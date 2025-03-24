import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { MoodData, MoodLevel, TimeOfDay } from "../types/mood"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { moodColors } from "../utils/theme"
import { TrendingUp, AlertTriangle } from 'lucide-react'
import { formatDate } from "../utils/date"

interface MoodPredictionProps {
  moodData: MoodData
}

export function MoodPrediction({ moodData }: MoodPredictionProps) {
  const prediction = useMemo(() => {
    const entries = Object.entries(moodData)
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
    
    // Calculate moving averages and trends
    const movingAverages: { date: string; actual: number; predicted: number }[] = []
    const windowSize = 7 // 7-day moving average
    
    for (let i = windowSize; i < entries.length; i++) {
      const window = entries.slice(i - windowSize, i)
      const nextDay = entries[i]
      
      // Calculate average mood for each day in window
      const dailyAverages = window.map(([_, dailyEntries]) => 
        Object.values(dailyEntries).reduce((sum, entry) => sum + entry.level, 0) / 
        Object.values(dailyEntries).length
      )
      
      // Simple weighted average prediction
      const weights = Array.from({ length: windowSize }, (_, i) => i + 1)
      const weightedSum = dailyAverages.reduce((sum, avg, i) => sum + avg * weights[i], 0)
      const weightTotal = weights.reduce((a, b) => a + b, 0)
      const predicted = weightedSum / weightTotal
      
      // Calculate actual average for the day
      const actual = Object.values(nextDay[1]).reduce((sum, entry) => sum + entry.level, 0) / 
        Object.values(nextDay[1]).length
      
      movingAverages.push({
        date: nextDay[0],
        actual,
        predicted: Number(predicted.toFixed(2))
      })
    }
    
    // Calculate prediction accuracy
    const accuracy = movingAverages.reduce((sum, day) => {
      const diff = Math.abs(day.actual - day.predicted)
      return sum + (1 - diff / 4) // Scale difference to 0-1 range
    }, 0) / movingAverages.length * 100
    
    // Predict next day's mood
    const lastWeek = entries.slice(-7)
    const dailyAverages = lastWeek.map(([_, dailyEntries]) => 
      Object.values(dailyEntries).reduce((sum, entry) => sum + entry.level, 0) / 
      Object.values(dailyEntries).length
    )
    
    const weights = Array.from({ length: 7 }, (_, i) => i + 1)
    const weightedSum = dailyAverages.reduce((sum, avg, i) => sum + avg * weights[i], 0)
    const weightTotal = weights.reduce((a, b) => a + b, 0)
    const nextDayPrediction = Number((weightedSum / weightTotal).toFixed(2))
    
    return {
      movingAverages,
      accuracy,
      nextDayPrediction,
      trend: nextDayPrediction > dailyAverages[dailyAverages.length - 1] ? 'improving' : 'declining'
    }
  }, [moodData])

  return (
    <Card className="border border-black/10 bg-white/95 backdrop-blur-sm shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Mood Predictions
        </CardTitle>
        <CardDescription>
          AI-powered mood trend analysis and predictions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium text-blue-800">Tomorrow's Prediction</div>
              <div className="mt-1 text-2xl font-bold text-blue-900">
                {prediction.nextDayPrediction.toFixed(1)}
              </div>
              <div className="mt-1 text-sm text-blue-600">
                Trend: {prediction.trend === 'improving' ? '↗️ Improving' : '↘️ Declining'}
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-sm font-medium text-green-800">Prediction Accuracy</div>
              <div className="mt-1 text-2xl font-bold text-green-900">
                {prediction.accuracy.toFixed(1)}%
              </div>
              <div className="mt-1 text-sm text-green-600">
                Based on historical data
              </div>
            </div>
          </div>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={prediction.movingAverages}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString()}
                />
                <YAxis domain={[1, 5]} />
                <Tooltip
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                />
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  stroke={moodColors[3].dot} 
                  name="Actual"
                />
                <Line 
                  type="monotone" 
                  dataKey="predicted" 
                  stroke={moodColors[4].dot} 
                  strokeDasharray="5 5" 
                  name="Predicted"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 