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

const colors = [
  '#1a237e', // Dark Blue
  '#3949ab', // Medium Dark Blue
  '#5c6bc0', // Medium Blue
  '#7986cb', // Light Blue

  '#212121', // Dark Gray
  '#424242', // Medium Dark Gray
  '#616161', // Medium Gray
  '#9e9e9e', // Light Gray

  '#4a148c', // Dark Purple
  '#6a1b9a', // Medium Dark Purple
  '#8e24aa', // Medium Purple
  '#ab47bc', // Light Purple

  '#283593', // Dark Blue
  '#3f51b5', // Medium Blue
  '#7986cb', // Light Blue
  '#263238', // Dark Gray

  '#757575', // Medium Gray
  '#bdbdbd', // Light Gray
  '#6a1b9a' // Medium Purple
]

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

    const assignedColors = new Set()

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

      if (first > 0 || second > 0 || third > 0 || fourth > 0) {
        firstYearData[p.name] = first
        secondYearData[p.name] = second
        thirdYearData[p.name] = third
        fourthYearData[p.name] = fourth

        let uniqueColor
        // Find a color that hasn't been assigned yet
        do {
          uniqueColor = colors[Math.floor(Math.random() * colors.length)]
        } while (assignedColors.has(uniqueColor))

        // Add the color to the assigned set
        assignedColors.add(uniqueColor)

        // Assign the unique color to the program
        chartConfigData[p.name] = {
          label: p.name,
          color: uniqueColor
        }
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

    setDataSets(chartData)
    setLabels(chartConfig)
    console.log('chartConfig', chartConfig)
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
        <div className="space-x-3">
          {Object.keys(labels).map((key) => (
            <div key={key} className="inline-flex space-x-1">
              <div className="text-xs">{labels[key].label}</div>
              <div
                className="w-4 h-4"
                style={{ backgroundColor: `${labels[key].color}` }}
              ></div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
