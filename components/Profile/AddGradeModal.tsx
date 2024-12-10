import { CustomButton } from '@/components/index'
import { useFilter } from '@/context/FilterContext'
import { useSupabase } from '@/context/SupabaseProvider'
import { fetchPeriods, logError } from '@/utils/fetchApi'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

// Types
import type { EvaluationPeriodTypes, GradeTypes } from '@/types'

// Redux imports
import { updateList } from '@/GlobalRedux/Features/listSlice'
import { updateResultCounter } from '@/GlobalRedux/Features/resultsCounterSlice'
import { PaperClipIcon } from '@heroicons/react/20/solid'
import { useDispatch, useSelector } from 'react-redux'

interface ModalProps {
  hideModal: () => void
  editData: GradeTypes | null
}

const AddGradeModal = ({ hideModal, editData }: ModalProps) => {
  const { setToast } = useFilter()
  const { supabase, session } = useSupabase()
  const [saving, setSaving] = useState(false)

  const [periods, setPeriods] = useState<EvaluationPeriodTypes[]>([])

  // Redux staff
  const globallist = useSelector((state: any) => state.list.value)
  const resultsCounter = useSelector((state: any) => state.results.value)
  const dispatch = useDispatch()

  const [file, setFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    setFile(selectedFile)
  }

  const {
    register,
    formState: { errors },
    reset,
    setError,
    handleSubmit
  } = useForm<GradeTypes>({
    mode: 'onSubmit'
  })

  const onSubmit = async (formdata: GradeTypes) => {
    if (saving) return

    setSaving(true)

    if (editData) {
      void handleUpdate(formdata)
    } else {
      void handleCreate(formdata)
    }
  }

  const handleCreate = async (formdata: GradeTypes) => {
    try {
      let filePath: string | null = null

      // Upload file if it exists
      if (file) {
        const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')
        const fileName = `${Date.now()}_${sanitizedFileName}`
        const { data: fileData, error: fileError } = await supabase.storage
          .from('sws_public') // Replace with your storage bucket name
          .upload(`grades/${fileName}`, file)

        if (fileError) throw new Error(fileError.message)
        filePath = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/sws_public/${fileData.path}` // Get the path of the uploaded file
      }

      const newData = {
        user_id: session.user.id,
        evaluation_period_id: formdata.period_id,
        file_path: filePath
      }

      const { data, error } = await supabase
        .from('sws_grades')
        .insert(newData)
        .select()

      if (error) {
        void logError(
          'Create grades',
          'sws_grades',
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
        period: periods.find(
          (p) => p.id.toString() === formdata.period_id.toString()
        ),
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

  const handleUpdate = async (formdata: GradeTypes) => {
    if (!editData) return

    try {
      let filePath: string | null = null

      // Upload file if it exists
      if (file) {
        const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')
        const fileName = `${Date.now()}_${sanitizedFileName}`
        const { data: fileData, error: fileError } = await supabase.storage
          .from('sws_public') // Replace with your storage bucket name
          .upload(`grades/${fileName}`, file)

        if (fileError) throw new Error(fileError.message)
        filePath = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/sws_public/${fileData.path}` // Get the path of the uploaded file
      }

      const newData = {
        file_path: filePath
      }

      const { data, error } = await supabase
        .from('sws_grades')
        .update(newData)
        .eq('id', editData.id)

      if (error) {
        void logError(
          'Create grades',
          'sws_grades',
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

  // Featch data
  useEffect(() => {
    ;(async () => {
      const result = await fetchPeriods(999, 0)
      setPeriods(result.data)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <div className="app__modal_wrapper">
        <div className="app__modal_wrapper2">
          <div className="app__modal_wrapper3">
            <div className="app__modal_header">
              <h5 className="app__modal_header_text">Grade Details</h5>
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
                  <div className="app__label_standard">Evaluation Period</div>
                  <div>
                    {editData && <span>{editData.period.description}</span>}
                    {!editData && (
                      <>
                        <select
                          {...register('period_id', { required: true })}
                          className="app__input_standard"
                        >
                          <option value="">Choose Evaluation Period</option>
                          {periods?.map((p, i) => (
                            <option key={i} value={p.id}>
                              {p.description}
                            </option>
                          ))}
                        </select>
                        {errors.period_id && (
                          <div className="app__error_message">
                            Period is required
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
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
                        <span className="text-sm text-gray-600">
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

export default AddGradeModal
