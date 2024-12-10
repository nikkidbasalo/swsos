import { CustomButton } from '@/components/index'
import { useFilter } from '@/context/FilterContext'
import { useSupabase } from '@/context/SupabaseProvider'
import { logError } from '@/utils/fetchApi'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

// Types
import type { ProgramTypes } from '@/types'

// Redux imports
import { updateList } from '@/GlobalRedux/Features/listSlice'
import { updateResultCounter } from '@/GlobalRedux/Features/resultsCounterSlice'
import { useDispatch, useSelector } from 'react-redux'

interface ModalProps {
  hideModal: () => void
  editData: ProgramTypes | null
  type: string
}

const AddEditModal = ({ hideModal, editData, type }: ModalProps) => {
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
    setError,
    handleSubmit
  } = useForm<ProgramTypes>({
    mode: 'onSubmit'
  })

  const onSubmit = async (formdata: ProgramTypes) => {
    if (saving) return

    setSaving(true)

    if (editData) {
      void handleUpdate(formdata)
    } else {
      void handleCreate(formdata)
    }
  }

  const validateName = async (name: string) => {
    if (editData) return

    const { data } = await supabase
      .from('sws_programs')
      .select('id', { count: 'exact' })
      .eq('type', type)
      .ilike('name', name)

    if (data && data.length > 0) {
      setError('name', { type: 'manual', message: 'Program already exists' })
    }
  }
  const handleCreate = async (formdata: ProgramTypes) => {
    const newData = {
      name: formdata.name,
      description: formdata.description,
      type,
      funds: formdata.funds,
      allow_applicants: formdata.allow_applicants
    }

    try {
      const { data, error } = await supabase
        .from('sws_programs')
        .insert(newData)
        .select()

      if (error) {
        void logError(
          'Create Program',
          'sws_programs',
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

  const handleUpdate = async (formdata: ProgramTypes) => {
    if (!editData) return

    const newData = {
      name: formdata.name,
      description: formdata.description,
      funds: formdata.funds,
      allow_applicants: formdata.allow_applicants
    }

    try {
      const { error } = await supabase
        .from('sws_programs')
        .update(newData)
        .eq('id', editData.id)

      if (error) {
        void logError(
          'Update program',
          'sws_programs',
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
      name: editData ? editData.name : '',
      description: editData ? editData.description : '',
      funds: editData ? editData.funds : '',
      allow_applicants: editData ? editData.allow_applicants : false
    })
  }, [editData, reset])

  return (
    <>
      <div className="app__modal_wrapper">
        <div className="app__modal_wrapper2">
          <div className="app__modal_wrapper3">
            <div className="app__modal_header">
              <h5 className="app__modal_header_text">
                Scholarship Program Details
              </h5>
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
                  <div className="app__label_standard">Title</div>
                  <div>
                    <input
                      {...register('name', { required: 'Title is required' })}
                      onBlur={(e) => validateName(e.target.value)}
                      className="app__input_standard"
                    />
                    {errors.name && (
                      <div className="app__error_message">
                        {errors.name.message}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="app__form_field_container">
                <div className="w-full">
                  <div className="app__label_standard">Description</div>
                  <div>
                    <input
                      {...register('description', { required: true })}
                      className="app__input_standard"
                    />
                    {errors.description && (
                      <div className="app__error_message">
                        Description is required
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="app__form_field_container">
                <div className="w-full">
                  <div className="app__label_standard">Total Funds</div>
                  <div>
                    <input
                      {...register('funds', { required: true })}
                      type="number"
                      step="any"
                      className="app__input_standard"
                    />
                    {errors.funds && (
                      <div className="app__error_message">
                        Funds is required
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="app__form_field_container">
                <div className="w-full">
                  <div className="app__label_standard">
                    <label className="flex items-center space-x-1">
                      <input
                        {...register('allow_applicants')}
                        type="checkbox"
                        className=""
                      />
                      <span className="font-normal">
                        Allow online applicants
                      </span>
                    </label>
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
