"use client"

import React from 'react'
import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, BarChart2, TrendingUp, ArrowUp, Activity } from 'lucide-react'
import { Area, AreaChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"
import { format, subYears } from "date-fns"
import { getWeekRange, getMonthRange, formatDate } from "../utils/date"
import { MoodData, MoodEntry, MoodLevel, moodDescriptions, timeOfDayOptions } from "../types/mood"
import { moodColors } from "../utils/theme"
import { motion } from "framer-motion"
import { MoodAnalytics } from "./mood-analytics"
import { MoodPatterns } from "./mood-patterns"
import { MoodTimeline } from "./mood-timeline"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useTheme } from 'next-themes'
import { LineChart, Line } from "recharts"

interface MoodStatsProps {
  moodData: Record<string, Record<string, MoodEntry>>
}

interface DetailedMoodEntry extends Omit<MoodEntry, 'note'> {
  note?: string;
  timestamp: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  moodColors: typeof moodColors;
  moodDescriptions: typeof moodDescriptions;
}

const CustomTooltip = ({ 
  active, 
  payload, 
  label,
  moodColors,
  moodDescriptions 
}: CustomTooltipProps) => {
  if (active && payload?.[0]) {
    const data = payload[0].payload;
    const moodLevel = data.mood as MoodLevel;
    
    return (
      <div className="bg-card dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-border dark:border-gray-700">
        <p className="font-medium text-foreground dark:text-gray-100">{label}</p>
        <div className="mt-2 flex items-center gap-2">
          <span 
            className="w-3 h-3 rounded-full"
            style={{ 
              backgroundColor: `hsl(var(--primary))`,
              opacity: moodLevel / 5
            }}
          />
          <span className="text-sm text-muted-foreground dark:text-gray-400">
            {moodDescriptions[moodLevel]}
          </span>
        </div>
        {data.entries?.length > 0 && (
          <div className="mt-3 space-y-1.5 border-t border-border dark:border-gray-700 pt-2">
            {data.entries.map((entry: any, i: number) => (
              <div key={i} className="text-sm flex items-center gap-2">
                <span className="text-muted-foreground dark:text-gray-500">{entry.timeOfDay}:</span>
                <span className="text-foreground dark:text-gray-300">
                  {moodDescriptions[entry.level as MoodLevel]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
  return null;
};

export function MoodStats({ moodData }: MoodStatsProps) {
  const [activeTab, setActiveTab] = useState("weekly")
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const { theme } = useTheme()
  
  const processDataForTimeRange = useMemo(() => (start: Date, end: Date) => {
    const data: any[] = []
    let currentDate = new Date(start)

    while (currentDate <= end) {
      const dateStr = formatDate(currentDate)
      const dailyEntries = moodData[dateStr]
      
      data.push({
        date: format(currentDate, 'MMM d'),
        originalDate: dateStr,
        mood: dailyEntries 
          ? Number((Object.values(dailyEntries).reduce((sum, entry) => sum + entry.level, 0) / 
              Object.values(dailyEntries).length).toFixed(1))
          : null
      })
      
      currentDate.setDate(currentDate.getDate() + 1)
    }
    return data
  }, [moodData])

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate)
    if (activeTab === 'weekly') {
      direction === 'prev' ? newDate.setDate(newDate.getDate() - 7) : newDate.setDate(newDate.getDate() + 7)
    } else if (activeTab === 'monthly') {
      direction === 'prev' ? newDate.setMonth(newDate.getMonth() - 1) : newDate.setMonth(newDate.getMonth() + 1)
    } else {
      direction === 'prev' ? newDate.setFullYear(newDate.getFullYear() - 1) : newDate.setFullYear(newDate.getFullYear() + 1)
    }
    setSelectedDate(newDate)
  }

  const currentData = useMemo(() => {
    let start: Date, end: Date
    
    if (activeTab === 'weekly') {
      const range = getWeekRange(selectedDate)
      start = range.start
      end = range.end
    } else if (activeTab === 'monthly') {
      const range = getMonthRange(selectedDate)
      start = range.start
      end = range.end
    } else {
      start = subYears(selectedDate, 1)
      end = selectedDate
    }
    
    return processDataForTimeRange(start, end)
  }, [activeTab, selectedDate, processDataForTimeRange])

  const renderAreaChart = (data: any[]) => (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`moodGradient-${activeTab}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            opacity={0.1} 
            stroke="hsl(var(--border))" 
            vertical={false}
            className="dark:opacity-20"
          />
          <XAxis 
            dataKey="date" 
            stroke="hsl(var(--foreground))"
            tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
            tickLine={{ stroke: 'hsl(var(--foreground))' }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
            label={{ 
              value: 'Date',
              position: 'bottom',
              style: { fill: 'hsl(var(--foreground))' }
            }}
          />
          <YAxis 
            domain={[1, 5]}
            stroke="hsl(var(--foreground))"
            tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
            ticks={[1, 2, 3, 4, 5]}
            tickLine={{ stroke: 'hsl(var(--foreground))' }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
            tickFormatter={(value) => moodDescriptions[value as MoodLevel]}
            label={{ 
              value: 'Mood Level',
              angle: -90,
              position: 'insideLeft',
              style: { fill: 'hsl(var(--foreground))' }
            }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="rounded-lg border bg-card p-3 shadow-md dark:bg-gray-800 dark:border-gray-700">
                    <p className="text-sm font-medium text-foreground dark:text-gray-100">{data.date}</p>
                    <p className="text-sm text-muted-foreground dark:text-gray-400">
                      {data.mood ? moodDescriptions[data.mood as MoodLevel] : 'No mood recorded'}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="mood"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            fill={`url(#moodGradient-${activeTab})`}
            isAnimationActive={true}
            dot={{ 
              strokeWidth: 2, 
              r: 4, 
              fill: "hsl(var(--background))",
              stroke: "hsl(var(--primary))"
            }}
            activeDot={{
              r: 6,
              stroke: "hsl(var(--primary))",
              fill: "hsl(var(--background))",
              strokeWidth: 2
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 bg-card rounded-lg border shadow-sm dark:shadow-md dark:bg-gray-800/90 dark:border-gray-700">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[300px]">
          <TabsList className="grid w-full grid-cols-3 h-11 bg-background dark:bg-gray-900">
            <TabsTrigger 
              value="weekly" 
              className="text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:text-gray-100 dark:data-[state=active]:text-white dark:hover:text-white"
              aria-label="Show weekly stats"
            >
              Weekly
            </TabsTrigger>
            <TabsTrigger 
              value="monthly" 
              className="text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:text-gray-100 dark:data-[state=active]:text-white dark:hover:text-white"
              aria-label="Show monthly stats"
            >
              Monthly
            </TabsTrigger>
            <TabsTrigger 
              value="yearly" 
              className="text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:text-gray-100 dark:data-[state=active]:text-white dark:hover:text-white"
              aria-label="Show yearly stats"
            >
              Yearly
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="default" 
            onClick={() => navigateDate('prev')}
            className="h-11 px-4 hover:bg-muted dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-700 dark:text-gray-100 dark:hover:text-white"
            aria-label="Previous period"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button 
            variant="outline" 
            size="default" 
            onClick={() => navigateDate('next')}
            className="h-11 px-4 hover:bg-muted dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-700 dark:text-gray-100 dark:hover:text-white"
            aria-label="Next period"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-card border shadow-sm dark:shadow-md dark:bg-gray-800/90 dark:border-gray-700">
          <CardHeader className="space-y-1">
            <CardTitle className="text-foreground dark:text-gray-100">Mood Trends</CardTitle>
            <CardDescription className="text-sm text-muted-foreground dark:text-gray-400">
              Your mood patterns over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderAreaChart(currentData)}
          </CardContent>
        </Card>

        <Card className="bg-card border shadow-sm dark:shadow-md dark:bg-gray-800/90 dark:border-gray-700">
          <CardHeader className="space-y-1">
            <CardTitle className="text-foreground dark:text-gray-100">Mood Statistics</CardTitle>
            <CardDescription className="text-sm text-muted-foreground dark:text-gray-400">
              Key metrics for the selected period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-card border shadow-sm dark:shadow-md dark:bg-gray-800 dark:border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
                        <TrendingUp className="h-5 w-5 text-primary dark:text-primary-foreground" aria-hidden="true" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground dark:text-gray-100">Weekly Average</h3>
                        <div className="text-2xl font-bold text-foreground dark:text-white" role="status">
                          {calculateWeeklyAverage(currentData)}
                        </div>
                        <p className="text-sm text-muted-foreground dark:text-gray-400">Average mood level</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border shadow-sm dark:shadow-md dark:bg-gray-800 dark:border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
                        <ArrowUp className="h-5 w-5 text-primary dark:text-primary-foreground" aria-hidden="true" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground dark:text-gray-100">Highest Mood</h3>
                        <div className="text-2xl font-bold text-foreground dark:text-white" role="status">
                          {calculateHighestMood(currentData)}
                        </div>
                        <p className="text-sm text-muted-foreground dark:text-gray-400">Peak mood this week</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border shadow-sm dark:shadow-md dark:bg-gray-800 dark:border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
                        <Activity className="h-5 w-5 text-primary dark:text-primary-foreground" aria-hidden="true" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground dark:text-gray-100">Mood Variance</h3>
                        <div className="text-2xl font-bold text-foreground dark:text-white" role="status">
                          {calculateMoodVariance(currentData)}
                        </div>
                        <p className="text-sm text-muted-foreground dark:text-gray-400">Weekly fluctuation</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function calculateWeeklyAverage(data: any[]): string {
  const validMoods = data.filter(d => d.mood !== null).map(d => d.mood)
  if (validMoods.length === 0) return '0'
  const average = validMoods.reduce((a, b) => a + b, 0) / validMoods.length
  return average.toFixed(1)
}

function calculateHighestMood(data: any[]): string {
  const validMoods = data.filter(d => d.mood !== null).map(d => d.mood)
  if (validMoods.length === 0) return '0'
  return Math.max(...validMoods).toFixed(1)
}

function calculateMoodVariance(data: any[]): string {
  const validMoods = data.filter(d => d.mood !== null).map(d => d.mood)
  if (validMoods.length === 0) return '0'
  const mean = validMoods.reduce((a, b) => a + b, 0) / validMoods.length
  const variance = validMoods.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / validMoods.length
  return variance.toFixed(2)
}

