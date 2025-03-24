import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { MoodData } from "../types/mood"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts"
import { Scale } from 'lucide-react'
import { format, subMonths } from "date-fns"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import { TrendingUp, Activity } from "lucide-react"

interface Period {
  label: string
  moodDistribution: { level: number; percentage: number }[]
  averageMood: number
  start: Date
}

interface MoodComparisonProps {
  comparisonData?: Period[]
}

export function MoodComparison({ comparisonData = [] }: MoodComparisonProps) {
  if (!comparisonData || comparisonData.length < 2) {
    return (
      <div className="flex items-center justify-center p-8 bg-white">
        <p className="text-gray-500">Not enough data for comparison</p>
      </div>
    )
  }

  const chartData = Array.from({ length: 5 }, (_, level) => ({
    level: level + 1,
    current: comparisonData[0]?.moodDistribution?.find(m => m.level === level)?.percentage || 0,
    previous: comparisonData[1]?.moodDistribution?.find(m => m.level === level)?.percentage || 0
  }))

  const [period1, setPeriod1] = useState<Date>(comparisonData[0].start)
  const [period2, setPeriod2] = useState<Date>(comparisonData[1].start)

  const handleCompare = () => {
    // Implement the compare logic here
    console.log('Comparing periods:', period1, period2)
  }

  const calculateAverageDifference = (data: Period[]) => {
    return (data[0].averageMood - data[1].averageMood).toFixed(1)
  }

  const calculateTrendChange = (data: Period[]) => {
    const change = ((data[0].averageMood - data[1].averageMood) / data[1].averageMood) * 100
    return change.toFixed(1)
  }

  const renderComparisonChart = (data: Period[]) => {
    return (
      <div className="h-[300px] w-full bg-white">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.3}/>
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              opacity={0.1} 
              stroke="#94a3b8"
              vertical={false}
            />
            <XAxis 
              dataKey="level" 
              stroke="#94a3b8"
              tick={{ fill: '#64748b', fontSize: 12 }}
              tickLine={{ stroke: '#94a3b8' }}
              axisLine={{ stroke: '#e2e8f0' }}
              label={{ 
                value: 'Mood Level', 
                position: 'bottom',
                style: { fill: '#64748b' }
              }}
              tickFormatter={(value) => `Level ${value}`}
            />
            <YAxis 
              label={{ 
                value: 'Percentage', 
                angle: -90, 
                position: 'insideLeft',
                style: { fill: '#64748b' }
              }}
              stroke="#94a3b8"
              tick={{ fill: '#64748b', fontSize: 12 }}
              tickLine={{ stroke: '#94a3b8' }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-white p-3 shadow-sm">
                      <p className="text-sm font-medium text-gray-700">
                        Mood Level {payload[0].payload.level}
                      </p>
                      {payload.map((entry, index) => (
                        <p 
                          key={`tooltip-${entry.name}-${index}`} 
                          className="text-sm text-gray-500"
                        >
                          {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}%
                        </p>
                      ))}
                    </div>
                  )
                }
                return null
              }}
            />
            <Legend 
              wrapperStyle={{ 
                paddingTop: '20px',
              }}
              formatter={(value) => (
                <span className="text-sm text-gray-700">{value}</span>
              )}
            />
            <Bar 
              dataKey="current" 
              name="Current Period" 
              fill="url(#barGradient)"
              stroke="#3b82f6"
              strokeWidth={2}
              opacity={0.9}
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="previous" 
              name="Previous Period" 
              fill="url(#barGradient)"
              stroke="#3b82f6"
              strokeWidth={2}
              opacity={0.5}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  return (
    <div className="space-y-6 bg-gray-50 p-6 rounded-lg">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white rounded-lg border shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto mb-4 sm:mb-0">
          <div className="flex flex-col w-full sm:w-auto">
            <span className="text-sm font-medium text-gray-700 mb-1">Period 1</span>
            <div className="w-full sm:w-auto">
              <DatePicker 
                date={period1} 
                onDateChange={(date) => setPeriod1(date || period1)}
                aria-label="Select first period"
              />
            </div>
          </div>
          <div className="flex flex-col w-full sm:w-auto">
            <span className="text-sm font-medium text-gray-700 mb-1">Period 2</span>
            <div className="w-full sm:w-auto">
              <DatePicker 
                date={period2} 
                onDateChange={(date) => setPeriod2(date || period2)}
                aria-label="Select second period"
              />
            </div>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="default" 
          onClick={handleCompare}
          className="w-full sm:w-auto h-11 px-4 bg-white hover:bg-gray-50 text-gray-700 border-gray-200"
          aria-label="Compare selected periods"
        >
          Compare
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="space-y-1 border-b border-gray-100 bg-gray-50/50">
            <CardTitle className="text-xl font-semibold text-gray-700">Mood Comparison</CardTitle>
            <CardDescription className="text-sm text-gray-500">
              Compare mood patterns between periods
            </CardDescription>
          </CardHeader>
          <CardContent className="bg-white">
            {renderComparisonChart(comparisonData)}
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="space-y-1 border-b border-gray-100 bg-gray-50/50">
            <CardTitle className="text-xl font-semibold text-gray-700">Comparison Statistics</CardTitle>
            <CardDescription className="text-sm text-gray-500">
              Key differences between periods
            </CardDescription>
          </CardHeader>
          <CardContent className="bg-white">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-white border border-gray-200 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-50">
                        <TrendingUp className="h-5 w-5 text-blue-500" aria-hidden="true" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-700">Average Difference</h3>
                        <div className="text-2xl font-bold text-gray-700" role="status">
                          {calculateAverageDifference(comparisonData)}
                        </div>
                        <p className="text-sm text-gray-500">Between periods</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border border-gray-200 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-50">
                        <Activity className="h-5 w-5 text-blue-500" aria-hidden="true" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-700">Trend Change</h3>
                        <div className="text-2xl font-bold text-gray-700" role="status">
                          {calculateTrendChange(comparisonData)}%
                        </div>
                        <p className="text-sm text-gray-500">Overall change</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 