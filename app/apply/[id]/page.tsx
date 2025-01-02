'use client'
import { TopBarDark } from '@/components/index'
import { useSupabase } from '@/context/SupabaseProvider'
import { ApplicationTypes } from '@/types'
import { generateRandomAlphaNumber } from '@/utils/text-helper'
import { PaperClipIcon } from '@heroicons/react/20/solid'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

export default function Page({ params }: { params: { id: string } }) {
  const programId = params.id
  const [isLoggedIn, setLoggedIn] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const { supabase } = useSupabase()
  const router = useRouter()

  const [saving, setSaving] = useState(false)
  const [refCode, setRefCode] = useState('')

  const [file, setFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    setFile(selectedFile)
  }

  const {
    register,
    formState: { errors },
    setError,
    clearErrors,
    handleSubmit
  } = useForm<ApplicationTypes>({
    mode: 'onSubmit'
  })

  const onSubmit = async (formdata: ApplicationTypes) => {
    if (saving) return

    const emailCheck = await handleCheckEmail(formdata.email)
    if (!emailCheck) return
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

        if (fileError) throw new Error(fileError.message)
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
        birthday: formdata.birthday,
        email: formdata.email,
        age: formdata.age,
        gender: formdata.gender,
        civil_status: formdata.civil_status,
        contact_number: formdata.contact_number,
        present_address: formdata.present_address,
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
          message: `${fullname} has recently applied for scholarship. Kindly review his/her applicantion.`,
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

  return (
    <div className="app__home">
      <TopBarDark isGuest={isLoggedIn ? false : true} />
      <div className="h-auto bg-gray-700 pb-10 pt-20 px-6 md:flex items-start md:space-x-4 justify-center">
        <div className="bg-white mx-1 w-full md:w-[700px] rounded-lg border mb-20">
          {submitted && (
            <div className="text-gray-700 p-4">
              Application successfully submitted. Your Application Code is{' '}
              <span className="font-bold text-lg">{refCode}</span>
            </div>
          )}
          {!submitted && (
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
                      <div className="text-xl font-bold mt-5">
                        ACADEMIC SCHOLARSHIP APPLICATION FORM
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
                                {...register('middlename', { required: true })}
                                className="app__input_standard"
                              />
                              {errors.middlename && (
                                <div className="app__error_message">
                                  Middlename is required
                                </div>
                              )}
                            </td>
                            <td className="font-bold border border-black bg-green-200 p-1">
                              GENDER
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
                            <td
                              colSpan={3}
                              className="font-bold border border-black p-1"
                            >
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
                                {...register('contact_number')}
                                className="app__input_standard"
                              />
                            </td>
                          </tr>
                          <tr>
                            <td className="font-bold border border-black bg-green-200 p-1">
                              BOARDING HOUSE/APPARTMENT ADDRESS
                            </td>
                            <td className="font-bold border border-black p-1">
                              <input
                                {...register('present_address')}
                                className="app__input_standard"
                              />
                            </td>
                          </tr>
                          <tr>
                            <td className="font-bold border border-black bg-green-200 p-1">
                              PERMANENT ADDRESS
                            </td>
                            <td className="font-bold border border-black p-1">
                              <input
                                {...register('permanent_address')}
                                className="app__input_standard"
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
                                {...register('father')}
                                className="app__input_standard"
                              />
                            </td>
                            <td className="font-bold border border-black bg-green-200 p-1">
                              OCCUPATION
                            </td>
                            <td className="font-bold border border-black p-1">
                              <input
                                {...register('father_occupation')}
                                className="app__input_standard"
                              />
                            </td>
                          </tr>
                          <tr>
                            <td className="font-bold border border-black bg-green-200 p-1">
                              MOTHERS MAIDEN NAME
                            </td>
                            <td className="font-bold border border-black p-1">
                              <input
                                {...register('mother')}
                                className="app__input_standard"
                              />
                            </td>
                            <td className="font-bold border border-black bg-green-200 p-1">
                              OCCUPATION
                            </td>
                            <td className="font-bold border border-black p-1">
                              <input
                                {...register('mother_occupation')}
                                className="app__input_standard"
                              />
                            </td>
                          </tr>
                          <tr>
                            <td className="font-bold border border-black bg-green-200 p-1">
                              GUARDIAN/BENEFACTORS
                            </td>
                            <td className="font-bold border border-black p-1">
                              <input
                                {...register('guardian')}
                                className="app__input_standard"
                              />
                            </td>
                            <td className="font-bold border border-black bg-green-200 p-1">
                              OCCUPATION
                            </td>
                            <td className="font-bold border border-black p-1">
                              <input
                                {...register('guardian_occupation')}
                                className="app__input_standard"
                              />
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
                                {...register('parent_address')}
                                className="app__input_standard"
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
                              <input
                                {...register('shs_honor')}
                                className="app__input_standard"
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
                                {...register('reference_name_1')}
                                className="app__input_standard"
                              />
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
                                {...register('reference_address_1')}
                                className="app__input_standard"
                              />
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
                                {...register('reference_contact_1')}
                                className="app__input_standard"
                              />
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
                  <div className="w-full">
                    <div className="mt-2 flex flex-col space-y-2 items-start">
                      {/* File Input Wrapper */}
                      <div className="relative">
                        <input
                          type="file"
                          accept=".pdf, .doc, .docx, .xls, .xlsx, .png, .jpg, .jpeg, .gif"
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
                            Attachment
                          </span>
                          <PaperClipIcon className="w-4 h-4" />
                        </label>

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
