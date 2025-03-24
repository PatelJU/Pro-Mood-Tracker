export type MoodLevel = 1 | 2 | 3 | 4 | 5

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night'

export interface MoodEntry {
  level: MoodLevel
  timeOfDay: TimeOfDay
  note?: string
  questionnaire?: {
    sleepQuality?: number
    symptoms?: Record<string, boolean>
    triggers?: Record<string, boolean>
  }
}

export type MoodData = Record<string, Record<TimeOfDay, MoodEntry>>

export const moodDescriptions: Record<MoodLevel, string> = {
  1: 'Very Bad',
  2: 'Bad',
  3: 'Okay',
  4: 'Good',
  5: 'Excellent'
} 