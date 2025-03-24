"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { MoodData } from "../types/mood"
import { Badge, Medal, Star, Sun, Moon, Coffee, Brain } from 'lucide-react'
import { motion } from "framer-motion"
import { format, differenceInDays } from "date-fns"

interface MoodBadgesProps {
  moodData: MoodData
}

export function MoodBadges({ moodData }: MoodBadgesProps) {
  const badges = useMemo(() => {
    const entries = Object.entries(moodData)
    const sortedEntries = entries.sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
    
    const firstEntry = sortedEntries[0]
    const lastEntry = sortedEntries[sortedEntries.length - 1]
    const daysTracking = firstEntry && lastEntry ? 
      differenceInDays(new Date(lastEntry[0]), new Date(firstEntry[0])) + 1 : 0

    const morningPerson = entries.reduce((count, [_, dailyEntries]) => {
      return count + Object.entries(dailyEntries)
        .filter(([time, entry]) => 
          time.includes('morning') && entry.level > 3
        ).length
    }, 0)

    const nightOwl = entries.reduce((count, [_, dailyEntries]) => {
      return count + Object.entries(dailyEntries)
        .filter(([time, entry]) => 
          time.includes('night') && entry.level > 3
        ).length
    }, 0)

    const reflectionMaster = entries.reduce((count, [_, dailyEntries]) => {
      return count + Object.values(dailyEntries)
        .filter(entry => entry.note && entry.note.length > 50).length
    }, 0)

    const badges = [
      {
        icon: Medal,
        title: "Veteran Tracker",
        earned: daysTracking >= 30,
        description: "30+ days of mood tracking",
        color: "bg-blue-100 text-blue-600"
      },
      {
        icon: Sun,
        title: "Morning Person",
        earned: morningPerson >= 15,
        description: "15+ positive morning moods",
        color: "bg-yellow-100 text-yellow-600"
      },
      {
        icon: Moon,
        title: "Night Owl",
        earned: nightOwl >= 15,
        description: "15+ positive evening moods",
        color: "bg-indigo-100 text-indigo-600"
      },
      {
        icon: Brain,
        title: "Deep Thinker",
        earned: reflectionMaster >= 10,
        description: "10+ detailed mood reflections",
        color: "bg-purple-100 text-purple-600"
      }
    ]

    return badges
  }, [moodData])

  return (
    <Card className="border border-black/10 bg-white/95 backdrop-blur-sm shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Badge className="h-5 w-5" />
          Achievement Badges
        </CardTitle>
        <CardDescription>
          Special recognitions for your mood tracking journey
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {badges.map((badge, index) => {
            const Icon = badge.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`${!badge.earned && 'opacity-50'}`}>
                  <CardContent className="p-4 text-center">
                    <div className={`mx-auto w-12 h-12 rounded-full ${badge.color} flex items-center justify-center mb-3`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-medium mb-1">{badge.title}</h3>
                    <p className="text-xs text-gray-600">
                      {badge.description}
                    </p>
                    {badge.earned && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="mt-2"
                      >
                        <Star className="h-4 w-4 text-yellow-500 mx-auto" />
                      </motion.div>
                    )}
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