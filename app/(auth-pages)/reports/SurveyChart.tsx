'use client'

import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart'
import { useSupabase } from '@/context/SupabaseProvider'
import { useEffect, useState } from 'react'

export function SurveyChart() {
  const { supabase } = useSupabase()

  // Chart data
  const [dataSets, setDataSets] = useState<any>([])
  const [labels, setLabels] = useState<any>([])

  const fetchData = async () => {
    const { data, error } = await supabase.rpc(
      'get_program_user_counts_by_year',
      {
        year_level_param: '1st  Year'
      }
    )

    if (error) {
      console.error('Error fetching program user counts by year:', error)
      return
    }

    console.log(data)

    const chartData = [
      { month: '1st Year', desktop: 186, mobile: 80 },
      { month: '2nd Year', desktop: 305, mobile: 200 },
      { month: '3rd Year', desktop: 237, mobile: 120 },
      { month: '4th Year', desktop: 73, mobile: 190 }
    ]

    const chartConfig = {
      desktop: {
        label: 'Desktop',
        color: '#2563eb'
      },
      mobile: {
        label: 'Mobile',
        color: '#60a5fa'
      }
    } satisfies ChartConfig

    setDataSets(chartData)
    setLabels(chartConfig)
  }

  // Featch data
  useEffect(() => {
    void fetchData()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparison of Program Grantes Across Year Levels</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={labels} className="min-h-[200px] w-full">
          <BarChart accessibilityLayer data={dataSets}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
            <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
