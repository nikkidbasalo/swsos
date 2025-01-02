import { CustomButton } from '@/components/index'
import { useFilter } from '@/context/FilterContext'
import { useSupabase } from '@/context/SupabaseProvider'
import { fetchPrograms, logError } from '@/utils/fetchApi'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

// Types
import type { AccountTypes, ProgramTypes } from '@/types'

// Redux imports

interface ModalProps {
  hideModal: () => void
  refresh: () => void
}

interface FormTypes {
  confirmed: string
  program_id: string
  period: string
  amount: string
}
const BulkAddModal = ({ hideModal, refresh }: ModalProps) => {
  const { setToast } = useFilter()
  const { supabase } = useSupabase()
  const [saving, setSaving] = useState(false)

  const [programs, setPrograms] = useState<ProgramTypes[]>([])

  const {
    register,
    formState: { errors },
    handleSubmit
  } = useForm<FormTypes>({
    mode: 'onSubmit'
  })

  const onSubmit = async (formdata: FormTypes) => {
    if (saving) return

    setSaving(true)
    void handleCreate(formdata)
  }

  const handleCreate = async (formdata: FormTypes) => {
    try {
      const { data, error } = await supabase
        .from('sws_users')
        .select()
        .eq('program_id', formdata.program_id)

      if (error) {
        void logError(
          'Bulk Create Allowance',
          'sws_allowances',
          ')',
          error.message
        )
        setToast(
          'error',
          'Saving failed, please reload the page and try again.'
        )
        throw new Error(error.message)
      }

      const insertArray: Array<{
        user_id: string | number
        program_id: string | number
        period: string | number
        amount: string
      }> = []

      data.forEach((item: AccountTypes) => {
        insertArray.push({
          user_id: item.id,
          program_id: formdata.program_id,
          period: formdata.period,
          amount: formdata.amount
        })
      })

      if (insertArray.length === 0) {
        setToast('error', 'No grantees found on the selected program')
        throw new Error('No grantees found on the selected program')
      }

      const { error: error2 } = await supabase
        .from('sws_allowances')
        .insert(insertArray)

      if (error2) {
        void logError(
          'Bulk Create Allowance',
          'sws_allowances',
          ')',
          error2.message
        )
        setToast(
          'error',
          'Saving failed, please reload the page and try again.'
        )
        throw new Error(error2.message)
      }

      setToast('success', 'Successfully added')

      // hide the modal
      hideModal()
      refresh()
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  // Featch data
  useEffect(() => {
    ;(async () => {
      const result = await fetchPrograms('', 999, 0)
      setPrograms(result.data)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <div className="app__modal_wrapper">
        <div className="app__modal_wrapper2">
          <div className="app__modal_wrapper3">
            <div className="app__modal_header">
              <h5 className="app__modal_header_text">Bulk Add Allowances</h5>
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
                  <div className="app__label_standard">Program</div>
                  <div>
                    <select
                      {...register('program_id', { required: true })}
                      className="app__select_standard"
                    >
                      <option value="">Select Scholarship Program</option>
                      {programs?.map((p, i) => (
                        <option key={i} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    {errors.program_id && (
                      <div className="app__error_message">
                        Scholarship Program is required
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="app__form_field_container">
                <div className="w-full">
                  <div className="app__label_standard">Period</div>
                  <div>
                    <input
                      placeholder="ex. JANUARY TO MARCH 2025."
                      {...register('period', { required: true })}
                      className="app__input_standard"
                    />
                    {errors.period && (
                      <div className="app__error_message">
                        Period is required
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="app__form_field_container">
                <div className="w-full">
                  <div className="app__label_standard">Amount</div>
                  <div>
                    <input
                      type="number"
                      {...register('amount', { required: true })}
                      className="app__input_standard"
                    />
                    {errors.amount && (
                      <div className="app__error_message">
                        Amount is required
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

export default BulkAddModal
