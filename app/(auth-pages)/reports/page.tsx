'use client'
import {
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
import { superAdmins } from '@/constants'
import { useFilter } from '@/context/FilterContext'
import { useSupabase } from '@/context/SupabaseProvider'
import { updateList } from '@/GlobalRedux/Features/listSlice'
import { updateResultCounter } from '@/GlobalRedux/Features/resultsCounterSlice'
import { AccountTypes, InstituteTypes, ProgramTypes } from '@/types'
import { fetchGrantees, fetchInstitutes, fetchPrograms } from '@/utils/fetchApi'
import { Menu, Transition } from '@headlessui/react'
import { PencilSquareIcon } from '@heroicons/react/20/solid'
import Excel from 'exceljs'
import { saveAs } from 'file-saver'
import { ChevronDownIcon } from 'lucide-react'
import React, { Fragment, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import EvaluationModal from './EvaluationModal'
import Filters from './Filters'
import ProgramsModal from './ProgramsModal'

const Page: React.FC = () => {
  const { hasAccess } = useFilter()
  const { session } = useSupabase()

  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [showEvaluationModal, setShowEvaluationModal] = useState(false)

  const [showProgramsModal, setShowProgramsModal] = useState(false)

  const [programs, setPrograms] = useState<ProgramTypes[]>([])
  const [institutes, setInstitutes] = useState<InstituteTypes[]>([])

  const [filterStatus, setFilterStatus] = useState<string>('')
  const [filterKeyword, setFilterKeyword] = useState<string>('')
  const [filterProgram, setFilterProgram] = useState<string>('')
  const [filterInstitute, setFilterInstitute] = useState<string>('')
  const [filterYear, setFilterYear] = useState<string>('')
  const [filterGender, setFilterGender] = useState<string>('')

  const [list, setList] = useState<AccountTypes[]>([])
  const [editData, setEditData] = useState<AccountTypes | null>(null)

  const [perPageCount, setPerPageCount] = useState<number>(10)

  // Redux staff
  const globallist = useSelector((state: any) => state.list.value)
  const resultsCounter = useSelector((state: any) => state.results.value)
  const dispatch = useDispatch()

  const fetchData = async () => {
    setLoading(true)

    try {
      const result = await fetchGrantees(
        {
          filterProgram,
          filterKeyword,
          filterGender,
          filterYear,
          filterStatus,
          filterInstitute
        },
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
        {
          filterProgram,
          filterKeyword,
          filterGender,
          filterYear,
          filterStatus,
          filterInstitute
        },
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

  const handleDownloadExcel = async () => {
    setDownloading(true)

    // Create a new workbook and add a worksheet
    const workbook = new Excel.Workbook()
    const worksheet = workbook.addWorksheet('Sheet 1')

    // Add data to the worksheet
    worksheet.columns = [
      { header: '#', key: 'no', width: 20 },
      { header: 'Lastname', key: 'lastname', width: 20 },
      { header: 'Firstname', key: 'firstname', width: 20 },
      { header: 'Middlename', key: 'middlename', width: 20 },
      { header: 'Sex', key: 'gender', width: 20 },
      { header: 'Year Level', key: 'year', width: 20 },
      { header: 'Program', key: 'program', width: 20 },
      { header: 'Institute', key: 'institute', width: 20 },
      { header: 'Birthday', key: 'birthday', width: 20 },
      { header: 'Year Granted', key: 'yeargranted', width: 20 }
      // Add more columns based on your data structure
    ]

    const result = await fetchGrantees(
      {
        filterProgram,
        filterKeyword,
        filterGender,
        filterYear,
        filterInstitute
      },
      '',
      99999,
      0
    )

    const results: AccountTypes[] = result.data

    // Data for the Excel file
    const data: any[] = []
    results.forEach((item, index) => {
      data.push({
        no: index + 1,
        lastname: `${item.lastname}`,
        firstname: `${item.firstname}`,
        middlename: `${item.middlename}`,
        gender: `${item.gender}`,
        year: `${item.year_level_status}`,
        program: `${item.program?.name}`,
        institute: `${item.institute?.name}`,
        birthday: `${item.birthday}`,
        yeargranted: `${item.year_granted ?? ''}`
      })
    })

    data.forEach((item) => {
      worksheet.addRow(item)
    })

    let filename = 'Grantees'
    if (filterProgram !== '') {
      const result = await fetchPrograms('', 999, 0)
      const find = result.data.find(
        (program: ProgramTypes) =>
          program.id.toString() === filterProgram.toString()
      )
      if (find) {
        filename = find.name
      }
    }

    // Generate the Excel file
    await workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })
      saveAs(blob, `${filename}.xlsx`)
    })
    setDownloading(false)
  }

  const handleViewDetails = (item: AccountTypes) => {
    setShowEvaluationModal(true)
    setEditData(item)
  }

  // Update list whenever list in redux updates
  useEffect(() => {
    setList(globallist)
  }, [globallist])

  // Featch data
  useEffect(() => {
    ;(async () => {
      const result = await fetchPrograms('', 999, 0)
      setPrograms(result.data)
      const institutesData = await fetchInstitutes(999, 0)
      setInstitutes(institutesData.data)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Featch data
  useEffect(() => {
    setList([])
    void fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    perPageCount,
    filterProgram,
    filterInstitute,
    filterKeyword,
    filterYear,
    filterGender,
    filterStatus
  ])

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
        <ProgramsSideBar />
      </Sidebar>
      <TopBar />
      <div className="app__main">
        <div>
          <div className="app__title">
            <Title title="Grantees Reports" />
          </div>

          {/* Filters */}
          <div className="app__filters">
            <Filters
              setFilterKeyword={setFilterKeyword}
              setFilterProgram={setFilterProgram}
              setFilterGender={setFilterGender}
              setFilterYear={setFilterYear}
              setFilterInstitute={setFilterInstitute}
              setFilterStatus={setFilterStatus}
              programs={programs}
              institutes={institutes}
            />
          </div>

          {/* Export Button */}
          <div className="mx-4 mb-4 flex justify-end space-x-2">
            <CustomButton
              containerStyles="app__btn_blue"
              isDisabled={downloading}
              title={downloading ? 'Downloading...' : 'Export To Excel'}
              btnType="button"
              handleClick={handleDownloadExcel}
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
                  <th className="app__th">Institute</th>
                  <th className="app__th">Sex</th>
                  <th className="app__th">Year Level</th>
                  <th className="app__th">Status</th>
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
                                    onClick={() => {
                                      setEditData(item)
                                      setShowProgramsModal(true)
                                    }}
                                    className="app__dropdown_item"
                                  >
                                    <PencilSquareIcon className="w-4 h-4" />
                                    <span>
                                      Add to another scholarship program
                                    </span>
                                  </div>
                                </Menu.Item>
                              </div>
                            </Menu.Items>
                          </Transition>
                        </Menu>
                      </td>
                      <td className="app__td">
                        <div className="space-y-1">
                          <div className="font-bold">
                            {item.lastname}, {item.firstname} {item.middlename}
                          </div>
                          <div>{item.email}</div>
                          <div>
                            <CustomButton
                              containerStyles="app__btn_green"
                              title="View Details"
                              btnType="button"
                              handleClick={() => handleViewDetails(item)}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="app__td">{item.program?.name}</td>
                      <td className="app__td">{item.institute?.name}</td>
                      <td className="app__td">{item.gender}</td>
                      <td className="app__td">{item.year_level_status}</td>
                      <td className="app__td">
                        {item.status === 'Active' && (
                          <span className="app__status_green">Active</span>
                        )}
                        {item.status === 'Inactive' && (
                          <span className="app__status_red">Inactive</span>
                        )}
                      </td>
                    </tr>
                  ))}
                {loading && <TableRowLoading cols={7} rows={2} />}
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

          {/* Details Modal */}
          {showEvaluationModal && editData && (
            <EvaluationModal
              grantee={editData}
              hideModal={() => setShowEvaluationModal(false)}
            />
          )}

          {/* Programs Modal */}
          {showProgramsModal && editData && (
            <ProgramsModal
              grantee={editData}
              hideModal={() => setShowProgramsModal(false)}
            />
          )}
        </div>
      </div>
    </>
  )
}
export default Page
