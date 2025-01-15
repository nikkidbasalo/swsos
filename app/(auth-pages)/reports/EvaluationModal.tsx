'use client'

import { CustomButton } from '@/components/index'
import { useFilter } from '@/context/FilterContext'
import { useSupabase } from '@/context/SupabaseProvider'
import { AccountTypes, GradeTypes } from '@/types'
import { fetchGrades } from '@/utils/fetchApi'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

interface ModalProps {
  hideModal: () => void
  grantee: AccountTypes
}

export default function EvaluateModal({ hideModal, grantee }: ModalProps) {
  //
  const wrapperRef = useRef<HTMLDivElement>(null)

  const { supabase, session } = useSupabase()
  const { setToast } = useFilter()
  const [saving, setSaving] = useState(false)
  const [refresh, setRefresh] = useState(false)
  const [allowances, setAllowances] = useState<GradeTypes[] | []>([])

  // states
  const [grades, setGrades] = useState<GradeTypes[] | []>([])

  const {
    register,
    formState: { errors },
    reset,
    handleSubmit
  } = useForm<GradeTypes>({
    mode: 'onSubmit'
  })

  const onSubmit = async (formdata: GradeTypes) => {
    if (saving) return
    setSaving(true)
    void handleSubmitEvaluation(formdata)
  }

  const handleSubmitEvaluation = async (formdata: GradeTypes) => {
    const newData = {
      remarks: formdata.remarks,
      status: formdata.status,
      allowance: formdata.allowance,
      allowance_type: formdata.allowance_type
    }

    try {
      const { error } = await supabase
        .from('sws_grades')
        .update(newData)
        .eq('id', formdata.grade_id)

      if (error) {
        setToast(
          'error',
          'Saving failed, please reload the page and try again.'
        )
        throw new Error(error.message)
      }

      setToast('success', 'Successly saved.')
      setSaving(false)

      // reset all form fields
      reset()

      //refresh
      setRefresh(!refresh)
    } catch (e) {
      console.error(e)
    }
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      hideModal()
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wrapperRef])

  // Update data whenever list in redux updates
  useEffect(() => {
    ;(async () => {
      const result = await fetchGrades(grantee.id, 999, 0)
      setGrades(result.data)

      const { data: allowancesData } = await supabase
        .from('sws_grades')
        .select('*, period:evaluation_period_id(*)')
        .eq('user_id', grantee.id)

      setAllowances(allowancesData)
    })()
  }, [refresh])

  return (
    <>
      <div ref={wrapperRef} className="app__modal_wrapper">
        <div className="app__modal_wrapper2_large">
          <div className="app__modal_wrapper3">
            <div className="app__modal_header">
              <h5 className="text-md font-bold leading-normal text-gray-800 dark:text-gray-300">
                Grantee Evaluation
              </h5>
              <div className="flex space-x-2">
                <CustomButton
                  containerStyles="app__btn_gray"
                  title="Close"
                  btnType="button"
                  handleClick={hideModal}
                />
              </div>
            </div>

            <div className="modal-body relative overflow-x-scroll">
              {/* Document Details */}
              <div className="py-2">
                <div className="flex flex-col lg:flex-row w-full items-start justify-between space-x-2 text-sm text-gray-600">
                  <div className="px-4 w-full">
                    <table className="w-full">
                      <thead>
                        <tr>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="px-2 py-2 font-light">
                            <div className="space-y-1">
                              <div>
                                <span className="">ID No:</span>{' '}
                                <span className="font-bold">
                                  {grantee.id_number}
                                </span>
                              </div>
                              <div>
                                <span className="">Fullname:</span>{' '}
                                <span className="font-bold">
                                  {grantee.lastname}, {grantee.firstname}{' '}
                                  {grantee.middlename}
                                </span>
                              </div>
                              <div>
                                <span className="">Year Granted:</span>{' '}
                                <span className="font-bold">
                                  {grantee.year_granted}
                                </span>
                              </div>
                              <div>
                                <span className="">Email:</span>{' '}
                                <span className="font-bold">
                                  {grantee.email}
                                </span>
                              </div>
                              <div>
                                <span className="">Employee No:</span>{' '}
                                <span className="font-bold">
                                  {grantee.employee_number}
                                </span>
                              </div>
                              <div>
                                <span className="">Function:</span>{' '}
                                <span className="font-bold">
                                  {grantee.function}
                                </span>
                              </div>
                              <div>
                                <span className="">Control No:</span>{' '}
                                <span className="font-bold">
                                  {grantee.control_number}
                                </span>
                              </div>
                              <div>
                                <span className="">TES Award Number</span>{' '}
                                <span className="font-bold">
                                  {grantee.tes_award_number}
                                </span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="px-2 w-full">
                    <table className="w-full">
                      <thead>
                        <tr>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="px-2 py-2 font-light">
                            <div className="space-y-1">
                              <div>
                                <span className="">Status:</span>{' '}
                                {grantee.status === 'Active' && (
                                  <span className="app__status_green">
                                    Active
                                  </span>
                                )}
                                {grantee.status === 'Inactive' && (
                                  <span className="app__status_red">
                                    Inactive
                                  </span>
                                )}
                              </div>
                              <div>
                                <span className="">Gender:</span>{' '}
                                <span className="font-bold">
                                  {grantee.gender}
                                </span>
                              </div>
                              <div>
                                <span className="">Birth Date:</span>{' '}
                                <span className="font-bold">
                                  {grantee.birthday}
                                </span>
                              </div>
                              <div>
                                <span className="">Degree Program:</span>{' '}
                                <span className="font-bold">
                                  {grantee.degree_program}
                                </span>
                              </div>
                              <div>
                                <span className="">Year level:</span>{' '}
                                <span className="font-bold">
                                  {grantee.year_level_status}
                                </span>
                              </div>
                              <div>
                                <span className="">Remarks:</span>{' '}
                                <span className="font-bold">
                                  {grantee.remarks}
                                </span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <hr />
              <div className="py-2 md:flex">
                <div className="md:w-1/2">
                  <div className="mx-2 px-4 py-4 text-gray-600 bg-gray-100">
                    <div className="font-bold text-sm mb-4">
                      Evaluation History:
                    </div>

                    <table className="app__table">
                      <thead className="app__thead">
                        <tr>
                          <th className="app__th">Period</th>
                          <th className="app__th">Grades</th>
                          <th className="app__th">Allowance</th>
                          <th className="app__th">Remarks</th>
                          <th className="app__th">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {grades?.map((item, index) => (
                          <tr key={index} className="app__tr">
                            <td className="app__td">
                              {item.period.description} {item.period.year}
                            </td>
                            <td className="app__td">
                              {item.file_path && (
                                <Link
                                  href={`${item.file_path}`}
                                  target="_blank"
                                  className="text-blue-600 hover:underline"
                                >
                                  {item.file_path.slice(-10)}
                                </Link>
                              )}
                            </td>
                            <td className="app__td">
                              {Number(item.allowance).toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })}{' '}
                              {item.allowance_type}
                            </td>
                            <td className="app__td">{item.remarks}</td>
                            <td className="app__td">
                              {item.status === 'Passed' && (
                                <span className="app__status_green">
                                  Passed
                                </span>
                              )}
                              {item.status === 'For Evaluation' && (
                                <span className="app__status_orange">
                                  For&nbsp;Evaluation
                                </span>
                              )}
                              {item.status === 'Failed' && (
                                <span className="app__status_red">Failed</span>
                              )}
                            </td>
                          </tr>
                        ))}
                        {grades.length === 0 && (
                          <tr className="app__tr">
                            <td className="app__td" colSpan={5}>
                              No Grades Uploaded Yet
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="md:w-1/2">
                  <div className="mx-2 px-4 py-4 text-gray-600 bg-gray-100">
                    <div className="font-bold text-sm mb-4">
                      Released History
                    </div>

                    <table className="app__table">
                      <thead className="app__thead">
                        <tr>
                          <th className="app__th">Period</th>
                          <th className="app__th">Amount</th>
                          <th className="app__th">Release Schedule</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allowances
                          ?.filter((a) => a.is_paid === true)
                          ?.map((item, index) => (
                            <tr key={index} className="app__tr">
                              <td className="app__td">
                                {item.period.description} {item.period.year}
                              </td>
                              <td className="app__td">
                                {Number(item.allowance).toLocaleString(
                                  'en-US',
                                  {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                  }
                                )}{' '}
                                {item.allowance_type}
                              </td>
                              <td className="app__td">
                                {item.period.release_schedule}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
