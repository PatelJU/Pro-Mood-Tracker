"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { motion } from "framer-motion"
import { MoodEntry, MoodLevel, moodDescriptions, MoodData } from "../types/mood"
import { moodColors } from "../utils/theme"
import { ChevronRight } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface MoodTimelineProps {
  moodData: MoodData
  onSelectEntry: (date: string, entry: MoodEntry) => void
  isOpen: boolean
  onClose: () => void
}

export function MoodTimeline({ moodData, onSelectEntry, isOpen, onClose }: MoodTimelineProps) {
  const sortedEntries = useMemo(() => {
    return Object.entries(moodData)
      .flatMap(([dateStr, dailyEntries]) => {
        // Parse the date string and validate it
        const date = new Date(dateStr)
        if (isNaN(date.getTime())) {
          console.error(`Invalid date string: ${dateStr}`)
          return []
        }
        
        return Object.entries(dailyEntries).map(([timeOfDay, entry]) => ({
          date,
          timeOfDay,
          entry
        }))
      })
      .sort((a, b) => b.date.getTime() - a.date.getTime())
  }, [moodData])

  const getMoodColor = (level: number): string => {
    if (level >= 1 && level <= 5) {
      return moodColors[level as MoodLevel].bg
    }
    return moodColors[3].bg
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] md:max-w-3xl lg:max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl font-semibold">Mood History</DialogTitle>
        </DialogHeader>
        
        <div className="border border-black/10 bg-white/95 backdrop-blur-sm rounded-lg">
          <ScrollArea className="h-[70vh] md:h-[600px] pr-4">
            <div className="relative p-4">
              <div className="absolute top-0 bottom-0 left-4 w-0.5 bg-gray-200 dark:bg-gray-800" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedEntries.map(({ date, timeOfDay, entry }, index) => (
                  <motion.div
                    key={`${date.toISOString()}-${timeOfDay}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative pl-8 group"
                  >
                    <div className="absolute left-2.5 top-4 -translate-y-1/2">
                      <div
                        className={cn(
                          "w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 transition-transform duration-200 group-hover:scale-125",
                          getMoodColor(entry.level)
                        )}
                      />
                    </div>
                    
                    <Button
                      variant="outline"
                      className="w-full justify-between hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 hover:shadow-md"
                      onClick={() => onSelectEntry(format(date, 'yyyy-MM-dd'), entry)}
                    >
                      <div className="flex flex-col items-start">
                        <span className="font-medium text-sm md:text-base">
                          {format(date, "EEEE, MMMM d")}
                        </span>
                        <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                          {timeOfDay} - {moodDescriptions[entry.level as MoodLevel]}
                        </span>
                      </div>
                      <ChevronRight className="h-4 w-4 opacity-50 group-hover:opacity-100" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
} 