"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MoodData, MoodLevel } from "../types/mood"
import { formatDate } from "../utils/date"
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts"
import React, { useMemo } from "react"
import { motion } from "framer-motion"

interface MoodPatternsProps {
  moodData: MoodData
}

export function MoodPatterns({ moodData }: MoodPatternsProps) {
  const dayPatterns = useMemo(() => {
    const patterns = Array.from({ length: 7 }, (_, i) => {
      const day = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][i]
      const dailyMoods = Object.entries(moodData).reduce((acc: number[], [_, entries]) => {
        Object.values(entries).forEach(entry => {
          if (new Date(entry.date).getDay() === i) {
            acc.push(entry.level)
          }
        })
        return acc
      }, [])

      const avgMood = dailyMoods.length 
        ? dailyMoods.reduce((sum, mood) => sum + mood, 0) / dailyMoods.length
        : 0

      return {
        day,
        value: Number(avgMood.toFixed(2)),
        fullMark: 5
      }
    })
    return patterns
  }, [moodData])

  return (
    <Card className="border border-black/10 bg-white shadow-xl hover:shadow-2xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            📊
          </motion.div>
          Mood Patterns
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] bg-white border border-black/10 rounded-lg">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={dayPatterns}>
              <PolarGrid stroke="#6b7280" strokeDasharray="3 3" />
              <PolarAngleAxis 
                dataKey="day" 
                tick={{ fill: '#6b7280', fontSize: 12 }}
              />
              <Radar
                name="Mood Level"
                dataKey="value"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.3}
                animationBegin={0}
                animationDuration={2000}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

