export type MoodLevel = 1 | 2 | 3 | 4 | 5

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night' | 'full-day'

export interface MoodEntry {
  level: MoodLevel
  timeOfDay: TimeOfDay
  note?: string
  questionnaire?: {
    sleepQuality?: string
    symptoms?: Record<string, boolean>
    triggers?: Record<string, boolean>
    notes?: string
  }
}

export type MoodData = Record<string, Record<TimeOfDay, MoodEntry>>

export type DailyMoodEntries = Partial<Record<TimeOfDay, MoodEntry>>

export const moodDescriptions: Record<MoodLevel, string> = {
  1: 'Very Bad',
  2: 'Bad',
  3: 'Okay',
  4: 'Good',
  5: 'Excellent'
}

export const moodColors = {
  1: { // Very Bad
    bg: "bg-red-100",
    text: "text-red-700",
    border: "border-red-300",
    dot: "#EF4444",
    ring: "ring-red-400",
    gradient: "from-red-500 to-red-600"
  },
  2: { // Bad
    bg: "bg-orange-100",
    text: "text-orange-700",
    border: "border-orange-300",
    dot: "#F97316",
    ring: "ring-orange-400",
    gradient: "from-orange-500 to-orange-600"
  },
  3: { // Okay
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    border: "border-yellow-300",
    dot: "#EAB308",
    ring: "ring-yellow-400",
    gradient: "from-yellow-500 to-yellow-600"
  },
  4: { // Good
    bg: "bg-green-100",
    text: "text-green-700",
    border: "border-green-300",
    dot: "#22C55E",
    ring: "ring-green-400",
    gradient: "from-green-500 to-green-600"
  },
  5: { // Excellent
    bg: "bg-blue-100",
    text: "text-blue-700",
    border: "border-blue-300",
    dot: "#3B82F6",
    ring: "ring-blue-400",
    gradient: "from-blue-500 to-blue-600"
  }
} as const;

export const timeOfDayOptions = [
  { value: 'morning', label: 'Morning (6AM-12PM)', icon: '🌅' },
  { value: 'afternoon', label: 'Afternoon (12PM-5PM)', icon: '☀️' },
  { value: 'evening', label: 'Evening (5PM-9PM)', icon: '🌆' },
  { value: 'night', label: 'Night (9PM-6AM)', icon: '🌙' },
  { value: 'full-day', label: 'Full Day', icon: '📅' },
] as const

