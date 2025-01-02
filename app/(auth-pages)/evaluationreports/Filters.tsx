import { CustomButton } from '@/components/index'
import { EvaluationPeriodTypes, ProgramTypes } from '@/types'
import { fetchPeriods, fetchPrograms } from '@/utils/fetchApi'
import { TagIcon } from '@heroicons/react/20/solid'
import React, { useEffect, useState } from 'react'

interface FilterTypes {
  setFilterPeriod: (period: string) => void
  setFilterProgram: (status: string) => void
  setFilterStatus: (status: string) => void
}

const Filters = ({
  setFilterPeriod,
  setFilterProgram,
  setFilterStatus
}: FilterTypes) => {
  const [period, setPeriod] = useState<string>('')
  const [selectedProgram, setSelectedProgram] = useState<string>('')
  const [status, setStatus] = useState<string>('')

  const [programs, setPrograms] = useState<ProgramTypes[]>([])
  const [periods, setPeriods] = useState<EvaluationPeriodTypes[]>([])

  const handleApply = () => {
    if (
      period.trim() === '' &&
      status.trim() === '' &&
      selectedProgram.trim() === ''
    )
      return

    setFilterPeriod(period) // pass to parent
    setFilterStatus(status) // pass to parent
    setFilterProgram(selectedProgram) // pass keyword to parent
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (
      period.trim() === '' &&
      status.trim() === '' &&
      selectedProgram.trim() === ''
    )
      return
    setFilterPeriod(period) // pass to parent
    setFilterStatus(status) // pass to parent
    setFilterProgram(selectedProgram) // pass keyword to parent
  }

  // clear all filters
  const handleClear = () => {
    setFilterPeriod('')
    setPeriod('')
    setFilterStatus('')
    setStatus('')
    setFilterProgram('')
    setSelectedProgram('')
  }

  // Featch data
  useEffect(() => {
    ;(async () => {
      const result = await fetchPrograms('', 999, 0)
      setPrograms(result.data)

      const periods = await fetchPeriods(999, 0)
      setPeriods(periods.data)
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
                  {p.description}
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
