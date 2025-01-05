'use client'

import { CustomButton } from '@/components/index'
import { GradeTypes, GranteeTypes } from '@/types'
import { fetchGrades } from '@/utils/fetchApi'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

interface ModalProps {
  hideModal: () => void
  grantee: GranteeTypes
}

export default function EvaluationModal({ hideModal, grantee }: ModalProps) {
  //
  const wrapperRef = useRef<HTMLDivElement>(null)

  // states
  const [grades, setGrades] = useState<GradeTypes[] | []>([])

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
  }, [])

  return (
    <>
      <div ref={wrapperRef} className="app__modal_wrapper">
        <div className="app__modal_wrapper2_large">
          <div className="app__modal_wrapper3">
            <div className="app__modal_header">
              <h5 className="text-md font-bold leading-normal text-gray-800 dark:text-gray-300">
                Evaluation History
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
              <div className="py-2">
                <div className="w-full">
                  <div className="mx-2 px-4 py-4">
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
