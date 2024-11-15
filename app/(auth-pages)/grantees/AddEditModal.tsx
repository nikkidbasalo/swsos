import { CustomButton } from '@/components'
import { useFilter } from '@/context/FilterContext'
import { useSupabase } from '@/context/SupabaseProvider'
import { logError } from '@/utils/fetchApi'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

// Types
import type { GranteeTypes, ProgramTypes } from '@/types'

// Redux imports
import { updateList } from '@/GlobalRedux/Features/listSlice'
import { updateResultCounter } from '@/GlobalRedux/Features/resultsCounterSlice'
import { useDispatch, useSelector } from 'react-redux'

interface ModalProps {
  hideModal: () => void
  editData: GranteeTypes | null
  programs: ProgramTypes[] | []
  type: string
}

const AddEditModal = ({ hideModal, editData, programs, type }: ModalProps) => {
  const { setToast } = useFilter()
  const { supabase } = useSupabase()
  const [saving, setSaving] = useState(false)

  // Redux staff
  const globallist = useSelector((state: any) => state.list.value)
  const resultsCounter = useSelector((state: any) => state.results.value)
  const dispatch = useDispatch()

  const {
    register,
    formState: { errors },
    reset,
    handleSubmit
  } = useForm<GranteeTypes>({
    mode: 'onSubmit'
  })

  const onSubmit = async (formdata: GranteeTypes) => {
    if (saving) return

    setSaving(true)

    if (editData) {
      void handleUpdate(formdata)
    } else {
      void handleCreate(formdata)
    }
  }

  const handleCreate = async (formdata: GranteeTypes) => {
    const newData = {
      program_id: formdata.program_id,
      id_number: formdata.id_number,
      year_granted: formdata.year_granted,
      lastname: formdata.lastname,
      firstname: formdata.firstname,
      middlename: formdata.middlename,
      tes_award_number: formdata.tes_award_number,
      gender: formdata.gender,
      birthday: formdata.birthday || null,
      degree_program: formdata.degree_program,
      year_level_status: formdata.year_level_status,
      remarks: formdata.remarks
    }

    try {
      const { data, error } = await supabase
        .from('sws_grantees')
        .insert(newData)
        .select()

      if (error) {
        void logError(
          'Create Grantee',
          'sws_grantees',
          JSON.stringify(newData),
          error.message
        )
        setToast(
          'error',
          'Saving failed, please reload the page and try again.'
        )
        throw new Error(error.message)
      }

      const updatedData = {
        ...newData,
        id: data[0].id
      }
      dispatch(updateList([updatedData, ...globallist]))

      // pop up the success message
      setToast('success', 'Successfully saved.')

      // Updating showing text in redux
      dispatch(
        updateResultCounter({
          showing: Number(resultsCounter.showing) + 1,
          results: Number(resultsCounter.results) + 1
        })
      )

      setSaving(false)

      // hide the modal
      hideModal()

      // reset all form fields
      reset()
    } catch (e) {
      console.error(e)
    }
  }

  const handleUpdate = async (formdata: GranteeTypes) => {
    if (!editData) return

    const newData = {
      program_id: formdata.program_id,
      id_number: formdata.id_number,
      year_granted: formdata.year_granted,
      lastname: formdata.lastname,
      firstname: formdata.firstname,
      middlename: formdata.middlename,
      tes_award_number: formdata.tes_award_number,
      gender: formdata.gender,
      birthday: formdata.birthday || null,
      degree_program: formdata.degree_program,
      year_level_status: formdata.year_level_status,
      remarks: formdata.remarks
    }

    try {
      const { error } = await supabase
        .from('sws_grantees')
        .update(newData)
        .eq('id', editData.id)

      if (error) {
        void logError(
          'Update grantee',
          'sws_grantees',
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
        id: editData.id
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

  // manually set the defaultValues of use-form-hook whenever the component receives new props.
  useEffect(() => {
    reset({
      program_id: editData ? editData.program_id : '',
      id_number: editData ? editData.id_number : '',
      year_granted: editData ? editData.year_granted : '',
      control_number: editData ? editData.control_number : '',
      lastname: editData ? editData.lastname : '',
      firstname: editData ? editData.firstname : '',
      middlename: editData ? editData.middlename : '',
      tes_award_number: editData ? editData.tes_award_number : '',
      gender: editData ? editData.gender : '',
      birthday: editData ? editData.birthday : '',
      degree_program: editData ? editData.degree_program : '',
      year_level_status: editData ? editData.year_level_status : '',
      remarks: editData ? editData.remarks : ''
    })
  }, [editData, reset])

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
                  <div className="app__label_standard">Student ID No.</div>
                  <div>
                    <input
                      placeholder="Student ID No."
                      {...register('id_number', { required: true })}
                      className="app__input_standard"
                    />
                    {errors.id_number && (
                      <div className="app__error_message">
                        ID Number is required
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {type === 'external-grant' && (
                <>
                  <div className="app__form_field_container">
                    <div className="w-full">
                      <div className="app__label_standard">Control No.</div>
                      <div>
                        <input
                          placeholder="Control No."
                          {...register('control_number', { required: true })}
                          className="app__input_standard"
                        />
                        {errors.control_number && (
                          <div className="app__error_message">
                            Control No. is required
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="app__form_field_container">
                    <div className="w-full">
                      <div className="app__label_standard">TES Award No.</div>
                      <div>
                        <input
                          placeholder="TES Award No."
                          {...register('tes_award_number', { required: true })}
                          className="app__input_standard"
                        />
                        {errors.tes_award_number && (
                          <div className="app__error_message">
                            TES Award No. is required
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="app__form_field_container">
                    <div className="w-full">
                      <div className="app__label_standard">Gender</div>
                      <div>
                        <select
                          {...register('gender', { required: true })}
                          className="app__select_standard"
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                        {errors.gender && (
                          <div className="app__error_message">
                            Gender is required
                          </div>
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
                          {...register('birthday', { required: true })}
                          className="app__input_standard"
                        />
                        {errors.birthday && (
                          <div className="app__error_message">
                            Birthday is required
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="app__form_field_container">
                    <div className="w-full">
                      <div className="app__label_standard">Degree Program</div>
                      <div>
                        <input
                          placeholder="Degree Program"
                          {...register('degree_program', { required: true })}
                          className="app__input_standard"
                        />
                        {errors.degree_program && (
                          <div className="app__error_message">
                            Degree Program is required
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="app__form_field_container">
                    <div className="w-full">
                      <div className="app__label_standard">
                        Year Level / Status
                      </div>
                      <div>
                        <input
                          placeholder="Year Level / Status"
                          {...register('year_level_status', { required: true })}
                          className="app__input_standard"
                        />
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
                      <div className="app__label_standard">Remarks</div>
                      <div>
                        <input
                          placeholder="Remarks"
                          {...register('remarks', { required: true })}
                          className="app__input_standard"
                        />
                        {errors.remarks && (
                          <div className="app__error_message">
                            Remarks is required
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
              <div className="app__form_field_container">
                <div className="w-full">
                  <div className="app__label_standard">Type</div>
                  <div>
                    <select
                      {...register('program_id', { required: true })}
                      className="app__select_standard"
                    >
                      <option value="">Select</option>
                      {programs.length > 0 &&
                        programs.map((item, index) => (
                          <option key={index} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                    </select>
                    {errors.program_id && (
                      <div className="app__error_message">
                        Program is required
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="app__form_field_container">
                <div className="w-full">
                  <div className="app__label_standard">Year Granted</div>
                  <div>
                    <input
                      placeholder="Year Granted"
                      {...register('year_granted', { required: true })}
                      className="app__input_standard"
                    />
                    {errors.year_granted && (
                      <div className="app__error_message">
                        Year Granted is required
                      </div>
                    )}
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
