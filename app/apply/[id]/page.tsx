'use client'
import { TopBarDark } from '@/components/index'
import { useSupabase } from '@/context/SupabaseProvider'
import { ApplicationTypes, BoardinghouseTypes, ProgramTypes } from '@/types'
import { fetchBoardinghouse } from '@/utils/fetchApi'
import { generateRandomAlphaNumber } from '@/utils/text-helper'
import { PaperClipIcon } from '@heroicons/react/20/solid'
import Excel from 'exceljs'
import { saveAs } from 'file-saver'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

export default function Page({ params }: { params: { id: string } }) {
  const programId = params.id
  const [isLoggedIn, setLoggedIn] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [idNumber, setIdNumber] = useState('')
  const { supabase } = useSupabase()
  const router = useRouter()

  const [boardinghouses, setBoardinghouses] = useState<
    BoardinghouseTypes[] | []
  >([])
  const [saving, setSaving] = useState(false)
  const [refCode, setRefCode] = useState('')
  const [details, setDetails] = useState<ProgramTypes | null>(null)

  const [applicationDetails, setApplicationDetails] = useState<any>(null)

  const [file, setFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    setFile(selectedFile)
    clearErrors('file_path')
  }

  const {
    register,
    formState: { errors },
    setError,
    clearErrors,
    watch,
    handleSubmit
  } = useForm<ApplicationTypes>({
    mode: 'onSubmit'
  })

  const watchedPresentAddress = watch('present_address')

  const onSubmit = async (formdata: ApplicationTypes) => {
    if (saving) return

    const emailCheck = await handleCheckEmail(formdata.email)
    if (!emailCheck) return

    if (!file) {
      setError('file_path', {
        type: 'manual',
        message: 'Requirements are required'
      })
      return
    } else {
      clearErrors('file_path')
    }

    setSaving(true)
    void handleCreate(formdata)
  }

  const handleCreate = async (formdata: ApplicationTypes) => {
    const randomCode = generateRandomAlphaNumber(5)
    setRefCode(randomCode)

    const tempPassword = Math.floor(Math.random() * 8999) + 1000

    try {
      let filePath: string | null = null

      // Upload file if it exists
      if (file) {
        const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')
        const fileName = `${Date.now()}_${sanitizedFileName}`
        const { data: fileData, error: fileError } = await supabase.storage
          .from('sws_public') // Replace with your storage bucket name
          .upload(`applications/${fileName}`, file)

        if (fileError) {
          throw new Error(fileError.message)
        }
        filePath = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/sws_public/${fileData.path}` // Get the path of the uploaded file
      }

      const newData = {
        program_id: programId,
        status: 'Pending Approval',
        reference_code: randomCode,
        lastname: formdata.lastname,
        firstname: formdata.firstname,
        middlename: formdata.middlename,
        name_ext: formdata.name_ext,
        tcgc_id: formdata.tcgc_id,
        birthday: formdata.birthday,
        email: formdata.email,
        age: formdata.age,
        gender: formdata.gender,
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
        reference_contact_3: formdata.reference_contact_3,
        file_path: filePath,
        temporary_password: tempPassword
      }

      setApplicationDetails(newData)

      const { data, error } = await supabase
        .from('sws_applications')
        .insert(newData)
        .select()

      if (error) {
        throw new Error(error.message)
      }

      void handleNotify(
        `${formdata.firstname} ${formdata.middlename} ${formdata.lastname}`
      )

      setSubmitted(true)

      setSaving(false)
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const handleNotify = async (fullname: string) => {
    //
    try {
      const userIds: string[] = []

      // Approvers
      const { data, error } = await supabase
        .from('sws_system_access')
        .select('user_id')
        .in('type', ['settings', 'staff'])

      if (error) {
        throw new Error(error.message)
      }

      data.forEach((item: any) => {
        userIds.push(item.user_id)
      })

      const notificationData: any[] = []

      userIds.forEach((userId) => {
        notificationData.push({
          message: `${fullname} has recently applied for scholarship. Kindly review his/her application.`,
          url: '/applications',
          type: 'New Scholarship Application',
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
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleCheckEmail = async (email: string) => {
    // Prepopulate Tin No
    const { data } = await supabase
      .from('sws_users')
      .select()
      .eq('email', email)
      .limit(1)
      .maybeSingle()

    if (data) {
      setError('email', {
        type: 'manual',
        message: 'This email already exist'
      })
      return false
    } else {
      clearErrors('email')
      return true
    }
  }

  const handleDownloadExcel = async () => {
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

    const details: ApplicationTypes = applicationDetails

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

  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const { data } = await supabase
      .from('sws_students')
      .select()
      .eq('id_number', idNumber)
      .limit(1)
      .single()

    if (data) {
      setIsVerified(true)
      setNotFound(false)
    } else {
      setNotFound(true)
      setIsVerified(false)
    }
  }

  useEffect(() => {
    ;(async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        setLoggedIn(true)
      } else {
        setLoggedIn(false)
      }
    })()
  }, [router])

  useEffect(() => {
    ;(async () => {
      const appartmentsData = await fetchBoardinghouse(999, 0)
      setBoardinghouses(appartmentsData.data)

      const { data: programDetails } = await supabase
        .from('sws_programs')
        .select()
        .eq('id', programId)
        .single()

      setDetails(programDetails)
    })()
  }, [])

  return (
    <div className="app__home">
      <TopBarDark isGuest={isLoggedIn ? false : true} />
      <div className="h-auto bg-gray-700 pb-10 pt-20 px-6 md:flex items-start md:space-x-4 justify-center">
        <div className="bg-white mx-1 w-full md:w-[700px] rounded-lg border mb-20">
          {submitted && (
            <div className="text-gray-700 p-4">
              <div>
                Application successfully submitted. Your Application Code is{' '}
                <span className="font-bold text-lg">{refCode}</span>
              </div>
              <div className="mt-2 italic text-xs">
                Please take note of this reference code, as it will be used to
                track the status of your application.
              </div>
              <div className="mt-2 italic">
                <span
                  className="text-blue-600 font-medium cursor-pointer"
                  onClick={handleDownloadExcel}
                >
                  Download a Copy
                </span>
              </div>
            </div>
          )}
          {!submitted && !isVerified && (
            <div>
              <div className="my-10">
                <div className="text-xl text-center">
                  Enter your TCGC ID Number for verification
                </div>
                <form onSubmit={handleVerify}>
                  <div className="flex items-center space-x-2 justify-center mt-4">
                    <input
                      type="text"
                      value={idNumber}
                      onChange={(e) => setIdNumber(e.target.value)}
                      className="border outline-none px-2 py-2 text-sm w-72"
                      placeholder="ID Number"
                    />
                    <button
                      className="bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-500 border border-emerald-600 font-bold px-8 py-2 text-sm text-white rounded-sm"
                      type="submit"
                    >
                      Submit
                    </button>
                  </div>
                </form>
              </div>
              <div className="w-full px-10 my-10 pb-20">
                {notFound && (
                  <>
                    <div className="text-center mb-2">
                      <div>
                        <span className="text-red-500 text-lg">
                          ID Number does not exist.
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
          {!submitted && isVerified && (
            <form onSubmit={handleSubmit(onSubmit)}>
              <table className="w-full">
                <tbody>
                  <tr>
                    <td colSpan={2} className="relative text-center">
                      <div className="flex items-center justify-center">
                        <div className="">
                          <Image
                            src="/tcgc_logo.png"
                            alt=""
                            width={100}
                            height={100}
                          />
                        </div>
                      </div>
                      <div className="text-base font-bold uppercase">
                        Tangub City Global College
                      </div>
                      <div className="text-base font-bold uppercase">
                        Scholarship and Welfare Office
                      </div>
                      <div className="text-xs">
                        Lot 289, J. Luna St., Maloro, Tangub City, Misamis
                        Occidental 7214
                      </div>
                      <div className="text-xl font-bold mt-5 uppercase">
                        {details?.name} APPLICATION FORM
                      </div>
                      <hr className="border-black mt-2" />
                    </td>
                  </tr>
                  <tr>
                    <td className="text-xs w-1/2 p-4">
                      <table className="w-full">
                        <tbody>
                          <tr>
                            <td
                              colSpan={4}
                              className="font-bold border border-black bg-green-200 p-1 text-base"
                            >
                              BIOGRAPHICAL DATA
                            </td>
                          </tr>
                          <tr>
                            <td className="font-bold border border-black bg-green-200 p-1">
                              LAST NAME:
                            </td>
                            <td className="font-bold border border-black p-1">
                              <input
                                {...register('lastname', { required: true })}
                                className="app__input_standard"
                              />
                              {errors.lastname && (
                                <div className="app__error_message">
                                  Lastname is required
                                </div>
                              )}
                            </td>
                            <td className="font-bold border border-black bg-green-200 p-1">
                              DATE OF BIRTH
                            </td>
                            <td className="font-bold border border-black p-1">
                              <input
                                {...register('birthday', { required: true })}
                                type="date"
                                className="app__input_standard"
                              />
                              {errors.birthday && (
                                <div className="app__error_message">
                                  Birthday is required
                                </div>
                              )}
                            </td>
                          </tr>
                          <tr>
                            <td className="font-bold border border-black bg-green-200 p-1">
                              FIRSTNAME
                            </td>
                            <td className="font-bold border border-black p-1">
                              <input
                                {...register('firstname', { required: true })}
                                className="app__input_standard"
                              />
                              {errors.firstname && (
                                <div className="app__error_message">
                                  Firstname is required
                                </div>
                              )}
                            </td>
                            <td className="font-bold border border-black bg-green-200 p-1">
                              AGE
                            </td>
                            <td className="font-bold border border-black p-1">
                              <input
                                {...register('age', { required: true })}
                                className="app__input_standard"
                              />
                              {errors.age && (
                                <div className="app__error_message">
                                  Age is required
                                </div>
                              )}
                            </td>
                          </tr>
                          <tr>
                            <td className="font-bold border border-black bg-green-200 p-1">
                              MIDDLENAME
                            </td>
                            <td className="font-bold border border-black p-1">
                              <input
                                {...register('middlename')}
                                className="app__input_standard"
                              />
                            </td>
                            <td className="font-bold border border-black bg-green-200 p-1">
                              SEX
                            </td>
                            <td className="font-bold border border-black p-1">
                              <select
                                {...register('gender', { required: true })}
                                className="app__select_standard"
                              >
                                <option value="">Select</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                              </select>
                              {errors.gender && (
                                <div className="app__error_message">
                                  Gender is required
                                </div>
                              )}
                            </td>
                          </tr>
                          <tr>
                            <td className="font-bold border border-black bg-green-200 p-1">
                              NAME EXTENSION (IF THERES ANY)
                            </td>
                            <td className="font-bold border border-black p-1">
                              <input
                                {...register('name_ext')}
                                className="app__input_standard"
                              />
                            </td>
                            <td className="font-bold border border-black bg-green-200 p-1">
                              CIVIL STATUS
                            </td>
                            <td className="font-bold border border-black p-1">
                              <select
                                {...register('civil_status')}
                                className="app__select_standard"
                              >
                                <option value="Single">Single</option>
                                <option value="Married">Married</option>
                                <option value="Separated">Separated</option>
                                <option value="Widowed">Widowed</option>
                              </select>
                            </td>
                          </tr>
                          <tr>
                            <td className="font-bold border border-black bg-green-200 p-1">
                              EMAIL
                            </td>
                            <td className="font-bold border border-black p-1">
                              <input
                                {...register('email', {
                                  required: 'Email is required'
                                })}
                                type="email"
                                className="app__select_standard"
                              />
                              {errors.email && (
                                <div className="app__error_message">
                                  {errors.email.message}
                                </div>
                              )}
                            </td>
                            <td className="font-bold border border-black bg-green-200 p-1">
                              TCGC ID Number
                            </td>
                            <td className="font-bold border border-black p-1">
                              <input
                                {...register('tcgc_id')}
                                className="app__select_standard"
                              />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td className="text-xs w-1/2 p-4">
                      <table className="w-full">
                        <tbody>
                          <tr>
                            <td
                              colSpan={2}
                              className="font-bold border border-black bg-green-200 p-1 text-base"
                            >
                              OTHER PERSONAL INFORMATION
                            </td>
                          </tr>
                          <tr>
                            <td className="font-bold border border-black bg-green-200 p-1 w-1/3">
                              CONTACT NUMBER
                            </td>
                            <td className="font-bold border border-black p-1">
                              <input
                                {...register('contact_number', {
                                  required: true
                                })}
                                className="app__input_standard"
                              />
                              {errors.contact_number && (
                                <div className="app__error_message">
                                  Contact No is required
                                </div>
                              )}
                            </td>
                          </tr>
                          <tr>
                            <td className="font-bold border border-black bg-green-200 p-1">
                              BOARDING HOUSE/APPARTMENT ADDRESS
                            </td>
                            <td className="font-bold border border-black p-1">
                              <select
                                {...register('present_address')}
                                className="app__select_standard"
                              >
                                <option value="">Select</option>
                                {boardinghouses?.map((b, i) => (
                                  <option key={i} value={b.name}>
                                    {b.name}
                                  </option>
                                ))}
                                <option value="Others">Others</option>
                              </select>
                              {watchedPresentAddress === 'Others' && (
                                <input
                                  {...register('present_address_others')}
                                  placeholder="Please specify"
                                  className="app__input_standard"
                                />
                              )}
                            </td>
                          </tr>
                          <tr>
                            <td className="font-bold border border-black bg-green-200 p-1">
                              PERMANENT ADDRESS
                            </td>
                            <td className="font-bold border border-black p-1">
                              <input
                                {...register('permanent_address', {
                                  required: true
                                })}
                                className="app__input_standard"
                              />
                              {errors.permanent_address && (
                                <div className="app__error_message">
                                  Address is required
                                </div>
                              )}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td className="text-xs w-1/2 p-4">
                      <table className="w-full">
                        <tbody>
                          <tr>
                            <td
                              colSpan={4}
                              className="font-bold border border-black bg-green-200 p-1 text-base"
                            >
                              PARENTS INFORMATION
                            </td>
                          </tr>
                          <tr>
                            <td className="font-bold border border-black bg-green-200 p-1">
                              FATHERS NAME:
                            </td>
                            <td className="font-bold border border-black p-1">
                              <input
                                {...register('father', { required: true })}
                                className="app__input_standard"
                              />
                              {errors.father && (
                                <div className="app__error_message">
                                  This is required
                                </div>
                              )}
                            </td>
                            <td className="font-bold border border-black bg-green-200 p-1">
                              OCCUPATION
                            </td>
                            <td className="font-bold border border-black p-1">
                              <input
                                {...register('father_occupation', {
                                  required: true
                                })}
                                className="app__input_standard"
                              />
                              {errors.father_occupation && (
                                <div className="app__error_message">
                                  This is required
                                </div>
                              )}
                            </td>
                          </tr>
                          <tr>
                            <td className="font-bold border border-black bg-green-200 p-1">
                              MOTHERS MAIDEN NAME
                            </td>
                            <td className="font-bold border border-black p-1">
                              <input
                                {...register('mother', { required: true })}
                                className="app__input_standard"
                              />
                              {errors.mother && (
                                <div className="app__error_message">
                                  This is required
                                </div>
                              )}
                            </td>
                            <td className="font-bold border border-black bg-green-200 p-1">
                              OCCUPATION
                            </td>
                            <td className="font-bold border border-black p-1">
                              <input
                                {...register('mother_occupation', {
                                  required: true
                                })}
                                className="app__input_standard"
                              />
                              {errors.mother_occupation && (
                                <div className="app__error_message">
                                  This is required
                                </div>
                              )}
                            </td>
                          </tr>
                          <tr>
                            <td className="font-bold border border-black bg-green-200 p-1">
                              GUARDIAN/BENEFACTORS
                            </td>
                            <td className="font-bold border border-black p-1">
                              <input
                                {...register('guardian', { required: true })}
                                className="app__input_standard"
                              />
                              {errors.guardian && (
                                <div className="app__error_message">
                                  This is required
                                </div>
                              )}
                            </td>
                            <td className="font-bold border border-black bg-green-200 p-1">
                              OCCUPATION
                            </td>
                            <td className="font-bold border border-black p-1">
                              <input
                                {...register('guardian_occupation', {
                                  required: true
                                })}
                                className="app__input_standard"
                              />
                              {errors.guardian_occupation && (
                                <div className="app__error_message">
                                  This is required
                                </div>
                              )}
                            </td>
                          </tr>
                          <tr>
                            <td className="font-bold border border-black bg-green-200 p-1">
                              PERMANENT ADDRESS
                            </td>
                            <td
                              colSpan={3}
                              className="font-bold border border-black p-1"
                            >
                              <input
                                {...register('parent_address', {
                                  required: true
                                })}
                                className="app__input_standard"
                              />
                              {errors.parent_address && (
                                <div className="app__error_message">
                                  This is required
                                </div>
                              )}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td className="text-xs w-1/2 p-4">
                      <table className="w-full">
                        <tbody>
                          <tr>
                            <td
                              colSpan={4}
                              className="font-bold border border-black bg-green-200 p-1 text-base"
                            >
                              <div>
                                HIGH SCHOOL INFORMATION{' '}
                                <span className="text-xs">
                                  (for Entrance Scholarship Applicants Only)
                                </span>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td className="font-bold border border-black bg-green-200 p-1">
                              SENIOR HIGH SCHOOL
                            </td>
                            <td className="font-bold border border-black p-1">
                              <input
                                {...register('shs')}
                                className="app__input_standard"
                              />
                            </td>
                            <td className="font-bold border border-black bg-green-200 p-1">
                              PRINCIPAL
                            </td>
                            <td className="font-bold border border-black p-1">
                              <input
                                {...register('shs_principal')}
                                className="app__input_standard"
                              />
                            </td>
                          </tr>
                          <tr>
                            <td className="font-bold border border-black bg-green-200 p-1">
                              ADDRESS
                            </td>
                            <td className="font-bold border border-black p-1">
                              <input
                                {...register('shs_address')}
                                className="app__input_standard"
                              />
                            </td>
                            <td className="font-bold border border-black bg-green-200 p-1">
                              YEAR GRADUATED
                            </td>
                            <td className="font-bold border border-black p-1">
                              <input
                                {...register('shs_year_graduated')}
                                className="app__input_standard"
                              />
                            </td>
                          </tr>
                          <tr>
                            <td className="font-bold border border-black bg-green-200 p-1">
                              TYPE OF SCHOOL
                            </td>
                            <td className="font-bold border border-black p-1">
                              <select
                                {...register('shs_school_type')}
                                className="app__select_standard"
                              >
                                <option value="Public">Public</option>
                                <option value="Private">Private</option>
                              </select>
                            </td>
                            <td className="font-bold border border-black bg-green-200 p-1">
                              HONORS RECEIVED
                            </td>
                            <td className="font-bold border border-black p-1">
                              <select
                                {...register('shs_honor')}
                                className="app__select_standard"
                              >
                                <option value="">Select</option>
                                <option value="Validictorian">
                                  Validictorian
                                </option>
                                <option value="Salutarian">Salutarian</option>
                              </select>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td className="text-xs w-1/2 p-4">
                      <table className="w-full">
                        <tbody>
                          <tr>
                            <td
                              colSpan={6}
                              className="font-bold border border-black bg-green-200 p-1 text-base"
                            >
                              REFERENCES
                            </td>
                          </tr>
                          <tr>
                            <td className="font-bold border border-black bg-green-200 p-1">
                              NAME
                            </td>
                            <td className="font-bold border border-black p-1">
                              <input
                                {...register('reference_name_1', {
                                  required: true
                                })}
                                className="app__input_standard"
                              />
                              {errors.reference_name_1 && (
                                <div className="app__error_message">
                                  This is required
                                </div>
                              )}
                            </td>
                            <td className="font-bold border border-black bg-green-200 p-1">
                              NAME
                            </td>
                            <td className="font-bold border border-black p-1">
                              <input
                                {...register('reference_name_2')}
                                className="app__input_standard"
                              />
                            </td>
                            <td className="font-bold border border-black bg-green-200 p-1">
                              NAME
                            </td>
                            <td className="font-bold border border-black p-1">
                              <input
                                {...register('reference_name_3')}
                                className="app__input_standard"
                              />
                            </td>
                          </tr>
                          <tr>
                            <td className="font-bold border border-black bg-green-200 p-1">
                              ADDRESS
                            </td>
                            <td className="font-bold border border-black p-1">
                              <input
                                {...register('reference_address_1', {
                                  required: true
                                })}
                                className="app__input_standard"
                              />
                              {errors.reference_address_1 && (
                                <div className="app__error_message">
                                  This is required
                                </div>
                              )}
                            </td>
                            <td className="font-bold border border-black bg-green-200 p-1">
                              ADDRESS
                            </td>
                            <td className="font-bold border border-black p-1">
                              <input
                                {...register('reference_address_2')}
                                className="app__input_standard"
                              />
                            </td>
                            <td className="font-bold border border-black bg-green-200 p-1">
                              ADDRESS
                            </td>
                            <td className="font-bold border border-black p-1">
                              <input
                                {...register('reference_address_3')}
                                className="app__input_standard"
                              />
                            </td>
                          </tr>
                          <tr>
                            <td className="font-bold border border-black bg-green-200 p-1">
                              CONTACT #
                            </td>
                            <td className="font-bold border border-black p-1">
                              <input
                                {...register('reference_contact_1', {
                                  required: true
                                })}
                                className="app__input_standard"
                              />
                              {errors.reference_contact_1 && (
                                <div className="app__error_message">
                                  This is required
                                </div>
                              )}
                            </td>
                            <td className="font-bold border border-black bg-green-200 p-1">
                              CONTACT #
                            </td>
                            <td className="font-bold border border-black p-1">
                              <input
                                {...register('reference_contact_2')}
                                className="app__input_standard"
                              />
                            </td>
                            <td className="font-bold border border-black bg-green-200 p-1">
                              CONTACT #
                            </td>
                            <td className="font-bold border border-black p-1">
                              <input
                                {...register('reference_contact_3')}
                                className="app__input_standard"
                              />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="mx-4 mb-8">
                <div className="app__form_field_container">
                  <div>
                    <div className="mt-4 font-bold">
                      {details?.name} SCHOLARSHIP REQUIREMENTS
                    </div>
                    <div className="tiptopeditor">
                      <div
                        className="text-sm"
                        dangerouslySetInnerHTML={{
                          __html:
                            details?.requirements ||
                            '<p>No requirements uploaded yet.</p>'
                        }}
                      />
                    </div>
                  </div>
                  <div className="w-full">
                    <div className="text-gray-700 italic text-xs">
                      (Merge all requirements into single PDF file and upload
                      below)
                    </div>
                  </div>
                  <div className="w-full">
                    <div className="mt-2 flex flex-col space-y-2 items-start">
                      {/* File Input Wrapper */}
                      <div className="relative">
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={handleFileChange}
                          className="hidden" // Hides the default file input
                          id="fileUpload"
                        />

                        {/* Custom Button for File Input */}
                        <label
                          htmlFor="fileUpload"
                          className="cursor-pointer flex items-start space-x-2"
                        >
                          <span className="text-sm text-gray-700 font-bold">
                            Click here to attachment requirements
                          </span>
                          <PaperClipIcon className="w-4 h-4" />
                        </label>
                        {errors.file_path && (
                          <div className="app__error_message">
                            {errors.file_path.message}
                          </div>
                        )}

                        {file && (
                          <span className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                            Selected: {file.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <hr className="my-6" />
                <div className="w-full">
                  <div className="app__label_standard">
                    <label className="flex items-center space-x-1">
                      <input
                        {...register('confirm', { required: true })}
                        type="checkbox"
                      />

                      <span className="font-normal text-xs">
                        By checking this box, you acknowledge that all
                        information is accurate.
                      </span>
                    </label>
                    {errors.confirm && (
                      <div className="app__error_message">
                        Confimation is required
                      </div>
                    )}
                  </div>
                </div>
                <div className="">
                  <button
                    type="submit"
                    disabled={saving}
                    className="app__btn_green_sm"
                  >
                    {saving ? 'Verifying Data..' : 'Submit'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
      <div className="mt-auto bg-gray-800 p-4 text-white fixed bottom-0 w-full">
        <div className="text-white text-center text-xs">&copy; SWSOS</div>
      </div>
    </div>
  )
}
