'use client'
import { useFilter } from '@/context/FilterContext'
import { useSupabase } from '@/context/SupabaseProvider'
import { logError } from '@/utils/fetchApi'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import OneColLayoutLoading from './Loading/OneColLayoutLoading'

// Redux imports
import { updateList } from '@/GlobalRedux/Features/listSlice'
import { useDispatch, useSelector } from 'react-redux'

// Types
import type { AccountTypes } from '@/types'
import CustomButton from './CustomButton'
import LoginSettings from './LoginSettings'

interface ModalProps {
  hideModal: () => void
  id: string
  shouldUpdateRedux: boolean
}

const AccountDetails = ({ hideModal, shouldUpdateRedux, id }: ModalProps) => {
  const { setToast, hasAccess } = useFilter()
  const { supabase } = useSupabase()

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Redux staff
  const globallist = useSelector((state: any) => state.list.value)
  const dispatch = useDispatch()

  const router = useRouter()

  // Check access from employee_accounts settings or Super Admins
  const isAdmin = hasAccess('employee_accounts')

  const {
    register,
    formState: { errors },
    reset,
    handleSubmit
  } = useForm<AccountTypes>({
    mode: 'onSubmit'
  })

  const onSubmit = async (formdata: AccountTypes) => {
    if (loading || saving) return

    void handleUpdate(formdata)
  }

  const handleUpdate = async (formdata: AccountTypes) => {
    setSaving(true)

    const newData = {
      firstname: formdata.firstname,
      middlename: formdata.middlename,
      lastname: formdata.lastname
    }

    try {
      const { error } = await supabase
        .from('sws_users')
        .update(newData)
        .eq('id', id)

      if (error) {
        void logError(
          'Update account details',
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

      // Update data in redux
      if (shouldUpdateRedux) {
        console.log('redux updated')
        const items = [...globallist]
        const updatedData = {
          ...newData,
          id
        }
        const foundIndex = items.findIndex((x) => x.id === updatedData.id)
        items[foundIndex] = { ...items[foundIndex], ...updatedData }
        dispatch(updateList(items))
      }

      // pop up the success message
      setToast('success', 'Successfully saved.')

      setSaving(false)

      router.refresh()

      // hide the modal
      hideModal()
    } catch (e) {
      console.error(e)
    }
  }

  // manually set the defaultValues of use-form-hook whenever the component receives new props.
  useEffect(() => {
    const fetchAccountDetails = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('sws_users')
          .select('')
          .eq('id', id)
          .limit(1)
          .single()

        if (error) throw new Error(error.message)

        reset({
          firstname: data ? data.firstname : '',
          middlename: data ? data.middlename : '',
          lastname: data ? data.lastname : ''
        })
      } catch (e) {
        console.error('fetch error: ', e)
      } finally {
        setLoading(false)
      }
    }

    void fetchAccountDetails()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, reset])

  return (
    <>
      <div className="app__modal_wrapper">
        <div className="app__modal_wrapper2">
          <div className="app__modal_wrapper3">
            <div className="app__modal_header">
              <h5 className="app__modal_header_text">Account Details</h5>
              <CustomButton
                containerStyles="app__btn_gray"
                title="Close"
                isDisabled={saving}
                btnType="button"
                handleClick={hideModal}
              />
            </div>

            {/* Modal Content */}
            <div className="app__modal_body">
              {loading && <OneColLayoutLoading />}
              {!loading && (
                <>
                  <form onSubmit={handleSubmit(onSubmit)} className="">
                    <div className="flex flex-col lg:flex-row w-full items-start justify-between text-xs dark:text-gray-400">
                      {/* Begin First Column */}
                      <div className="w-full px-4">
                        <div className="app__form_field_container">
                          <div className="w-full">
                            <div className="app__label_standard">
                              First Name:
                            </div>
                            <div>
                              <input
                                {...register('firstname', { required: true })}
                                type="text"
                                className="app__input_standard"
                              />
                              {errors.firstname && (
                                <div className="app__error_message">
                                  First Name is required
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="app__form_field_container">
                          <div className="w-full">
                            <div className="app__label_standard">
                              Middle Name:
                            </div>
                            <div>
                              <input
                                {...register('middlename')}
                                type="text"
                                className="app__input_standard"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="app__form_field_container">
                          <div className="w-full">
                            <div className="app__label_standard">
                              Last Name:
                            </div>
                            <div>
                              <input
                                {...register('lastname', { required: true })}
                                type="text"
                                className="app__input_standard"
                              />
                              {errors.lastname && (
                                <div className="app__error_message">
                                  Last Name is required
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* End First Column */}
                    </div>
                    <div className="w-full px-4">
                      <div className="app__label_standard">
                        <label className="flex items-center space-x-1">
                          <input
                            {...register('confirmed', { required: true })}
                            type="checkbox"
                            className=""
                          />
                          <span className="font-normal text-xs">
                            By checking this box, you acknowledge that all
                            information is accurate and up-to-date.
                          </span>
                        </label>
                        {errors.confirmed && (
                          <div className="app__error_message">
                            Confirmation is required
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="px-4 mt-4">
                      <button type="submit" className="app__btn_green_sm">
                        {saving ? 'Saving..' : 'Save'}
                      </button>
                    </div>
                  </form>
                  <div className="p-4">
                    <hr />
                    <h2 className="my-4 text-gray-600 font-bold">
                      Change Password
                    </h2>
                    <LoginSettings userId={id} />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default AccountDetails
