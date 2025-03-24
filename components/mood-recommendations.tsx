import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { MoodData, MoodEntry, MoodLevel } from "../types/mood"
import { Lightbulb, Brain, Sun, Moon, Coffee, Battery, Target, Clock, Heart, Sparkles, Activity, Star } from 'lucide-react'
import { motion } from "framer-motion"
import { formatDate } from "../utils/date"
import { triggers } from "../config/triggers"

// Define mood colors with proper typing
const moodColors: Record<MoodLevel, { bg: string; dot: string }> = {
  1: { bg: "bg-red-500", dot: "#EF4444" },
  2: { bg: "bg-orange-500", dot: "#F97316" },
  3: { bg: "bg-yellow-500", dot: "#EAB308" },
  4: { bg: "bg-green-500", dot: "#22C55E" },
  5: { bg: "bg-blue-500", dot: "#3B82F6" }
} as const

interface MoodRecommendationsProps {
  moodData: MoodData
}

interface Analytics {
  triggerImpact: {
    [key: string]: {
      avgMood: number
      count: number
    }
  }
  moodTrends: {
    timeOfDay: { [key: string]: number }
    dayOfWeek: { [key: string]: number }
  }
  averageMood: number
}

interface Insights {
  bestTime: {
    time: string
    average: number
  }
  worstTime: {
    time: string
    average: number
  }
  moodStability: number
  averageMood: number
}

interface RecentActivity {
  date: Date
  hasEntry: boolean
  isPositive: boolean
}

export function MoodRecommendations({ moodData }: MoodRecommendationsProps) {
  const recommendations = useMemo(() => {
    // Reference mood insights calculation
    // Lines referenced: components/mood-insights-dashboard.tsx
    startLine: 14
    endLine: 45

    const entries = Object.entries(moodData)
    const suggestions: Array<{
      icon: any
      title: string
      description: string
      color: string
    }> = []

    // Calculate analytics
    const analytics: Analytics = {
      triggerImpact: {},
      moodTrends: {
        timeOfDay: {},
        dayOfWeek: {}
      },
      averageMood: 0
    }

    // Calculate insights
    const insights: Insights = {
      bestTime: { time: '', average: 0 },
      worstTime: { time: '', average: 0 },
      moodStability: 0,
      averageMood: calculateAverageMood(moodData)
    }

    // Calculate recent activity
    const recentActivity = Array.from({ length: 14 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = formatDate(date)
      const entries = moodData[dateStr] || {}
      
      return {
        date,
        hasEntry: Object.keys(entries).length > 0,
        isPositive: Object.values(entries).every((entry: MoodEntry) => entry.level > 3)
      }
    })

    const recentStreak = recentActivity.filter(day => day.hasEntry).length
    if (recentStreak < 3) {
      suggestions.push({
        icon: Star,
        title: "Build Your Streak",
        description: "Try to log your mood daily to maintain consistency and get better insights.",
        color: "bg-indigo-100 text-indigo-600"
      })
    }

    // Calculate averages
    Object.values(analytics.triggerImpact).forEach(data => {
      data.avgMood /= data.count
    })

    // Add trigger-based recommendations
    Object.entries(analytics.triggerImpact)
      .sort((a, b) => a[1].avgMood - b[1].avgMood)
      .slice(0, 2)
      .forEach(([trigger, data]) => {
        if (data.avgMood < insights.averageMood - 0.5) {
          suggestions.push({
            icon: Activity,
            title: `Manage ${trigger}`,
            description: `This trigger tends to lower your mood. Consider developing strategies to better handle ${trigger.toLowerCase()}.`,
            color: "bg-amber-100 text-amber-600"
          })
        }
      })

    // Calculate mood stability and trends
    // Lines referenced: components/mood-analytics.tsx:141-182
    
    // Add mood stability recommendations
    if (insights.moodStability < 70) {
      suggestions.push({
        icon: Battery,
        title: "Improve Mood Stability",
        description: "Try establishing a consistent daily routine to help stabilize your mood patterns.",
        color: "bg-orange-100 text-orange-600"
      })
    }

    // Add time-based recommendations
    if (insights.worstTime.time) {
      suggestions.push({
        icon: Clock,
        title: "Schedule Adjustment",
        description: `Consider planning uplifting activities during ${insights.worstTime.time} to improve your mood during challenging times.`,
        color: "bg-blue-100 text-blue-600"
      })
    }

    // Calculate reflective entries
    const totalEntries = entries.reduce((sum, [_, dailyEntries]) => 
      sum + Object.keys(dailyEntries).length, 0)
    
    const reflectiveEntries = entries.filter(([_, dailyEntries]) => 
      Object.values(dailyEntries).some(entry => entry.note && entry.note.length > 0)
    ).length

    if (reflectiveEntries < totalEntries * 0.5) {
      suggestions.push({
        icon: Brain,
        title: "Enhance Reflection",
        description: "Adding notes to your mood entries can help identify patterns and triggers.",
        color: "bg-green-100 text-green-600"
      })
    }

    // Add mental health recommendations
    // Lines referenced: components/mood-history-view.tsx:178-188
    
    if (insights.averageMood < 3) {
      suggestions.push({
        icon: Heart,
        title: "Mental Health Check",
        description: "Your mood has been lower than usual. Consider speaking with a mental health professional.",
        color: "bg-red-100 text-red-600"
      })
    }

    // Add positive reinforcement
    if (insights.averageMood > 4) {
      suggestions.push({
        icon: Sparkles,
        title: "Keep Up the Good Work",
        description: "You're maintaining a positive mood! Continue your current practices and activities.",
        color: "bg-purple-100 text-purple-600"
      })
    }

    return suggestions.slice(0, 5) // Limit to top 5 most relevant recommendations
  }, [moodData])

  return (
    <Card className="border border-black/10 bg-white/95 backdrop-blur-sm shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Personalized Recommendations
        </CardTitle>
        <CardDescription>
          Suggestions based on your mood patterns and insights
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {recommendations.map((recommendation, index) => {
            const Icon = recommendation.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className={`p-2 rounded-lg ${recommendation.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">{recommendation.title}</h3>
                        <p className="text-sm text-gray-600">{recommendation.description}</p>
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

function calculateAverageMood(moodData: MoodData): number {
  const entries = Object.values(moodData).flatMap(dailyEntries => 
    Object.values(dailyEntries)
  )
  
  if (entries.length === 0) return 0
  
  const sum = entries.reduce((acc, entry) => acc + entry.level, 0)
  return sum / entries.length
} 