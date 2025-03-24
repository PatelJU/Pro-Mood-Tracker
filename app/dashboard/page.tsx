"use client"

import { UserDashboard } from "@/components/dashboard/user-dashboard"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, orderBy, Timestamp, DocumentData } from "firebase/firestore"
import { startOfDay, endOfDay, format } from "date-fns"

interface MoodEntry {
  id: string
  userId: string
  timestamp: Timestamp
  moodLevel: number
  note?: string
}

interface MoodData {
  date: string
  avgMood: number
  entries: number
}

interface WeeklyStats {
  day: string
  avgMood: number
  count: number
}

interface StreakData {
  currentStreak: number
  longestStreak: number
  totalEntries: number
  lastEntry: Date | null
}

interface DashboardData {
  moodData: MoodData[]
  weeklyStats: WeeklyStats[]
  streakData: StreakData
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    moodData: [],
    weeklyStats: [],
    streakData: {
      currentStreak: 0,
      longestStreak: 0,
      totalEntries: 0,
      lastEntry: null
    }
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDashboardData() {
      if (!user) return

      try {
        setIsLoading(true)
        setError(null)

        // Fetch mood entries
        const moodRef = collection(db, "moods")
        const q = query(
          moodRef,
          where("userId", "==", user.uid),
          orderBy("timestamp", "desc")
        )
        
        const querySnapshot = await getDocs(q)
        const entries = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as MoodEntry[]

        // Process entries for mood trend
        const moodByDate = new Map<string, { total: number; count: number }>()
        const dayStats = new Map<string, { total: number; count: number }>()
        let currentStreak = 0
        let longestStreak = 0
        let lastEntryDate: Date | null = null

        entries.forEach(entry => {
          const date = format(entry.timestamp.toDate(), 'yyyy-MM-dd')
          const day = format(entry.timestamp.toDate(), 'EEE')
          
          // Aggregate mood data by date
          const dateData = moodByDate.get(date) || { total: 0, count: 0 }
          dateData.total += entry.moodLevel
          dateData.count += 1
          moodByDate.set(date, dateData)

          // Aggregate weekly stats
          const dayData = dayStats.get(day) || { total: 0, count: 0 }
          dayData.total += entry.moodLevel
          dayData.count += 1
          dayStats.set(day, dayData)

          // Track last entry
          if (!lastEntryDate || entry.timestamp.toDate() > lastEntryDate) {
            lastEntryDate = entry.timestamp.toDate()
          }
        })

        // Calculate streaks
        const dates = Array.from(moodByDate.keys()).sort()
        let streak = 0
        for (let i = 0; i < dates.length; i++) {
          const curr = new Date(dates[i])
          const prev = i > 0 ? new Date(dates[i - 1]) : null
          
          if (prev && (curr.getTime() - prev.getTime()) === 86400000) {
            streak++
            currentStreak = Math.max(currentStreak, streak)
          } else {
            streak = 1
          }
          longestStreak = Math.max(longestStreak, streak)
        }

        // Format data for charts
        const moodData: MoodData[] = Array.from(moodByDate.entries()).map(([date, data]) => ({
          date,
          avgMood: data.total / data.count,
          entries: data.count
        }))

        const weeklyStats: WeeklyStats[] = Array.from(dayStats.entries()).map(([day, data]) => ({
          day,
          avgMood: data.total / data.count,
          count: data.count
        }))

        setDashboardData({
          moodData: moodData.sort((a, b) => a.date.localeCompare(b.date)),
          weeklyStats: weeklyStats.sort((a, b) => {
            const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            return days.indexOf(a.day) - days.indexOf(b.day)
          }),
          streakData: {
            currentStreak,
            longestStreak,
            totalEntries: entries.length,
            lastEntry: lastEntryDate
          }
        })
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError('Failed to load dashboard data. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [user])

  if (error) {
    return (
      <ProtectedRoute>
        <div className="container py-8">
          <div className="rounded-lg border bg-destructive/10 p-4 text-destructive">
            {error}
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="container py-8">
        <UserDashboard {...dashboardData} isLoading={isLoading} />
      </div>
    </ProtectedRoute>
  )
} 