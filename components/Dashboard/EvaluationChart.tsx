'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSupabase } from '@/context/SupabaseProvider'
import { GranteeSummaryTypes } from '@/types'
import { useEffect, useState } from 'react'

export function EvaluationChart({ periodId }: { periodId: number }) {
  const { supabase } = useSupabase()
  const [stats, setStats] = useState<any>()

  const fetchData = async () => {
    const { data, error } = await supabase.rpc('get_program_statistics', {
      p_evaluation_period_id: periodId
    })

    setStats(data)
  }

  // Featch data
  useEffect(() => {
    void fetchData()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Grantes Summary Across All Periods</CardTitle>
      </CardHeader>
      <CardContent>
        <table className="app__table">
          <thead className="app__thead">
            <tr>
              <th className="app__th">Program</th>
              <th className="app__th">Total Grantees</th>
              <th className="app__th">Total Allowance</th>
              <th className="app__th">Paid</th>
              <th className="app__th">Un-Paid</th>
            </tr>
          </thead>
          <tbody>
            {stats?.map((item: GranteeSummaryTypes, index: any) => (
              <tr key={index} className="app__tr">
                <td className="app__td">{item.program_name}</td>
                <td className="app__td">{item.total_users}</td>
                <td className="app__td">{item.total_allowance}</td>
                <td className="app__td">{item.total_paid}</td>
                <td className="app__td">{item.total_unpaid}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}
