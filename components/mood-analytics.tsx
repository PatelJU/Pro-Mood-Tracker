"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MoodData, MoodLevel, TimeOfDay } from "../types/mood"
import { formatDate } from "../utils/date"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts"
import { moodColors } from "../utils/theme"
import { Brain, Coffee, Cloud, Moon, Sun, Utensils } from 'lucide-react'

interface MoodAnalyticsProps {
  moodData: MoodData
}

const triggers = [
  { label: "Sleep Quality", icon: Moon },
  { label: "Diet", icon: Utensils },
  { label: "Weather", icon: Cloud },
  { label: "Caffeine", icon: Coffee },
  { label: "Stress", icon: Brain },
  { label: "Exercise", icon: Sun }
]

export function MoodAnalytics({ moodData }: MoodAnalyticsProps) {
  const analytics = useMemo(() => {
    const entries = Object.entries(moodData)
    const allMoods: number[] = []
    const timeOfDayTrends: Record<TimeOfDay, number[]> = {
      morning: [],
      afternoon: [],
      evening: [],
      night: [],
      "full-day": []
    }
    const dayOfWeekTrends: Record<string, number[]> = {
      Sunday: [], Monday: [], Tuesday: [], Wednesday: [],
      Thursday: [], Friday: [], Saturday: []
    }
    const triggerImpact: Record<string, { count: number; avgMood: number }> = {}

    entries.forEach(([dateStr, dailyMoods]) => {
      const date = new Date(dateStr)
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' })

      Object.values(dailyMoods).forEach(entry => {
        if (entry && typeof entry.level === 'number') {
          allMoods.push(entry.level)
          
          // Safely handle timeOfDay
          const timeOfDay = entry.timeOfDay as TimeOfDay
          if (timeOfDay && timeOfDayTrends[timeOfDay]) {
            timeOfDayTrends[timeOfDay].push(entry.level)
          } else {
            timeOfDayTrends["full-day"].push(entry.level) // fallback
          }

          // Safely handle dayOfWeek
          if (dayOfWeekTrends[dayName]) {
            dayOfWeekTrends[dayName].push(entry.level)
          }

          // Analyze questionnaire data if available
          if (entry.questionnaire?.triggers) {
            Object.entries(entry.questionnaire.triggers).forEach(([trigger, isPresent]) => {
              if (isPresent) {
                if (!triggerImpact[trigger]) {
                  triggerImpact[trigger] = { count: 0, avgMood: 0 }
                }
                triggerImpact[trigger].count++
                triggerImpact[trigger].avgMood += entry.level
              }
            })
          }
        }
      })
    })

    // Calculate averages for trigger impact
    Object.values(triggerImpact).forEach(impact => {
      impact.avgMood = impact.avgMood / impact.count
    })

    const calculateAverage = (arr: number[]) => 
      arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0

    return {
      averageMood: calculateAverage(allMoods),
      moodTrends: {
        timeOfDay: Object.fromEntries(
          Object.entries(timeOfDayTrends).map(([time, moods]) => [
            time,
            calculateAverage(moods)
          ])
        ),
        dayOfWeek: Object.fromEntries(
          Object.entries(dayOfWeekTrends).map(([day, moods]) => [
            day,
            calculateAverage(moods)
          ])
        )
      },
      triggerImpact
    }
  }, [moodData])

  return (
    <Card className="border border-black/10 bg-white/95 backdrop-blur-sm shadow-xl">
      <CardHeader>
        <CardTitle>Mood Insights</CardTitle>
        <CardDescription>Detailed analysis of your mood patterns</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="patterns">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="patterns">Time Patterns</TabsTrigger>
            <TabsTrigger value="recommendations">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="patterns" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Time of Day Impact</h3>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={Object.entries(analytics.moodTrends.timeOfDay).map(([time, value]) => ({
                      time,
                      value
                    }))}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="time" />
                      <Radar dataKey="value" fill={moodColors[3].dot} fillOpacity={0.6} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2">Day of Week Impact</h3>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={Object.entries(analytics.moodTrends.dayOfWeek).map(([day, value]) => ({
                      day: day.slice(0, 3),
                      value
                    }))}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="day" />
                      <Radar dataKey="value" fill={moodColors[4].dot} fillOpacity={0.6} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="recommendations">
            <div className="space-y-4">
              {analytics.averageMood < 3 && (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-amber-600">Your average mood has been lower than usual. Consider speaking with a mental health professional.</p>
                  </CardContent>
                </Card>
              )}
              {Object.entries(analytics.moodTrends.timeOfDay).map(([time, value]) => {
                if (value < analytics.averageMood - 0.5) {
                  return (
                    <Card key={time}>
                      <CardContent className="pt-6">
                        <p className="text-blue-600">Your mood tends to be lower during {time}. Try to plan enjoyable activities during this time.</p>
                      </CardContent>
                    </Card>
                  )
                }
                return null
              })}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
} 