import { CustomButton } from '@/components/index'
import { useFilter } from '@/context/FilterContext'
import { useSupabase } from '@/context/SupabaseProvider'
import { fetchInstitutes, fetchPrograms, logError } from '@/utils/fetchApi'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

// Types
import type { GranteeTypes, InstituteTypes, ProgramTypes } from '@/types'

// Redux imports
import { updateList } from '@/GlobalRedux/Features/listSlice'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'

interface ModalProps {
  hideModal: () => void
  editData: GranteeTypes | null
  programId: string
  type: string
}

const AddEditModal = ({ hideModal, editData, programId, type }: ModalProps) => {
  const { setToast } = useFilter()
  const { supabase } = useSupabase()
  const [saving, setSaving] = useState(false)

  const [programs, setPrograms] = useState<ProgramTypes[]>([])
  const [institutes, setInstitutes] = useState<InstituteTypes[]>([])

  // Redux staff
  const globallist = useSelector((state: any) => state.list.value)
  const resultsCounter = useSelector((state: any) => state.results.value)
  const dispatch = useDispatch()

  const {
    register,
    formState: { errors },
    reset,
    setError,
    clearErrors,
    handleSubmit
  } = useForm<GranteeTypes>({
    mode: 'onSubmit'
  })

  const onSubmit = async (formdata: GranteeTypes) => {
    if (saving) return

    if (editData) {
      setSaving(true)
      void handleUpdate(formdata)
    } else {
      const emailCheck = await handleCheckEmail(formdata.email)
      if (!emailCheck) return

      setSaving(true)
      void handleCreate(formdata)
    }
  }

  const handleCreate = async (formdata: GranteeTypes) => {
    // zz
    const tempPassword = Math.floor(Math.random() * 8999) + 1000

    const newData = {
      program_id: programId,
      id_number: formdata.id_number,
      year_granted: formdata.year_granted,
      lastname: formdata.lastname,
      firstname: formdata.firstname,
      middlename: formdata.middlename,
      email: formdata.email,
      employee_number: formdata.employee_number,
      function: formdata.function,
      control_number: formdata.control_number,
      tes_award_number: formdata.tes_award_number,
      gender: formdata.gender,
      birthday: formdata.birthday || null,
      degree_program: formdata.degree_program,
      year_level_status: formdata.year_level_status,
      institute_id: formdata.institute_id,
      remarks: formdata.remarks,
      type: 'Scholar',
      temp_password: tempPassword.toString()
    }

    try {
      // Sign up the user on the server side to fix pkce issue https://github.com/supabase/auth-helpers/issues/569
      axios
        .post('/api/signup', {
          item: newData
        })
        .then(async function (response) {
          if (response.data.error_message === '') {
            const { error: error2 } = await supabase
              .from('sws_users')
              .insert({ ...newData, id: response.data.insert_id })

            if (error2) throw new Error(error2.message)

            const updatedData = {
              ...newData,
              program: programs.find(
                (p) => p.id.toString() === programId.toString()
              ),
              id: response.data.insert_id,
              institute: institutes.find(
                (p) => p.id.toString() === formdata.institute_id
              )
            }
            dispatch(updateList([updatedData, ...globallist]))

            // pop up the success message
            setToast('success', 'Successfully saved.')

            // hide the modal
            hideModal()

            setSaving(false)
          } else {
            setSaving(false)
            throw new Error(response.data.error_message)
          }
        })
        .catch(function (error) {
          setToast(
            'error',
            `Something went wrong, please reload the page': ${error}`
          )
          console.error(error)
        })
    } catch (e) {
      // pop up the success message
      setToast('success', 'Something went wrong, please reload the page')

      console.error(e)
    }
  }

  const handleUpdate = async (formdata: GranteeTypes) => {
    if (!editData) return

    const newData = {
      id_number: formdata.id_number,
      year_granted: formdata.year_granted,
      lastname: formdata.lastname,
      firstname: formdata.firstname,
      middlename: formdata.middlename,
      email: formdata.email,
      employee_number: formdata.middlename,
      function: formdata.function,
      tes_award_number: formdata.tes_award_number,
      gender: formdata.gender,
      birthday: formdata.birthday || null,
      degree_program: formdata.degree_program,
      year_level_status: formdata.year_level_status,
      institute_id: formdata.institute_id,
      remarks: formdata.remarks
    }

    try {
      const { error } = await supabase
        .from('sws_users')
        .update(newData)
        .eq('id', editData.id)

      if (error) {
        void logError(
          'Update grantee',
          'sws_users',
          JSON.stringify(newData),
          error.message
        )
        setToast(
          'error',
          'Saving failed, please reload the page and try again.'
        )
        throw new Error(error.message)
      }

      const items = [...globallist]
      const updatedData = {
        ...newData,
        id: editData.id,
        institute: institutes.find(
          (p) => p.id.toString() === formdata.institute_id
        )
      }
      const foundIndex = items.findIndex((x) => x.id === updatedData.id)
      items[foundIndex] = { ...items[foundIndex], ...updatedData }
      dispatch(updateList(items))

      // pop up the success message
      setToast('success', 'Successfully saved.')

      setSaving(false)

      // hide the modal
      hideModal()

      // reset all form fields
      reset()
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

  // Featch data
  useEffect(() => {
    ;(async () => {
      const result = await fetchPrograms(type, 999, 0)
      setPrograms(result.data)

      const institutesData = await fetchInstitutes(999, 0)
      setInstitutes(institutesData.data)
    })()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // manually set the defaultValues of use-form-hook whenever the component receives new props.
  useEffect(() => {
    reset({
      id_number: editData ? editData.id_number : '',
      year_granted: editData ? editData.year_granted : '',
      control_number: editData ? editData.control_number : '',
      lastname: editData ? editData.lastname : '',
      firstname: editData ? editData.firstname : '',
      middlename: editData ? editData.middlename : '',
      email: editData ? editData.email : '',
      employee_number: editData ? editData.employee_number : '',
      function: editData ? editData.function : '',
      tes_award_number: editData ? editData.tes_award_number : '',
      gender: editData ? editData.gender : '',
      birthday: editData ? editData.birthday : '',
      degree_program: editData ? editData.degree_program : '',
      year_level_status: editData ? editData.year_level_status : '',
      institute_id: editData ? editData.institute_id : '',
      remarks: editData ? editData.remarks : ''
    })
  }, [editData, institutes, reset])

  return (
    <>
      <div className="app__modal_wrapper">
        <div className="app__modal_wrapper2">
          <div className="app__modal_wrapper3">
            <div className="app__modal_header">
              <h5 className="app__modal_header_text">Grantee Details</h5>
              <CustomButton
                containerStyles="app__btn_gray"
                title="Close"
                isDisabled={saving}
                btnType="button"
                handleClick={hideModal}
              />
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="app__modal_body">
              <div className="app__form_field_container">
                <div className="w-full">
                  <div className="app__label_standard">Firstname</div>
                  <div>
                    <input
                      placeholder="Firstname."
                      {...register('firstname', { required: true })}
                      className="app__input_standard"
                    />
                    {errors.firstname && (
                      <div className="app__error_message">
                        Firstname is required
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="app__form_field_container">
                <div className="w-full">
                  <div className="app__label_standard">Middlename</div>
                  <div>
                    <input
                      placeholder="Middlename"
                      {...register('middlename', { required: true })}
                      className="app__input_standard"
                    />
                    {errors.middlename && (
                      <div className="app__error_message">
                        Middlename is required
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="app__form_field_container">
                <div className="w-full">
                  <div className="app__label_standard">Lastname</div>
                  <div>
                    <input
                      placeholder="Lastname"
                      {...register('lastname', { required: true })}
                      className="app__input_standard"
                    />
                    {errors.lastname && (
                      <div className="app__error_message">
                        Lastname is required
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="app__form_field_container">
                <div className="w-full">
                  <div className="app__label_standard">Email</div>
                  <div>
                    <input
                      {...register('email', {
                        required: 'Email is required'
                      })}
                      type="email"
                      className="app__input_standard"
                    />
                    {errors.email && (
                      <div className="app__error_message">
                        {errors.email.message}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="app__form_field_container">
                <div className="w-full">
                  <div className="app__label_standard">Sex</div>
                  <div>
                    <select
                      {...register('gender', { required: true })}
                      className="app__select_standard"
                    >
                      <option value="">Select Sex</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                    {errors.gender && (
                      <div className="app__error_message">Sex is required</div>
                    )}
                  </div>
                </div>
              </div>
              <div className="app__form_field_container">
                <div className="w-full">
                  <div className="app__label_standard">Birthday</div>
                  <div>
                    <input
                      type="date"
                      placeholder="Birthday"
                      {...register('birthday')}
                      className="app__input_standard"
                    />
                  </div>
                </div>
              </div>
              <div className="app__form_field_container">
                <div className="w-full">
                  <div className="app__label_standard">Year Level</div>
                  <div>
                    <select
                      {...register('year_level_status', { required: true })}
                      className="app__select_standard"
                    >
                      <option value="">Select Year Level</option>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                    {errors.year_level_status && (
                      <div className="app__error_message">
                        Year Level / Status is required
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="app__form_field_container">
                <div className="w-full">
                  <div className="app__label_standard">Institute</div>
                  <div>
                    <select
                      {...register('institute_id', { required: true })}
                      className="app__select_standard"
                    >
                      <option value="">Select Institute</option>
                      {institutes?.map((institute) => (
                        <option key={institute.id} value={institute.id}>
                          {institute.name}
                        </option>
                      ))}
                    </select>
                    {errors.institute_id && (
                      <div className="app__error_message">
                        Institute is required
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {type !== 'internal-grant' && (
                <div className="app__form_field_container">
                  <div className="w-full">
                    <div className="app__label_standard">Student ID No.</div>
                    <div>
                      <input
                        placeholder="Student ID No."
                        {...register('id_number')}
                        className="app__input_standard"
                      />
                    </div>
                  </div>
                </div>
              )}
              {type === 'internal-grant' && (
                <>
                  <div className="app__form_field_container">
                    <div className="w-full">
                      <div className="app__label_standard">Serial No.</div>
                      <div>
                        <input
                          placeholder="Serial No."
                          {...register('control_number')}
                          className="app__input_standard"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="app__form_field_container">
                    <div className="w-full">
                      <div className="app__label_standard">Employee ID No.</div>
                      <div>
                        <input
                          placeholder="Employee ID No."
                          {...register('employee_number')}
                          className="app__input_standard"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="app__form_field_container">
                    <div className="w-full">
                      <div className="app__label_standard">Function</div>
                      <div>
                        <input
                          placeholder="Function"
                          {...register('function')}
                          className="app__input_standard"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
              {type === 'external-grant' && (
                <>
                  <div className="app__form_field_container">
                    <div className="w-full">
                      <div className="app__label_standard">Control No.</div>
                      <div>
                        <input
                          placeholder="Control No."
                          {...register('control_number')}
                          className="app__input_standard"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="app__form_field_container">
                    <div className="w-full">
                      <div className="app__label_standard">TES Award No.</div>
                      <div>
                        <input
                          placeholder="TES Award No."
                          {...register('tes_award_number')}
                          className="app__input_standard"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="app__form_field_container">
                    <div className="w-full">
                      <div className="app__label_standard">Degree Program</div>
                      <div>
                        <input
                          placeholder="Degree Program"
                          {...register('degree_program')}
                          className="app__input_standard"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="app__form_field_container">
                    <div className="w-full">
                      <div className="app__label_standard">Remarks</div>
                      <div>
                        <input
                          placeholder="Remarks"
                          {...register('remarks')}
                          className="app__input_standard"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
              <div className="app__form_field_container">
                <div className="w-full">
                  <div className="app__label_standard">Year Granted</div>
                  <div>
                    <input
                      placeholder="Year Granted"
                      {...register('year_granted')}
                      className="app__input_standard"
                    />
                  </div>
                </div>
              </div>

              <hr className="my-6" />
              <div className="w-full">
                <div className="app__label_standard">
                  <label className="flex items-center space-x-1">
                    <input
                      {...register('confirmed', { required: true })}
                      type="checkbox"
                      className=""
                    />
                    <span className="font-normal text-xs">
                      By checking this box, you acknowledge that all information
                      is accurate.
                    </span>
                  </label>
                  {errors.confirmed && (
                    <div className="app__error_message">
                      Confirmation is required
                    </div>
                  )}
                </div>
              </div>
              <div className="app__modal_footer">
                <button type="submit" className="app__btn_green_sm">
                  {saving ? 'Saving..' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export default AddEditModal
