"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { MoodData, MoodLevel, moodDescriptions } from "../types/mood"
import { formatDate } from "../utils/date"

interface MoodSummaryProps {
  moodData: MoodData
}

export function MoodSummary({ moodData }: MoodSummaryProps) {
  const today = formatDate(new Date())
  const todayEntries = moodData[today] || {}
  
  const averageMood = Object.values(todayEntries).reduce((sum, entry) => 
    sum + entry.level, 0) / (Object.values(todayEntries).length || 1)
  
  const moodLevel = Math.round(averageMood) as MoodLevel

  return (
    <Card className="border border-black/10 bg-white/95 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Today's Summary</CardTitle>
        <CardDescription>Your mood overview for today</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {Object.keys(todayEntries).length > 0 
            ? moodDescriptions[moodLevel]
            : "No entries yet"}
        </div>
      </CardContent>
    </Card>
  )
} 