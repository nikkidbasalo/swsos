'use client'
import { EvaluationChart } from '@/components/Dashboard/EvaluationChart'
import { Sidebar, Title, Unauthorized } from '@/components/index'
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

const Page: React.FC = () => {
  const { hasAccess, setToast } = useFilter()
  const { session, supabase } = useSupabase()

  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const [selectedItems, setSelectedItems] = useState<GradeTypes[]>([])
  const [selectedId, setSelectedId] = useState<string>('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [checkAll, setCheckAll] = useState(false)

  const [filterStatus, setFilterStatus] = useState<string>('')
  const [filterPeriod, setFilterPeriod] = useState<string>('')
  const [filterProgram, setFilterProgram] = useState<string>('')
  const [filterInstitute, setFilterInstitute] = useState<string>('')

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
        { filterProgram, filterPeriod, filterStatus, filterInstitute },
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
      { filterProgram, filterPeriod, filterStatus, filterInstitute },
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
        { filterProgram, filterPeriod, filterStatus, filterInstitute },
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
        .update({ is_paid: true })
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

  // Featch data
  useEffect(() => {
    setList([])
    void fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perPageCount, filterProgram, filterInstitute, filterPeriod, filterStatus])

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
            <Title title="Evaluation Dashboard" />
          </div>

          <div>
            <div className="mx-4 my-4 grid md:grid-cols-2 gap-2">
              <EvaluationChart periodId={0} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
export default Page
