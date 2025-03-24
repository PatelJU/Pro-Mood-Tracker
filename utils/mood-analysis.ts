import { MoodData, MoodLevel } from "../types/mood"

interface MoodTrends {
  timeOfDay: { [key: string]: number }
  dayOfWeek: { [key: string]: number }
  averageMood: number
}

export function calculateMoodTrends(moodData: MoodData): MoodTrends {
  const entries = Object.entries(moodData)
  
  // Calculate time of day patterns
  const timeOfDay = entries.reduce((acc, [_, dailyEntries]) => {
    Object.entries(dailyEntries).forEach(([time, entry]) => {
      const hour = parseInt(time.split(':')[0])
      const period = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'
      acc[period] = (acc[period] || 0) + entry.level
    })
    return acc
  }, {} as { [key: string]: number })

  // Calculate day of week patterns
  const dayOfWeek = entries.reduce((acc, [dateStr, dailyEntries]) => {
    const day = new Date(dateStr).getDay()
    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day]
    acc[dayName] = (acc[dayName] || 0) + Object.values(dailyEntries)[0].level
    return acc
  }, {} as { [key: string]: number })

  // Calculate average mood
  const allMoods = entries.flatMap(([_, dailyEntries]) => 
    Object.values(dailyEntries).map(entry => entry.level)
  )
  const averageMood = allMoods.length ? allMoods.reduce((sum, level) => sum + level, 0) / allMoods.length : 0

  return {
    timeOfDay,
    dayOfWeek,
    averageMood
  }
} 