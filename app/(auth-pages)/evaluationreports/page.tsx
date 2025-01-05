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
import { GradeTypes } from '@/types'
import { fetchEvaluations } from '@/utils/fetchApi'
import Excel from 'exceljs'
import { saveAs } from 'file-saver'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Filters from './Filters'

const Page: React.FC = () => {
  const { hasAccess } = useFilter()
  const { session } = useSupabase()

  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const [filterStatus, setFilterStatus] = useState<string>('')
  const [filterPeriod, setFilterPeriod] = useState<string>('')
  const [filterProgram, setFilterProgram] = useState<string>('')

  const [list, setList] = useState<GradeTypes[]>([])

  const [perPageCount, setPerPageCount] = useState<number>(10)
  const [totalPassed, setTotalPassed] = useState(0)
  const [totalFailed, setTotalFailed] = useState(0)
  const [totalForEvaluation, setTotalForEvaluation] = useState(0)

  // Redux staff
  const globallist = useSelector((state: any) => state.list.value)
  const resultsCounter = useSelector((state: any) => state.results.value)
  const dispatch = useDispatch()

  const fetchData = async () => {
    setLoading(true)

    try {
      const result = await fetchEvaluations(
        { filterProgram, filterPeriod, filterStatus },
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
      { filterProgram, filterPeriod },
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
        { filterProgram, filterPeriod, filterStatus },
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
      { header: 'Evaluation Period', key: 'period', width: 20 },
      { header: 'Remarks', key: 'remarks', width: 20 },
      { header: 'Status', key: 'status', width: 20 }
      // Add more columns based on your data structure
    ]

    const result = await fetchEvaluations(
      { filterProgram, filterPeriod, filterStatus },
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
        middlename: `${item.user?.middlename}`,
        program: `${item.program?.name}`,
        period: `${item.period?.description}`,
        remarks: `${item.remarks}`,
        status: `${item.status}`
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

  // Featch data
  useEffect(() => {
    setList([])
    void fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perPageCount, filterProgram, filterPeriod, filterStatus])

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
              setFilterStatus={setFilterStatus}
            />
          </div>

          {/* Export Button */}
          <div className="mx-4 mb-4 flex justify-start items-end space-x-2">
            <div className="text-xs font-medium">
              Total Passed:{' '}
              <span className="text-xl font-bold">{totalPassed}</span>
            </div>
            <div className="text-xs font-medium">
              Total Failed:{' '}
              <span className="text-xl font-bold">{totalFailed}</span>
            </div>
            <div className="text-xs font-medium">
              Total For Evaluation:{' '}
              <span className="text-xl font-bold">
                {totalForEvaluation.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </span>
            </div>
            <div className="flex-1"></div>
            <div>
              <CustomButton
                containerStyles="app__btn_blue"
                isDisabled={downloading}
                title={downloading ? 'Downloading...' : 'Export To Excel'}
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
                  <th className="app__th pl-4"></th>
                  <th className="app__th">Scholar</th>
                  <th className="app__th">Program</th>
                  <th className="app__th">Evaluation Period</th>
                  <th className="app__th">Allowance</th>
                  <th className="app__th">Remarks</th>
                  <th className="app__th">Status</th>
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
                            {item.user?.lastname}, {item.user?.firstname}{' '}
                            {item.user?.middlename}
                          </div>
                          <div>
                            {item.user?.email} | {item.user?.gender}
                          </div>
                        </div>
                      </td>

                      <td className="app__td">{item.program?.name}</td>
                      <td className="app__td">{item.period?.description}</td>
                      <td className="app__td">
                        {Number(item.allowance).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}{' '}
                        {item.allowance_type}
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
        </div>
      </div>
    </>
  )
}
export default Page
