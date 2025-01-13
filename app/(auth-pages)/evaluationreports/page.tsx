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
import {
  GradeTypes,
  GranteeSummaryTypes,
  ProgramTypes,
  UserAccessTypes
} from '@/types'
import { fetchEvaluations, fetchPrograms } from '@/utils/fetchApi'
import Excel from 'exceljs'
import { saveAs } from 'file-saver'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import EvaluateModal from './EvaluateModal'
import Filters from './Filters'

const Page: React.FC = () => {
  const { hasAccess, setToast } = useFilter()
  const { session, supabase, systemAccess } = useSupabase()

  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const [selectedItems, setSelectedItems] = useState<GradeTypes[]>([])
  const [selectedId, setSelectedId] = useState<string>('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [checkAll, setCheckAll] = useState(false)

  const [showEvaluateModal, setShowEvaluateModal] = useState(false)
  const [editData, setEditData] = useState<GradeTypes | null>(null)

  const [filterStatus, setFilterStatus] = useState<string>('')
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string>('')
  const [filterPeriod, setFilterPeriod] = useState<string>('')
  const [filterProgram, setFilterProgram] = useState<string>('')
  const [filterInstitute, setFilterInstitute] = useState<string>('')

  const [list, setList] = useState<GradeTypes[]>([])

  const [perPageCount, setPerPageCount] = useState<number>(10)
  const [totalPassed, setTotalPassed] = useState(0)
  const [totalFailed, setTotalFailed] = useState(0)
  const [totalForEvaluation, setTotalForEvaluation] = useState(0)

  const userAccess: UserAccessTypes | undefined = systemAccess.find(
    (user: UserAccessTypes) => user.user_id === session.user.id
  )

  // Redux staff
  const globallist = useSelector((state: any) => state.list.value)
  const resultsCounter = useSelector((state: any) => state.results.value)
  const dispatch = useDispatch()

  const fetchData = async () => {
    setLoading(true)

    try {
      const result = await fetchEvaluations(
        {
          filterProgram,
          filterPeriod,
          filterStatus,
          filterInstitute,
          filterPaymentStatus,
          filterProgramIds:
            userAccess && userAccess.program_ids ? userAccess.program_ids : []
        },
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

    //All
    const all = await fetchEvaluations(
      {
        filterProgram,
        filterPeriod,
        filterStatus,
        filterInstitute,
        filterPaymentStatus,
        filterProgramIds:
          userAccess && userAccess.program_ids ? userAccess.program_ids : []
      },
      99999,
      0
    )
    const passed = all.data.filter(
      (item: GradeTypes) => item.status === 'Passed'
    ).length
    const failed = all.data.filter(
      (item: GradeTypes) => item.status === 'Failed'
    ).length
    const forEval = all.data.filter(
      (item: GradeTypes) => item.status === 'For Evaluation'
    ).length
    setTotalPassed(passed)
    setTotalFailed(failed)
    setTotalForEvaluation(forEval)
  }

  // Append data to existing list whenever 'show more' button is clicked
  const handleShowMore = async () => {
    setLoading(true)

    try {
      const result = await fetchEvaluations(
        {
          filterProgram,
          filterPeriod,
          filterStatus,
          filterInstitute,
          filterPaymentStatus,
          filterProgramIds:
            userAccess && userAccess.program_ids ? userAccess.program_ids : []
        },
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
      { header: 'Program', key: 'program', width: 20 },
      { header: 'Institute', key: 'institute', width: 20 },
      { header: 'Evaluation Period', key: 'period', width: 20 },
      { header: 'Allowance', key: 'allowance', width: 20 },
      { header: 'Allowance Type', key: 'allowance_type', width: 20 },
      { header: 'Remarks', key: 'remarks', width: 20 },
      { header: 'Status', key: 'status', width: 20 }
      // Add more columns based on your data structure
    ]

    const result = await fetchEvaluations(
      { filterProgram, filterPeriod, filterStatus, filterInstitute },
      99999,
      0
    )

    const results: GradeTypes[] = result.data

    // Data for the Excel file
    const data: any[] = []
    results.forEach((item, index) => {
      data.push({
        no: index + 1,
        lastname: `${item.user?.lastname}`,
        firstname: `${item.user?.firstname}`,
        middlename: `${item.user?.middlename || ''}`,
        program: `${item.program?.name}`,
        period: `${item.period?.description}`,
        institute: `${item.user?.institute?.name || ''}`,
        allowance: `${item.allowance ?? ''}`,
        allowance_type: `${item.allowance_type ?? ''}`,
        remarks: `${item.remarks ?? ''}`,
        status: `${item.status}`
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
  const handleDownloadSummary = async () => {
    setDownloading(true)

    const { data: stats } = await supabase.rpc('get_program_statistics', {
      p_evaluation_period_id: filterPeriod === '' ? 0 : filterPeriod
    })

    // Create a new workbook and add a worksheet
    const workbook = new Excel.Workbook()
    const worksheet = workbook.addWorksheet('Sheet 1')

    // Add data to the worksheet
    worksheet.columns = [
      { header: '#', key: 'no', width: 20 },
      { header: 'Program', key: 'program', width: 20 },
      { header: 'Total Grantees', key: 'total_grantees', width: 20 },
      { header: 'Total Allowance', key: 'total_allowance', width: 20 },
      { header: 'Total Paid', key: 'total_paid', width: 20 },
      { header: 'Total Unpaid', key: 'total_unpaid', width: 20 }
      // Add more columns based on your data structure
    ]

    const result = await fetchEvaluations(
      { filterProgram, filterPeriod, filterStatus, filterInstitute },
      99999,
      0
    )

    const results: GradeTypes[] = result.data

    // Data for the Excel file
    const data: any[] = []
    stats.forEach((item: GranteeSummaryTypes, index: number) => {
      data.push({
        no: index + 1,
        program: `${item.program_name}`,
        total_grantees: `${item.total_users}`,
        total_allowance: `${item.total_allowance}`,
        total_paid: `${item.total_paid}`,
        total_unpaid: `${item.total_unpaid}`
      })
    })

    data.forEach((item) => {
      worksheet.addRow(item)
    })

    // Generate the Excel file
    await workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })
      saveAs(blob, `Summary.xlsx`)
    })
    setDownloading(false)
  }

  // Update list whenever list in redux updates
  useEffect(() => {
    setList(globallist)
  }, [globallist])

  useEffect(() => {
    ;(async () => {
      const { data, error } = await supabase.rpc('get_program_statistics', {
        p_evaluation_period_id: 2
      })

      if (error) {
        console.error('Error fetching program statistics:', error)
        return []
      } else {
        console.log('return data', data)
      }
    })()
  }, [])

  const handlePaidSelected = async () => {
    const ids = selectedItems.map((obj) => obj.id)
    try {
      const { error } = await supabase
        .from('sws_grades')
        .update({ is_paid: true })
        .in('id', ids)

      if (error) throw new Error(error.message)

      // pop up the success message
      setToast('success', 'Successfully saved')

      // Append new data in redux
      const items = [...globallist]
      const updatedArray = items.map((obj: GradeTypes) => {
        if (selectedItems.find((o) => o.id.toString() === obj.id.toString()))
          return { ...obj, is_paid: true }
        else return obj
      })
      dispatch(updateList(updatedArray))
    } catch (error) {
      // pop up the error  message
      setToast('error', 'Something went wrong')
    }
  }
  const handleUnpaidSelected = async () => {
    const ids = selectedItems.map((obj) => obj.id)
    try {
      const { error } = await supabase
        .from('sws_grades')
        .update({ is_paid: false })
        .in('id', ids)

      if (error) throw new Error(error.message)

      // pop up the success message
      setToast('success', 'Successfully saved')

      // Append new data in redux
      const items = [...globallist]
      const updatedArray = items.map((obj: GradeTypes) => {
        if (selectedItems.find((o) => o.id.toString() === obj.id.toString()))
          return { ...obj, is_paid: false }
        else return obj
      })
      dispatch(updateList(updatedArray))
    } catch (error) {
      // pop up the error  message
      setToast('error', 'Something went wrong')
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

  const handleViewDetails = (item: GradeTypes) => {
    setShowEvaluateModal(true)
    setEditData(item)
  }

  // Featch data
  useEffect(() => {
    setList([])
    void fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    perPageCount,
    filterProgram,
    filterInstitute,
    filterPeriod,
    filterPaymentStatus,
    filterStatus
  ])

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
            <Title title="Evaluation Reports" />
          </div>

          {/* Filters */}
          <div className="app__filters">
            <Filters
              setFilterPeriod={setFilterPeriod}
              setFilterProgram={setFilterProgram}
              setFilterInstitute={setFilterInstitute}
              setFilterStatus={setFilterStatus}
              setFilterPaymentStatus={setFilterPaymentStatus}
            />
          </div>

          {/* Export Button */}
          <div className="mx-4 mb-4 flex justify-start items-end space-x-2">
            <div className="text-xs font-medium">
              Passed: <span className="text-xl font-bold">{totalPassed}</span>
            </div>
            <div className="text-xs font-medium">
              Failed: <span className="text-xl font-bold">{totalFailed}</span>
            </div>
            <div className="text-xs font-medium">
              For Evaluation:{' '}
              <span className="text-xl font-bold">{totalForEvaluation}</span>
            </div>
            <div className="flex-1"></div>
            <div className="space-x-2">
              {selectedItems.length > 0 && (
                <>
                  <CustomButton
                    containerStyles="app__btn_orange"
                    isDisabled={downloading}
                    title={`Mark Unpaid (${selectedItems.length})`}
                    btnType="button"
                    handleClick={handleUnpaidSelected}
                  />
                  <CustomButton
                    containerStyles="app__btn_green"
                    isDisabled={downloading}
                    title={`Mark Paid (${selectedItems.length})`}
                    btnType="button"
                    handleClick={handlePaidSelected}
                  />
                </>
              )}
              <CustomButton
                containerStyles="app__btn_blue"
                isDisabled={downloading}
                title={downloading ? 'Downloading...' : 'Download Summary'}
                btnType="button"
                handleClick={handleDownloadSummary}
              />
              <CustomButton
                containerStyles="app__btn_blue"
                isDisabled={downloading}
                title={downloading ? 'Downloading...' : 'Export Data To Excel'}
                btnType="button"
                handleClick={handleDownloadExcel}
              />
            </div>
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
                  <th className="app__th">Scholar</th>
                  <th className="app__th">Program</th>
                  <th className="app__th">Institute</th>
                  <th className="app__th">Evaluation Period</th>
                  <th className="app__th">Allowance</th>
                  <th className="app__th">Remarks</th>
                  <th className="app__th">Status</th>
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
                      <td className="app__td">
                        <div className="space-y-1">
                          <div className="font-bold">
                            {item.user?.lastname}, {item.user?.firstname}{' '}
                            {item.user?.middlename}
                          </div>
                          <div>
                            {item.user?.email} | {item.user?.gender}
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

                      <td className="app__td">{item.program?.name}</td>
                      <td className="app__td">{item.user?.institute?.name}</td>
                      <td className="app__td">
                        {item.period?.description} {item.period?.year}
                      </td>
                      <td className="app__td">
                        <div>
                          <span className="font-bold">
                            {Number(item.allowance).toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}{' '}
                          </span>
                          {item.allowance_type}
                        </div>
                        <div>
                          {item.is_paid ? (
                            <span className="text-green-500 font-bold">
                              Paid
                            </span>
                          ) : (
                            <span className="text-orange-500 font-bold">
                              Unpaid
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="app__td">{item.remarks}</td>
                      <td className="app__td">
                        {item.status === 'Passed' && (
                          <span className="app__status_green">Passed</span>
                        )}
                        {item.status === 'For Evaluation' && (
                          <span className="app__status_orange">
                            For&nbsp;Evaluation
                          </span>
                        )}
                        {item.status === 'Failed' && (
                          <span className="app__status_red">Failed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                {loading && <TableRowLoading cols={8} rows={2} />}
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
