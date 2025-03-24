"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { TimeSelector } from "./time-selector"
import { MoodLevel, moodDescriptions, TimeOfDay, DailyMoodEntries } from "../types/mood"
import { formatDate } from "../utils/date"
import { moodColors, gradients } from "../utils/theme"
import { Smile, SmileIcon, Meh, Frown, FrownIcon, AlertCircle } from 'lucide-react'
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import type { MoodEntry as MoodEntryType } from "../types/mood"
import { useMoodStore } from "../store/moodStore"

const timeOfDayOptions = [
  { value: 'morning', label: 'Morning', icon: '🌅' },
  { value: 'afternoon', label: 'Afternoon', icon: '☀️' },
  { value: 'evening', label: 'Evening', icon: '🌆' },
  { value: 'night', label: 'Night', icon: '🌙' },
  { value: 'full-day', label: 'Full Day', icon: '📅' },
] as const;

interface MoodEntryProps {
  selectedDate: Date | null | undefined
  onSaveMood: (timeOfDay: TimeOfDay, level: MoodLevel, note: string) => void
  existingMoods?: Partial<Record<TimeOfDay, MoodEntryType>>
  isEditing: boolean
  editingEntry: MoodEntryType | null | undefined
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

export function MoodEntry({ selectedDate, onSaveMood, existingMoods, isEditing, editingEntry }: MoodEntryProps) {
  const resetDay = useMoodStore((state: { resetDay: (date: Date) => void }) => state.resetDay)
  const [selectedTime, setSelectedTime] = useState<TimeOfDay>('morning')
  const [selectedMood, setSelectedMood] = useState<MoodLevel | null>(null)
  const [note, setNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isEditing && editingEntry) {
      setSelectedTime(editingEntry.timeOfDay)
      setSelectedMood(editingEntry.level)
      setNote(editingEntry.note || '')
    } else {
      // Reset form when not editing
      setSelectedTime('morning')
      setSelectedMood(null)
      setNote('')
    }
  }, [isEditing, editingEntry])

  const handleSubmit = useCallback(async () => {
    if (!selectedMood || isSubmitting) return
    
    try {
      setIsSubmitting(true)
      await onSaveMood(selectedTime, selectedMood, note)
      
      if (!isEditing) {
        setNote('')
        setSelectedMood(null)
      }
    } catch (error) {
      console.error('Failed to save mood:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [selectedTime, selectedMood, note, onSaveMood, isSubmitting, isEditing])

  const handleResetDay = useCallback(() => {
    if (!selectedDate) return
    resetDay(selectedDate)
    setSelectedTime('morning')
    setSelectedMood(null)
    setNote('')
  }, [selectedDate, resetDay])

  const moodOptions = [
    { level: 1, emoji: "😢", label: "Very Bad" },
    { level: 2, emoji: "😔", label: "Bad" },
    { level: 3, emoji: "😐", label: "Okay" },
    { level: 4, emoji: "😊", label: "Good" },
    { level: 5, emoji: "🤗", label: "Excellent" }
  ]

  const handleTimeChange = (time: TimeOfDay) => {
    setSelectedTime(time)
    if (existingMoods?.[time]) {
      setSelectedMood(existingMoods[time].level)
      setNote(existingMoods[time].note || '')
    } else {
      setSelectedMood(null)
      setNote('')
    }
  }

  return (
    <Card className="border border-black/10 bg-white/95 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300">
      <CardHeader>
        <CardTitle>
          {selectedDate
            ? `How are you feeling on ${selectedDate.toLocaleDateString()}?`
            : "Select a date to record your mood"}
        </CardTitle>
        <CardDescription>
          Choose when and how you're feeling
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Time of Day</label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {timeOfDayOptions.map(({ value, label, icon }) => (
              <Button
                key={value}
                variant={selectedTime === value ? "default" : "outline"}
                className="h-auto py-4 flex flex-col gap-2 bg-white hover:bg-gray-50 shadow-sm hover:shadow-md transition-all duration-300"
                onClick={() => handleTimeChange(value)}
              >
                <span className="text-2xl">{icon}</span>
                <span className="text-xs text-center">{label}</span>
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-5 gap-3">
          {moodOptions.map(({ level, emoji, label }) => (
            <motion.div
              key={level}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="ghost"
                className={cn(
                  "w-full flex flex-col py-6 h-auto gap-2 transition-all duration-300 shadow-lg hover:shadow-xl",
                  selectedMood === level && "ring-2 ring-offset-2"
                )}
                style={{
                  background: `linear-gradient(135deg, ${moodColors[level as MoodLevel].dot}, ${adjustColor(moodColors[level as MoodLevel].dot, -15)})`,
                  color: "white",
                  opacity: selectedMood === null || selectedMood === level ? 1 : 0.7,
                }}
                onClick={() => setSelectedMood(level as MoodLevel)}
                disabled={!selectedDate}
              >
                <span className="text-2xl mb-1" style={{ fontSize: '28px' }}>
                  {emoji}
                </span>
                <span className="text-xs font-medium">
                  {label}
                </span>
              </Button>
            </motion.div>
          ))}
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">
            What's on your mind? (Optional)
          </label>
          <textarea
            className="flex w-full rounded-lg border border-black/10 px-3 py-2 text-base 
                     ring-offset-background placeholder:text-muted-foreground 
                     focus-visible:outline-none focus-visible:ring-2 
                     focus-visible:ring-ring focus-visible:ring-offset-2 
                     disabled:cursor-not-allowed disabled:opacity-50 
                     md:text-sm min-h-[100px] bg-white shadow-inner"
            placeholder="Write your thoughts here..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={!selectedDate || !selectedTime}
          />
        </div>

        <div className="flex gap-4">
          <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              className="w-full bg-gradient-to-r from-violet-500 to-purple-500 
                        hover:from-violet-600 hover:to-purple-600 text-white 
                        shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={handleSubmit}
              disabled={!selectedDate || !selectedMood || isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Saving...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {existingMoods?.[selectedTime] ? "✏️ Update Mood Entry" : "✨ Save Mood Entry"}
                </div>
              )}
            </Button>
          </motion.div>

          {existingMoods && Object.keys(existingMoods).length > 0 && (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                className="px-4 h-full border-red-200 hover:border-red-300 hover:bg-red-50 text-red-600
                         shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={handleResetDay}
              >
                <div className="flex items-center gap-2">
                  🗑️ Reset Day
                </div>
              </Button>
            </motion.div>
          )}
        </div>

        {existingMoods && Object.keys(existingMoods).length > 0 && (
          <div className="pt-4 border-t">
            <h3 className="text-sm font-medium mb-2">Today's Entries</h3>
            <div className="grid gap-2">
              {Object.entries(existingMoods).map(([time, entry]) => (
                <div
                  key={time}
                  className={cn(
                    "p-2 rounded-lg flex items-center justify-between",
                    moodColors[entry.level].bg
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span>{timeOfDayOptions.find(t => t.value === time)?.icon}</span>
                    <span className="text-sm font-medium">
                      {timeOfDayOptions.find(t => t.value === time)?.label}
                    </span>
                  </div>
                  <span className="text-sm">
                    {moodDescriptions[entry.level]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

