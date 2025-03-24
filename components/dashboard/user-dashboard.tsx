"use client"

import { useAuth } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format, subDays, isWithinInterval, eachDayOfInterval, startOfMonth, endOfMonth } from "date-fns"
import { DateRange } from "react-day-picker"
import { 
  LineChart, Line, BarChart, Bar, PieChart as RechartsChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, Tooltip, TooltipProps 
} from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { 
  Calendar,
  Clock,
  Settings,
  User,
  BarChart2,
  PieChart,
  TrendingUp,
  Activity,
  Heart,
  Award,
  Loader2,
  Share2,
  Download
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"

interface DashboardProps {
  moodData: {
    date: string
    avgMood: number
    entries: number
  }[]
  weeklyStats: {
    day: string
    avgMood: number
    count: number
  }[]
  streakData: {
    currentStreak: number
    longestStreak: number
    totalEntries: number
    lastEntry: Date | null
  }
  isLoading: boolean
}

// Add type for tooltip payloads
type MoodTooltipPayload = {
  value: number
  payload: {
    avgMood: number
    date: string
  }
}

type WeeklyTooltipPayload = {
  value: number
  payload: {
    day: string
    avgMood: number
    count: number
  }
}

interface MoodDistribution {
  name: string
  value: number
  color: string
}

const MOOD_COLORS = {
  1: "#ef4444", // red
  2: "#f97316", // orange
  3: "#facc15", // yellow
  4: "#84cc16", // green
  5: "#22c55e"  // emerald
} as const

const MOOD_LABELS = {
  1: "Very Bad",
  2: "Bad",
  3: "Okay",
  4: "Good",
  5: "Very Good"
} as const

type MoodLevel = keyof typeof MOOD_COLORS

export function UserDashboard({ moodData, weeklyStats, streakData, isLoading }: DashboardProps) {
  const { profile } = useAuth()
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date()
  })
  const [timeframe, setTimeframe] = useState<"7d" | "30d" | "90d" | "all">("30d")
  const [weeklyFilter, setWeeklyFilter] = useState<"all" | "weekday" | "weekend">("all")

  // Filter mood data based on date range
  const filteredMoodData = moodData.filter(entry => {
    const entryDate = new Date(entry.date)
    return dateRange.from && dateRange.to
      ? isWithinInterval(entryDate, { start: dateRange.from, end: dateRange.to })
      : true
  })

  // Filter weekly stats based on selection
  const filteredWeeklyStats = weeklyStats.filter(stat => {
    if (weeklyFilter === "all") return true
    const isWeekend = stat.day === "Sat" || stat.day === "Sun"
    return weeklyFilter === "weekend" ? isWeekend : !isWeekend
  })

  // Calculate mood distribution
  const moodDistribution = Object.entries(
    filteredMoodData.reduce((acc, entry) => {
      const moodLevel = Math.round(entry.avgMood) as MoodLevel
      acc[moodLevel] = (acc[moodLevel] || 0) + entry.entries
      return acc
    }, {} as Record<MoodLevel, number>)
  ).map(([level, count]) => ({
    name: MOOD_LABELS[Number(level) as MoodLevel],
    value: count,
    color: MOOD_COLORS[Number(level) as MoodLevel]
  }))

  // Calculate heatmap data
  const currentMonth = new Date()
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  })

  const heatmapData = daysInMonth.map(day => {
    const dayStr = format(day, 'yyyy-MM-dd')
    const entry = moodData.find(d => d.date === dayStr)
    return {
      date: day,
      value: entry?.avgMood || 0,
      entries: entry?.entries || 0
    }
  })

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range || { from: subDays(new Date(), 30), to: new Date() })
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile?.photoURL || undefined} />
              <AvatarFallback>{profile?.displayName?.[0] || profile?.email?.[0] || "?"}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">Welcome back, {profile?.displayName || "User"}!</CardTitle>
              <CardDescription>
                {streakData.lastEntry 
                  ? `Last entry: ${format(streakData.lastEntry, "EEEE, MMMM d")}`
                  : "No entries yet"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Current Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{streakData.currentStreak} days</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Longest Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{streakData.longestStreak} days</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Total Entries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{streakData.totalEntries}</div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link href="/mood/new" passHref>
          <Button className="w-full h-auto py-4 flex flex-col items-center gap-2" variant="outline">
            <Calendar className="h-5 w-5" />
            <span>New Entry</span>
          </Button>
        </Link>
        
        <Link href="/mood/history" passHref>
          <Button className="w-full h-auto py-4 flex flex-col items-center gap-2" variant="outline">
            <Clock className="h-5 w-5" />
            <span>View History</span>
          </Button>
        </Link>
        
        <Link href="/profile" passHref>
          <Button className="w-full h-auto py-4 flex flex-col items-center gap-2" variant="outline">
            <User className="h-5 w-5" />
            <span>Profile</span>
          </Button>
        </Link>
        
        <Link href="/settings" passHref>
          <Button className="w-full h-auto py-4 flex flex-col items-center gap-2" variant="outline">
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </Button>
        </Link>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col space-y-4">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Mood Trend
              </CardTitle>
              <CardDescription>Your mood pattern over time</CardDescription>
              <div className="flex flex-col sm:flex-row gap-4">
                <Select
                  value={timeframe}
                  onValueChange={(value: "7d" | "30d" | "90d" | "all") => {
                    setTimeframe(value)
                    const to = new Date()
                    const from = value === "all" 
                      ? subDays(to, 365)
                      : subDays(to, parseInt(value))
                    setDateRange({ from, to })
                  }}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Select timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">7 days</SelectItem>
                    <SelectItem value="30d">30 days</SelectItem>
                    <SelectItem value="90d">90 days</SelectItem>
                    <SelectItem value="all">All time</SelectItem>
                  </SelectContent>
                </Select>
                <DateRangePicker
                  value={dateRange}
                  onChange={handleDateRangeChange}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] relative">
              {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={filteredMoodData}>
                    <XAxis 
                      dataKey="date" 
                      stroke="#888888"
                      fontSize={12}
                      tickFormatter={(value) => format(new Date(value), 'MMM d')}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      domain={[1, 5]}
                      ticks={[1, 2, 3, 4, 5]}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0] as MoodTooltipPayload
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                              <div className="grid grid-cols-2 gap-2">
                                <div className="flex flex-col">
                                  <span className="text-[0.70rem] uppercase text-muted-foreground">
                                    Date
                                  </span>
                                  <span className="font-bold">
                                    {format(new Date(label), 'MMM d, yyyy')}
                                  </span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[0.70rem] uppercase text-muted-foreground">
                                    Average Mood
                                  </span>
                                  <span className="font-bold">
                                    {data.value.toFixed(1)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="avgMood"
                      strokeWidth={2}
                      activeDot={{
                        r: 6,
                        style: { fill: "var(--primary)", opacity: 0.8 }
                      }}
                      style={{
                        stroke: "var(--primary)",
                        opacity: 0.8
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-col space-y-4">
              <CardTitle className="flex items-center gap-2">
                <BarChart2 className="h-5 w-5" />
                Weekly Overview
              </CardTitle>
              <CardDescription>Mood entries by day of week</CardDescription>
              <Select
                value={weeklyFilter}
                onValueChange={(value: "all" | "weekday" | "weekend") => setWeeklyFilter(value)}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Filter days" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All days</SelectItem>
                  <SelectItem value="weekday">Weekdays</SelectItem>
                  <SelectItem value="weekend">Weekends</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] relative">
              {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={filteredWeeklyStats}>
                    <XAxis dataKey="day" />
                    <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0] as WeeklyTooltipPayload
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                              <div className="grid gap-2">
                                <div className="flex flex-col">
                                  <span className="text-[0.70rem] uppercase text-muted-foreground">
                                    {data.payload.day}
                                  </span>
                                  <span className="font-bold">
                                    Average Mood: {data.value.toFixed(1)}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {data.payload.count} entries
                                  </span>
                                </div>
                              </div>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Bar
                      dataKey="avgMood"
                      fill="var(--primary)"
                      opacity={0.8}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Mood Distribution */}
        <Card>
          <CardHeader>
            <div className="flex flex-col space-y-4">
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Mood Distribution
              </CardTitle>
              <CardDescription>Breakdown of your mood levels</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] relative">
              {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsChart>
                    <Pie
                      data={moodDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {moodDistribution.map((entry, index) => (
                        <Cell 
                          key={`cell-${entry.name}-${index}`} 
                          fill={entry.color} 
                          strokeWidth={1}
                          stroke="hsl(var(--background))"
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                              <div className="grid gap-2">
                                <div className="flex flex-col">
                                  <span className="text-[0.70rem] uppercase text-muted-foreground">
                                    {data.name}
                                  </span>
                                  <span className="font-bold">
                                    {data.value} entries
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {((data.value / filteredMoodData.reduce((acc, curr) => acc + curr.entries, 0)) * 100).toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                  </RechartsChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="mt-4 grid grid-cols-5 gap-2">
              {Object.entries(MOOD_LABELS).map(([level, label]) => (
                <div key={level} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: MOOD_COLORS[Number(level) as MoodLevel] }}
                  />
                  <span className="text-xs">{label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Heatmap */}
        <Card>
          <CardHeader>
            <div className="flex flex-col space-y-4">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Monthly Overview
              </CardTitle>
              <CardDescription>Calendar view of your mood entries</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs text-muted-foreground">
                  {day}
                </div>
              ))}
              {Array.from({ length: startOfMonth(currentMonth).getDay() }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              {heatmapData.map((day, i) => {
                const moodLevel = day.value ? Math.round(day.value) as MoodLevel : null
                return (
                  <div
                    key={i}
                    className="aspect-square rounded-sm relative group"
                    style={{
                      backgroundColor: moodLevel ? MOOD_COLORS[moodLevel] : 'var(--muted)',
                      opacity: day.value ? (0.3 + (day.value / 5) * 0.7) : 0.1
                    }}
                  >
                    {day.value > 0 && (
                      <div className="absolute hidden group-hover:block bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 rounded-lg border bg-background shadow-sm whitespace-nowrap">
                        <div className="text-xs">
                          <div>{format(day.date, 'MMM d, yyyy')}</div>
                          <div>Avg Mood: {day.value.toFixed(1)}</div>
                          <div>{day.entries} entries</div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export/Share Buttons */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => window.print()}>
          <Download className="mr-2 h-4 w-4" />
          Export Data
        </Button>
        <Button variant="outline" onClick={() => navigator.share?.({
          title: 'My Mood Dashboard',
          text: 'Check out my mood tracking stats!',
          url: window.location.href
        }).catch(() => {})}>
          <Share2 className="mr-2 h-4 w-4" />
          Share Dashboard
        </Button>
      </div>
    </div>
  )
} 