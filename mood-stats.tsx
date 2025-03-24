"use client"

import { Area, AreaChart, Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { MoodLevel } from "./types/mood"
import { moodDescriptions } from "./types/mood"

const weeklyData = [
  { date: "05/01", mood: 3 },
  { date: "06/01", mood: 3 },
  { date: "07/01", mood: 4 },
  { date: "08/01", mood: 5 },
  { date: "09/01", mood: 4 },
  { date: "10/01", mood: 3 },
  { date: "11/01", mood: 3 },
]

const monthlyData = [
  { month: "Jan", mood: 4 },
  { month: "Feb", mood: 0 },
  { month: "Mar", mood: 0 },
  { month: "Apr", mood: 0 },
  { month: "May", mood: 0 },
]

const moodColors = {
  dot: {
    1: '#ef4444', // red
    2: '#f97316', // orange
    3: '#eab308', // yellow
    4: '#22c55e', // green
    5: '#8b5cf6', // purple
  },
  chart: {
    1: '#fecaca',
    2: '#fed7aa',
    3: '#fef08a',
    4: '#bbf7d0',
    5: '#ddd6fe',
  }
} as const;

const renderAreaChart = (data: any[]) => (
  <div className="h-[300px] w-full">
    <ResponsiveContainer>
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#ec4899" stopOpacity={0.8}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" opacity={0.1} stroke="#374151" />
        <XAxis 
          dataKey="date" 
          stroke="#6b7280"
          tick={{ fill: '#6b7280', fontSize: 12 }}
          tickLine={{ stroke: '#6b7280' }}
        />
        <YAxis 
          domain={[0, 5]}
          stroke="#6b7280"
          tick={{ fill: '#6b7280', fontSize: 12 }}
          ticks={[1, 2, 3, 4, 5]}
          tickLine={{ stroke: '#6b7280' }}
        />
        <Tooltip
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload;
              return (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                  <p className="font-medium">{label}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Average Mood: {data.mood?.toFixed(1) || 'No data'}
                  </p>
                  <div className="mt-2 space-y-1">
                    {data.entries?.map((entry: any, i: number) => (
                      <div key={i} className="text-sm flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: moodColors.dot[entry.level as MoodLevel] }}></span>
                        <span className="font-medium">{entry.timeOfDay}: </span>
                        <span className="text-gray-600 dark:text-gray-400">
                          {moodDescriptions[entry.level as MoodLevel]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }
            return null;
          }}
        />
        <Area
          type="monotone"
          dataKey="mood"
          stroke="url(#colorMood)"
          fill="url(#colorMood)"
          strokeWidth={3}
          dot={{ 
            r: 6, 
            stroke: '#8b5cf6', 
            strokeWidth: 2,
            fill: '#fff'
          }}
          activeDot={{ 
            r: 8, 
            stroke: '#8b5cf6',
            strokeWidth: 2,
            fill: '#fff'
          }}
          animationDuration={2000}
          animationEasing="ease-in-out"
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

export function MoodStats() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Mood</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                mood: {
                  label: "Mood Level",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px]"
            >
              <AreaChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 5]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="mood"
                  stroke="var(--color-mood)"
                  fill="var(--color-mood)"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                mood: {
                  label: "Average Mood",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[300px]"
            >
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 5]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="mood" fill="var(--color-mood)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

