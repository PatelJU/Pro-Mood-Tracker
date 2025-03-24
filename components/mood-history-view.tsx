"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { format } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
import { MoodEntry, MoodLevel, moodDescriptions } from "../types/mood"
import { moodColors } from "../utils/theme"
import { Brain, Coffee, Cloud, Moon, Sun, Utensils, X } from 'lucide-react'
import { ErrorBoundary } from "react-error-boundary"
import { cn } from "@/lib/utils"

interface MoodHistoryViewProps {
  date: string
  entry: MoodEntry & {
    questionnaire?: {
      sleepQuality?: string
      symptoms?: Record<string, boolean>
      triggers?: Record<string, boolean>
      notes?: string
    }
  }
  onClose: () => void
  onEdit: (date: string, entry: MoodEntry) => void
}

const triggerIcons = {
  "Sleep Quality": Moon,
  "Diet": Utensils,
  "Weather": Cloud,
  "Caffeine": Coffee,
  "Stress": Brain,
  "Exercise": Sun,
} as const

function ErrorFallback({error, resetErrorBoundary}: {error: Error; resetErrorBoundary: () => void}) {
  return (
    <div className="text-center p-4">
      <h2 className="text-red-600">Something went wrong:</h2>
      <pre className="text-sm">{error.message}</pre>
      <Button onClick={resetErrorBoundary} className="mt-4">Try again</Button>
    </div>
  );
}

export function MoodHistoryView({ date, entry, onClose, onEdit }: MoodHistoryViewProps) {
  const [activeTab, setActiveTab] = useState("overview")

  const timeOfDayEmoji = {
    morning: "🌅",
    afternoon: "☀️",
    evening: "🌆",
    night: "🌙",
    "full-day": "📅"
  }

  const handleClose = () => {
    setActiveTab("overview") // Reset the active tab
    onClose() // Call the parent's onClose function
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={handleClose}>
      <Dialog open={true} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Mood History</DialogTitle>
                <DialogDescription>
                  View your mood history for this date
                </DialogDescription>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleClose} 
                className="absolute right-4 top-4 hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <Button 
                variant="outline" 
                onClick={() => onEdit(date, entry)}
                className="flex items-center gap-2"
              >
                ✏️ Edit Entry
              </Button>
            </div>
          </DialogHeader>
          
          <ScrollArea className="h-[calc(90vh-8rem)]">
            <div className="space-y-6 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold">
                  {format(new Date(date), "EEEE, MMMM d, yyyy")}
                </h3>
                <div className="flex items-center gap-2">
                  <span>{timeOfDayEmoji[entry.timeOfDay]}</span>
                  <span className="capitalize">{entry.timeOfDay}</span>
                </div>
              </div>

              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Mood Note</h4>
                        <p className="text-gray-600">
                          {entry.note || "No note recorded"}
                        </p>
                      </div>

                      {entry.questionnaire && (
                        <>
                          <div>
                            <h4 className="font-medium mb-2">Sleep Quality</h4>
                            <p className="text-gray-600 dark:text-gray-400">
                              {entry.questionnaire.sleepQuality || "Not recorded"}
                            </p>
                          </div>

                          {entry.questionnaire.symptoms && (
                            <div>
                              <h4 className="font-medium mb-2">Symptoms</h4>
                              <div className="flex flex-wrap gap-2">
                                {Object.entries(entry.questionnaire.symptoms)
                                  .filter(([_, active]) => active)
                                  .map(([symptom]) => (
                                    <span
                                      key={symptom}
                                      className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm"
                                    >
                                      {symptom}
                                    </span>
                                  ))}
                              </div>
                            </div>
                          )}

                          {entry.questionnaire.triggers && (
                            <div>
                              <h4 className="font-medium mb-2">Mood Triggers</h4>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {Object.entries(entry.questionnaire.triggers)
                                  .filter(([_, active]) => active)
                                  .map(([trigger]) => {
                                    const Icon = triggerIcons[trigger as keyof typeof triggerIcons]
                                    return (
                                      <div
                                        key={trigger}
                                        className="flex items-center gap-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg"
                                      >
                                        {Icon && <Icon className="h-4 w-4" />}
                                        <span className="text-sm">{trigger}</span>
                                      </div>
                                    )
                                  })}
                              </div>
                            </div>
                          )}

                          {entry.questionnaire.notes && (
                            <div>
                              <h4 className="font-medium mb-2">Additional Notes</h4>
                              <p className="text-gray-600 dark:text-gray-400">
                                {entry.questionnaire.notes}
                              </p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recommendations</CardTitle>
                    <CardDescription>Based on your mood and triggers</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {entry.level <= 2 && (
                        <div className="flex items-start gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div className="text-red-500">⚠️</div>
                          <div>
                            <div className="font-medium">Low Mood Alert</div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              Consider reaching out to a mental health professional or trusted friend.
                            </p>
                          </div>
                        </div>
                      )}

                      {entry.questionnaire?.sleepQuality === "Poor" && (
                        <div className="flex items-start gap-4 p-4 bg-white border border-blue-200 rounded-lg">
                          <div className="text-blue-500">💤</div>
                          <div>
                            <div className="font-medium">Sleep Quality</div>
                            <p className="text-sm text-gray-600 mt-1">
                              Try establishing a consistent bedtime routine and limit screen time before bed.
                            </p>
                          </div>
                        </div>
                      )}

                      {entry.questionnaire?.triggers?.["Stress"] && (
                        <div className="flex items-start gap-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <div className="text-purple-500">🧘</div>
                          <div>
                            <div className="font-medium">Stress Management</div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              Consider practicing mindfulness or meditation to help manage stress levels.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </ErrorBoundary>
  )
}

