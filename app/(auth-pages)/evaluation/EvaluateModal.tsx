'use client'

import { CustomButton } from '@/components/index'
import { useFilter } from '@/context/FilterContext'
import { useSupabase } from '@/context/SupabaseProvider'
import { GradeTypes, GranteeTypes } from '@/types'
import { fetchGrades } from '@/utils/fetchApi'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

interface ModalProps {
  hideModal: () => void
  grantee: GranteeTypes
}

export default function EvaluateModal({ hideModal, grantee }: ModalProps) {
  //
  const wrapperRef = useRef<HTMLDivElement>(null)

  const { supabase, session } = useSupabase()
  const { setToast } = useFilter()
  const [saving, setSaving] = useState(false)
  const [refresh, setRefresh] = useState(false)

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
    console.log(formdata)
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
                                <span className="app__status_green">
                                  {grantee.status}
                                </span>
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
                              {item.period.description}
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
                    <div className="w-full relative">
                      <div className="mx-2 mb-10 outline-none overflow-x-hidden overflow-y-auto text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400">
                        <div className="font-bold text-sm mb-4">
                          Submit Evaluation:
                        </div>
                        {/* Remarks Box */}
                        <div className="w-full text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                          <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="app__modal_body"
                          >
                            <div className="app__form_field_container">
                              <div className="w-full">
                                <div className="app__label_standard">
                                  Evaluation Period
                                </div>
                                <div>
                                  <select
                                    {...register('grade_id', {
                                      required: true
                                    })}
                                    className="app__input_standard"
                                  >
                                    <option value="">
                                      Choose Evaluation Period
                                    </option>
                                    {grades?.map((p, i) => (
                                      <option key={i} value={p.id}>
                                        {p.period.description}
                                      </option>
                                    ))}
                                  </select>
                                  {errors.grade_id && (
                                    <div className="app__error_message">
                                      Period is required
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="app__form_field_container">
                              <div className="w-full">
                                <div className="app__label_standard">
                                  Allowance
                                </div>
                                <div>
                                  <input
                                    {...register('allowance', {
                                      required: true
                                    })}
                                    type="number"
                                    step="any"
                                    className="app__input_standard"
                                  />
                                  {errors.allowance && (
                                    <div className="app__error_message">
                                      Allowance required
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="app__form_field_container">
                              <div className="w-full">
                                <div className="app__label_standard">
                                  Allowance Type
                                </div>
                                <div>
                                  <select
                                    {...register('allowance_type', {
                                      required: true
                                    })}
                                    className="app__select_standard"
                                  >
                                    <option value="">Choose Type</option>
                                    <option value="Per Month">Per Month</option>
                                    <option value="Per Semester">
                                      Per Semester
                                    </option>
                                  </select>
                                  {errors.allowance_type && (
                                    <div className="app__error_message">
                                      Allowance Type required
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="app__form_field_container">
                              <div className="w-full">
                                <div className="app__label_standard">
                                  Remarks
                                </div>
                                <div>
                                  <textarea
                                    {...register('remarks')}
                                    className="app__input_standard"
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="app__form_field_container">
                              <div className="w-full">
                                <div className="app__label_standard">
                                  Final Evaluation
                                </div>
                                <div className="space-x-2 mt-2">
                                  <label className="text-xs space-x-2">
                                    <input
                                      type="radio"
                                      value="Passed"
                                      {...register('status', {
                                        required: true
                                      })}
                                    />
                                    <span className="text-green-600 font-bold">
                                      PASSED
                                    </span>
                                  </label>

                                  <label className="text-xs space-x-2">
                                    <input
                                      type="radio"
                                      value="Failed"
                                      {...register('status', {
                                        required: true
                                      })}
                                    />
                                    <span className="text-red-600 font-bold">
                                      FAILED
                                    </span>
                                  </label>

                                  {errors.status && (
                                    <div className="app__error_message">
                                      Final Evaluation is required
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="app__modal_footer">
                              <span className="flex-1">&nbsp;</span>
                              <CustomButton
                                containerStyles="app__btn_green"
                                title="Submit"
                                isDisabled={saving}
                                btnType="submit"
                              />
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>
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
