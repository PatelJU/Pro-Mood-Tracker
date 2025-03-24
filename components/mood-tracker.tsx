"use client"

import { useState, useRef } from "react"
import { MoodCalendar } from "./mood-calendar"
import { MoodEntry as MoodEntryComponent } from "./mood-entry"
import type { MoodEntry } from "../types/mood"
import { MoodStats } from "./mood-stats"
import { MoodPatterns } from "./mood-patterns"
import { MoodTimeline } from "./moodTimeline"
import { MoodData, MoodLevel, TimeOfDay } from "../types/mood"
import { formatDate } from "../utils/date"
import { MoodHistoryView } from "./mood-history-view"
import { useMoodStore } from "../store/moodStore"
import { ExportData } from "./export-data"
import { MoodInsights } from "./mood-insights"
import { MoodSeasonalAnalysis } from "./mood-seasonal-analysis"
import { MoodAnalytics } from "./mood-analytics"
import { MoodCorrelation } from "./mood-correlation"
import { MoodPrediction } from "./mood-prediction"
import { MoodComparison } from "./mood-comparison"
import { MoodHeatmap } from "./mood-heatmap"
import { MoodRecommendations } from "./mood-recommendations"
import { MoodGoals } from "./mood-goals"
import { MoodMilestones } from "./mood-milestones"
import { MoodBadges } from "./mood-badges"
import { MoodStreaks } from "./mood-streaks"
import { MoodProgress } from "./mood-progress"
import { MoodInsightsDashboard } from "./mood-insights-dashboard"
import { MoodTrends } from "./moodTrends"
import { MoodSummary } from "./mood-summary"
import { Card } from "@/components/ui/card"

export function MoodTracker() {
  const { 
    moodData,
    selectedDate,
    isEditing,
    editingEntry,
    showHistoryModal,
    selectedHistoryEntry,
    setSelectedDate,
    saveMood,
    editEntry,
    toggleHistoryModal,
    setSelectedHistoryEntry
  } = useMoodStore()

  const containerRef = useRef<HTMLDivElement>(null)

  const handleViewHistory = (date: string, entry: MoodEntry) => {
    setSelectedHistoryEntry({ date, entry })
  }

  const handleCloseHistory = () => {
    setSelectedHistoryEntry(null)
    toggleHistoryModal(false)
  }

  const handleEditEntry = (date: string, entry: MoodEntry) => {
    editEntry(date, entry)
    handleCloseHistory()
  }

  const handleSubmitMood = (timeOfDay: TimeOfDay, level: MoodLevel, note: string) => {
    if (selectedDate) {
      saveMood(timeOfDay, level, note)
    }
  }

  return (
    <div className="container mx-auto p-4" ref={containerRef}>
      {/* Top Row - Two Equal Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Calendar */}
        <div className="w-full h-[600px]">
          <Card className="h-full border border-black/10 bg-white/95 backdrop-blur-sm shadow-xl overflow-auto visualization-component" data-title="Calendar View">
            <MoodCalendar
              moodData={moodData}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onViewHistory={handleViewHistory}
              onEditEntry={handleEditEntry}
            />
          </Card>
        </div>

        {/* Current Mood Entry */}
        <div className="w-full h-[600px]">
          <Card className="h-full border border-black/10 bg-white/95 backdrop-blur-sm shadow-xl overflow-auto">
            <MoodEntryComponent
              selectedDate={selectedDate}
              onSaveMood={handleSubmitMood}
              existingMoods={selectedDate ? moodData[formatDate(selectedDate)] : undefined}
              isEditing={isEditing}
              editingEntry={editingEntry}
            />
          </Card>
        </div>
      </div>

      {/* Middle Row - Full Width */}
      <div className="mb-4">
        <div className="w-full h-[600px]">
          <Card className="h-full border border-black/10 bg-white/95 backdrop-blur-sm shadow-xl overflow-auto visualization-component" data-title="Mood Statistics">
            <MoodStats moodData={moodData} />
          </Card>
        </div>
      </div>

      {/* Insights Dashboard - Full Width */}
      <div className="mb-4">
        <div className="w-full h-[600px]">
          <Card className="h-full border border-black/10 bg-white/95 backdrop-blur-sm shadow-xl overflow-auto visualization-component" data-title="Insights Dashboard">
            <MoodInsightsDashboard moodData={moodData} />
          </Card>
        </div>
      </div>

      {/* Heatmap - Full Width */}
      <div className="mb-4">
        <div className="w-full h-[600px]">
          <Card className="h-full border border-black/10 bg-white/95 backdrop-blur-sm shadow-xl overflow-auto visualization-component" data-title="Mood Heatmap">
            <MoodHeatmap moodData={moodData} />
          </Card>
        </div>
      </div>

      {/* Bottom Section - Two Columns Grid */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border border-black/10 bg-white/95 backdrop-blur-sm shadow-xl visualization-component" data-title="Progress Overview">
            <MoodProgress moodData={moodData} />
          </Card>
          <Card className="border border-black/10 bg-white/95 backdrop-blur-sm shadow-xl visualization-component" data-title="Goals & Targets">
            <MoodGoals moodData={moodData} />
          </Card>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border border-black/10 bg-white/95 backdrop-blur-sm shadow-xl visualization-component" data-title="Achievements">
            <MoodBadges moodData={moodData} />
          </Card>
          <Card className="border border-black/10 bg-white/95 backdrop-blur-sm shadow-xl visualization-component" data-title="Mood Streaks">
            <MoodStreaks moodData={moodData} />
          </Card>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border border-black/10 bg-white/95 backdrop-blur-sm shadow-xl visualization-component" data-title="Mood Predictions">
            <MoodPrediction moodData={moodData} />
          </Card>
          <Card className="border border-black/10 bg-white/95 backdrop-blur-sm shadow-xl visualization-component" data-title="Mood Comparisons">
            <MoodComparison moodData={moodData} />
          </Card>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border border-black/10 bg-white/95 backdrop-blur-sm shadow-xl visualization-component" data-title="Correlation Analysis">
            <MoodCorrelation moodData={moodData} />
          </Card>
          <Card className="border border-black/10 bg-white/95 backdrop-blur-sm shadow-xl visualization-component" data-title="Seasonal Analysis">
            <MoodSeasonalAnalysis moodData={moodData} />
          </Card>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border border-black/10 bg-white/95 backdrop-blur-sm shadow-xl visualization-component" data-title="Analytics Overview">
            <MoodAnalytics moodData={moodData} />
          </Card>
          <Card className="border border-black/10 bg-white/95 backdrop-blur-sm shadow-xl">
            <ExportData moodData={moodData} containerRef={containerRef} />
          </Card>
        </div>
      </div>

      {selectedHistoryEntry && (
        <MoodHistoryView
          date={selectedHistoryEntry.date}
          entry={selectedHistoryEntry.entry}
          onClose={handleCloseHistory}
          onEdit={handleEditEntry}
        />
      )}
    </div>
  )
} 