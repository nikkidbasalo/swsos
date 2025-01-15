import { CustomButton } from '@/components/index'
import { useFilter } from '@/context/FilterContext'
import { useSupabase } from '@/context/SupabaseProvider'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { v4 as uuidv4 } from 'uuid'

// Types
import { updateList } from '@/GlobalRedux/Features/listSlice'
import type { AccountTypes, InstituteTypes, ProgramTypes } from '@/types'
import { fetchInstitutes } from '@/utils/fetchApi'
import { useDispatch, useSelector } from 'react-redux'

// Redux imports

interface ModalProps {
  hideModal: () => void
  grantee: AccountTypes
}

const ProgramsModal = ({ hideModal, grantee }: ModalProps) => {
  const { setToast } = useFilter()
  const { supabase } = useSupabase()
  const [saving, setSaving] = useState(false)

  const [programs, setPrograms] = useState<ProgramTypes[]>([])
  const [institutes, setInstitutes] = useState<InstituteTypes[]>([])

  const [otherAccounts, setOtherAccounts] = useState<AccountTypes[] | []>([])

  // Redux staff
  const globallist = useSelector((state: any) => state.list.value)
  const dispatch = useDispatch()

  const {
    register,
    formState: { errors },
    handleSubmit
  } = useForm<AccountTypes>({
    mode: 'onSubmit'
  })

  const onSubmit = async (formdata: AccountTypes) => {
    if (saving) return

    // setSaving(true)
    void handleCreate(formdata)
  }

  const handleCreate = async (formdata: AccountTypes) => {
    // zz

    const newData = {
      id: uuidv4(),
      program_id: formdata.program_id,
      user_id: grantee.id,
      type: 'Scholar',
      lastname: grantee.lastname,
      firstname: grantee.firstname,
      middlename: grantee.middlename,
      email: grantee.email,
      gender: grantee.gender,
      birthday: grantee.birthday,
      civil_status: grantee.civil_status,
      contact_number: grantee.contact_number,
      present_address: grantee.present_address,
      present_address_others: grantee.present_address_others,
      permanent_address: grantee.permanent_address,
      father: grantee.father,
      mother: grantee.mother,
      guardian: grantee.guardian,
      parent_address: grantee.parent_address,
      father_occupation: grantee.father_occupation,
      mother_occupation: grantee.mother_occupation,
      guardian_occupation: grantee.guardian_occupation,
      shs: grantee.shs,
      shs_principal: grantee.shs_principal,
      shs_address: grantee.shs_address,
      shs_school_type: grantee.shs_school_type,
      shs_year_graduated: grantee.shs_year_graduated,
      shs_honor: grantee.shs_honor,
      reference_name_1: grantee.reference_name_1,
      reference_name_2: grantee.reference_name_2,
      reference_name_3: grantee.reference_name_3,
      reference_address_1: grantee.reference_address_1,
      reference_address_2: grantee.reference_address_2,
      reference_address_3: grantee.reference_address_3,
      reference_contact_1: grantee.reference_contact_1,
      reference_contact_2: grantee.reference_contact_2,
      reference_contact_3: grantee.reference_contact_3
    }
    console.log(newData)
    try {
      const { data, error: error2 } = await supabase
        .from('sws_users')
        .insert({ ...newData })

      if (error2) throw new Error(error2.message)

      const updatedData = {
        ...newData,
        program: programs.find(
          (p) => p.id.toString() === formdata.program_id.toString()
        ),
        institute: institutes.find(
          (p) => p.id.toString() === grantee.institute_id
        )
      }
      dispatch(updateList([updatedData, ...globallist]))

      // pop up the success message
      setToast('success', 'Successfully saved.')

      // hide the modal
      hideModal()

      setSaving(false)
    } catch (e) {
      // pop up the success message
      setToast('success', 'Something went wrong, please reload the page')

      console.error(e)
    }
  }

  // Featch data
  useEffect(() => {
    ;(async () => {
      const { data } = await supabase
        .from('sws_programs')
        .select()
        .neq('id', grantee.program_id)

      setPrograms(data)

      const institutesData = await fetchInstitutes(999, 0)
      setInstitutes(institutesData.data)

      const { data: usersData } = await supabase
        .from('sws_users')
        .select('*,program:program_id(*)')
        .eq('email', grantee.email)
      setOtherAccounts(usersData)
    })()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grantee])

  return (
    <>
      <div className="app__modal_wrapper">
        <div className="app__modal_wrapper2">
          <div className="app__modal_wrapper3">
            <div className="app__modal_header">
              <h5 className="app__modal_header_text">
                Add{' '}
                <span className="text-green-700">
                  {grantee.firstname} {grantee.middlename} {grantee.lastname}{' '}
                </span>
                to another Program
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
                  <div className="app__label_standard">Scholarship Program</div>
                  <div>
                    <select
                      {...register('program_id', { required: true })}
                      className="app__select_standard"
                    >
                      <option value="">Select</option>
                      {programs
                        ?.filter(
                          (program) =>
                            !otherAccounts?.some(
                              (acct) => acct.program_id === program.id
                            )
                        )
                        .map((p, i) => (
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

export default ProgramsModal
