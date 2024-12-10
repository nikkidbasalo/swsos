'use client'
import {
  CustomButton,
  PerPage,
  ShowMore,
  Sidebar,
  TableRowLoading,
  Title,
  Unauthorized
} from '@/components/index'
import EvaluationSidebar from '@/components/Sidebars/EvaluationSidebar'
import TopBar from '@/components/TopBar'
import { superAdmins } from '@/constants'
import { useFilter } from '@/context/FilterContext'
import { useSupabase } from '@/context/SupabaseProvider'
import { updateList } from '@/GlobalRedux/Features/listSlice'
import { updateResultCounter } from '@/GlobalRedux/Features/resultsCounterSlice'
import { GranteeTypes } from '@/types'
import { fetchGrantees } from '@/utils/fetchApi'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import EvaluateModal from './EvaluateModal'
import Filters from './Filters'

const Page: React.FC = () => {
  const { hasAccess } = useFilter()
  const { session } = useSupabase()

  const [loading, setLoading] = useState(false)
  const [showEvaluateModal, setShowEvaluateModal] = useState(false)

  const [filterKeyword, setFilterKeyword] = useState<string>('')
  const [filterProgram, setFilterProgram] = useState<string>('')

  const [list, setList] = useState<GranteeTypes[]>([])

  const [perPageCount, setPerPageCount] = useState<number>(10)
  const [editData, setEditData] = useState<GranteeTypes | null>(null)

  // Redux staff
  const globallist = useSelector((state: any) => state.list.value)
  const resultsCounter = useSelector((state: any) => state.results.value)
  const dispatch = useDispatch()

  const fetchData = async () => {
    setLoading(true)

    try {
      const result = await fetchGrantees(
        { filterProgram, filterKeyword },
        '',
        perPageCount,
        0
      )
      // update the list in redux
      dispatch(updateList(result.data))

      // Updating showing text in redux
      dispatch(
        updateResultCounter({
          showing: result.data.length,
          results: result.count ? result.count : 0
        })
      )
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  // Append data to existing list whenever 'show more' button is clicked
  const handleShowMore = async () => {
    setLoading(true)

    try {
      const result = await fetchGrantees(
        { filterProgram, filterKeyword },
        '',
        perPageCount,
        list.length
      )

      // update the list in redux
      const newList = [...list, ...result.data]
      dispatch(updateList(newList))

      // Updating showing text in redux
      dispatch(
        updateResultCounter({
          showing: newList.length,
          results: result.count ? result.count : 0
        })
      )
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (item: GranteeTypes) => {
    setShowEvaluateModal(true)
    setEditData(item)
  }

  // Update list whenever list in redux updates
  useEffect(() => {
    setList(globallist)
  }, [globallist])

  // Featch data
  useEffect(() => {
    setList([])
    void fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perPageCount, filterProgram, filterKeyword])

  const isDataEmpty = !Array.isArray(list) || list.length < 1 || !list

  // Check access from permission settings or Super Admins
  if (
    !hasAccess('evaluators') &&
    !hasAccess('settings') &&
    !superAdmins.includes(session.user.email)
  )
    return <Unauthorized />

  return (
    <>
      <Sidebar>
        <EvaluationSidebar />
      </Sidebar>
      <TopBar />
      <div className="app__main">
        <div>
          <div className="app__title">
            <Title title="Evaluation & Monitoring" />
          </div>

          {/* Filters */}
          <div className="app__filters">
            <Filters
              setFilterKeyword={setFilterKeyword}
              setFilterProgram={setFilterProgram}
            />
          </div>

          {/* Per Page */}
          <PerPage
            showingCount={resultsCounter.showing}
            resultsCount={resultsCounter.results}
            perPageCount={perPageCount}
            setPerPageCount={setPerPageCount}
          />

          {/* Main Content */}
          <div>
            <table className="app__table">
              <thead className="app__thead">
                <tr>
                  <th className="app__th pl-4"></th>
                  <th className="app__th pl-4">Scholar</th>
                  <th className="app__th">Program</th>
                </tr>
              </thead>
              <tbody>
                {!isDataEmpty &&
                  list.map((item, index) => (
                    <tr key={index} className="app__tr">
                      <th className="app__tdapp__th_firstcol"></th>
                      <td className="app__td">
                        <div className="space-y-1">
                          <div className="font-bold">
                            {item.lastname}, {item.firstname} {item.middlename}
                          </div>
                          <div>
                            {item.email} | {item.gender}
                          </div>
                          <div>
                            <CustomButton
                              containerStyles="app__btn_green"
                              title="Evaluate"
                              btnType="button"
                              handleClick={() => handleViewDetails(item)}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="app__td">{item.program.name}</td>
                    </tr>
                  ))}
                {loading && <TableRowLoading cols={3} rows={2} />}
              </tbody>
            </table>
            {!loading && isDataEmpty && (
              <div className="app__norecordsfound">No records found.</div>
            )}
          </div>

          {/* Show More */}
          {resultsCounter.results > resultsCounter.showing && !loading && (
            <ShowMore handleShowMore={handleShowMore} />
          )}

          {/* Tracker Modal */}
          {showEvaluateModal && editData && (
            <EvaluateModal
              grantee={editData}
              hideModal={() => setShowEvaluateModal(false)}
            />
          )}
        </div>
      </div>
    </>
  )
}
export default Page
