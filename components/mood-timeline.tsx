"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { format, isValid, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, getDay, getHours, subDays } from "date-fns"
import { motion } from "framer-motion"
import { MoodEntry, MoodLevel, moodDescriptions, MoodData } from "../types/mood"
import { moodColors } from "../utils/theme"
import { ChevronRight, X, Clock, Sparkles, Filter, Search, SortDesc, SortAsc, Calendar } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useTheme } from "next-themes"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, RadialBarChart, RadialBar, Legend } from 'recharts'

interface MoodTimelineProps {
  moodData: MoodData
  onSelectEntry: (date: string, entry: MoodEntry) => void
  isOpen: boolean
  onClose: () => void
}

export function MoodTimeline({ moodData, onSelectEntry, isOpen, onClose }: MoodTimelineProps) {
  const { theme } = useTheme()
  const [searchQuery, setSearchQuery] = useState("")
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc")
  const [filterLevel, setFilterLevel] = useState<string>("all")
  const [activeTab, setActiveTab] = useState<"entries" | "insights">("entries")
  
  const sortedEntries = useMemo(() => {
    let entries = Object.entries(moodData)
      .flatMap(([dateStr, dailyEntries]) => {
        // Parse the date string in yyyy-MM-dd format
        const [year, month, day] = dateStr.split('-').map(Number)
        const date = new Date(year, month - 1, day) // month is 0-indexed in JS Date
        
        if (isNaN(date.getTime())) {
          console.error(`Invalid date string: ${dateStr}`)
          return []
        }
        
        return Object.entries(dailyEntries).map(([timeOfDay, entry]) => ({
          date,
          timeOfDay,
          entry,
          dateStr
        }))
      })
      
    // Apply search filter
    if (searchQuery) {
      entries = entries.filter(({ entry, dateStr, timeOfDay }) => {
        const searchStr = `${dateStr} ${timeOfDay} ${entry.note || ''} ${moodDescriptions[entry.level as MoodLevel]}`.toLowerCase()
        return searchStr.includes(searchQuery.toLowerCase())
      })
    }
    
    // Apply mood level filter
    if (filterLevel !== "all") {
      entries = entries.filter(({ entry }) => entry.level === Number(filterLevel))
    }
    
    // Apply sort
    return entries.sort((a, b) => {
      const diff = b.date.getTime() - a.date.getTime()
      return sortOrder === "desc" ? diff : -diff
    })
  }, [moodData, searchQuery, filterLevel, sortOrder])

  const moodStats = useMemo(() => {
    const entries = Object.entries(moodData).flatMap(([date, dailyEntries]) =>
      Object.entries(dailyEntries).map(([time, entry]) => ({
        date,
        time,
        level: entry.level,
        note: entry.note,
        hour: getHours(new Date(`${date}T${time}`)),
        weekday: getDay(new Date(date))
      }))
    )

    const totalEntries = entries.length
    if (totalEntries === 0) return {
      totalEntries: 0,
      averageMood: 0,
      moodDistribution: {},
      moodTrend: [],
      mostFrequentMood: 0,
      weekdayStats: [],
      hourlyStats: [],
      weeklyComparison: []
    }

    const averageMood = entries.reduce((sum, entry) => sum + entry.level, 0) / totalEntries
    
    const moodDistribution = entries.reduce((acc, entry) => {
      acc[entry.level] = (acc[entry.level] || 0) + 1
      return acc
    }, {} as Record<number, number>)
    
    // Weekly patterns
    const weekdayStats = Array.from({ length: 7 }, (_, i) => {
      const dayEntries = entries.filter(entry => entry.weekday === i)
      return {
        day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i],
        avgMood: dayEntries.length > 0
          ? dayEntries.reduce((sum, entry) => sum + entry.level, 0) / dayEntries.length
          : 0,
        count: dayEntries.length
      }
    })

    // Hourly patterns
    const hourlyStats = Array.from({ length: 24 }, (_, i) => {
      const hourEntries = entries.filter(entry => entry.hour === i)
      return {
        hour: i,
        avgMood: hourEntries.length > 0
          ? hourEntries.reduce((sum, entry) => sum + entry.level, 0) / hourEntries.length
          : 0,
        count: hourEntries.length
      }
    })

    // Weekly comparison
    const now = new Date()
    const currentWeekStart = startOfWeek(now)
    const currentWeekEnd = endOfWeek(now)
    const lastWeekStart = startOfWeek(subDays(now, 7))
    const lastWeekEnd = endOfWeek(subDays(now, 7))

    const weeklyComparison = [
      {
        name: 'Last Week',
        data: eachDayOfInterval({ start: lastWeekStart, end: lastWeekEnd }).map(date => {
          const dateStr = format(date, 'yyyy-MM-dd')
          const dayEntries = Object.values(moodData[dateStr] || {})
          return {
            date: dateStr,
            avgMood: dayEntries.length > 0
              ? dayEntries.reduce((sum, entry) => sum + entry.level, 0) / dayEntries.length
              : 0
          }
        })
      },
      {
        name: 'This Week',
        data: eachDayOfInterval({ start: currentWeekStart, end: currentWeekEnd }).map(date => {
          const dateStr = format(date, 'yyyy-MM-dd')
          const dayEntries = Object.values(moodData[dateStr] || {})
          return {
            date: dateStr,
            avgMood: dayEntries.length > 0
              ? dayEntries.reduce((sum, entry) => sum + entry.level, 0) / dayEntries.length
              : 0
          }
        })
      }
    ]

    return {
      totalEntries,
      averageMood,
      moodDistribution,
      moodTrend: Object.entries(moodData)
        .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
        .map(([date, dailyEntries]) => ({
          date,
          avgMood: Object.values(dailyEntries)
            .reduce((sum, entry) => sum + entry.level, 0) / Object.values(dailyEntries).length
        })),
      mostFrequentMood: Object.entries(moodDistribution)
        .sort(([, a], [, b]) => b - a)[0][0],
      weekdayStats,
      hourlyStats,
      weeklyComparison
    }
  }, [moodData])

  const getMoodColor = (level: number): string => {
    const colors = {
      light: {
        1: 'bg-red-400 hover:bg-red-500',
        2: 'bg-orange-400 hover:bg-orange-500',
        3: 'bg-yellow-400 hover:bg-yellow-500',
        4: 'bg-green-400 hover:bg-green-500',
        5: 'bg-emerald-500 hover:bg-emerald-600'
      },
      dark: {
        1: 'bg-red-500 hover:bg-red-600',
        2: 'bg-orange-500 hover:bg-orange-600',
        3: 'bg-yellow-500 hover:bg-yellow-600',
        4: 'bg-green-500 hover:bg-green-600',
        5: 'bg-emerald-600 hover:bg-emerald-700'
      }
    }
    
    if (level >= 1 && level <= 5) {
      return theme === 'dark' ? colors.dark[level as keyof typeof colors.dark] : colors.light[level as keyof typeof colors.light]
    }
    return theme === 'dark' ? "bg-gray-800" : "bg-gray-200"
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] md:max-w-4xl max-h-[90vh] md:max-h-[85vh] flex flex-col p-3 sm:p-4 md:p-6 gap-4">
        <DialogHeader className="sticky top-0 z-50 bg-background pb-3 sm:pb-4 border-b border-border">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                Mood History
              </DialogTitle>
              <Badge variant="secondary" className="text-xs w-fit">
                <Sparkles className="h-3 w-3 mr-1" />
                {sortedEntries.length} Entries
              </Badge>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="hover:bg-gray-100 dark:hover:bg-gray-800 absolute right-2 top-2 sm:relative sm:right-0 sm:top-0"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex flex-col gap-3 sm:gap-4 mt-3 sm:mt-4">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search entries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-9 sm:h-10"
                />
              </div>
              
              <Select value={filterLevel} onValueChange={setFilterLevel}>
                <SelectTrigger className="w-full sm:w-[180px] h-9 sm:h-10">
                  <SelectValue placeholder="Filter by mood" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Moods</SelectItem>
                  {[1, 2, 3, 4, 5].map((level) => (
                    <SelectItem key={level} value={level.toString()}>
                      {moodDescriptions[level as MoodLevel]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSortOrder(prev => prev === "desc" ? "asc" : "desc")}
                className="w-full sm:w-10 h-9 sm:h-10 flex items-center justify-center"
              >
                {sortOrder === "desc" ? (
                  <SortDesc className="h-4 w-4" />
                ) : (
                  <SortAsc className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {searchQuery && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="secondary">
                  {sortedEntries.length} results
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="h-7 py-1 px-2 text-xs"
                >
                  Clear search
                </Button>
              </div>
            )}
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto -mx-3 sm:-mx-4 md:-mx-6 px-3 sm:px-4 md:px-6">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "entries" | "insights")}>
            <TabsList className="grid w-full grid-cols-2 sticky top-0 z-10 bg-background h-9 sm:h-10">
              <TabsTrigger value="entries">Entries</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>
            
            <TabsContent value="entries" className="mt-4 focus-visible:outline-none">
              <div className="border border-black/10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-lg">
                <div className="relative p-2 sm:p-4">
                  <div 
                    className="absolute top-0 bottom-0 left-2 sm:left-4 w-0.5 bg-gray-200 dark:bg-gray-800" 
                    aria-hidden="true" 
                  />
                  
                  <div className="space-y-2 sm:space-y-4" role="list" aria-label="Mood history entries">
                    {sortedEntries.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-center">
                        <Calendar className="h-10 w-10 sm:h-12 sm:w-12 mb-3 sm:mb-4 opacity-50" />
                        <p className="text-base sm:text-lg font-medium text-gray-900 mb-2">No entries found</p>
                        <p className="text-sm text-gray-600">
                          {searchQuery || filterLevel !== "all" 
                            ? "Try adjusting your filters"
                            : "Start tracking your moods to see them here"}
                        </p>
                      </div>
                    ) : (
                      sortedEntries.map(({ date, timeOfDay, entry, dateStr }, index) => (
                        <motion.div
                          key={`${dateStr}-${timeOfDay}-${index}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="relative pl-6 sm:pl-8 group"
                          role="listitem"
                        >
                          <div 
                            className="absolute left-1 sm:left-2.5 top-4 -translate-y-1/2 transition-transform duration-300 group-hover:scale-125"
                            aria-hidden="true"
                          >
                            <div
                              className={cn(
                                "w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 border-white dark:border-gray-900 transition-colors duration-300",
                                getMoodColor(entry.level)
                              )}
                            />
                          </div>
                          
                          <Button
                            variant="outline"
                            className="w-full justify-between hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-300 h-auto py-2 px-3 sm:px-4"
                            onClick={() => onSelectEntry(dateStr, entry)}
                            aria-label={`View mood entry for ${format(date, "EEEE, MMMM d")} - ${timeOfDay}`}
                          >
                            <div className="flex flex-col items-start min-w-0">
                              <span className="font-medium text-gray-900 text-sm sm:text-base">
                                {format(date, "EEEE, MMMM d")}
                              </span>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs sm:text-sm text-gray-600">
                                  {timeOfDay}
                                </span>
                                <Badge variant="secondary" className="text-xs text-gray-900">
                                  {moodDescriptions[entry.level as MoodLevel]}
                                </Badge>
                                {entry.note && (
                                  <span className="text-xs text-gray-600 truncate max-w-[150px] sm:max-w-[200px]">
                                    {entry.note}
                                  </span>
                                )}
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-600 transition-transform duration-300 group-hover:translate-x-1 flex-shrink-0" />
                          </Button>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="insights" className="mt-4 space-y-4 focus-visible:outline-none">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <Card className="bg-white">
                  <CardHeader className="pb-2 space-y-1.5">
                    <CardTitle className="text-sm font-medium text-gray-900">Total Entries</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl sm:text-2xl font-bold text-gray-900">{moodStats.totalEntries}</div>
                    <p className="text-xs text-gray-600">Tracked moods</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-white">
                  <CardHeader className="pb-2 space-y-1.5">
                    <CardTitle className="text-sm font-medium text-gray-900">Average Mood</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl sm:text-2xl font-bold text-gray-900">{moodStats.averageMood.toFixed(1)}</div>
                    <p className="text-xs text-gray-600">Out of 5</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-white">
                  <CardHeader className="pb-2 space-y-1.5">
                    <CardTitle className="text-sm font-medium text-gray-900">Most Frequent</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl sm:text-2xl font-bold text-gray-900">
                      {moodDescriptions[Number(moodStats.mostFrequentMood) as MoodLevel]}
                    </div>
                    <p className="text-xs text-gray-600">Common mood</p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                <Card className="w-full bg-white">
                  <CardHeader className="space-y-1.5">
                    <CardTitle className="text-base sm:text-lg text-gray-900">Mood Trend</CardTitle>
                    <CardDescription className="text-sm text-gray-600">Your mood pattern over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px] xs:h-[250px] sm:h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={moodStats.moodTrend}>
                          <XAxis 
                            dataKey="date" 
                            stroke="#888888"
                            fontSize={12}
                            tickFormatter={(value) => format(parseISO(value), 'MMM d')}
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
                                return (
                                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                                    <div className="grid grid-cols-2 gap-2">
                                      <div className="flex flex-col">
                                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                                          Date
                                        </span>
                                        <span className="font-bold">
                                          {format(parseISO(label), 'MMM d, yyyy')}
                                        </span>
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                                          Average Mood
                                        </span>
                                        <span className="font-bold">
                                          {typeof payload[0].value === 'number' ? payload[0].value.toFixed(1) : payload[0].value}
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
                    </div>
                  </CardContent>
                </Card>

                <Card className="w-full bg-white">
                  <CardHeader className="space-y-1.5">
                    <CardTitle className="text-base sm:text-lg text-gray-900">Weekly Patterns</CardTitle>
                    <CardDescription className="text-sm text-gray-600">Your mood variations throughout the week</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px] xs:h-[250px] sm:h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={moodStats.weekdayStats}>
                          <XAxis dataKey="day" />
                          <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} />
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload
                                return (
                                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                                    <div className="grid gap-2">
                                      <div className="flex flex-col">
                                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                                          {data.day}
                                        </span>
                                        <span className="font-bold">
                                          Average Mood: {typeof data.avgMood === 'number' ? data.avgMood.toFixed(1) : data.avgMood}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                          {data.count} entries
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
                    </div>
                  </CardContent>
                </Card>

                <Card className="w-full bg-white">
                  <CardHeader className="space-y-1.5">
                    <CardTitle className="text-base sm:text-lg text-gray-900">Time of Day Analysis</CardTitle>
                    <CardDescription className="text-sm text-gray-600">When you experience different moods</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px] xs:h-[250px] sm:h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={moodStats.hourlyStats}>
                          <XAxis
                            dataKey="hour"
                            tickFormatter={(hour) => `${hour}:00`}
                          />
                          <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} />
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload
                                return (
                                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                                    <div className="grid gap-2">
                                      <div className="flex flex-col">
                                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                                          {data.hour}:00
                                        </span>
                                        <span className="font-bold">
                                          Average Mood: {typeof data.avgMood === 'number' ? data.avgMood.toFixed(1) : data.avgMood}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                          {data.count} entries
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
                            dot={{ r: 4 }}
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
                    </div>
                  </CardContent>
                </Card>

                <Card className="w-full bg-white">
                  <CardHeader className="space-y-1.5">
                    <CardTitle className="text-base sm:text-lg text-gray-900">Weekly Comparison</CardTitle>
                    <CardDescription className="text-sm text-gray-600">Compare your moods with last week</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px] xs:h-[250px] sm:h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart>
                          {moodStats.weeklyComparison.map((week, index) => (
                            <Line
                              key={week.name}
                              data={week.data}
                              type="monotone"
                              dataKey="avgMood"
                              name={week.name}
                              strokeWidth={2}
                              stroke={index === 0 ? "var(--muted-foreground)" : "var(--primary)"}
                              strokeDasharray={index === 0 ? "5 5" : "0"}
                              dot={{ r: 4 }}
                              activeDot={{
                                r: 6,
                                style: { fill: index === 0 ? "var(--muted-foreground)" : "var(--primary)", opacity: 0.8 }
                              }}
                            />
                          ))}
                          <XAxis
                            dataKey="date"
                            tickFormatter={(value) => format(parseISO(value), 'EEE')}
                          />
                          <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} />
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                                    <div className="grid gap-2">
                                      {payload.map((entry) => (
                                        <div key={entry.name} className="flex flex-col">
                                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                                            {entry.name}
                                          </span>
                                          <span className="font-bold">
                                            Average Mood: {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )
                              }
                              return null
                            }}
                          />
                          <Legend />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}

