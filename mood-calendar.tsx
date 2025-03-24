"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { Smile, Meh, Frown } from 'lucide-react'
import { useState } from "react"

const moodEmojis = [
  { icon: Frown, label: "Bad", value: 1 },
  { icon: Meh, label: "Okay", value: 3 },
  { icon: Smile, label: "Great", value: 5 },
]

export function MoodCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedMood, setSelectedMood] = useState<number | null>(null)

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardContent className="p-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-4">
          <h3 className="text-lg font-medium">How are you feeling today?</h3>
          <div className="flex gap-4">
            {moodEmojis.map((mood) => {
              const Icon = mood.icon
              return (
                <Button
                  key={mood.value}
                  variant={selectedMood === mood.value ? "default" : "outline"}
                  className="flex-1 h-20 flex flex-col gap-2"
                  onClick={() => setSelectedMood(mood.value)}
                >
                  <Icon className="h-8 w-8" />
                  <span>{mood.label}</span>
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

