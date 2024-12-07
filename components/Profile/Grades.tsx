'use client'
import {
  CustomButton,
  DeleteModal,
  PerPage,
  ShowMore,
  TableRowLoading,
  Unauthorized
} from '@/components/index'
import { superAdmins } from '@/constants'
import { useFilter } from '@/context/FilterContext'
import { useSupabase } from '@/context/SupabaseProvider'
import { updateList } from '@/GlobalRedux/Features/listSlice'
import { updateResultCounter } from '@/GlobalRedux/Features/resultsCounterSlice'
import { AccountTypes, LiquidationTypes } from '@/types'
import { fetchGrades } from '@/utils/fetchApi'
import { Menu, Transition } from '@headlessui/react'
import {
  ChevronDownIcon,
  PencilSquareIcon,
  TrashIcon
} from '@heroicons/react/20/solid'
import Link from 'next/link'
import { Fragment, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import AddGradeModal from './AddGradeModal'

export default function Grades({ userData }: { userData: AccountTypes }) {
  const { hasAccess } = useFilter()
  const { session } = useSupabase()

  const [loading, setLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)

  const [selectedId, setSelectedId] = useState<string>('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const [list, setList] = useState<LiquidationTypes[]>([])

  const [perPageCount, setPerPageCount] = useState<number>(10)
  const [showingCount, setShowingCount] = useState<number>(0)
  const [resultsCount, setResultsCount] = useState<number>(0)
  const [editData, setEditData] = useState<LiquidationTypes | null>(null)

  // Redux staff
  const globallist = useSelector((state: any) => state.list.value)
  const resultsCounter = useSelector((state: any) => state.results.value)
  const dispatch = useDispatch()

  const fetchData = async () => {
    setLoading(true)

    try {
      const result = await fetchGrades(perPageCount, 0)
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
      const result = await fetchGrades(perPageCount, list.length)

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

  const handleEdit = (item: LiquidationTypes) => {
    setShowAddModal(true)
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
  }, [perPageCount])

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
      <div>
        {/* Main Content */}
        <div className="w-full px-2 bg-gray-100">
          <div>
            <div className="app__title">
              <div className="flex-1">&nbsp;</div>
              {session.user.id === userData.id && (
                <CustomButton
                  containerStyles="app__btn_green"
                  title="Upload Grade"
                  btnType="button"
                  handleClick={handleAdd}
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
                    <th className="app__th pl-4"></th>
                    <th className="app__th">School Semester/Year</th>
                    <th className="app__th">Attachment</th>
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
                                      onClick={() => {
                                        setSelectedId(item.id.toString())
                                        setShowDeleteModal(true)
                                      }}
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
                        <td className="app__td">{item.description}</td>
                        <td className="app__td">
                          {item.file_path && (
                            <Link
                              href={`${item.file_path}`}
                              target="_blank"
                              className="text-blue-600 hover:underline"
                            >
                              {item.file_path.slice(-20)}
                            </Link>
                          )}
                        </td>
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

            {/* Add/Edit Modal */}
            {showAddModal && (
              <AddGradeModal hideModal={() => setShowAddModal(false)} />
            )}

            {/* Confirm Delete Modal */}
            {showDeleteModal && (
              <DeleteModal
                table="sws_grades"
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
      </div>
    </>
  )
}
