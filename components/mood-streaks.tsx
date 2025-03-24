import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { MoodData } from "../types/mood"
import { Trophy, Star, Flame, Sparkles } from 'lucide-react'
import { motion } from "framer-motion"
import { formatDate } from "../utils/date"

interface MoodStreaksProps {
  moodData: MoodData
}

export function MoodStreaks({ moodData }: MoodStreaksProps) {
  const streakStats = useMemo(() => {
    const entries = Object.entries(moodData)
    const sortedEntries = entries.sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
    
    let currentStreak = 0
    let bestStreak = 0
    let positiveStreak = 0
    let bestPositiveStreak = 0
    let perfectDays = 0 // Days with all positive moods
    
    sortedEntries.forEach(([date, dailyEntries], index) => {
      const moodLevels = Object.values(dailyEntries).map(entry => entry.level)
      const avgMood = moodLevels.reduce((sum, level) => sum + level, 0) / moodLevels.length
      const isPerfectDay = moodLevels.every(level => level > 3)
      
      if (isPerfectDay) perfectDays++

      if (index > 0) {
        const prevDate = new Date(sortedEntries[index - 1][0])
        const currDate = new Date(date)
        const dayDiff = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24))
        
        if (dayDiff === 1) {
          currentStreak++
          bestStreak = Math.max(bestStreak, currentStreak)
        } else {
          currentStreak = 0
        }
      }

      if (avgMood > 3) {
        positiveStreak++
        bestPositiveStreak = Math.max(bestPositiveStreak, positiveStreak)
      } else {
        positiveStreak = 0
      }
    })

    return {
      currentStreak,
      bestStreak,
      positiveStreak,
      bestPositiveStreak,
      perfectDays
    }
  }, [moodData])

  const recentActivity = useMemo(() => {
    const last14Days = Array.from({ length: 14 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return {
        date,
        hasEntry: !!moodData[formatDate(date)],
        isPositive: moodData[formatDate(date)] ? 
          Object.values(moodData[formatDate(date)]).every(entry => entry.level > 3) : 
          false
      }
    })
    return last14Days
  }, [moodData])

  return (
    <Card className="border border-black/10 bg-white/95 backdrop-blur-sm shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          Streak Statistics
        </CardTitle>
        <CardDescription>
          Your mood tracking consistency
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-orange-50 to-amber-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-100">
                  <Flame className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{streakStats.currentStreak}</div>
                  <div className="text-sm text-gray-600">Current Streak</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-indigo-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100">
                  <Trophy className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{streakStats.bestStreak}</div>
                  <div className="text-sm text-gray-600">Best Streak</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-amber-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-100">
                  <Sparkles className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{streakStats.perfectDays}</div>
                  <div className="text-sm text-gray-600">Perfect Days</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="text-sm font-medium">Recent Activity</div>
          <div className="flex gap-1 flex-wrap">
            {recentActivity.map(({ date, hasEntry, isPositive }, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className={`h-8 w-8 rounded-md flex items-center justify-center ${
                  !hasEntry ? "bg-gray-50 border border-gray-200" :
                  isPositive ? "bg-green-50 border border-green-200" :
                  "bg-blue-50 border border-blue-200"
                }`}
                title={formatDate(date)}
              >
                {hasEntry && (
                  <Star className={`h-4 w-4 ${
                    isPositive ? "text-green-500" : "text-blue-500"
                  }`} />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 