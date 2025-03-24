"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { MoodData, MoodLevel, moodDescriptions, TimeOfDay } from "../types/mood"
import { Brain } from 'lucide-react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { format } from 'date-fns'

interface MoodInsightsDashboardProps {
  moodData: MoodData
}

export function MoodInsightsDashboard({ moodData }: MoodInsightsDashboardProps) {
  const insights = useMemo(() => {
    const entries = Object.entries(moodData)
    const sortedEntries = entries.sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())

    const timeSeriesData = sortedEntries.reduce((acc, [date, dailyEntries]) => {
      const dayData = {
        date,
        morning: null as number | null,
        afternoon: null as number | null,
        evening: null as number | null,
        night: null as number | null,
        fullDay: null as number | null,
      }

      // Process each entry for the day
      Object.entries(dailyEntries).forEach(([timeOfDay, entry]) => {
        const tod = timeOfDay as TimeOfDay
        if (tod === 'morning') dayData.morning = entry.level
        if (tod === 'afternoon') dayData.afternoon = entry.level
        if (tod === 'evening') dayData.evening = entry.level
        if (tod === 'night') dayData.night = entry.level
        if (tod === 'full-day') dayData.fullDay = entry.level
      })

      // Calculate full day average if not explicitly set
      if (dayData.fullDay === null) {
        const values = [dayData.morning, dayData.afternoon, dayData.evening, dayData.night]
          .filter((v): v is number => v !== null)
        if (values.length > 0) {
          dayData.fullDay = values.reduce((a, b) => a + b, 0) / values.length
        }
      }

      acc.push(dayData)
      return acc
    }, [] as any[]).slice(-14) // Last 14 days

    return { timeSeriesData }
  }, [moodData])

  const timeColors = {
    morning: { stroke: '#f97316', fill: '#fff7ed' },    // Orange
    afternoon: { stroke: '#eab308', fill: '#fefce8' },  // Yellow
    evening: { stroke: '#8b5cf6', fill: '#f3e8ff' },    // Purple
    night: { stroke: '#3b82f6', fill: '#eff6ff' },      // Blue
    fullDay: { stroke: '#10b981', fill: '#ecfdf5' }     // Emerald
  }

  return (
    <Card className="border border-black/10 bg-white/95 backdrop-blur-sm shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Mood Insights Dashboard
        </CardTitle>
        <CardDescription>
          Comprehensive analysis of your mood patterns across different times of day
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={insights.timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis 
                dataKey="date" 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickFormatter={(value) => {
                  try {
                    // Ensure value is in YYYY-MM-DD format
                    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                      return value;
                    }
                    // Parse date components
                    const [year, month, day] = value.split('-').map(Number);
                    // Create date with explicit components
                    const date = new Date(year, month - 1, day);
                    return isNaN(date.getTime()) ? value : format(date, 'MMM dd');
                  } catch {
                    return value;
                  }
                }}
              />
              <YAxis 
                domain={[1, 5]} 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickFormatter={(value) => moodDescriptions[value as MoodLevel]}
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-4 rounded-lg shadow-lg border">
                        <p className="font-medium">{format(new Date(label), 'MMM dd, yyyy')}</p>
                        <div className="space-y-2 mt-2">
                          {payload
                            .filter(entry => entry.value !== null)
                            .map((entry) => (
                              <div key={entry.name} className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: entry.stroke }}
                                />
                                <span className="capitalize text-sm">{entry.name}:</span>
                                <span className="font-medium text-sm">
                                  {moodDescriptions[Math.round(Number(entry.value)) as MoodLevel]}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Legend 
                verticalAlign="top" 
                height={36}
                formatter={(value) => <span className="text-sm capitalize">{value}</span>}
              />
              {Object.entries(timeColors).map(([key, color]) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  name={key === 'fullDay' ? 'Full Day' : key}
                  stroke={color.stroke}
                  strokeWidth={2}
                  dot={{ r: 4, fill: color.stroke }}
                  activeDot={{ r: 6 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
} 