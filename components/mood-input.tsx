"use client"

import { Button } from "./ui/button"
import { cn } from "@/lib/utils"
import { MoodLevel, moodColors, moodDescriptions } from "@/types/mood"
import { motion } from "framer-motion"
import { Frown, Meh, Smile } from "lucide-react"

interface MoodInputProps {
  selectedMood?: MoodLevel
  onMoodSelect: (level: MoodLevel) => void
}

const moodOptions = [
  { level: 1, icon: Frown, description: "Very Bad" },
  { level: 2, icon: Frown, description: "Bad" },
  { level: 3, icon: Meh, description: "Okay" },
  { level: 4, icon: Smile, description: "Good" },
  { level: 5, icon: Smile, description: "Excellent" }
]

export function MoodInput({ selectedMood, onMoodSelect }: MoodInputProps) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {moodOptions.map((option) => {
        const Icon = option.icon
        const colors = moodColors[option.level as MoodLevel]
        
        return (
          <motion.div
            key={option.level}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => onMoodSelect(option.level as MoodLevel)}
              variant="ghost"
              className={cn(
                "w-full flex flex-col py-6 h-auto gap-2 transition-all duration-200",
                colors.bg,
                colors.text,
                colors.border,
                selectedMood === option.level && [
                  "ring-2 ring-offset-2",
                  colors.ring
                ]
              )}
            >
              <Icon 
                className={cn(
                  "h-6 w-6",
                  selectedMood === option.level && "animate-bounce"
                )} 
              />
              <span className="text-xs font-medium">{option.description}</span>
            </Button>
          </motion.div>
        )
      })}
    </div>
  )
} 