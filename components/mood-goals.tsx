import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { MoodData } from "../types/mood"
import { Trophy, Target, TrendingUp, Star, Award } from 'lucide-react'
import { motion } from "framer-motion"
import { formatDate } from "../utils/date"

interface MoodGoalsProps {
  moodData: MoodData
}

export function MoodGoals({ moodData }: MoodGoalsProps) {
  const achievements = useMemo(() => {
    const entries = Object.entries(moodData)
    const streaks = {
      current: 0,
      best: 0,
      positiveStreak: 0,
      bestPositiveStreak: 0
    }

    // Calculate streaks and achievements
    entries.sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
    
    let consecutiveDays = 0
    let positiveDays = 0

    entries.forEach(([date, dailyEntries], index) => {
      const avgMood = Object.values(dailyEntries)
        .reduce((sum, entry) => sum + entry.level, 0) / Object.values(dailyEntries).length

      if (index > 0) {
        const prevDate = new Date(entries[index - 1][0])
        const currDate = new Date(date)
        const dayDiff = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24))
        
        if (dayDiff === 1) {
          consecutiveDays++
          streaks.current = consecutiveDays
          streaks.best = Math.max(streaks.best, consecutiveDays)
        } else {
          consecutiveDays = 0
        }
      }

      if (avgMood > 3) {
        positiveDays++
        streaks.positiveStreak = positiveDays
        streaks.bestPositiveStreak = Math.max(streaks.bestPositiveStreak, positiveDays)
      } else {
        positiveDays = 0
      }
    })

    const achievements = [
      {
        icon: Trophy,
        title: "Current Streak",
        value: `${streaks.current} days`,
        description: "Consecutive days of mood tracking",
        color: "bg-blue-100 text-blue-600"
      },
      {
        icon: Star,
        title: "Best Streak",
        value: `${streaks.best} days`,
        description: "Longest tracking streak",
        color: "bg-purple-100 text-purple-600"
      },
      {
        icon: TrendingUp,
        title: "Positive Streak",
        value: `${streaks.positiveStreak} days`,
        description: "Current streak of positive moods",
        color: "bg-green-100 text-green-600"
      },
      {
        icon: Award,
        title: "Best Positive Streak",
        value: `${streaks.bestPositiveStreak} days`,
        description: "Longest streak of positive moods",
        color: "bg-yellow-100 text-yellow-600"
      }
    ]

    return achievements
  }, [moodData])

  return (
    <Card className="border border-black/10 bg-white/95 backdrop-blur-sm shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Goals & Achievements
        </CardTitle>
        <CardDescription>
          Track your mood tracking progress
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((achievement, index) => {
            const Icon = achievement.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${achievement.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium">{achievement.title}</h3>
                        <div className="text-2xl font-bold mt-1">{achievement.value}</div>
                        <p className="text-sm text-gray-600 mt-1">
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
} 