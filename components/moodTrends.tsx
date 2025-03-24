"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { MoodData, MoodLevel } from "../types/mood"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

interface MoodTrendsProps {
  moodData: MoodData
}

export function MoodTrends({ moodData }: MoodTrendsProps) {
  const trendData = useMemo(() => {
    return Object.entries(moodData).map(([date, entries]) => {
      const avgMood = Object.values(entries).reduce((sum, entry) => sum + entry.level, 0) / Object.values(entries).length
      return {
        date: new Date(date).toLocaleDateString(),
        level: avgMood
      }
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [moodData])

  return (
    <Card className="border border-black/10 bg-white/95 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Mood Trends</CardTitle>
        <CardDescription>Your mood patterns over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <XAxis dataKey="date" />
              <YAxis domain={[1, 5]} />
              <Tooltip />
              <Line type="monotone" dataKey="level" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
} 