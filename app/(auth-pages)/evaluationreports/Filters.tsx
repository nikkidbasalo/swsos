import { CustomButton } from '@/components/index'
import { useSupabase } from '@/context/SupabaseProvider'
import {
  EvaluationPeriodTypes,
  InstituteTypes,
  ProgramTypes,
  UserAccessTypes
} from '@/types'
import { fetchInstitutes, fetchPeriods, fetchPrograms } from '@/utils/fetchApi'
import { TagIcon } from '@heroicons/react/20/solid'
import React, { useEffect, useState } from 'react'

interface FilterTypes {
  setFilterPeriod: (period: string) => void
  setFilterProgram: (status: string) => void
  setFilterInstitute: (year: string) => void
  setFilterStatus: (status: string) => void
  setFilterPaymentStatus: (status: string) => void
}

const Filters = ({
  setFilterPeriod,
  setFilterProgram,
  setFilterInstitute,
  setFilterPaymentStatus,
  setFilterStatus
}: FilterTypes) => {
  const [period, setPeriod] = useState<string>('')
  const [selectedProgram, setSelectedProgram] = useState<string>('')
  const [selectedInstitute, setSelectedInstitute] = useState<string>('')
  const [status, setStatus] = useState<string>('')
  const [paymentStatus, setPaymentStatus] = useState<string>('')

  const [programs, setPrograms] = useState<ProgramTypes[]>([])
  const [periods, setPeriods] = useState<EvaluationPeriodTypes[]>([])
  const [institutes, setInstitutes] = useState<InstituteTypes[]>([])

  const { session, systemAccess } = useSupabase()
  const userAccess: UserAccessTypes | undefined = systemAccess.find(
    (user: UserAccessTypes) => user.user_id === session.user.id
  )

  const handleApply = () => {
    if (
      paymentStatus.trim() === '' &&
      period.trim() === '' &&
      status.trim() === '' &&
      selectedInstitute.trim() === '' &&
      selectedProgram.trim() === ''
    )
      return

    setFilterPeriod(period) // pass to parent
    setFilterStatus(status) // pass to parent
    setFilterPaymentStatus(paymentStatus) // pass to parent
    setFilterInstitute(selectedInstitute) // pass keyword to parent
    setFilterProgram(selectedProgram) // pass keyword to parent
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (
      paymentStatus.trim() === '' &&
      period.trim() === '' &&
      status.trim() === '' &&
      selectedInstitute.trim() === '' &&
      selectedProgram.trim() === ''
    )
      return
    setFilterPeriod(period) // pass to parent
    setFilterStatus(status) // pass to parent
    setFilterPaymentStatus(paymentStatus) // pass to parent
    setFilterInstitute(selectedInstitute) // pass keyword to parent
    setFilterProgram(selectedProgram) // pass keyword to parent
  }

  // clear all filters
  const handleClear = () => {
    setFilterPeriod('')
    setPeriod('')
    setFilterStatus('')
    setStatus('')
    setFilterPaymentStatus('')
    setPaymentStatus('')
    setFilterProgram('')
    setSelectedProgram('')
    setFilterInstitute('')
    setSelectedInstitute('')
  }

  // Featch data
  useEffect(() => {
    ;(async () => {
      const result = await fetchPrograms('', 999, 0)

      if (userAccess && userAccess.program_ids) {
        const filterResult = result.data.filter((program: ProgramTypes) =>
          (userAccess.program_ids || []).includes(program.id)
        )

        setPrograms(filterResult)
      }

      const periods = await fetchPeriods(999, 0)
      setPeriods(periods.data)

      const institutesData = await fetchInstitutes(999, 0)
      setInstitutes(institutesData.data)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="">
      <div className="flex items-center">
        <form onSubmit={handleSubmit} className="items-center">
          <div className="app__filter_container">
            <TagIcon className="w-4 h-4 mr-1 text-gray-500" />
            <select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              className="app__filter_select"
            >
              <option value="">Choose Scholarship Program</option>
              {programs?.map((p, i) => (
                <option key={i} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="app__filter_container">
            <TagIcon className="w-4 h-4 mr-1 text-gray-500" />
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="app__filter_select"
            >
              <option value="">Choose Evaluation Period</option>
              {periods?.map((p, i) => (
                <option key={i} value={p.id}>
                  {p.description} {p.year}
                </option>
              ))}
            </select>
          </div>
          <div className="app__filter_container">
            <TagIcon className="w-4 h-4 mr-1 text-gray-500" />
            <select
              value={selectedInstitute}
              onChange={(e) => setSelectedInstitute(e.target.value)}
              className="app__filter_select"
            >
              <option value="">Choose Institute</option>
              {institutes?.map((p, i) => (
                <option key={i} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="app__filter_container">
            <TagIcon className="w-4 h-4 mr-1 text-gray-500" />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="app__filter_select"
            >
              <option value="">Choose Status</option>
              <option value="Passed">Passed</option>
              <option value="For Evaluation">For Evaluation</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
          <div className="app__filter_container">
            <TagIcon className="w-4 h-4 mr-1 text-gray-500" />
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="app__filter_select"
            >
              <option value="">Paid/Unpaid</option>
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
            </select>
          </div>
        </form>
      </div>
      <div className="flex items-center space-x-2 mt-4">
        <CustomButton
          containerStyles="app__btn_green"
          title="Apply Filter"
          btnType="button"
          handleClick={handleApply}
        />
        <CustomButton
          containerStyles="app__btn_gray"
          title="Clear Filter"
          btnType="button"
          handleClick={handleClear}
        />
      </div>
    </div>
  )
}

export default Filters
