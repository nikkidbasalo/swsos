'use client'
import {
  ConfirmModal,
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
import { ApplicationTypes } from '@/types'
import { fetchApplications } from '@/utils/fetchApi'
import { Menu, Transition } from '@headlessui/react'
import {
  AcademicCapIcon,
  CheckIcon,
  ChevronDownIcon,
  TrashIcon
} from '@heroicons/react/20/solid'
import Excel from 'exceljs'
import { saveAs } from 'file-saver'
import Link from 'next/link'
import React, { Fragment, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import axios from 'axios'
import Filters from './Filters'

const Page: React.FC = () => {
  const { hasAccess, setToast } = useFilter()
  const { session, supabase } = useSupabase()

  const [loading, setLoading] = useState(false)
  const [showDisapproveModal, setShowDisapproveModal] = useState(false)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const [refresh, setRefresh] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ApplicationTypes>()
  const [filterKeyword, setFilterKeyword] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [filterProgram, setFilterProgram] = useState<string>('')
  const [list, setList] = useState<ApplicationTypes[]>([])

  const [perPageCount, setPerPageCount] = useState<number>(10)
  const [showingCount, setShowingCount] = useState<number>(0)
  const [resultsCount, setResultsCount] = useState<number>(0)
  const [editData, setEditData] = useState<ApplicationTypes | null>(null)

  // Redux staff
  const globallist = useSelector((state: any) => state.list.value)
  const resultsCounter = useSelector((state: any) => state.results.value)
  const dispatch = useDispatch()

  const fetchData = async () => {
    setLoading(true)

    try {
      const result = await fetchApplications(
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
      const result = await fetchApplications(
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

  const handleConfirmApprove = (item: ApplicationTypes) => {
    setShowApproveModal(true)
    setSelectedItem(item)
  }

  const handleConfirmDisapprove = (item: ApplicationTypes) => {
    setShowDisapproveModal(true)
    setSelectedItem(item)
  }

  const handleApprove = () => {
    void handleAddGrantee()
  }
  const handleDisapprove = () => {
    void handleDisapproveApplicant()
  }

  const handleAddGrantee = async () => {
    if (!selectedItem) return

    try {
      const { error } = await addAccount(selectedItem)

      if (error) {
        setToast('error', `Failed to add account: ${error}`)
        return
      }

      const { error: error2 } = await supabase
        .from('sws_applications')
        .update({ status: 'Approved' })
        .eq('id', selectedItem.id)

      if (error2) {
        throw new Error(error2.message)
      }

      const items = [...globallist]
      const updatedData = {
        status: 'Approved',
        id: selectedItem.id
      }
      const foundIndex = items.findIndex((x) => x.id === updatedData.id)
      items[foundIndex] = { ...items[foundIndex], ...updatedData }
      dispatch(updateList(items))

      setToast('success', 'Successfully approved.')

      setRefresh(!refresh)
    } catch (e) {
      console.error(e)
    } finally {
      setShowApproveModal(false)
    }
  }

  const handleDisapproveApplicant = async () => {
    if (!selectedItem) return

    const newData = {
      status: 'Disapproved'
    }

    try {
      const { error } = await supabase
        .from('sws_applications')
        .update(newData)
        .eq('id', selectedItem.id)

      if (error) {
        throw new Error(error.message)
      }

      const items = [...globallist]
      const updatedData = {
        ...newData,
        id: selectedItem.id
      }
      const foundIndex = items.findIndex((x) => x.id === updatedData.id)
      items[foundIndex] = { ...items[foundIndex], ...updatedData }
      dispatch(updateList(items))

      setToast('success', 'Successfully disapproved.')
    } catch (e) {
      console.error(e)
    } finally {
      setShowDisapproveModal(false)
    }
  }

  const handleDownloadExcel = async (details: ApplicationTypes) => {
    setDownloading(true)

    // Create a new workbook and add a worksheet
    const workbook = new Excel.Workbook()
    const worksheet = workbook.addWorksheet('Sheet 1')

    // Add data to the worksheet
    worksheet.columns = [
      { header: 'reference_code', key: 'reference_code', width: 20 },
      { header: 'last name', key: 'lastname', width: 20 },
      { header: 'first name', key: 'firstname', width: 20 },
      { header: 'middle name', key: 'middlename', width: 20 },
      { header: 'ext', key: 'name_ext', width: 20 },
      { header: 'tcgc id', key: 'tcgc_id', width: 20 },
      { header: 'birthday', key: 'birthday', width: 20 },
      { header: 'email', key: 'email', width: 20 },
      { header: 'age', key: 'age', width: 20 },
      { header: 'gender', key: 'gender', width: 20 },
      { header: 'civil status', key: 'civil_status', width: 20 },
      { header: 'contact number', key: 'contact_number', width: 20 },
      { header: 'present address', key: 'present_address', width: 20 },
      {
        header: 'present address_others',
        key: 'present_address_others',
        width: 20
      },
      { header: 'permanent address', key: 'permanent_address', width: 20 },
      { header: 'father', key: 'father', width: 20 },
      { header: 'mother', key: 'mother', width: 20 },
      { header: 'guardian', key: 'guardian', width: 20 },
      { header: 'parent address', key: 'parent_address', width: 20 },
      { header: 'father occupation', key: 'father_occupation', width: 20 },
      { header: 'mother occupation', key: 'mother_occupation', width: 20 },
      { header: 'guardian occupation', key: 'guardian_occupation', width: 20 },
      { header: 'shs', key: 'shs', width: 20 },
      { header: 'shs principal', key: 'shs_principal', width: 20 },
      { header: 'shs address', key: 'shs_address', width: 20 },
      { header: 'shs school_type', key: 'shs_school_type', width: 20 },
      { header: 'shs year graduated', key: 'shs_year_graduated', width: 20 },
      { header: 'shs honor', key: 'shs_honor', width: 20 },
      { header: 'reference name 1', key: 'reference_name_1', width: 20 },
      { header: 'reference name 2', key: 'reference_name_2', width: 20 },
      { header: 'reference name 3', key: 'reference_name_3', width: 20 },
      { header: 'reference address 1', key: 'reference_address_1', width: 20 },
      { header: 'reference address 2', key: 'reference_address_2', width: 20 },
      { header: 'reference address 3', key: 'reference_address_3', width: 20 },
      { header: 'reference contact 1', key: 'reference_contact_1', width: 20 },
      { header: 'reference contact 2', key: 'reference_contact_2', width: 20 },
      { header: 'reference contact 3', key: 'reference_contact_3', width: 20 }
      // Add more columns based on your data structure
    ]

    // Data for the Excel file
    const data: any[] = []
    data.push({
      reference_code: details.reference_code,
      lastname: details.lastname,
      firstname: details.firstname,
      middlename: details.middlename,
      name_ext: details.name_ext,
      tcgc_id: details.tcgc_id,
      birthday: details.birthday,
      email: details.email,
      age: details.age,
      gender: details.gender,
      civil_status: details.civil_status,
      contact_number: details.contact_number,
      present_address: details.present_address,
      present_address_others: details.present_address_others,
      permanent_address: details.permanent_address,
      father: details.father,
      mother: details.mother,
      guardian: details.guardian,
      parent_address: details.parent_address,
      father_occupation: details.father_occupation,
      mother_occupation: details.mother_occupation,
      guardian_occupation: details.guardian_occupation,
      shs: details.shs,
      shs_principal: details.shs_principal,
      shs_address: details.shs_address,
      shs_school_type: details.shs_school_type,
      shs_year_graduated: details.shs_year_graduated,
      shs_honor: details.shs_honor,
      reference_name_1: details.reference_name_1,
      reference_name_2: details.reference_name_2,
      reference_name_3: details.reference_name_3,
      reference_address_1: details.reference_address_1,
      reference_address_2: details.reference_address_2,
      reference_address_3: details.reference_address_3,
      reference_contact_1: details.reference_contact_1,
      reference_contact_2: details.reference_contact_2,
      reference_contact_3: details.reference_contact_3
    })

    data.forEach((item) => {
      worksheet.addRow(item)
    })

    // Generate the Excel file
    await workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })
      saveAs(blob, `Applicant Details.xlsx`)
    })
    setDownloading(false)
  }

  const addAccount = async (
    formdata: ApplicationTypes
  ): Promise<{ error?: string }> => {
    const newData = {
      program_id: formdata.program_id,
      lastname: formdata.lastname,
      firstname: formdata.firstname,
      middlename: formdata.middlename,
      email: formdata.email.toLowerCase(),
      gender: formdata.gender,
      birthday: formdata.birthday || null,
      type: 'Scholar',
      temp_password: selectedItem?.temporary_password
    }

    try {
      // Sign up the user on the server side
      const response = await axios.post('/api/signup', { item: newData })

      if (response.data.error_message) {
        return { error: response.data.error_message } // Return error from API
      }

      const { error: dbError } = await supabase.from('sws_users').insert({
        ...newData,
        applicant_id: Number(formdata.id),
        id: response.data.insert_id,
        age: formdata.age,
        civil_status: formdata.civil_status,
        contact_number: formdata.contact_number,
        present_address: formdata.present_address,
        present_address_others: formdata.present_address_others,
        permanent_address: formdata.permanent_address,
        father: formdata.father,
        mother: formdata.mother,
        guardian: formdata.guardian,
        parent_address: formdata.parent_address,
        father_occupation: formdata.father_occupation,
        mother_occupation: formdata.mother_occupation,
        guardian_occupation: formdata.guardian_occupation,
        shs: formdata.shs,
        shs_principal: formdata.shs_principal,
        shs_address: formdata.shs_address,
        shs_school_type: formdata.shs_school_type,
        shs_year_graduated: formdata.shs_year_graduated,
        shs_honor: formdata.shs_honor,
        reference_name_1: formdata.reference_name_1,
        reference_name_2: formdata.reference_name_2,
        reference_name_3: formdata.reference_name_3,
        reference_address_1: formdata.reference_address_1,
        reference_address_2: formdata.reference_address_2,
        reference_address_3: formdata.reference_address_3,
        reference_contact_1: formdata.reference_contact_1,
        reference_contact_2: formdata.reference_contact_2,
        reference_contact_3: formdata.reference_contact_3
      })

      if (dbError) {
        return { error: dbError.message } // Return database error
      }

      setToast('success', 'Successfully saved.')
      return {} // Return success
    } catch (e) {
      console.error(e)
      setToast('error', 'Something went wrong, please reload the page.')
      return { error: 'Unexpected error occurred.' } // Return unexpected error
    }
  }

  const handleDownloadData = async () => {
    setDownloading(true)

    // Create a new workbook and add a worksheet
    const workbook = new Excel.Workbook()
    const worksheet = workbook.addWorksheet('Sheet 1')

    // Add data to the worksheet
    worksheet.columns = [
      { header: 'No', key: 'no', width: 20 },
      { header: 'reference_code', key: 'reference_code', width: 20 },
      { header: 'last name', key: 'lastname', width: 20 },
      { header: 'first name', key: 'firstname', width: 20 },
      { header: 'middle name', key: 'middlename', width: 20 },
      { header: 'ext', key: 'name_ext', width: 20 },
      { header: 'tcgc id', key: 'tcgc_id', width: 20 },
      { header: 'birthday', key: 'birthday', width: 20 },
      { header: 'email', key: 'email', width: 20 },
      { header: 'age', key: 'age', width: 20 },
      { header: 'gender', key: 'gender', width: 20 },
      { header: 'civil status', key: 'civil_status', width: 20 },
      { header: 'contact number', key: 'contact_number', width: 20 },
      { header: 'present address', key: 'present_address', width: 20 },
      {
        header: 'present address_others',
        key: 'present_address_others',
        width: 20
      },
      { header: 'permanent address', key: 'permanent_address', width: 20 },
      { header: 'father', key: 'father', width: 20 },
      { header: 'mother', key: 'mother', width: 20 },
      { header: 'guardian', key: 'guardian', width: 20 },
      { header: 'parent address', key: 'parent_address', width: 20 },
      { header: 'father occupation', key: 'father_occupation', width: 20 },
      { header: 'mother occupation', key: 'mother_occupation', width: 20 },
      { header: 'guardian occupation', key: 'guardian_occupation', width: 20 },
      { header: 'shs', key: 'shs', width: 20 },
      { header: 'shs principal', key: 'shs_principal', width: 20 },
      { header: 'shs address', key: 'shs_address', width: 20 },
      { header: 'shs school_type', key: 'shs_school_type', width: 20 },
      { header: 'shs year graduated', key: 'shs_year_graduated', width: 20 },
      { header: 'shs honor', key: 'shs_honor', width: 20 },
      { header: 'reference name 1', key: 'reference_name_1', width: 20 },
      { header: 'reference name 2', key: 'reference_name_2', width: 20 },
      { header: 'reference name 3', key: 'reference_name_3', width: 20 },
      { header: 'reference address 1', key: 'reference_address_1', width: 20 },
      { header: 'reference address 2', key: 'reference_address_2', width: 20 },
      { header: 'reference address 3', key: 'reference_address_3', width: 20 },
      { header: 'reference contact 1', key: 'reference_contact_1', width: 20 },
      { header: 'reference contact 2', key: 'reference_contact_2', width: 20 },
      { header: 'reference contact 3', key: 'reference_contact_3', width: 20 }
      // Add more columns based on your data structure
    ]

    const result = await fetchApplications(
      { filterStatus, filterKeyword, filterProgram },
      99999,
      0
    )

    const results: ApplicationTypes[] = result.data

    // Data for the Excel file
    const data: any[] = []
    results.forEach((details, index) => {
      data.push({
        no: index + 1,
        reference_code: details.reference_code,
        lastname: details.lastname,
        firstname: details.firstname,
        middlename: details.middlename,
        name_ext: details.name_ext,
        tcgc_id: details.tcgc_id,
        birthday: details.birthday,
        email: details.email,
        age: details.age,
        gender: details.gender,
        civil_status: details.civil_status,
        contact_number: details.contact_number,
        present_address: details.present_address,
        present_address_others: details.present_address_others,
        permanent_address: details.permanent_address,
        father: details.father,
        mother: details.mother,
        guardian: details.guardian,
        parent_address: details.parent_address,
        father_occupation: details.father_occupation,
        mother_occupation: details.mother_occupation,
        guardian_occupation: details.guardian_occupation,
        shs: details.shs,
        shs_principal: details.shs_principal,
        shs_address: details.shs_address,
        shs_school_type: details.shs_school_type,
        shs_year_graduated: details.shs_year_graduated,
        shs_honor: details.shs_honor,
        reference_name_1: details.reference_name_1,
        reference_name_2: details.reference_name_2,
        reference_name_3: details.reference_name_3,
        reference_address_1: details.reference_address_1,
        reference_address_2: details.reference_address_2,
        reference_address_3: details.reference_address_3,
        reference_contact_1: details.reference_contact_1,
        reference_contact_2: details.reference_contact_2,
        reference_contact_3: details.reference_contact_3
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
      saveAs(blob, `Applicants.xlsx`)
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
              <span>Scholarship Applications</span>
            </div>
          </li>
        </ul>
      </Sidebar>
      <TopBar />
      <div className="app__main">
        <div>
          <div className="app__title">
            <Title title="Scholarship Applicants" />
          </div>

          {/* Filters */}
          <div className="app__filters">
            <Filters
              setFilterKeyword={setFilterKeyword}
              setFilterProgram={setFilterProgram}
              setFilterStatus={setFilterStatus}
            />
          </div>

          {/* Export Button */}
          <div className="mx-4 mb-2 flex justify-end items-end space-x-2">
            <div className="space-x-2">
              <CustomButton
                containerStyles="app__btn_blue"
                isDisabled={downloading}
                title={downloading ? 'Downloading...' : 'Export To Excel'}
                btnType="button"
                handleClick={handleDownloadData}
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
                  <th className="app__th">Applicant Name</th>
                  <th className="app__th">Status</th>
                  <th className="app__th">Program</th>
                  <th className="app__th">Other Details</th>
                  <th className="app__th">Attachment</th>
                </tr>
              </thead>
              <tbody>
                {!isDataEmpty &&
                  list.map((item, index) => (
                    <tr key={index} className="app__tr">
                      <td className="w-6 pl-4 app__td">
                        {item.status === 'Pending Approval' && (
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
                                      onClick={() => handleConfirmApprove(item)}
                                      className="app__dropdown_item"
                                    >
                                      <CheckIcon className="w-4 h-4" />
                                      <span>Approve</span>
                                    </div>
                                  </Menu.Item>
                                  <Menu.Item>
                                    <div
                                      onClick={() =>
                                        handleConfirmDisapprove(item)
                                      }
                                      className="app__dropdown_item"
                                    >
                                      <TrashIcon className="w-4 h-4" />
                                      <span>Disapprove</span>
                                    </div>
                                  </Menu.Item>
                                </div>
                              </Menu.Items>
                            </Transition>
                          </Menu>
                        )}
                      </td>
                      <td className="app__td">
                        <div className="font-bold">
                          {item.lastname}, {item.firstname} {item.middlename}
                        </div>
                        <div>
                          {item.email} | {item.gender} | {item.civil_status}
                        </div>
                        <div>
                          Application Code:{' '}
                          <span className="font-bold">
                            {item.reference_code}
                          </span>
                        </div>
                        <div className="mt-2">
                          <CustomButton
                            containerStyles="app__btn_green"
                            title="Download Details"
                            btnType="button"
                            handleClick={() => handleDownloadExcel(item)}
                          />
                        </div>
                      </td>
                      <td className="app__td">
                        {item.status === 'Approved' && (
                          <span className="app__status_green">Approved</span>
                        )}
                        {item.status === 'Pending Approval' && (
                          <span className="app__status_orange">
                            Pending Approval
                          </span>
                        )}
                        {item.status === 'Disapproved' && (
                          <span className="app__status_red">Disapproved</span>
                        )}
                      </td>
                      <td className="app__td">{item.program?.name}</td>
                      <td className="app__td">
                        <div>TCGC ID No: {item.tcgc_id}</div>
                        <div>Contact #: {item.contact_number}</div>
                        <div>Present Address: {item.present_address}</div>
                        <div>
                          Present Address (Others):{' '}
                          {item.present_address_others}
                        </div>
                        <div>Permanent Address: {item.permanent_address}</div>
                        <div>
                          Mother: {item.mother} | {item.mother_occupation}
                        </div>
                        <div>
                          Father: {item.father} | {item.father_occupation}
                        </div>
                        <div>
                          Guardian: {item.guardian} | {item.guardian_occupation}
                        </div>
                        <div>
                          SHS: {item.shs}({item.shs_school_type}) -{' '}
                          {item.shs_address} - {item.shs_honor}(
                          {item.shs_year_graduated})
                        </div>
                        <div>
                          References 1: {item.reference_name_1} |{' '}
                          {item.reference_address_1} |{' '}
                          {item.reference_contact_1}
                        </div>
                        <div>
                          References 2: {item.reference_name_2} |{' '}
                          {item.reference_address_2} |{' '}
                          {item.reference_contact_2}
                        </div>
                        <div>
                          References 3: {item.reference_name_3} |{' '}
                          {item.reference_address_3} |{' '}
                          {item.reference_contact_3}
                        </div>
                      </td>
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

          {/* Approve Modal */}
          {showApproveModal && (
            <ConfirmModal
              header="Confirm Approve"
              btnText="Confirm"
              message="This action cannot be undone. Are you sure you want to approve this applicant?"
              onConfirm={handleApprove}
              onCancel={() => setShowApproveModal(false)}
            />
          )}
          {/* Confirm Disapprove Modal */}
          {showDisapproveModal && (
            <ConfirmModal
              header="Confirm Disapprove"
              btnText="Confirm"
              message="This action cannot be undone. Are you sure you want to disapprove this applicant?"
              onConfirm={handleDisapprove}
              onCancel={() => setShowDisapproveModal(false)}
            />
          )}
        </div>
      </div>
    </>
  )
}
export default Page
