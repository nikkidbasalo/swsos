'use client'
import { useFilter } from '@/context/FilterContext'
import { useSupabase } from '@/context/SupabaseProvider'
import { fetchBoardinghouse, fetchInstitutes } from '@/utils/fetchApi'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

// Redux imports

// Types
import type { AccountTypes, BoardinghouseTypes, InstituteTypes } from '@/types'
import CustomButton from '../CustomButton'

interface ModalProps {
  hideModal: () => void
  refresh: () => void
  userData: AccountTypes
}

const ProfileDetails = ({ hideModal, userData, refresh }: ModalProps) => {
  const { setToast } = useFilter()
  const { supabase } = useSupabase()

  const [saving, setSaving] = useState(false)

  const [boardinghouses, setBoardinghouses] = useState<
    BoardinghouseTypes[] | []
  >([])

  const [institutes, setInstitutes] = useState<InstituteTypes[]>([])

  const {
    register,
    formState: { errors },
    reset,
    handleSubmit
  } = useForm<AccountTypes>({
    mode: 'onSubmit'
  })

  const onSubmit = async (formdata: AccountTypes) => {
    if (saving) return

    void handleUpdate(formdata)
  }

  const handleUpdate = async (formdata: AccountTypes) => {
    setSaving(true)

    const newData = {
      lastname: formdata.lastname,
      firstname: formdata.firstname,
      middlename: formdata.middlename,
      gender: formdata.gender,
      institute_id: formdata.institute_id,
      birthday: formdata.birthday,
      age: formdata.age,
      year_level_status: formdata.year_level_status,
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
      reference_contact_3: formdata.reference_contact_3
    }

    try {
      const { error } = await supabase
        .from('sws_users')
        .update(newData)
        .eq('id', userData.id)

      if (error) {
        setToast(
          'error',
          'Saving failed, please reload the page and try again.'
        )
        throw new Error(error.message)
      }

      const { error: error2 } = await supabase
        .from('sws_users')
        .update(newData)
        .eq('user_id', userData.id)

      if (error2) {
        setToast(
          'error',
          'Saving failed, please reload the page and try again.'
        )
        throw new Error(error2.message)
      }
      // pop up the success message
      setToast('success', 'Successfully saved.')

      setSaving(false)

      refresh()

      hideModal()
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    ;(async () => {
      const appartmentsData = await fetchBoardinghouse(999, 0)
      setBoardinghouses(appartmentsData.data)

      const institutesData = await fetchInstitutes(999, 0)
      setInstitutes(institutesData.data)
    })()
  }, [])

  // manually set the defaultValues of use-form-hook whenever the component receives new props.
  useEffect(() => {
    reset({
      lastname: userData ? userData.lastname : '',
      institute_id: userData ? userData.institute_id : '',
      firstname: userData ? userData.firstname : '',
      middlename: userData ? userData.middlename : '',
      gender: userData ? userData.gender : '',
      birthday: userData ? userData.birthday : '',
      year_level_status: userData ? userData.year_level_status : '',
      age: userData ? userData.age : '',
      civil_status: userData ? userData.civil_status : '',
      contact_number: userData ? userData.contact_number : '',
      present_address: userData ? userData.present_address : '',
      permanent_address: userData ? userData.permanent_address : '',
      father: userData ? userData.father : '',
      mother: userData ? userData.mother : '',
      guardian: userData ? userData.guardian : '',
      parent_address: userData ? userData.parent_address : '',
      father_occupation: userData ? userData.father_occupation : '',
      mother_occupation: userData ? userData.mother_occupation : '',
      guardian_occupation: userData ? userData.guardian_occupation : '',
      shs: userData ? userData.shs : '',
      shs_principal: userData ? userData.shs_principal : '',
      shs_address: userData ? userData.shs_address : '',
      shs_school_type: userData ? userData.shs_school_type : '',
      shs_year_graduated: userData ? userData.shs_year_graduated : '',
      shs_honor: userData ? userData.shs_honor : '',
      reference_name_1: userData ? userData.reference_name_1 : '',
      reference_name_2: userData ? userData.reference_name_2 : '',
      reference_name_3: userData ? userData.reference_name_3 : '',
      reference_address_1: userData ? userData.reference_address_1 : '',
      reference_address_2: userData ? userData.reference_address_2 : '',
      reference_address_3: userData ? userData.reference_address_3 : '',
      reference_contact_1: userData ? userData.reference_contact_1 : '',
      reference_contact_2: userData ? userData.reference_contact_2 : '',
      reference_contact_3: userData ? userData.reference_contact_3 : ''
    })
  }, [reset, institutes])

  return (
    <>
      <div className="app__modal_wrapper">
        <div className="app__modal_wrapper2_large">
          <div className="app__modal_wrapper3">
            <div className="app__modal_header">
              <h5 className="app__modal_header_text">Profile Details</h5>
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
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="app__modal_body"
              >
                <div className="grid grid-cols-2 gap-4">
                  {/* Begin First Column */}
                  <div>
                    <div className="app__form_field_container">
                      <div className="w-full">
                        <div className="app__label_standard">First Name:</div>
                        <div className="flex space-x-2">
                          <input
                            placeholder="Firstname"
                            {...register('firstname')}
                            type="text"
                            className="app__input_standard"
                          />
                          <input
                            placeholder="Middlename"
                            {...register('middlename')}
                            type="text"
                            className="app__input_standard"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="app__form_field_container">
                      <div className="w-full">
                        <div className="app__label_standard">Last Name:</div>
                        <div>
                          <input
                            placeholder="Lastname"
                            {...register('lastname')}
                            type="text"
                            className="app__input_standard"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="app__form_field_container">
                      <div className="w-full">
                        <div className="app__label_standard">
                          Boarding House/Appartment (if applicable):
                        </div>
                        <div>
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
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="app__form_field_container">
                      <div className="w-full">
                        <div className="app__label_standard">
                          Permanent Address:
                        </div>
                        <div>
                          <input
                            {...register('permanent_address')}
                            className="app__input_standard"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="app__form_field_container">
                      <div className="w-full">
                        <div className="app__label_standard">Year Level:</div>
                        <div>
                          <select
                            {...register('year_level_status')}
                            className="app__select_standard"
                          >
                            <option value="">Select</option>
                            <option value="1st Year">1st Year</option>
                            <option value="2nd Year">2nd Year</option>
                            <option value="3rd Year">3rd Year</option>
                            <option value="4th Year">4th Year</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="app__form_field_container">
                      <div className="w-full">
                        <div className="app__label_standard">Institute:</div>
                        <div>
                          <select
                            {...register('institute_id')}
                            className="app__select_standard"
                          >
                            <option value="">Select Institute</option>
                            {institutes?.map((institute) => (
                              <option key={institute.id} value={institute.id}>
                                {institute.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="app__form_field_container">
                      <div className="w-full">
                        <div className="app__label_standard">
                          HIGH SCHOOL INFORMATION{' '}
                          <span className="text-xs">
                            (for Entrance Scholarship Applicants Only)
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <input
                            placeholder="Senior High School"
                            {...register('shs')}
                            className="app__input_standard"
                          />
                          <input
                            placeholder="Address"
                            {...register('shs_address')}
                            className="app__input_standard"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="app__form_field_container">
                      <div className="w-full">
                        <div className="app__label_standard">
                          SHS - Year Graduated
                        </div>
                        <div className="flex space-x-2">
                          <input
                            placeholder="SHS - Year Graduated"
                            {...register('shs_year_graduated')}
                            className="app__input_standard"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="app__form_field_container">
                      <div className="w-full">
                        <div className="app__label_standard">Father:</div>
                        <div className="flex space-x-2">
                          <input
                            placeholder="Father Name"
                            {...register('father')}
                            className="app__input_standard"
                          />
                          <input
                            placeholder="Occupation"
                            {...register('father_occupation')}
                            className="app__input_standard"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="app__form_field_container">
                      <div className="w-full">
                        <div className="app__label_standard">Mother:</div>
                        <div className="flex space-x-2">
                          <input
                            placeholder="Mother Name"
                            {...register('mother')}
                            className="app__input_standard"
                          />
                          <input
                            placeholder="Occupation"
                            {...register('mother_occupation')}
                            className="app__input_standard"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="app__form_field_container">
                      <div className="w-full">
                        <div className="app__label_standard">Guardian:</div>
                        <div className="flex space-x-2">
                          <input
                            placeholder="Guardian Name"
                            {...register('guardian')}
                            className="app__input_standard"
                          />
                          <input
                            placeholder="Occupation"
                            {...register('guardian_occupation')}
                            className="app__input_standard"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* End First Column */}
                  {/* Begin Second Column */}
                  <div>
                    <div className="app__form_field_container">
                      <div className="w-full">
                        <div className="app__label_standard">Birth Date:</div>
                        <div>
                          <input
                            {...register('birthday')}
                            type="date"
                            className="app__input_standard"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="app__form_field_container">
                      <div className="w-full">
                        <div className="app__label_standard">Age:</div>
                        <div>
                          <input
                            {...register('age')}
                            className="app__input_standard"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="app__form_field_container">
                      <div className="w-full">
                        <div className="app__label_standard">Sex:</div>
                        <div>
                          <select
                            {...register('gender')}
                            className="app__select_standard"
                          >
                            <option value="">Select</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="app__form_field_container">
                      <div className="w-full">
                        <div className="app__label_standard">Civil Status:</div>
                        <div>
                          <select
                            {...register('civil_status')}
                            className="app__select_standard"
                          >
                            <option value="Single">Single</option>
                            <option value="Married">Married</option>
                            <option value="Separated">Separated</option>
                            <option value="Widowed">Widowed</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="app__form_field_container">
                      <div className="w-full">
                        <div className="app__label_standard">
                          Contact Number:
                        </div>
                        <div>
                          <input
                            {...register('contact_number')}
                            className="app__input_standard"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="app__form_field_container">
                      <div className="w-full">
                        <div className="app__label_standard">Reference 1:</div>
                        <div className="flex space-x-2">
                          <input
                            placeholder="Reference Name"
                            {...register('reference_name_1')}
                            className="app__input_standard"
                          />
                          <input
                            placeholder="Address"
                            {...register('reference_address_1')}
                            className="app__input_standard"
                          />
                          <input
                            placeholder="Address"
                            {...register('reference_contact_1')}
                            className="app__input_standard"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="app__form_field_container">
                      <div className="w-full">
                        <div className="app__label_standard">Reference 2:</div>
                        <div className="flex space-x-2">
                          <input
                            placeholder="Reference Name"
                            {...register('reference_name_2')}
                            className="app__input_standard"
                          />
                          <input
                            placeholder="Address"
                            {...register('reference_address_2')}
                            className="app__input_standard"
                          />
                          <input
                            placeholder="Address"
                            {...register('reference_contact_2')}
                            className="app__input_standard"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="app__form_field_container">
                      <div className="w-full">
                        <div className="app__label_standard">Reference 3:</div>
                        <div className="flex space-x-2">
                          <input
                            placeholder="Reference Name"
                            {...register('reference_name_3')}
                            className="app__input_standard"
                          />
                          <input
                            placeholder="Address"
                            {...register('reference_address_3')}
                            className="app__input_standard"
                          />
                          <input
                            placeholder="Address"
                            {...register('reference_contact_3')}
                            className="app__input_standard"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* End Second Column */}
                </div>
                <div className="w-full">
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
                <div className="mt-4">
                  <button type="submit" className="app__btn_green_sm">
                    {saving ? 'Saving..' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ProfileDetails
