"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FlameIcon as Fire, Trophy, Star } from 'lucide-react'
import { MoodData } from "../types/mood"
import { formatDate } from "../utils/date"
import { useMemo } from "react"

interface StreakTrackerProps {
  moodData: MoodData
}

export function StreakTracker({ moodData }: StreakTrackerProps) {
  const stats = useMemo(() => {
    const today = new Date()
    let currentStreak = 0
    let date = new Date()
    let positiveStreak = 0
    let bestMoodStreak = 0
    let currentBestStreak = 0

    // Calculate current streak and positive mood streak
    while (moodData[formatDate(date)]) {
      currentStreak++
      
      // Check if average mood for the day is positive (> 3)
      const dayMoods = Object.values(moodData[formatDate(date)])
      const avgMood = dayMoods.reduce((sum, entry) => sum + entry.level, 0) / dayMoods.length
      
      if (avgMood > 3) {
        currentBestStreak++
        bestMoodStreak = Math.max(bestMoodStreak, currentBestStreak)
      } else {
        currentBestStreak = 0
      }
      
      date.setDate(date.getDate() - 1)
    }

    // Calculate longest streak
    const dates = Object.keys(moodData).sort()
    let longestStreak = 0
    let currentCount = 1

    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i - 1])
      const curr = new Date(dates[i])
      const diffDays = Math.floor((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24))
      
      if (diffDays === 1) {
        currentCount++
        longestStreak = Math.max(longestStreak, currentCount)
      } else {
        currentCount = 1
      }
    }

    return {
      currentStreak,
      longestStreak,
      bestMoodStreak
    }
  }, [moodData])

  return (
    <Card className="bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 border-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fire className="h-5 w-5 text-orange-500" />
          Streak Tracker
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-black/10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="h-12 w-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center"
            >
              <Fire className="h-6 w-6 text-white" />
            </motion.div>
            <div>
              <div className="text-2xl font-bold">{stats.currentStreak}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Current Streak</div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-black/10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="h-12 w-12 bg-white border border-purple-200 rounded-full flex items-center justify-center"
            >
              <Trophy className="h-6 w-6 text-purple-500" />
            </motion.div>
            <div>
              <div className="text-2xl font-bold">{stats.longestStreak}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Longest Streak</div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="text-sm font-medium mb-2">Recent Activity</div>
          <div className="flex gap-1">
            {Array.from({ length: 7 }).map((_, i) => {
              const date = new Date()
              date.setDate(date.getDate() - i)
              const hasEntry = moodData[formatDate(date)]
              
              return (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className={`h-8 w-8 rounded-md flex items-center justify-center ${
                    hasEntry 
                      ? "bg-white border border-green-200 text-green-500" 
                      : "bg-white border border-gray-200"
                  }`}
                >
                  {hasEntry && <Star className="h-4 w-4" />}
                </motion.div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

