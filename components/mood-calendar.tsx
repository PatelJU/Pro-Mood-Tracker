"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { DailyMoodEntries, MoodData, moodDescriptions, MoodEntry, MoodLevel, TimeOfDay } from "../types/mood"
import { formatDate } from "../utils/date"
import { moodColors, gradients } from "../utils/theme"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { MoodTimeline } from "./mood-timeline"

interface MoodCalendarProps {
  moodData: MoodData
  selectedDate: Date | null | undefined
  onSelectDate: (date: Date | null | undefined) => void
  onViewHistory: (date: string, entry: MoodEntry) => void
  onEditEntry: (date: string, entry: MoodEntry) => void
}

const adjustColor = (hex: string, percent: number) => {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return `#${(
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  ).toString(16).slice(1)}`;
};

export function MoodCalendar({ moodData, selectedDate, onSelectDate, onViewHistory, onEditEntry }: MoodCalendarProps) {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  const calculateAverageMoodLevel = (dailyMoods: DailyMoodEntries): MoodLevel => {
    const moodLevels = Object.values(dailyMoods).map(entry => entry.level)
    const sum = moodLevels.reduce((acc, level) => acc + level, 0)
    const average = sum / moodLevels.length
    return Math.round(average) as MoodLevel
  }

  return (
    <Card className="h-full border bg-card text-card-foreground shadow-xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold flex items-center justify-between">
          Your Mood Calendar
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsHistoryOpen(true)}
            className="ml-auto"
          >
            View History
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="flex-1">
            <Calendar
              mode="single"
              selected={selectedDate || undefined}
              onSelect={onSelectDate}
              className="rounded-md border bg-card"
              components={{
                DayContent: ({ date }) => {
                  const dateStr = formatDate(date)
                  const dailyMoods = moodData[dateStr]
                  
                  let displayMoodLevel: MoodLevel | undefined
                  
                  if (dailyMoods && Object.keys(dailyMoods).length > 0) {
                    displayMoodLevel = calculateAverageMoodLevel(dailyMoods)
                  }
                  
                  return (
                    <motion.div
                      className="relative group w-full h-full flex items-center justify-center"
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <div
                        className={cn(
                          "w-8 h-8 flex items-center justify-center rounded-md",
                          displayMoodLevel ? [
                            "mood-box",
                            `bg-[hsl(var(--mood-${displayMoodLevel}))]`,
                            "text-primary-foreground font-medium"
                          ] : [
                            "empty-box"
                          ],
                          selectedDate && formatDate(selectedDate) === dateStr && [
                            "ring-2 ring-offset-2",
                            displayMoodLevel ? 
                              `ring-[hsl(var(--mood-${displayMoodLevel}))]` :
                              "ring-border"
                          ],
                          "focus-ring"
                        )}
                        role="gridcell"
                        aria-label={`${date.toLocaleDateString('en-US', { 
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}${displayMoodLevel ? ` - Mood Level: ${displayMoodLevel}` : ' - No entries'}`}
                      >
                        {date.getDate()}
                      </div>
                      
                      {/* Enhanced Tooltip */}
                      <div className="mood-tooltip">
                        <div className="font-semibold text-foreground">
                          {date.toLocaleDateString('en-US', { weekday: 'long' })}
                        </div>
                        <div className="font-medium text-foreground">
                          {date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </div>
                        {displayMoodLevel && (
                          <div className="text-muted-foreground mt-1">
                            <span className="font-medium">Mood Level: {displayMoodLevel}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )
                }
              }}
            />
          </div>
          {selectedDate && (
            <div className="w-48 flex flex-col justify-center space-y-4 p-6 bg-card rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 border border-border">
              <div className="text-4xl font-bold text-foreground">
                {selectedDate.toLocaleDateString('en-US', { month: 'long' })}
              </div>
              <div className="text-2xl font-semibold text-muted-foreground">
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}
              </div>
              <div className="text-5xl font-bold text-foreground">
                {selectedDate.getDate()}
              </div>
              <div className="text-xl text-muted-foreground">
                {selectedDate.getFullYear()}
              </div>
            </div>
          )}
        </div>
        <div className="mt-6 mood-legend">
          {Object.entries(moodColors).map(([level, colors]) => (
            <div key={level} className="mood-legend-item">
              <div 
                className={cn(
                  'w-5 h-5 rounded-md mood-box',
                  `bg-[hsl(var(--mood-${level}))]`
                )}
              />
              <span className="text-sm font-medium text-muted-foreground">
                {moodDescriptions[level as unknown as MoodLevel]}
              </span>
            </div>
          ))}
        </div>

        <MoodTimeline 
          moodData={moodData}
          onSelectEntry={onViewHistory}
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
        />
      </CardContent>
    </Card>
  )
}

