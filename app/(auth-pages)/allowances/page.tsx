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
import AllowancesSidebar from '@/components/Sidebars/AllowancesSidebar'
import TopBar from '@/components/TopBar'
import { superAdmins } from '@/constants'
import { useFilter } from '@/context/FilterContext'
import { useSupabase } from '@/context/SupabaseProvider'
import { updateList } from '@/GlobalRedux/Features/listSlice'
import { updateResultCounter } from '@/GlobalRedux/Features/resultsCounterSlice'
import { AllowancesTypes } from '@/types'
import { fetchAllowances } from '@/utils/fetchApi'
import Excel from 'exceljs'
import { saveAs } from 'file-saver'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import BulkAddModal from './BulkAddModal'
import Filters from './Filters'

const Page: React.FC = () => {
  const { hasAccess } = useFilter()
  const { session } = useSupabase()

  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [showBulkAddModal, setShowBulkAddModal] = useState(false)

  const [filterPeriod, setFilterPeriod] = useState<string>('')
  const [filterProgram, setFilterProgram] = useState<string>('')

  const [list, setList] = useState<AllowancesTypes[]>([])

  const [perPageCount, setPerPageCount] = useState<number>(10)
  const [totalScholars, setTotalScholars] = useState(0)
  const [totalAllowances, setTotalAllowances] = useState(0)

  // Redux staff
  const globallist = useSelector((state: any) => state.list.value)
  const resultsCounter = useSelector((state: any) => state.results.value)
  const dispatch = useDispatch()

  const fetchData = async () => {
    setLoading(true)

    try {
      const result = await fetchAllowances(
        { filterProgram, filterPeriod },
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
    const all = await fetchAllowances({ filterProgram, filterPeriod }, 99999, 0)
    const totalAmount = all.data.reduce(
      (sum, item: AllowancesTypes) => sum + Number(item.amount),
      0
    )

    setTotalScholars(all.data.length)
    setTotalAllowances(totalAmount)
  }

  // Append data to existing list whenever 'show more' button is clicked
  const handleShowMore = async () => {
    setLoading(true)

    try {
      const result = await fetchAllowances(
        { filterProgram, filterPeriod },
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
    setShowBulkAddModal(true)
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
      { header: 'Period', key: 'period', width: 20 },
      { header: 'Amount', key: 'amount', width: 20 }
      // Add more columns based on your data structure
    ]

    const result = await fetchAllowances(
      { filterProgram, filterPeriod },
      99999,
      0
    )

    const results: AllowancesTypes[] = result.data

    // Data for the Excel file
    const data: any[] = []
    results.forEach((item, index) => {
      data.push({
        no: index + 1,
        lastname: `${item.user?.lastname}`,
        firstname: `${item.user?.firstname}`,
        middlename: `${item.user?.middlename}`,
        program: `${item.program?.name}`,
        period: `${item.period}`,
        amount: `${item.amount}`
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
  }, [perPageCount, filterProgram, filterPeriod])

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
        <AllowancesSidebar />
      </Sidebar>
      <TopBar />
      <div className="app__main">
        <div>
          <div className="app__title">
            <Title title="Allowances" />
            <CustomButton
              containerStyles="app__btn_green"
              title="Bulk Add Allowances"
              btnType="button"
              handleClick={handleAdd}
            />
          </div>

          {/* Filters */}
          <div className="app__filters">
            <Filters
              setFilterPeriod={setFilterPeriod}
              setFilterProgram={setFilterProgram}
            />
          </div>

          {/* Export Button */}
          <div className="mx-4 mb-4 flex justify-start items-end space-x-2">
            <div className="flex-1 flex justify-center space-x-2">
              <div className="border bg-gray-200 py-px px-2 rounded-lg">
                <div className="text-xs font-medium">Total Scholars</div>
                <div className="text-sm font-bold text-center">
                  {totalScholars}
                </div>
              </div>
              <div className="border bg-gray-200 py-px px-2 rounded-lg">
                <div className="text-xs font-medium">Total Allowances</div>
                <div className="text-sm font-bold text-center">
                  {totalAllowances.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </div>
              </div>
            </div>
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
                  <th className="app__th pl-4">Scholar</th>
                  <th className="app__th">Program</th>
                  <th className="app__th">Allowance</th>
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
                        </div>
                      </td>
                      <td className="app__td">{item.program.name}</td>
                      <td className="app__td">
                        {Number(item.amount).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </td>
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
          {showBulkAddModal && (
            <BulkAddModal hideModal={() => setShowBulkAddModal(false)} />
          )}
        </div>
      </div>
    </>
  )
}
export default Page
