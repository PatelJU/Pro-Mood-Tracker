"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { TimeOfDay, timeOfDayOptions } from "@/types/mood"

interface TimeSelectorProps {
  selected: TimeOfDay
  onSelect: (time: TimeOfDay) => void
}

export function TimeSelector({ selected, onSelect }: TimeSelectorProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
      {timeOfDayOptions.map((option) => (
        <Button
          key={option.value}
          onClick={() => onSelect(option.value)}
          variant={selected === option.value ? "default" : "outline"}
          className="h-auto py-4 flex flex-col gap-2"
        >
          <span className="text-2xl">{option.icon}</span>
          <span className="text-xs text-center">{option.label}</span>
        </Button>
      ))}
    </div>
  )
}

