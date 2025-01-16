'use client'
import {
  CustomButton,
  DeleteModal,
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
import { EvaluationPeriodTypes } from '@/types'
import { fetchPeriods } from '@/utils/fetchApi'
import { Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon, PencilSquareIcon } from '@heroicons/react/20/solid'
import { format } from 'date-fns'
import { TrashIcon } from 'lucide-react'
import React, { Fragment, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import AddEditModal from './AddEditModal'

const Page: React.FC = () => {
  const { hasAccess, setToast } = useFilter()
  const { session, supabase } = useSupabase()

  const [loading, setLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)

  const [selectedId, setSelectedId] = useState<string>('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const [list, setList] = useState<EvaluationPeriodTypes[]>([])

  const [perPageCount, setPerPageCount] = useState<number>(10)
  const [showingCount, setShowingCount] = useState<number>(0)
  const [resultsCount, setResultsCount] = useState<number>(0)
  const [editData, setEditData] = useState<EvaluationPeriodTypes | null>(null)

  // Redux staff
  const globallist = useSelector((state: any) => state.list.value)
  const resultsCounter = useSelector((state: any) => state.results.value)
  const dispatch = useDispatch()

  const fetchData = async () => {
    setLoading(true)

    try {
      const result = await fetchPeriods(perPageCount, 0)
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
      const result = await fetchPeriods(perPageCount, list.length)

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

  const handleAdd = () => {
    setShowAddModal(true)
    setEditData(null)
  }

  const handleDelete = (id: string) => {
    setSelectedId(id)
    setShowDeleteModal(true)
  }

  const handleEdit = (item: EvaluationPeriodTypes) => {
    setShowAddModal(true)
    setEditData(item)
  }

  const handleNotify = async (item: EvaluationPeriodTypes) => {
    //
    try {
      const userIds: string[] = []

      // Approvers
      const { data, error } = await supabase
        .from('sws_grades')
        .select()
        .eq('evaluation_period_id', item.id)
        .eq('status', 'Passed')

      if (error) {
        throw new Error(error.message)
      }

      data.forEach((item: any) => {
        userIds.push(item.user_id)
      })

      const notificationData: any[] = []

      userIds.forEach((userId) => {
        notificationData.push({
          message: `Your scholarship allowance for ${item.description} is scheduled to be release on ${item.release_schedule}.`,
          url: `/profile/${userId}`,
          type: 'Scholarship Allowance',
          user_id: userId
        })
      })

      if (notificationData.length > 0) {
        // insert to notifications
        const { error: error3 } = await supabase
          .from('sws_notifications')
          .insert(notificationData)

        if (error3) {
          throw new Error(error3.message)
        }

        // pop up the success message
        setToast('success', 'Notification successfully sent')
      }
    } catch (e) {
      console.error(e)
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
  }, [perPageCount])

  const isDataEmpty = !Array.isArray(list) || list.length < 1 || !list

  // Check access from permission settings or Super Admins
  if (
    !hasAccess('evaluator') &&
    !hasAccess('staff') &&
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
            <Title title="Evaluation Periods" />
            <CustomButton
              containerStyles="app__btn_green"
              title="Add Evaluation Period"
              btnType="button"
              handleClick={handleAdd}
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
                  <th className="app__th">Description / Academmic Year</th>
                  <th className="app__th">
                    Deadline of Requirements Submission
                  </th>
                  <th className="app__th">Allowance Release Schedule</th>
                  <th className="app__th">Uploading (Open/Close)</th>
                  <th className="app__th">Requirements</th>
                </tr>
              </thead>
              <tbody>
                {!isDataEmpty &&
                  list.map((item, index) => (
                    <tr key={index} className="app__tr">
                      <td className="w-6 pl-4 app__td">
                        <Menu as="div" className="app__menu_container">
                          <div>
                            <Menu.Button className="app__dropdown_btn">
                              <ChevronDownIcon
                                className="h-5 w-5"
                                aria-hidden="true"
                              />
                            </Menu.Button>
                          </div>

                          <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                          >
                            <Menu.Items className="app__dropdown_items">
                              <div className="py-1">
                                <Menu.Item>
                                  <div
                                    onClick={() => handleEdit(item)}
                                    className="app__dropdown_item"
                                  >
                                    <PencilSquareIcon className="w-4 h-4" />
                                    <span>Edit</span>
                                  </div>
                                </Menu.Item>
                                <Menu.Item>
                                  <div
                                    onClick={() => handleDelete(item.id)}
                                    className="app__dropdown_item"
                                  >
                                    <TrashIcon className="w-4 h-4" />
                                    <span>Delete</span>
                                  </div>
                                </Menu.Item>
                              </div>
                            </Menu.Items>
                          </Transition>
                        </Menu>
                      </td>
                      <td className="app__td">
                        {item.description} {item.year}
                      </td>
                      <td className="app__td">
                        {format(new Date(item.deadline), 'MMMM dd, yyyy')}
                      </td>
                      <td className="app__td">
                        <div>{item.release_schedule}</div>
                        <div className="mt-1">
                          <CustomButton
                            containerStyles="app__btn_green"
                            title="Send Notification to Scholars"
                            btnType="button"
                            handleClick={() => handleNotify(item)}
                          />
                        </div>
                      </td>
                      <td className="app__td">
                        {item.allow_upload ? (
                          <span className="app__status_green">Open</span>
                        ) : (
                          <span className="app__status_red">Closed</span>
                        )}
                      </td>
                      <td className="app__td">
                        <div className="tiptopeditor mt-2">
                          <div
                            className="text-sm text-gray-600"
                            dangerouslySetInnerHTML={{
                              __html: item.requirements
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                {loading && <TableRowLoading cols={6} rows={2} />}
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

          {/* Add/Edit Modal */}
          {showAddModal && (
            <AddEditModal
              editData={editData}
              hideModal={() => setShowAddModal(false)}
            />
          )}

          {/* Delete Modal */}
          {showDeleteModal && (
            <DeleteModal
              table="sws_evaluation_periods"
              selectedId={selectedId}
              showingCount={showingCount}
              setShowingCount={setShowingCount}
              resultsCount={resultsCount}
              setResultsCount={setResultsCount}
              hideModal={() => setShowDeleteModal(false)}
            />
          )}
        </div>
      </div>
    </>
  )
}
export default Page
