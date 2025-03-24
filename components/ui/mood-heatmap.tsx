import React from 'react'
import { Card } from './card'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip'

interface MoodHeatmapProps {
  data: {
    date: Date
    value: number
  }[]
}

export function MoodHeatmap({ data }: MoodHeatmapProps) {
  const { theme } = useTheme()
  const today = new Date()
  const startDate = new Date(today)
  startDate.setDate(startDate.getDate() - 364) // Show last 365 days

  // Generate all dates
  const allDates = []
  for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
    allDates.push(new Date(d))
  }

  // Create weeks array
  const weeks: Date[][] = []
  let currentWeek: Date[] = []
  
  allDates.forEach(date => {
    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
    currentWeek.push(date)
  })
  if (currentWeek.length > 0) {
    weeks.push(currentWeek)
  }

  // Get mood value for a date
  const getMoodValue = (date: Date) => {
    const entry = data.find(d => 
      d.date.getFullYear() === date.getFullYear() &&
      d.date.getMonth() === date.getMonth() &&
      d.date.getDate() === date.getDate()
    )
    return entry?.value
  }

  // Get color based on mood value using theme-aware colors
  const getMoodColor = (value: number | undefined) => {
    if (value === undefined) {
      return theme === 'dark' ? 'bg-background/20' : 'bg-muted/50'
    }

    const opacity = 0.3 + (value / 5) * 0.7 // Scale opacity based on mood value
    const level = Math.ceil(value)
    
    return `bg-[hsl(var(--mood-${level})/${Math.round(opacity * 100)}%)]`
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getMoodDescription = (value: number | undefined) => {
    if (value === undefined) return 'No mood entry'
    const descriptions = [
      'Very Low',
      'Low',
      'Neutral',
      'Good',
      'Excellent'
    ]
    return descriptions[Math.ceil(value) - 1] || 'Unknown'
  }

  return (
    <Card className="p-6 overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Month labels */}
        <div className="flex mb-2 pl-8">
          {months.map((month, i) => (
            <div
              key={month}
              className="flex-1 text-center text-sm font-medium text-foreground/70"
              style={{
                visibility: weeks.some(week => 
                  week.some(date => date.getMonth() === i)
                ) ? 'visible' : 'hidden'
              }}
            >
              {month}
            </div>
          ))}
        </div>

        <div className="flex">
          {/* Weekday labels */}
          <div className="w-8 pt-2">
            {weekdays.map((day) => (
              <div
                key={day}
                className="h-8 text-xs font-medium flex items-center justify-end pr-2 text-foreground/70"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          <div className="flex-1 grid grid-flow-col gap-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-rows-7 gap-1">
                {week.map((date, dayIndex) => {
                  const moodValue = getMoodValue(date)
                  return (
                    <TooltipProvider key={dayIndex}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              "w-8 h-8 rounded-sm transition-all duration-200",
                              getMoodColor(moodValue),
                              "hover:ring-2 hover:ring-offset-2 hover:ring-ring hover:ring-offset-background",
                              "hover:scale-110 cursor-pointer",
                              "shadow-sm"
                            )}
                          />
                        </TooltipTrigger>
                        <TooltipContent 
                          side="top" 
                          className="text-xs font-medium"
                        >
                          <div className="space-y-1">
                            <p className="font-semibold text-foreground">{formatDate(date)}</p>
                            <p className={cn(
                              "px-2 py-0.5 rounded-sm text-center",
                              moodValue ? getMoodColor(moodValue) : "bg-muted",
                              "text-foreground"
                            )}>
                              {getMoodDescription(moodValue)}
                            </p>
                            {moodValue && (
                              <p className="text-center text-muted-foreground">
                                Level: {moodValue.toFixed(1)}
                              </p>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center justify-end gap-3 text-sm border-t pt-4 border-border">
          <span className="font-medium text-foreground">Mood Level:</span>
          <div className="flex items-center gap-1 text-foreground/70">
            <span>Low</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map(value => (
                <TooltipProvider key={value}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "w-6 h-6 rounded-sm shadow-sm transition-all duration-200",
                          getMoodColor(value),
                          "hover:ring-1 hover:ring-ring hover:scale-105"
                        )}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                      {getMoodDescription(value)}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
            <span>High</span>
          </div>
        </div>
      </div>
    </Card>
  )
} 