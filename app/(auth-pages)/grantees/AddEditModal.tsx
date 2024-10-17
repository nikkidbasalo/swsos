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
}

const AddEditModal = ({ hideModal, editData, programs }: ModalProps) => {
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
      fullname: formdata.fullname,
      id_number: formdata.id_number,
      year_granted: formdata.year_granted
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
      fullname: formdata.fullname,
      id_number: formdata.id_number,
      year_granted: formdata.year_granted
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
      fullname: editData ? editData.fullname : '',
      id_number: editData ? editData.id_number : '',
      year_granted: editData ? editData.year_granted : ''
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
                  <div className="app__label_standard">Fullname</div>
                  <div>
                    <input
                      {...register('fullname', { required: true })}
                      className="app__input_standard"
                    />
                    {errors.fullname && (
                      <div className="app__error_message">
                        Fullname is required
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="app__form_field_container">
                <div className="w-full">
                  <div className="app__label_standard">ID Number</div>
                  <div>
                    <input
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
