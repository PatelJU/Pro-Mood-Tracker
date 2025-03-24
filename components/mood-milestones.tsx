import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { MoodData } from "../types/mood"
import { Medal, Gift, Crown, Heart, Zap } from 'lucide-react'
import { motion } from "framer-motion"
import { Progress } from "@/components/ui/progress"

interface MoodMilestonesProps {
  moodData: MoodData
}

export function MoodMilestones({ moodData }: MoodMilestonesProps) {
  const milestones = useMemo(() => {
    const entries = Object.entries(moodData)
    const totalEntries = entries.reduce((sum, [_, dailyEntries]) => 
      sum + Object.keys(dailyEntries).length, 0)
    
    const positiveEntries = entries.reduce((sum, [_, dailyEntries]) => {
      return sum + Object.values(dailyEntries)
        .filter(entry => entry.level > 3).length
    }, 0)

    const milestonesList = [
      {
        icon: Medal,
        title: "Tracking Master",
        target: 100,
        current: totalEntries,
        description: "Total mood entries logged",
        color: "bg-blue-100 text-blue-600"
      },
      {
        icon: Heart,
        title: "Positivity Champion",
        target: 50,
        current: positiveEntries,
        description: "Positive mood entries recorded",
        color: "bg-pink-100 text-pink-600"
      },
      {
        icon: Crown,
        title: "Consistency King",
        target: 30,
        current: Math.min(30, Number(entries.length)),
        description: "Days of tracking completed",
        color: "bg-yellow-100 text-yellow-600"
      },
      {
        icon: Zap,
        title: "Reflection Warrior",
        target: 20,
        current: entries.filter(([_, dailyEntries]) => 
          Object.values(dailyEntries).some(entry => entry.note && entry.note.length > 0)
        ).length,
        description: "Entries with reflective notes",
        color: "bg-purple-100 text-purple-600"
      }
    ]

    return milestonesList
  }, [moodData])

  return (
    <Card className="border border-black/10 bg-white/95 backdrop-blur-sm shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Mood Milestones
        </CardTitle>
        <CardDescription>
          Celebrate your mood tracking journey
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {milestones.map((milestone, index) => {
            const Icon = milestone.icon
            const progress = (milestone.current / milestone.target) * 100
            const isCompleted = progress >= 100
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${milestone.color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium">{milestone.title}</h3>
                          <p className="text-sm text-gray-600">
                            {milestone.description}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{milestone.current} / {milestone.target}</span>
                          <span>{Math.min(100, Math.round(progress))}%</span>
                        </div>
                        <Progress value={Math.min(100, progress)} />
                      </div>
                      {isCompleted && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-sm font-medium text-green-600"
                        >
                          🎉 Milestone Achieved!
                        </motion.div>
                      )}
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