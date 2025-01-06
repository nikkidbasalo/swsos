'use client'
import { GradeTypes } from '@/types'
import { fetchEvaluations } from '@/utils/fetchApi'
import { useEffect, useState } from 'react'

export default function AllowanceReleased() {
  const [totalAllowances, setTotalAllowances] = useState(0)

  useEffect(() => {
    ;(async () => {
      //All
      const all = await fetchEvaluations({}, 99999, 0)

      const totalAmount = all.data.reduce((sum, item: GradeTypes) => {
        if (item.is_paid) {
          return sum + Number(item.allowance)
        } else {
          return sum
        }
      }, 0)

      setTotalAllowances(totalAmount)
    })()
  }, [])
  return (
    <div>
      <div className="text-sm font-bold">Allowances Released</div>
      <div className="text-4xl font-bold text-center">
        {totalAllowances.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}
      </div>
    </div>
  )
}
