import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { Brain, Target, TrendingUp, Award, Bell, Calendar, ArrowUp, ArrowDown, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { format, startOfWeek, endOfWeek, differenceInDays } from "date-fns"
import { MoodData, MoodLevel, moodDescriptions } from "@/types/mood"
import { cn } from "@/lib/utils"

interface MoodGoal {
  id: string
  type: "average" | "streak" | "entries" | "custom"
  target: number
  deadline?: Date
  description: string
  notifications: boolean
  progress: number
  achieved: boolean
  createdAt: Date
}

interface MoodPattern {
  type: string
  description: string
  confidence: number
  impact: "positive" | "negative" | "neutral"
  suggestions: string[]
}

interface MoodInsightsProps {
  moodData: MoodData
  onSetGoal: (goal: MoodGoal) => void
  goals: MoodGoal[]
  onDeleteGoal: (goalId: string) => void
  onUpdateProgress: (goalId: string, progress: number) => void
}

export function MoodInsights({ moodData, onSetGoal, goals, onDeleteGoal, onUpdateProgress }: MoodInsightsProps) {
  const [patterns, setPatterns] = useState<MoodPattern[]>([])
  const [newGoal, setNewGoal] = useState<Partial<MoodGoal>>({
    type: "average",
    target: 4,
    notifications: true
  })
  const { toast } = useToast()

  // Analyze mood patterns
  useEffect(() => {
    const analyzeMoodPatterns = () => {
      const patterns: MoodPattern[] = []
      
      // Time-based patterns
      const timePatterns = analyzeTimePatterns(moodData)
      patterns.push(...timePatterns)
      
      // Activity correlations
      const activityPatterns = analyzeActivityPatterns(moodData)
      patterns.push(...activityPatterns)
      
      // Trend analysis
      const trendPatterns = analyzeTrends(moodData)
      patterns.push(...trendPatterns)
      
      setPatterns(patterns)
    }
    
    analyzeMoodPatterns()
  }, [moodData])

  // Update goal progress
  useEffect(() => {
    goals.forEach(goal => {
      const progress = calculateGoalProgress(goal, moodData)
      if (progress !== goal.progress) {
        onUpdateProgress(goal.id, progress)
      }
    })
  }, [moodData, goals, onUpdateProgress])

  const handleCreateGoal = () => {
    if (!newGoal.description) {
      toast({
        title: "Missing Description",
        description: "Please provide a description for your goal.",
        variant: "destructive"
      })
      return
    }

    const goal: MoodGoal = {
      id: crypto.randomUUID(),
      type: newGoal.type!,
      target: newGoal.target!,
      deadline: newGoal.deadline,
      description: newGoal.description,
      notifications: newGoal.notifications!,
      progress: 0,
      achieved: false,
      createdAt: new Date()
    }

    onSetGoal(goal)
    setNewGoal({
      type: "average",
      target: 4,
      notifications: true
    })
    
    toast({
      title: "Goal Created",
      description: "Your new mood goal has been set. Good luck!",
    })
  }

  return (
    <div className="space-y-6">
      {/* AI Insights */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Brain className="h-5 w-5" />
          <h2 className="text-lg font-semibold">AI Insights</h2>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {patterns.map((pattern, index) => (
              <motion.div
                key={pattern.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        {pattern.type}
                      </CardTitle>
                      <Badge variant={
                        pattern.impact === "positive" ? "default" :
                        pattern.impact === "negative" ? "destructive" : "secondary"
                      }>
                        {pattern.impact === "positive" && <ArrowUp className="h-3 w-3 mr-1" />}
                        {pattern.impact === "negative" && <ArrowDown className="h-3 w-3 mr-1" />}
                        {pattern.impact.charAt(0).toUpperCase() + pattern.impact.slice(1)}
                      </Badge>
                    </div>
                    <CardDescription>
                      Confidence: {pattern.confidence}%
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {pattern.description}
                    </p>
                    {pattern.suggestions.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Suggestions:</p>
                        <ul className="text-sm text-muted-foreground list-disc pl-4 space-y-1">
                          {pattern.suggestions.map((suggestion, i) => (
                            <li key={i}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* Goals */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Mood Goals</h2>
          </div>
          <Button variant="outline" size="sm" onClick={() => setNewGoal({
            type: "average",
            target: 4,
            notifications: true
          })}>
            Set New Goal
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* New Goal Form */}
          {newGoal && (
            <Card>
              <CardHeader>
                <CardTitle>New Goal</CardTitle>
                <CardDescription>Set a new mood improvement goal</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Goal Type</Label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    value={newGoal.type}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, type: e.target.value as MoodGoal["type"] }))}
                  >
                    <option value="average">Average Mood</option>
                    <option value="streak">Positive Streak</option>
                    <option value="entries">Daily Entries</option>
                    <option value="custom">Custom Goal</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Target Value</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[newGoal.target || 4]}
                      min={1}
                      max={5}
                      step={0.5}
                      onValueChange={([value]) => setNewGoal(prev => ({ ...prev, target: value }))}
                      className="flex-1"
                    />
                    <span className="w-12 text-right font-medium">
                      {newGoal.target}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    placeholder="Describe your goal..."
                    value={newGoal.description || ""}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Deadline (Optional)</Label>
                  <Input
                    type="date"
                    value={newGoal.deadline ? format(newGoal.deadline, "yyyy-MM-dd") : ""}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, deadline: e.target.value ? new Date(e.target.value) : undefined }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Enable Notifications</Label>
                  <Switch
                    checked={newGoal.notifications}
                    onCheckedChange={(checked) => setNewGoal(prev => ({ ...prev, notifications: checked }))}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setNewGoal({
                  type: "average",
                  target: 4,
                  notifications: true
                })}>
                  Cancel
                </Button>
                <Button onClick={handleCreateGoal}>
                  Create Goal
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Existing Goals */}
          <AnimatePresence mode="popLayout">
            {goals.map((goal) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card className={cn(
                  "transition-colors duration-300",
                  goal.achieved && "border-green-500/50 bg-green-500/5"
                )}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        {goal.description}
                      </CardTitle>
                      {goal.achieved && (
                        <Badge className="bg-green-500">
                          <Award className="h-3 w-3 mr-1" />
                          Achieved
                        </Badge>
                      )}
                    </div>
                    <CardDescription>
                      Target: {goal.target} {goal.deadline && `• Due ${format(goal.deadline, "MMM d, yyyy")}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span className="font-medium">{goal.progress.toFixed(0)}%</span>
                      </div>
                      <Progress value={goal.progress} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>
    </div>
  )
}

// Helper functions for pattern analysis
function analyzeTimePatterns(moodData: MoodData): MoodPattern[] {
  const patterns: MoodPattern[] = []
  
  // Analyze morning vs evening moods
  const morningMoods = []
  const eveningMoods = []
  
  for (const [date, entries] of Object.entries(moodData)) {
    for (const [time, entry] of Object.entries(entries)) {
      const hour = parseInt(time.split(":")[0])
      if (hour < 12) morningMoods.push(entry.level)
      if (hour >= 18) eveningMoods.push(entry.level)
    }
  }
  
  const avgMorning = morningMoods.reduce((a, b) => a + b, 0) / morningMoods.length
  const avgEvening = eveningMoods.reduce((a, b) => a + b, 0) / eveningMoods.length
  
  if (Math.abs(avgMorning - avgEvening) > 0.5) {
    patterns.push({
      type: "Time of Day Pattern",
      description: avgMorning > avgEvening
        ? "You tend to feel better in the mornings compared to evenings"
        : "You tend to feel better in the evenings compared to mornings",
      confidence: 85,
      impact: "neutral",
      suggestions: [
        avgMorning > avgEvening
          ? "Consider scheduling important tasks in the morning"
          : "Try to schedule challenging activities for the evening",
        "Maintain a consistent sleep schedule",
        "Plan activities around your natural mood patterns"
      ]
    })
  }
  
  return patterns
}

function analyzeActivityPatterns(moodData: MoodData): MoodPattern[] {
  const patterns: MoodPattern[] = []
  
  // Analyze mood notes for common activities
  const activityMoods: Record<string, number[]> = {}
  const commonActivities = ["exercise", "work", "sleep", "social", "meditation"]
  
  for (const entries of Object.values(moodData)) {
    for (const entry of Object.values(entries)) {
      if (!entry.note) continue
      
      const note = entry.note.toLowerCase()
      for (const activity of commonActivities) {
        if (note.includes(activity)) {
          if (!activityMoods[activity]) activityMoods[activity] = []
          activityMoods[activity].push(entry.level)
        }
      }
    }
  }
  
  for (const [activity, moods] of Object.entries(activityMoods)) {
    if (moods.length < 3) continue // Need enough data points
    
    const avgMood = moods.reduce((a, b) => a + b, 0) / moods.length
    const impact = avgMood > 3.5 ? "positive" : avgMood < 2.5 ? "negative" : "neutral"
    
    patterns.push({
      type: "Activity Correlation",
      description: `${activity.charAt(0).toUpperCase() + activity.slice(1)} appears to ${
        impact === "positive" ? "boost" : impact === "negative" ? "lower" : "maintain"
      } your mood`,
      confidence: 75,
      impact,
      suggestions: [
        impact === "positive"
          ? `Try to incorporate more ${activity} into your routine`
          : impact === "negative"
          ? `Consider adjusting your approach to ${activity} or seeking support`
          : `Monitor how ${activity} affects your mood in different contexts`
      ]
    })
  }
  
  return patterns
}

function analyzeTrends(moodData: MoodData): MoodPattern[] {
  const patterns: MoodPattern[] = []
  
  // Analyze overall trend
  const sortedEntries = Object.entries(moodData)
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
  
  if (sortedEntries.length < 7) return patterns // Need at least a week of data
  
  const weeklyAverages = []
  let currentWeek = []
  
  for (const [, entries] of sortedEntries) {
    const dayMoods = Object.values(entries).map(entry => entry.level)
    currentWeek.push(...dayMoods)
    
    if (currentWeek.length >= 7) {
      const avgMood = currentWeek.reduce((a, b) => a + b, 0) / currentWeek.length
      weeklyAverages.push(avgMood)
      currentWeek = []
    }
  }
  
  if (weeklyAverages.length >= 2) {
    const firstWeek = weeklyAverages[0]
    const lastWeek = weeklyAverages[weeklyAverages.length - 1]
    const difference = lastWeek - firstWeek
    
    if (Math.abs(difference) > 0.3) {
      patterns.push({
        type: "Mood Trend",
        description: difference > 0
          ? "Your overall mood has been improving over time"
          : "Your mood has been declining recently",
        confidence: 80,
        impact: difference > 0 ? "positive" : "negative",
        suggestions: difference > 0
          ? [
              "Keep up your current positive practices",
              "Document what's working well for you",
              "Share your success strategies with others"
            ]
          : [
              "Consider talking to a mental health professional",
              "Review and adjust your self-care routine",
              "Identify and address potential stressors"
            ]
      })
    }
  }
  
  return patterns
}

function calculateGoalProgress(goal: MoodGoal, moodData: MoodData): number {
  switch (goal.type) {
    case "average": {
      const recentEntries = Object.entries(moodData)
        .slice(-7) // Last 7 days
        .flatMap(([, entries]) => Object.values(entries))
        .map(entry => entry.level)
      
      if (recentEntries.length === 0) return 0
      
      const average = recentEntries.reduce((a, b) => a + b, 0) / recentEntries.length
      return Math.min((average / goal.target) * 100, 100)
    }
    
    case "streak": {
      let currentStreak = 0
      const sortedDates = Object.entries(moodData)
        .sort(([dateA], [dateB]) => dateB.localeCompare(dateA)) // Most recent first
      
      for (const [, entries] of sortedDates) {
        const dayMoods = Object.values(entries).map(entry => entry.level)
        const avgMood = dayMoods.reduce((a, b) => a + b, 0) / dayMoods.length
        
        if (avgMood >= goal.target) {
          currentStreak++
        } else {
          break
        }
      }
      
      return Math.min((currentStreak / goal.target) * 100, 100)
    }
    
    case "entries": {
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - i)
        return format(date, "yyyy-MM-dd")
      })
      
      const completedDays = last7Days.filter(date => {
        const entries = moodData[date]
        return entries && Object.keys(entries).length >= goal.target
      }).length
      
      return (completedDays / 7) * 100
    }
    
    default:
      return 0
  }
} 