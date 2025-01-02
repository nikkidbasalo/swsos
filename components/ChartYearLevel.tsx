'use client'

import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart'
import { useSupabase } from '@/context/SupabaseProvider'
import { GranteeTypes, ProgramTypes } from '@/types'
import { fetchGrantees, fetchPrograms } from '@/utils/fetchApi'
import { useEffect, useState } from 'react'

export function ChartYearLevel() {
  const { supabase } = useSupabase()

  // Chart data
  const [dataSets, setDataSets] = useState<any>([])
  const [labels, setLabels] = useState<any>([])

  const fetchData = async () => {
    const programsData = await fetchPrograms('', 999, 0)
    const programs: ProgramTypes[] = programsData.data

    const result = await fetchGrantees({}, '', 99999, 0)

    const results: GranteeTypes[] = result.data

    const firstYearData: any = { month: '1st Year' }
    const secondYearData: any = { month: '2nd Year' }
    const thirdYearData: any = { month: '3rd Year' }
    const fourthYearData: any = { month: '4th Year' }

    type ChartConfig = Record<string, { label: string; color: string }>
    const chartConfigData: ChartConfig = {}

    programs.forEach((p) => {
      const first = results.filter(
        (g) =>
          g.year_level_status === '1st Year' &&
          g.program_id?.toString() === p.id?.toString()
      ).length
      const second = results.filter(
        (g) =>
          g.year_level_status === '2nd Year' &&
          g.program_id?.toString() === p.id?.toString()
      ).length
      const third = results.filter(
        (g) =>
          g.year_level_status === '3rd Year' &&
          g.program_id?.toString() === p.id?.toString()
      ).length
      const fourth = results.filter(
        (g) =>
          g.year_level_status === '4th Year' &&
          g.program_id?.toString() === p.id?.toString()
      ).length

      firstYearData[p.name] = first
      secondYearData[p.name] = second
      thirdYearData[p.name] = third
      fourthYearData[p.name] = fourth

      chartConfigData[p.name] = {
        label: p.name,
        color: '#2563eb'
      }
    })

    type ChartDataItem = {
      month: string // Represents the year
      [program: string]: number | string // Dynamic keys for program values
    }

    type ChartData = ChartDataItem[]

    const chartData: ChartData = [
      firstYearData,
      secondYearData,
      thirdYearData,
      fourthYearData
    ]

    const chartConfig = chartConfigData satisfies ChartConfig

    console.log('xx', chartData, chartConfig)

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
              tickFormatter={(value) => value.slice(0, 8)}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            {Object.keys(labels).map((key) => (
              <Bar
                key={key}
                dataKey={key}
                fill={labels[key].color}
                name={labels[key].label}
                radius={4}
              />
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
