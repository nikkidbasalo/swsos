'use client'
import {
  ConfirmModal,
  CustomButton,
  PerPage,
  ProgramsSideBar,
  ShowMore,
  Sidebar,
  TableRowLoading,
  Title,
  Unauthorized
} from '@/components/index'
import TopBar from '@/components/TopBar'
import { programsTypes, superAdmins } from '@/constants'
import { useFilter } from '@/context/FilterContext'
import { useSupabase } from '@/context/SupabaseProvider'
import { updateList } from '@/GlobalRedux/Features/listSlice'
import { updateResultCounter } from '@/GlobalRedux/Features/resultsCounterSlice'
import { GranteeTypes } from '@/types'
import { fetchGrantees } from '@/utils/fetchApi'
import { Menu, Transition } from '@headlessui/react'
import {
  ArrowLeftIcon,
  CheckIcon,
  ChevronDownIcon,
  PencilSquareIcon,
  TrashIcon
} from '@heroicons/react/20/solid'
import Link from 'next/link'
import { notFound, useSearchParams } from 'next/navigation'
import React, { Fragment, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import AddEditModal from './AddEditModal'
import Filters from './Filters'

const Page: React.FC = () => {
  const { hasAccess, setToast } = useFilter()
  const { session, supabase } = useSupabase()

  const searchParams = useSearchParams()
  const type = searchParams.get('type') // Get the "type" query parameter
  const program = searchParams.get('program') // Get the "type" query parameter
  const ref = searchParams.get('ref') // Get the "ref" query parameter

  const [loading, setLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)

  const [showArchiveModal, setShowArchiveModal] = useState(false)
  const [showActiveModal, setShowActiveModal] = useState(false)

  const [filterKeyword, setFilterKeyword] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('')

  const [list, setList] = useState<GranteeTypes[]>([])

  const [perPageCount, setPerPageCount] = useState<number>(10)
  const [editData, setEditData] = useState<GranteeTypes | null>(null)

  // Redux staff
  const globallist = useSelector((state: any) => state.list.value)
  const resultsCounter = useSelector((state: any) => state.results.value)
  const dispatch = useDispatch()

  if (!ref || !type || !programsTypes[type]) {
    return notFound()
  }

  const title = programsTypes[type] // URL param

  const fetchData = async () => {
    setLoading(true)

    try {
      const result = await fetchGrantees(
        { filterStatus, filterKeyword },
        ref,
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
        { filterStatus, filterKeyword },
        ref,
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

  const handleAdd = () => {
    setShowAddModal(true)
    setEditData(null)
  }

  const handleEdit = (item: GranteeTypes) => {
    setShowAddModal(true)
    setEditData(item)
  }

  const handleActivate = (item: GranteeTypes) => {
    setShowActiveModal(true)
    setEditData(item)
  }

  const handleArchived = (item: GranteeTypes) => {
    setShowArchiveModal(true)
    setEditData(item)
  }

  const activate = async () => {
    if (!editData) return
    try {
      const newData = {
        status: 'Active'
      }

      const { error } = await supabase
        .from('sws_users')
        .update(newData)
        .eq('id', editData.id)

      if (error) {
        setToast(
          'error',
          'Saving failed, please reload the page and try again.'
        )
        throw new Error(error.message)
      }

      const items = [...globallist]
      const updatedData = {
        ...newData,
        id: editData.id
      }
      const foundIndex = items.findIndex((x) => x.id === updatedData.id)
      items[foundIndex] = { ...items[foundIndex], ...updatedData }
      dispatch(updateList(items))

      // pop up the success message
      setToast('success', 'Successfully added.')
    } catch (e) {
      console.error(e)
    } finally {
      setShowActiveModal(false)
    }
  }

  const archived = async () => {
    if (!editData) return
    try {
      const newData = {
        status: 'Inactive'
      }

      const { error } = await supabase
        .from('sws_users')
        .update(newData)
        .eq('id', editData.id)

      if (error) {
        setToast(
          'error',
          'Saving failed, please reload the page and try again.'
        )
        throw new Error(error.message)
      }

      const items = [...globallist]
      const updatedData = {
        ...newData,
        id: editData.id
      }
      const foundIndex = items.findIndex((x) => x.id === updatedData.id)
      items[foundIndex] = { ...items[foundIndex], ...updatedData }
      dispatch(updateList(items))

      // pop up the success message
      setToast('success', 'Successfully added.')
    } catch (e) {
      console.error(e)
    } finally {
      setShowArchiveModal(false)
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
  }, [perPageCount, type, filterStatus, filterKeyword])

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
        <ProgramsSideBar />
      </Sidebar>
      <TopBar />
      <div className="app__main">
        <div>
          <div className="app__title">
            <Link
              href={`programs?type=${type}`}
              className="app__btn_gray flex items-center space-x-1"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span>Back</span>
            </Link>
            <Title title={`${program} Grantees`} />
            <CustomButton
              containerStyles="app__btn_green"
              title="Add Grantee"
              btnType="button"
              handleClick={handleAdd}
            />
          </div>

          {/* Filters */}
          <div className="app__filters">
            <Filters
              setFilterKeyword={setFilterKeyword}
              setFilterStatus={setFilterStatus}
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
                  <th className="app__th">Scholar</th>
                  <th className="app__th">Program</th>
                  <th className="app__th">Institute</th>
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
                                {item.status === 'Inactive' && (
                                  <Menu.Item>
                                    <div
                                      onClick={() => handleActivate(item)}
                                      className="app__dropdown_item"
                                    >
                                      <CheckIcon className="w-4 h-4" />
                                      <span>Change to Active</span>
                                    </div>
                                  </Menu.Item>
                                )}
                                {item.status === 'Active' && (
                                  <Menu.Item>
                                    <div
                                      onClick={() => handleArchived(item)}
                                      className="app__dropdown_item"
                                    >
                                      <TrashIcon className="w-4 h-4" />
                                      <span>Move to Archived</span>
                                    </div>
                                  </Menu.Item>
                                )}
                              </div>
                            </Menu.Items>
                          </Transition>
                        </Menu>
                      </td>
                      <th className="app__th_firstcol">
                        <div className="space-y-1">
                          <div className="font-bold">
                            {item.lastname}, {item.firstname} {item.middlename}
                          </div>
                          <div>
                            {item.email} | {item.gender}
                          </div>
                          <div>
                            {item.status === 'Active' && (
                              <span className="app__status_green">Active</span>
                            )}
                            {item.status === 'Inactive' && (
                              <span className="app__status_orange">
                                Archived
                              </span>
                            )}
                          </div>
                        </div>
                      </th>
                      <td className="app__td">{item.program.name}</td>
                      <td className="app__td">{item.institute?.name}</td>
                    </tr>
                  ))}
                {loading && <TableRowLoading cols={4} rows={2} />}
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
              type={type}
              editData={editData}
              programId={ref}
              hideModal={() => setShowAddModal(false)}
            />
          )}
          {/* Active Modal */}
          {showActiveModal && (
            <ConfirmModal
              header="Confirm Active"
              btnText="Confirm"
              message="Please confirm this action."
              onConfirm={activate}
              onCancel={() => setShowActiveModal(false)}
            />
          )}

          {/* Archive Modal */}
          {showArchiveModal && (
            <ConfirmModal
              header="Confirm Archive"
              btnText="Confirm"
              message="Please confirm this action."
              onConfirm={archived}
              onCancel={() => setShowArchiveModal(false)}
            />
          )}
        </div>
      </div>
    </>
  )
}
export default Page
