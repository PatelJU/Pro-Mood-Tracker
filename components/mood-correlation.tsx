import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { MoodData, TimeOfDay } from "../types/mood"
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { moodColors } from "../utils/theme"
import { Brain, Activity } from 'lucide-react'

interface MoodCorrelationProps {
  moodData: MoodData
}

export function MoodCorrelation({ moodData }: MoodCorrelationProps) {
  const correlationData = useMemo(() => {
    const timeCorrelation = new Map<string, { prevMood: number; nextMood: number }[]>()
    const entries = Object.entries(moodData).sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
    
    // Analyze consecutive days
    for (let i = 0; i < entries.length - 1; i++) {
      const [currentDate, currentMoods] = entries[i]
      const [nextDate, nextMoods] = entries[i + 1]
      
      Object.entries(currentMoods).forEach(([timeOfDay, currentEntry]) => {
        if (!timeCorrelation.has(timeOfDay)) {
          timeCorrelation.set(timeOfDay, [])
        }
        
        const nextDayMood = nextMoods[timeOfDay as TimeOfDay]
        if (nextDayMood) {
          timeCorrelation.get(timeOfDay)?.push({
            prevMood: currentEntry.level,
            nextMood: nextDayMood.level
          })
        }
      })
    }

    // Calculate correlations
    const correlations = Array.from(timeCorrelation.entries()).map(([timeOfDay, data]) => {
      const correlation = calculateCorrelation(
        data.map(d => d.prevMood),
        data.map(d => d.nextMood)
      )
      
      return {
        timeOfDay,
        correlation: Number(correlation.toFixed(2)),
        dataPoints: data.map(d => ({
          x: d.prevMood,
          y: d.nextMood
        }))
      }
    })

    return correlations
  }, [moodData])

  // Pearson correlation coefficient calculation
  function calculateCorrelation(x: number[], y: number[]): number {
    const n = x.length
    const sum_x = x.reduce((a, b) => a + b, 0)
    const sum_y = y.reduce((a, b) => a + b, 0)
    const sum_xy = x.reduce((acc, _, i) => acc + x[i] * y[i], 0)
    const sum_x2 = x.reduce((acc, val) => acc + val * val, 0)
    const sum_y2 = y.reduce((acc, val) => acc + val * val, 0)

    const numerator = n * sum_xy - sum_x * sum_y
    const denominator = Math.sqrt((n * sum_x2 - sum_x * sum_x) * (n * sum_y2 - sum_y * sum_y))
    
    return denominator === 0 ? 0 : numerator / denominator
  }

  return (
    <Card className="border border-black/10 bg-white/95 backdrop-blur-sm shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Mood Correlations
        </CardTitle>
        <CardDescription>
          How your mood today affects tomorrow
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {correlationData.map(({ timeOfDay, correlation, dataPoints }) => (
            <div key={timeOfDay} className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium capitalize">{timeOfDay}</h3>
                <span className={`text-sm ${
                  correlation > 0.5 ? 'text-green-600' :
                  correlation < -0.5 ? 'text-red-600' :
                  'text-gray-600'
                }`}>
                  r = {correlation}
                </span>
              </div>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      type="number" 
                      dataKey="x" 
                      name="Previous Mood" 
                      domain={[1, 5]}
                      label={{ value: 'Previous Day', position: 'bottom' }}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="y" 
                      name="Next Mood" 
                      domain={[1, 5]}
                      label={{ value: 'Next Day', angle: -90, position: 'left' }}
                    />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      content={({ payload }) => {
                        if (payload && payload[0]) {
                          return (
                            <div className="bg-white p-2 border rounded shadow">
                              <p>Previous: {payload[0].payload.x}</p>
                              <p>Next: {payload[0].payload.y}</p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Scatter 
                      data={dataPoints} 
                      fill={moodColors[3].dot}
                      opacity={0.6}
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 