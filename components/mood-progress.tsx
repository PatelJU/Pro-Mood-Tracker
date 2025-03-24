import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { MoodData } from "../types/mood"
import { Progress } from "@/components/ui/progress"
import { Target, Trophy, Star, Award, Sparkles } from 'lucide-react'
import { motion } from "framer-motion"
import { formatDate } from "../utils/date"

interface MoodProgressProps {
  moodData: MoodData
}

export function MoodProgress({ moodData }: MoodProgressProps) {
  const progressStats = useMemo(() => {
    const entries = Object.entries(moodData)
    const sortedEntries = entries.sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
    
    // Reference existing streak calculation from StreakTracker
    // Lines referenced: components/streak-tracker.tsx:15-64
    
    // Reference milestone targets from MoodMilestones
    // Lines referenced: components/mood-milestones.tsx:23-58
    
    const totalEntries = entries.reduce((sum, [_, dailyEntries]) => 
      sum + Object.keys(dailyEntries).length, 0)
    
    const positiveEntries = entries.reduce((sum, [_, dailyEntries]) => {
      return sum + Object.values(dailyEntries)
        .filter(entry => entry.level > 3).length
    }, 0)

    const reflectiveEntries = entries.filter(([_, dailyEntries]) => 
      Object.values(dailyEntries).some(entry => entry.note && entry.note.length > 0)
    ).length

    const progressItems = [
      {
        icon: Trophy,
        title: "Tracking Progress",
        current: totalEntries,
        target: 100,
        description: "Total mood entries logged",
        color: "bg-blue-100 text-blue-600"
      },
      {
        icon: Star,
        title: "Positivity Progress",
        current: positiveEntries,
        target: 50,
        description: "Positive mood entries",
        color: "bg-green-100 text-green-600"
      },
      {
        icon: Award,
        title: "Consistency Progress",
        current: entries.length,
        target: 30,
        description: "Days tracked",
        color: "bg-purple-100 text-purple-600"
      },
      {
        icon: Sparkles,
        title: "Reflection Progress",
        current: reflectiveEntries,
        target: 20,
        description: "Reflective entries",
        color: "bg-yellow-100 text-yellow-600"
      }
    ]

    return progressItems
  }, [moodData])

  return (
    <Card className="border border-black/10 bg-white/95 backdrop-blur-sm shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Progress Overview
        </CardTitle>
        <CardDescription>
          Your journey towards better mood tracking
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
          {progressStats.map((stat, index) => {
            const Icon = stat.icon
            const progress = Math.min(100, (stat.current / stat.target) * 100)
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${stat.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">{stat.title}</h3>
                      <p className="text-sm text-gray-600">{stat.description}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{stat.current} / {stat.target}</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
} 