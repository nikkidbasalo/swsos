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
import TopBar from '@/components/TopBar'
import { superAdmins } from '@/constants'
import { useFilter } from '@/context/FilterContext'
import { useSupabase } from '@/context/SupabaseProvider'
import { updateList } from '@/GlobalRedux/Features/listSlice'
import { updateResultCounter } from '@/GlobalRedux/Features/resultsCounterSlice'
import { StudentTypes } from '@/types'
import { fetchStudents } from '@/utils/fetchApi'
import { AcademicCapIcon } from '@heroicons/react/20/solid'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import Filters from './Filters'
import ImportModal from './ImportModal'

const Page: React.FC = () => {
  const { hasAccess, setToast } = useFilter()
  const { session, supabase } = useSupabase()

  const [loading, setLoading] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const [checkAll, setCheckAll] = useState(false)
  const [selectedItems, setSelectedItems] = useState<StudentTypes[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [refresh, setRefresh] = useState(false)
  const [selectedItem, setSelectedItem] = useState<StudentTypes>()
  const [filterKeyword, setFilterKeyword] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [filterProgram, setFilterProgram] = useState<string>('')
  const [list, setList] = useState<StudentTypes[]>([])

  const [perPageCount, setPerPageCount] = useState<number>(10)
  const [showingCount, setShowingCount] = useState<number>(0)
  const [resultsCount, setResultsCount] = useState<number>(0)
  const [editData, setEditData] = useState<StudentTypes | null>(null)

  // Redux staff
  const globallist = useSelector((state: any) => state.list.value)
  const resultsCounter = useSelector((state: any) => state.results.value)
  const dispatch = useDispatch()

  const fetchData = async () => {
    setLoading(true)

    try {
      const result = await fetchStudents(
        { filterStatus, filterKeyword, filterProgram },
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

      setResultsCount(result.count ? result.count : 0)
      setShowingCount(result.data.length)
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
      const result = await fetchStudents(
        { filterStatus, filterKeyword, filterProgram },
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

  const deleteSelected = async () => {
    setDownloading(true)
    const ids = selectedItems.map((obj) => obj.id)
    try {
      const { error } = await supabase
        .from('sws_students')
        .delete()
        .in('id', ids)

      if (error) throw new Error(error.message)

      // pop up the success message
      setToast('success', 'Successfully deleted')

      // Append new data in redux
      const items = [...globallist]
      const updatedArray = items.filter(
        (obj: StudentTypes) =>
          !selectedItems.find((o) => o.id.toString() === obj.id.toString())
      )
      dispatch(updateList(updatedArray))
    } catch (error) {
      // pop up the error  message
      setToast('error', 'Something went wrong')
    } finally {
      setDownloading(false)
    }
  }

  // Function to handle checkbox change event
  const handleCheckboxChange = (id: string) => {
    if (selectedIds.length > 0 && selectedIds.includes(id)) {
      // If item is already selected, remove it
      const ids = selectedIds.filter((selectedId) => selectedId !== id)
      setSelectedIds(ids)
      const items = list.filter((item) => ids.includes(item.id.toString()))
      setSelectedItems(items)
    } else {
      // If item is not selected, add it
      const ids = [...selectedIds, id]
      setSelectedIds(ids)
      const items = list.filter((item) => ids.includes(item.id.toString()))
      setSelectedItems(items)
    }
  }

  const handleCheckAllChange = () => {
    setCheckAll(!checkAll)
    if (!checkAll) {
      const ids = list.map((obj) => obj.id.toString())
      setSelectedIds([...ids])
      const items = list.filter((item) => ids.includes(item.id.toString()))
      setSelectedItems(items)
    } else {
      setSelectedIds([])
      setSelectedItems([])
    }
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
  }, [perPageCount, refresh, filterKeyword, filterProgram, filterStatus])

  const isDataEmpty = !Array.isArray(list) || list.length < 1 || !list

  // Check access from permission settings or Super Admins
  if (
    !hasAccess('staff') &&
    !hasAccess('settings') &&
    !superAdmins.includes(session.user.email)
  )
    return <Unauthorized />

  return (
    <>
      <Sidebar>
        <ul className="pt-8 mt-4 space-y-2 border-t border-gray-700">
          <li>
            <div className="flex items-center text-gray-500 items-centers space-x-1 px-2">
              <AcademicCapIcon className="w-4 h-4" />
              <span>Students Database</span>
            </div>
          </li>
        </ul>
      </Sidebar>
      <TopBar />
      <div className="app__main">
        <div>
          <div className="app__title">
            <Title title="Scholarship Applicants" />
            <CustomButton
              containerStyles="app__btn_green"
              title="Import Students"
              btnType="button"
              handleClick={() => {
                setShowImportModal(true)
              }}
            />
          </div>

          {/* Filters */}
          <div className="app__filters">
            <Filters
              setFilterKeyword={setFilterKeyword}
              setFilterStatus={setFilterStatus}
            />
          </div>

          {/* Export Button */}
          <div className="mx-4 mb-4 flex justify-end items-end space-x-2">
            {selectedItems.length > 0 && (
              <CustomButton
                containerStyles="app__btn_orange"
                isDisabled={downloading}
                title={downloading ? 'Deleting...' : 'Delete Selected'}
                btnType="button"
                handleClick={deleteSelected}
              />
            )}
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
                  <th className="app__th pl-4">
                    <input
                      type="checkbox"
                      checked={checkAll}
                      onChange={handleCheckAllChange}
                    />
                  </th>
                  <th className="app__th">ID Number</th>
                  <th className="app__th">Fullname</th>
                  <th className="app__th">Year Level</th>
                  <th className="app__th">Program</th>
                  {/* <th className="app__th">Status</th> */}
                </tr>
              </thead>
              <tbody>
                {!isDataEmpty &&
                  list.map((item, index) => (
                    <tr
                      key={index}
                      onClick={() => handleCheckboxChange(item.id.toString())}
                      className="app__tr cursor-pointer"
                    >
                      <td className="hidden md:table-cell app__td">
                        <input
                          type="checkbox"
                          value={item.id.toString()}
                          checked={selectedIds.includes(item.id.toString())}
                          readOnly
                        />
                      </td>
                      <td className="app__td">{item.id_number}</td>
                      <td className="app__td">
                        <div className="font-bold">
                          {item.lastname}, {item.firstname} {item.middlename}
                        </div>
                      </td>
                      <td className="app__td">{item.year_level}</td>
                      <td className="app__td">{item.program}</td>
                      {/* <td className="app__td">
                        {item.status === 'Active' && (
                          <span className="app__status_green">Active</span>
                        )}
                        {item.status === 'Inactive' && (
                          <span className="app__status_orange">Inactive</span>
                        )}
                      </td> */}
                    </tr>
                  ))}
                {loading && <TableRowLoading cols={5} rows={2} />}
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

          {/* Import Modal */}
          {showImportModal && (
            <ImportModal hideModal={() => setShowImportModal(false)} />
          )}
        </div>
      </div>
    </>
  )
}
export default Page
