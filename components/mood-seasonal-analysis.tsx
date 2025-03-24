import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { MoodData } from "../types/mood"
import { Cloud, Sun, Snowflake, Leaf } from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { moodColors } from "../utils/theme"

interface MoodSeasonalAnalysisProps {
  moodData: MoodData
}

export function MoodSeasonalAnalysis({ moodData }: MoodSeasonalAnalysisProps) {
  const seasonalData = useMemo(() => {
    const seasons = {
      Spring: { months: [2, 3, 4], moods: [] as number[], icon: Leaf },
      Summer: { months: [5, 6, 7], moods: [] as number[], icon: Sun },
      Fall: { months: [8, 9, 10], moods: [] as number[], icon: Cloud },
      Winter: { months: [11, 0, 1], moods: [] as number[], icon: Snowflake }
    }

    Object.entries(moodData).forEach(([dateStr, entries]) => {
      const date = new Date(dateStr)
      const month = date.getMonth()
      const season = Object.entries(seasons).find(([_, data]) => 
        data.months.includes(month)
      )?.[0]

      if (season) {
        const dailyAvg = Object.values(entries).reduce((sum, entry) => 
          sum + entry.level, 0) / Object.values(entries).length
        seasons[season as keyof typeof seasons].moods.push(dailyAvg)
      }
    })

    return Object.entries(seasons).map(([season, data]) => ({
      season,
      average: data.moods.length ? 
        data.moods.reduce((a, b) => a + b, 0) / data.moods.length : 0,
      entries: data.moods.length,
      Icon: data.icon
    }))
  }, [moodData])

  return (
    <Card className="border border-black/10 bg-white/95 backdrop-blur-sm shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sun className="h-5 w-5" />
          Seasonal Patterns
        </CardTitle>
        <CardDescription>
          How seasons affect your mood
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={seasonalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="season" />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Bar 
                dataKey="average" 
                fill={moodColors[3].dot}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {seasonalData.map(({ season, average, entries, Icon }) => (
            <div key={season} className="flex items-center gap-3 p-3 rounded-lg border">
              <Icon className="h-5 w-5 text-gray-500" />
              <div>
                <div className="font-medium">{season}</div>
                <div className="text-sm text-gray-500">
                  Avg: {average.toFixed(1)} ({entries} entries)
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 