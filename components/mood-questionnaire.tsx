"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { motion } from "framer-motion"
import { Brain, Coffee, Cloud, Moon, Sun, Utensils } from 'lucide-react'

interface QuestionnaireData {
  sleepQuality: string;
  symptoms?: Record<string, boolean>;
  triggers?: Record<string, boolean>;
  notes?: string;
}

interface QuestionnaireProps {
  onComplete: (data: QuestionnaireData) => void;
}

export function MoodQuestionnaire({ onComplete }: QuestionnaireProps) {
  const [step, setStep] = useState(1)
  const [answers, setAnswers] = useState<Partial<QuestionnaireData>>({})

  const symptoms = [
    "Fatigue",
    "Anxiety",
    "Restlessness",
    "Poor concentration",
    "Changes in appetite",
    "Sleep issues"
  ]

  const triggers = [
    { label: "Sleep Quality", icon: Moon },
    { label: "Diet", icon: Utensils },
    { label: "Weather", icon: Cloud },
    { label: "Caffeine", icon: Coffee },
    { label: "Stress", icon: Brain },
    { label: "Exercise", icon: Sun }
  ]

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1)
    } else if (answers.sleepQuality) {
      onComplete(answers as QuestionnaireData)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-none bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
        <CardHeader>
          <CardTitle>Daily Wellness Check</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <h3 className="font-medium">How did you sleep last night?</h3>
              <RadioGroup
                onValueChange={(value) => 
                  setAnswers({ ...answers, sleepQuality: value })
                }
                defaultValue={answers.sleepQuality}
              >
                {["Excellent", "Good", "Fair", "Poor"].map((quality) => (
                  <div key={quality} className="flex items-center space-x-2">
                    <RadioGroupItem value={quality} id={`sleep-${quality}`} />
                    <Label htmlFor={`sleep-${quality}`}>{quality}</Label>
                  </div>
                ))}
              </RadioGroup>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <h3 className="font-medium">Select any symptoms you're experiencing:</h3>
              <div className="grid grid-cols-2 gap-4">
                {symptoms.map((symptom) => (
                  <div key={symptom} className="flex items-center space-x-2">
                    <Checkbox
                      id={symptom}
                      onCheckedChange={(checked) =>
                        setAnswers({
                          ...answers,
                          symptoms: {
                            ...answers.symptoms,
                            [symptom]: checked === true
                          }
                        })
                      }
                    />
                    <Label htmlFor={symptom}>{symptom}</Label>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <h3 className="font-medium">What factors might be affecting your mood today?</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {triggers.map(({ label, icon: Icon }) => (
                  <Button
                    key={label}
                    variant={answers.triggers?.[label] ? "default" : "outline"}
                    className="h-24 flex flex-col gap-2"
                    onClick={() =>
                      setAnswers({
                        ...answers,
                        triggers: {
                          ...answers.triggers,
                          [label]: !answers.triggers?.[label]
                        }
                      })
                    }
                  >
                    <Icon className="h-6 w-6" />
                    <span className="text-sm">{label}</span>
                  </Button>
                ))}
              </div>
              <div className="mt-4">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any other factors affecting your mood..."
                  className="mt-2"
                  onChange={(e) =>
                    setAnswers({ ...answers, notes: e.target.value })
                  }
                  value={answers.notes || ""}
                />
              </div>
            </motion.div>
          )}

          <div className="flex justify-end">
            <Button onClick={handleNext}>
              {step === 3 ? "Complete" : "Next"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

