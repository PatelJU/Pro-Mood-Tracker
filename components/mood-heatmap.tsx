"use client"

import React, { useMemo, useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { MoodData, MoodLevel } from "../types/mood"
import { Calendar, Download, Settings, Loader2, Maximize2, Filter, Share2, Sparkles } from 'lucide-react'
import { format, eachDayOfInterval, subMonths, isWithinInterval, startOfMonth, endOfMonth, differenceInDays } from "date-fns"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DatePicker } from "@/components/ui/date-picker"
import { useToast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "next-themes"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"

interface MoodHeatmapProps {
  moodData: MoodData
}

interface ExportTemplate {
  name: string
  description: string
  options: Partial<ExportOptions>
}

const exportTemplates: ExportTemplate[] = [
  {
    name: "Complete Report",
    description: "Full detailed report with all visualizations and data",
    options: {
      includeStats: true,
      includeNotes: true,
      includeMoodGraph: true,
      includeHeatmap: true,
      includeTableOfContents: true,
      includeMoodDistribution: true,
      includeWeekdayAnalysis: true,
      orientation: 'portrait'
    }
  },
  {
    name: "Statistics Only",
    description: "Key statistics and visualizations without detailed entries",
    options: {
      includeStats: true,
      includeNotes: false,
      includeMoodGraph: true,
      includeHeatmap: true,
      includeTableOfContents: true,
      includeMoodDistribution: true,
      includeWeekdayAnalysis: true,
      orientation: 'portrait'
    }
  },
  {
    name: "Data Export",
    description: "Raw data export with minimal formatting",
    options: {
      includeStats: false,
      includeNotes: true,
      includeMoodGraph: false,
      includeHeatmap: false,
      includeTableOfContents: false,
      includeMoodDistribution: false,
      includeWeekdayAnalysis: false,
      orientation: 'portrait'
    }
  }
]

interface CSVOptions {
  delimiter: ',' | ';' | '\t'
  dateFormat: string
  timeFormat: string
  includeHeaders: boolean
  quoteStrings: boolean
  encoding: 'UTF-8' | 'UTF-16'
}

interface ExportOptions {
  startDate: Date
  endDate: Date
  fileName: string
  includeStats: boolean
  includeNotes: boolean
  includeMoodGraph: boolean
  includeHeatmap: boolean
  orientation: 'portrait' | 'landscape'
  includeTableOfContents: boolean
  includeMoodDistribution: boolean
  includeWeekdayAnalysis: boolean
  csvDateFormat: string
  csvDelimiter: ',' | ';' | '\t'
  csvOptions: CSVOptions
  scheduledExport?: {
    enabled: boolean
    frequency: 'daily' | 'weekly' | 'monthly'
    time: string
    format: 'pdf' | 'csv' | 'json'
  }
}

// Enhanced statistics calculation
const calculateStats = (data: MoodData, startDate: Date, endDate: Date) => {
  let totalMood = 0
  let count = 0
  let bestDay = { date: '', mood: 0 }
  let worstDay = { date: '', mood: 5 }
  let totalEntries = 0
  let moodDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  let weekdayMoods: Record<number, { total: number; count: number }> = {
    0: { total: 0, count: 0 }, // Sunday
    1: { total: 0, count: 0 },
    2: { total: 0, count: 0 },
    3: { total: 0, count: 0 },
    4: { total: 0, count: 0 },
    5: { total: 0, count: 0 },
    6: { total: 0, count: 0 }
  }
  let streaks = {
    current: 0,
    longest: 0,
    bestMood: { current: 0, longest: 0 },
    worstMood: { current: 0, longest: 0 }
  }

  let lastDate: Date | null = null
  let lastMood: number | null = null

  Object.entries(data).forEach(([date, entries]) => {
    const currentDate = new Date(date)
    if (currentDate >= startDate && currentDate <= endDate) {
      const dayMoods = Object.values(entries).map(entry => entry.level)
      const avgMood = dayMoods.reduce((sum, level) => sum + level, 0) / dayMoods.length
      
      totalMood += avgMood
      count++
      totalEntries += dayMoods.length

      // Update mood distribution
      dayMoods.forEach(mood => {
        moodDistribution[mood as keyof typeof moodDistribution]++
      })

      // Update weekday stats
      const weekday = currentDate.getDay()
      weekdayMoods[weekday].total += avgMood
      weekdayMoods[weekday].count++

      // Update streaks
      if (lastDate) {
        const dayDiff = differenceInDays(currentDate, lastDate)
        if (dayDiff === 1) {
          streaks.current++
          streaks.longest = Math.max(streaks.longest, streaks.current)
        } else if (dayDiff > 1) {
          streaks.current = 0
        }

        if (lastMood && avgMood >= 4) {
          streaks.bestMood.current++
          streaks.bestMood.longest = Math.max(streaks.bestMood.longest, streaks.bestMood.current)
        } else {
          streaks.bestMood.current = 0
        }

        if (lastMood && avgMood <= 2) {
          streaks.worstMood.current++
          streaks.worstMood.longest = Math.max(streaks.worstMood.longest, streaks.worstMood.current)
        } else {
          streaks.worstMood.current = 0
        }
      }

      lastDate = currentDate
      lastMood = avgMood

      if (avgMood > bestDay.mood) {
        bestDay = { date, mood: avgMood }
      }
      if (avgMood < worstDay.mood) {
        worstDay = { date, mood: avgMood }
      }
    }
  })

  const weekdayAnalysis = Object.entries(weekdayMoods).map(([day, stats]) => ({
    day: Number(day),
    avgMood: stats.count ? stats.total / stats.count : 0
  })).sort((a, b) => b.avgMood - a.avgMood)

  return {
    averageMood: count ? (totalMood / count).toFixed(2) : 0,
    totalEntries,
    bestDay,
    worstDay,
    trackedDays: count,
    moodDistribution,
    weekdayAnalysis,
    streaks,
    consistency: (count / differenceInDays(endDate, startDate)) * 100
  }
}

// Enhanced graph drawing with axis labels and grid
const drawMoodTrendGraph = (data: MoodData, startDate: Date, endDate: Date, pdf: jsPDF, startY: number) => {
  const days = differenceInDays(endDate, startDate) + 1
  const width = 170
  const height = 80 // Increased height for labels
  const padding = 20 // Increased padding for labels
  const graphWidth = width - (padding * 2)
  const graphHeight = height - (padding * 2)

  // Draw grid lines
  pdf.setDrawColor(240, 240, 240)
  pdf.setLineWidth(0.1)
  // Horizontal grid lines
  for (let i = 0; i <= 5; i++) {
    const y = startY + height - padding - (i / 5) * graphHeight
    pdf.line(20 + padding, y, 20 + width - padding, y)
    // Add mood level labels
    pdf.setFontSize(8)
    pdf.setTextColor(156, 163, 175)
    pdf.text(i.toString(), 15, y)
  }
  // Vertical grid lines
  const monthInterval = Math.ceil(days / 6) // Show ~6 date markers
  for (let i = 0; i <= days; i += monthInterval) {
    const x = 20 + padding + (i / days) * graphWidth
    pdf.line(x, startY + padding, x, startY + height - padding)
    // Add date labels
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    pdf.text(format(date, 'MMM d'), x - 10, startY + height - 5)
  }

  // Draw axes with labels
  pdf.setDrawColor(200, 200, 200)
  pdf.setLineWidth(0.5)
  pdf.line(20 + padding, startY + height - padding, 20 + width - padding, startY + height - padding) // x-axis
  pdf.line(20 + padding, startY + padding, 20 + padding, startY + height - padding) // y-axis
  
  // Axis labels
  pdf.setFontSize(10)
  pdf.setTextColor(107, 114, 128)
  pdf.text('Mood Level', 10, startY + height/2, { angle: 90 })
  pdf.text('Date', 20 + width/2, startY + height - 2, { align: 'center' })

  // Plot points and trend line
  const points: [number, number][] = []
  let currentDate = new Date(startDate)
  
  while (currentDate <= endDate) {
    const dateStr = format(currentDate, 'yyyy-MM-dd')
    const dayData = data[dateStr]
    if (dayData) {
      const moodLevels = Object.values(dayData).map(entry => entry.level)
      const avgMood = moodLevels.reduce((sum, level) => sum + level, 0) / moodLevels.length
      
      const x = 20 + padding + (differenceInDays(currentDate, startDate) / days) * graphWidth
      const y = startY + height - padding - (avgMood / 5) * graphHeight
      points.push([x, y])
      
      // Add point markers
      pdf.setFillColor(34, 197, 94)
      pdf.circle(x, y, 0.5, 'F')
    }
    currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1))
  }

  // Draw trend line
  if (points.length > 1) {
    pdf.setDrawColor(34, 197, 94)
    pdf.setLineWidth(0.5)
    for (let i = 1; i < points.length; i++) {
      pdf.line(points[i-1][0], points[i-1][1], points[i][0], points[i][1])
    }
  }

  return startY + height + 15 // Increased spacing after graph
}

// Draw mood distribution chart
const drawMoodDistribution = (stats: ReturnType<typeof calculateStats>, pdf: jsPDF, startY: number) => {
  const width = 170
  const height = 60
  const padding = 20
  const barWidth = 20
  const maxCount = Math.max(...Object.values(stats.moodDistribution))
  
  // Draw axes
  pdf.setDrawColor(200, 200, 200)
  pdf.setLineWidth(0.5)
  pdf.line(20 + padding, startY + height - padding, 20 + width - padding, startY + height - padding)
  pdf.line(20 + padding, startY + padding, 20 + padding, startY + height - padding)
  
  // Draw bars
  Object.entries(stats.moodDistribution).forEach(([mood, count], index) => {
    const x = 20 + padding + (index * (barWidth + 10))
    const barHeight = (count / maxCount) * (height - padding * 2)
    
    pdf.setFillColor(34, 197, 94)
    pdf.rect(x, startY + height - padding - barHeight, barWidth, barHeight, 'F')
    
    // Add labels
    pdf.setFontSize(8)
    pdf.setTextColor(75, 85, 99)
    pdf.text(mood, x + barWidth/2, startY + height - 5, { align: 'center' })
    pdf.text(count.toString(), x + barWidth/2, startY + height - padding - barHeight - 5, { align: 'center' })
  })
  
  return startY + height + 15
}

// Draw weekday analysis chart
const drawWeekdayAnalysis = (stats: ReturnType<typeof calculateStats>, pdf: jsPDF, startY: number) => {
  const width = 170
  const height = 60
  const padding = 20
  const barWidth = 20
  
  // Draw axes
  pdf.setDrawColor(200, 200, 200)
  pdf.setLineWidth(0.5)
  pdf.line(20 + padding, startY + height - padding, 20 + width - padding, startY + height - padding)
  pdf.line(20 + padding, startY + padding, 20 + padding, startY + height - padding)
  
  // Draw bars
  stats.weekdayAnalysis.forEach(({ day, avgMood }, index) => {
    const x = 20 + padding + (index * (barWidth + 10))
    const barHeight = (avgMood / 5) * (height - padding * 2)
    
    pdf.setFillColor(34, 197, 94)
    pdf.rect(x, startY + height - padding - barHeight, barWidth, barHeight, 'F')
    
    // Add labels
    pdf.setFontSize(8)
    pdf.setTextColor(75, 85, 99)
    pdf.text(format(new Date(2024, 0, day), 'EEE'), x + barWidth/2, startY + height - 5, { align: 'center' })
    pdf.text(avgMood.toFixed(1), x + barWidth/2, startY + height - padding - barHeight - 5, { align: 'center' })
  })
  
  return startY + height + 15
}

// Enhanced PDF export
const exportAsPDF = async (
  data: MoodData, 
  heatmapRef: React.RefObject<HTMLDivElement>,
  options: ExportOptions,
  setExporting: (exporting: boolean) => void,
  setProgress: (progress: number) => void,
  toast: ReturnType<typeof useToast>['toast']
) => {
  try {
    setExporting(true)
    setProgress(5)
    const pdf = new jsPDF(options.orientation, 'mm', 'a4')
    const stats = calculateStats(data, options.startDate, options.endDate)
    
    // Table of contents entries
    const toc: Array<{ title: string; page: number }> = []
    let currentPage = 1

    // Add header
    pdf.setFillColor(249, 250, 251)
    pdf.rect(0, 0, pdf.internal.pageSize.width, 40, 'F')
    pdf.setDrawColor(229, 231, 235)
    pdf.line(0, 40, pdf.internal.pageSize.width, 40)
    
    pdf.setFontSize(24)
    pdf.setTextColor(17, 24, 39)
    pdf.text('Mood Tracker Report', 20, 25)
    
    pdf.setFontSize(10)
    pdf.setTextColor(107, 114, 128)
    pdf.text(`Generated on ${format(new Date(), 'PPP')}`, 20, 35)
    
    setProgress(15)
    let yPos = 50

    // Add table of contents if enabled
    if (options.includeTableOfContents) {
      pdf.setFontSize(16)
      pdf.setTextColor(31, 41, 55)
      pdf.text('Table of Contents', 20, yPos)
      yPos += 10
      
      // Placeholder for TOC - will be filled later
      const tocStartY = yPos
      yPos += 20 * 6 // Reserve space for TOC entries
      pdf.addPage()
      currentPage++
    }

    // Analysis Period
    toc.push({ title: 'Analysis Period', page: currentPage })
    pdf.setFontSize(14)
    pdf.setTextColor(31, 41, 55)
    pdf.text('Analysis Period', 20, yPos)
    pdf.setFontSize(11)
    pdf.setTextColor(75, 85, 99)
    pdf.text(`${format(options.startDate, 'PPP')} - ${format(options.endDate, 'PPP')}`, 20, yPos + 7)
    yPos += 20

    setProgress(30)

    // Statistics section
    if (options.includeStats) {
      toc.push({ title: 'Key Statistics', page: currentPage })
      pdf.setFontSize(14)
      pdf.setTextColor(31, 41, 55)
      pdf.text('Key Statistics', 20, yPos)
      yPos += 10
      
      const statItems = [
        { label: 'Average Mood', value: `${stats.averageMood}/5.0` },
        { label: 'Total Entries', value: stats.totalEntries.toString() },
        { label: 'Days Tracked', value: stats.trackedDays.toString() },
        { label: 'Tracking Consistency', value: `${stats.consistency.toFixed(1)}%` },
        { label: 'Current Streak', value: `${stats.streaks.current} days` },
        { label: 'Longest Streak', value: `${stats.streaks.longest} days` },
        { label: 'Best Mood Streak', value: `${stats.streaks.bestMood.longest} days` },
        { label: 'Best Day', value: `${format(new Date(stats.bestDay.date), 'PPP')} (${stats.bestDay.mood.toFixed(1)}/5.0)` },
        { label: 'Worst Day', value: `${format(new Date(stats.worstDay.date), 'PPP')} (${stats.worstDay.mood.toFixed(1)}/5.0)` }
      ]

      pdf.setFontSize(10)
      statItems.forEach((item, index) => {
        if (yPos > pdf.internal.pageSize.height - 20) {
          pdf.addPage()
          currentPage++
          yPos = 20
        }
        pdf.setTextColor(75, 85, 99)
        pdf.text(item.label + ':', 25, yPos + (index * 7))
        pdf.setTextColor(31, 41, 55)
        pdf.text(item.value, 80, yPos + (index * 7))
      })
      
      yPos += 70
    }

    setProgress(45)

    // Mood distribution
    if (options.includeMoodDistribution) {
      if (yPos > pdf.internal.pageSize.height - 100) {
        pdf.addPage()
        currentPage++
        yPos = 20
      }
      
      toc.push({ title: 'Mood Distribution', page: currentPage })
      pdf.setFontSize(14)
      pdf.setTextColor(31, 41, 55)
      pdf.text('Mood Distribution', 20, yPos)
      yPos += 10
      yPos = drawMoodDistribution(stats, pdf, yPos)
    }

    setProgress(60)

    // Weekday analysis
    if (options.includeWeekdayAnalysis) {
      if (yPos > pdf.internal.pageSize.height - 100) {
        pdf.addPage()
        currentPage++
        yPos = 20
      }
      
      toc.push({ title: 'Weekday Analysis', page: currentPage })
      pdf.setFontSize(14)
      pdf.setTextColor(31, 41, 55)
      pdf.text('Weekday Analysis', 20, yPos)
      yPos += 10
      yPos = drawWeekdayAnalysis(stats, pdf, yPos)
    }

    setProgress(75)

    // Mood trend graph
    if (options.includeMoodGraph) {
      if (yPos > pdf.internal.pageSize.height - 100) {
        pdf.addPage()
        currentPage++
        yPos = 20
      }
      
      toc.push({ title: 'Mood Trend', page: currentPage })
      pdf.setFontSize(14)
      pdf.setTextColor(31, 41, 55)
      pdf.text('Mood Trend', 20, yPos)
      yPos += 10
      yPos = drawMoodTrendGraph(data, options.startDate, options.endDate, pdf, yPos)
    }

    setProgress(85)

    // Heatmap visualization
    if (options.includeHeatmap && heatmapRef.current) {
      if (yPos > pdf.internal.pageSize.height - 120) {
        pdf.addPage()
        currentPage++
        yPos = 20
      }

      toc.push({ title: 'Mood Heatmap', page: currentPage })
      pdf.setFontSize(14)
      pdf.setTextColor(31, 41, 55)
      pdf.text('Mood Heatmap', 20, yPos)
      yPos += 10

      const canvas = await html2canvas(heatmapRef.current)
      const imgData = canvas.toDataURL('image/png')
      pdf.addImage(imgData, 'PNG', 20, yPos, 170, 100)
      yPos += 110
    }

    setProgress(90)

    // Detailed entries
    if (options.includeNotes) {
      if (yPos > pdf.internal.pageSize.height - 40) {
        pdf.addPage()
        currentPage++
        yPos = 20
      }

      toc.push({ title: 'Detailed Mood Entries', page: currentPage })
      pdf.setFontSize(14)
      pdf.setTextColor(31, 41, 55)
      pdf.text('Detailed Mood Entries', 20, yPos)
      yPos += 10

      pdf.setFontSize(10)
      Object.entries(data)
        .filter(([date]) => {
          const currentDate = new Date(date)
          return currentDate >= options.startDate && currentDate <= options.endDate
        })
        .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
        .forEach(([date, entries]) => {
          if (yPos > pdf.internal.pageSize.height - 20) {
            pdf.addPage()
            currentPage++
            yPos = 20
          }

          pdf.setTextColor(31, 41, 55)
          pdf.setFontSize(11)
          pdf.text(format(new Date(date), 'PPPP'), 20, yPos)
          yPos += 5

          Object.entries(entries).forEach(([time, entry]) => {
            if (yPos > pdf.internal.pageSize.height - 15) {
              pdf.addPage()
              currentPage++
              yPos = 20
            }

            pdf.setTextColor(75, 85, 99)
            pdf.setFontSize(10)
            pdf.text(`${time} - Mood Level: ${entry.level}${entry.note ? ` - ${entry.note}` : ''}`, 25, yPos)
            yPos += 5
          })
          yPos += 2
        })
    }

    setProgress(95)

    // Fill in table of contents if enabled
    if (options.includeTableOfContents) {
      pdf.setPage(1)
      let tocY = 60
      
      pdf.setFontSize(10)
      toc.forEach(entry => {
        pdf.setTextColor(75, 85, 99)
        pdf.text(entry.title, 25, tocY)
        pdf.setTextColor(31, 41, 55)
        pdf.text(entry.page.toString(), 180, tocY, { align: 'right' })
        pdf.setDrawColor(229, 231, 235)
        pdf.line(25, tocY + 2, 180, tocY + 2)
        tocY += 10
      })
    }

    // Add page numbers
    const pageCount = pdf.internal.pages.length - 1
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i)
      pdf.setFontSize(10)
      pdf.setTextColor(156, 163, 175)
      pdf.text(
        `Page ${i} of ${pageCount}`,
        pdf.internal.pageSize.width / 2,
        pdf.internal.pageSize.height - 10,
        { align: 'center' }
      )
    }

    setProgress(100)
    pdf.save(getExportFileName(options.fileName, 'pdf'))
    
    toast({
      title: "Export Successful",
      description: "Your mood data has been exported as PDF",
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    toast({
      variant: "destructive",
      title: "Export Failed",
      description: "There was an error exporting your mood data",
      action: <ToastAction altText="Try again">Try again</ToastAction>,
    })
  } finally {
    setExporting(false)
    setProgress(0)
  }
}

// Enhanced export functions with proper file extensions
const getExportFileName = (baseFileName: string, type: 'json' | 'csv' | 'pdf') => {
  const name = baseFileName.replace(/\.(json|csv|pdf)$/i, '')
  return `${name}.${type}`
}

// Enhanced JSON export with error handling
const exportAsJSON = async (
  data: MoodData, 
  options: ExportOptions,
  setExporting: (exporting: boolean) => void,
  toast: ReturnType<typeof useToast>['toast']
) => {
  try {
    setExporting(true)
    const filteredData = Object.entries(data)
      .filter(([date]) => {
        const currentDate = new Date(date)
        return currentDate >= options.startDate && currentDate <= options.endDate
      })
      .reduce((acc, [date, entries]) => {
        acc[date] = entries
        return acc
      }, {} as MoodData)

    const jsonString = JSON.stringify(filteredData, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = getExportFileName(options.fileName, 'json')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    toast({
      title: "Export Successful",
      description: "Your mood data has been exported as JSON",
    })
  } catch (error) {
    console.error('Error exporting JSON:', error)
    toast({
      variant: "destructive",
      title: "Export Failed",
      description: "There was an error exporting your mood data",
      action: <ToastAction altText="Try again">Try again</ToastAction>,
    })
  } finally {
    setExporting(false)
  }
}

// Data validation functions
const validateExportOptions = (options: ExportOptions): string[] => {
  const errors: string[] = []
  
  if (options.startDate > options.endDate) {
    errors.push('Start date must be before end date')
  }
  
  if (!options.fileName.trim()) {
    errors.push('File name is required')
  }
  
  if (options.scheduledExport?.enabled && !options.scheduledExport.time) {
    errors.push('Export time is required for scheduled exports')
  }
  
  return errors
}

// Sanitize file name
const sanitizeFileName = (fileName: string): string => {
  return fileName
    .replace(/[<>:"/\\|?*]/g, '_') // Replace invalid characters
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .trim()
}

// Preview functions
const generateCSVPreview = (data: MoodData, options: ExportOptions): string => {
  const rows: string[][] = []
  if (options.csvOptions.includeHeaders) {
    rows.push(['Date', 'Time of Day', 'Mood Level', 'Note'])
  }
  
  Object.entries(data)
    .slice(0, 5) // Preview first 5 entries
    .forEach(([date, entries]) => {
      Object.entries(entries).forEach(([timeOfDay, entry]) => {
        try {
          const currentDate = new Date(date)
          if (isNaN(currentDate.getTime())) {
            console.error(`Invalid date: ${date}`)
            return
          }

          const formattedDate = format(currentDate, options.csvOptions.dateFormat)
          const row = [
            formattedDate,
            timeOfDay,
            entry.level.toString(),
            entry.note || ''
          ]
          
          if (options.csvOptions.quoteStrings) {
            rows.push(row.map(cell => `"${cell.replace(/"/g, '""')}"`))
          } else {
            rows.push(row)
          }
        } catch (error) {
          console.error(`Error processing entry for preview:`, error)
        }
      })
    })
  
  return rows.map(row => row.join(options.csvOptions.delimiter)).join('\n')
}

// Enhanced CSV export
const exportAsCSV = async (
  data: MoodData, 
  options: ExportOptions,
  setExporting: (exporting: boolean) => void,
  toast: ReturnType<typeof useToast>['toast']
) => {
  try {
    setExporting(true)
    
    // Validate options
    const errors = validateExportOptions(options)
    if (errors.length > 0) {
      toast({
        variant: "destructive",
        title: "Invalid Export Options",
        description: errors.join('. '),
      })
      return
    }
    
    const rows: string[][] = []
    if (options.csvOptions.includeHeaders) {
      rows.push(['Date', 'Time of Day', 'Mood Level', 'Note'])
    }
    
    Object.entries(data)
      .filter(([date]) => {
        const currentDate = new Date(date)
        return currentDate >= options.startDate && currentDate <= options.endDate
      })
      .forEach(([date, entries]) => {
        Object.entries(entries).forEach(([timeOfDay, entry]) => {
          try {
            const currentDate = new Date(date)
            if (isNaN(currentDate.getTime())) {
              console.error(`Invalid date: ${date}`)
              return
            }

            const formattedDate = format(currentDate, options.csvOptions.dateFormat)
            const row = [
              formattedDate,
              timeOfDay,
              entry.level.toString(),
              entry.note || ''
            ]
            
            if (options.csvOptions.quoteStrings) {
              rows.push(row.map(cell => `"${cell.replace(/"/g, '""')}"`))
            } else {
              rows.push(row)
            }
          } catch (error) {
            console.error(`Error processing entry for date ${date}:`, error)
          }
        })
      })
    
    const csvContent = rows.map(row => row.join(options.csvOptions.delimiter)).join('\n')
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { 
      type: `text/csv;charset=${options.csvOptions.encoding}` 
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = sanitizeFileName(getExportFileName(options.fileName, 'csv'))
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    toast({
      title: "Export Successful",
      description: "Your mood data has been exported as CSV",
    })
  } catch (error) {
    console.error('Error exporting CSV:', error)
    toast({
      variant: "destructive",
      title: "Export Failed",
      description: "There was an error exporting your mood data",
      action: <ToastAction altText="Try again">Try again</ToastAction>,
    })
  } finally {
    setExporting(false)
  }
}

export function MoodHeatmap({ moodData }: MoodHeatmapProps) {
  const { theme } = useTheme()
  const [viewMode, setViewMode] = useState<'calendar' | 'compact'>('calendar')
  const [selectedStartDate, setSelectedStartDate] = useState<Date>(subMonths(new Date(), 6))
  const [selectedEndDate, setSelectedEndDate] = useState<Date>(new Date())
  const heatmapRef = React.useRef<HTMLDivElement>(null)
  const [exporting, setExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const { toast } = useToast()
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    startDate: subMonths(new Date(), 6),
    endDate: new Date(),
    fileName: `mood-tracker-export-${format(new Date(), 'yyyy-MM-dd')}.pdf`,
    includeStats: true,
    includeNotes: true,
    includeMoodGraph: true,
    includeHeatmap: true,
    orientation: 'portrait',
    includeTableOfContents: true,
    includeMoodDistribution: true,
    includeWeekdayAnalysis: true,
    csvDateFormat: 'yyyy-MM-dd',
    csvDelimiter: ',',
    csvOptions: {
      delimiter: ',',
      dateFormat: 'yyyy-MM-dd',
      timeFormat: 'HH:mm',
      includeHeaders: true,
      quoteStrings: true,
      encoding: 'UTF-8'
    },
    scheduledExport: {
      enabled: false,
      frequency: 'monthly',
      time: '00:00',
      format: 'pdf'
    }
  })
  
  // Preview state
  const [previewContent, setPreviewContent] = useState<string>('')
  
  // Update preview when options change
  useEffect(() => {
    if (exportOptions.csvOptions) {
      setPreviewContent(generateCSVPreview(moodData, exportOptions))
    }
  }, [exportOptions.csvOptions, moodData])

  const heatmapData = useMemo(() => {
    // Generate all dates in the interval
    const dates = eachDayOfInterval({ start: selectedStartDate, end: selectedEndDate })
    
    // Create month groups
    const monthGroups = dates.reduce((acc, date) => {
      const monthKey = format(date, 'MMM yyyy')
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthKey,
          days: []
        }
      }
      
      const dateStr = format(date, 'yyyy-MM-dd')
      const dayMoods = moodData[dateStr] || {}
      
      // Calculate average mood for the day
      const moodLevels = Object.values(dayMoods).map(entry => entry.level)
      const avgMood = moodLevels.length 
        ? moodLevels.reduce((sum, level) => sum + level, 0) / moodLevels.length
        : 0
      
      acc[monthKey].days.push({
        date,
        dateStr,
        dayOfMonth: date.getDate(),
        dayOfWeek: date.getDay(),
        avgMood,
        entries: Object.entries(dayMoods).length
      })
      
      return acc
    }, {} as Record<string, { month: string; days: Array<{
      date: Date;
      dateStr: string;
      dayOfMonth: number;
      dayOfWeek: number;
      avgMood: number;
      entries: number;
    }> }>)
    
    return Object.values(monthGroups)
  }, [moodData, selectedStartDate, selectedEndDate])

  // Theme-aware colors
  const themeColors = {
    light: {
      excellent: 'bg-[hsl(var(--mood-5))] hover:bg-[hsl(var(--mood-5))] text-primary-foreground',
      good: 'bg-[hsl(var(--mood-4))] hover:bg-[hsl(var(--mood-4))] text-primary-foreground',
      okay: 'bg-[hsl(var(--mood-3))] hover:bg-[hsl(var(--mood-3))] text-primary-foreground',
      bad: 'bg-[hsl(var(--mood-2))] hover:bg-[hsl(var(--mood-2))] text-primary-foreground',
      veryBad: 'bg-[hsl(var(--mood-1))] hover:bg-[hsl(var(--mood-1))] text-primary-foreground',
      empty: 'bg-muted/30 hover:bg-muted/40 border-border'
    },
    dark: {
      excellent: 'bg-[hsl(var(--mood-5))] hover:bg-[hsl(var(--mood-5))] text-primary-foreground',
      good: 'bg-[hsl(var(--mood-4))] hover:bg-[hsl(var(--mood-4))] text-primary-foreground',
      okay: 'bg-[hsl(var(--mood-3))] hover:bg-[hsl(var(--mood-3))] text-primary-foreground',
      bad: 'bg-[hsl(var(--mood-2))] hover:bg-[hsl(var(--mood-2))] text-primary-foreground',
      veryBad: 'bg-[hsl(var(--mood-1))] hover:bg-[hsl(var(--mood-1))] text-primary-foreground',
      empty: 'bg-muted/40 hover:bg-muted/50 border-border'
    }
  }

  const getIntensityColor = (avgMood: number) => {
    const colors = theme === 'dark' ? themeColors.dark : themeColors.light
    if (avgMood === 0) return cn('empty-box', colors.empty)
    
    if (avgMood >= 4.5) return cn('mood-box', colors.excellent)
    if (avgMood >= 3.5) return cn('mood-box', colors.good)
    if (avgMood >= 2.5) return cn('mood-box', colors.okay)
    if (avgMood >= 1.5) return cn('mood-box', colors.bad)
    return cn('mood-box', colors.veryBad)
  }

  return (
    <div className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-xl overflow-auto",
    )}>
      <div className="rounded-lg border bg-card text-card-foreground shadow-xl">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Calendar className="h-5 w-5" />
                Mood Heatmap
              </CardTitle>
              <Badge variant="secondary" className="text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                Interactive
              </Badge>
            </div>
            
            <div className="flex gap-2">
              {/* Date Range Selection */}
              <div className="flex items-center gap-2">
                <DatePicker
                  date={selectedStartDate}
                  onDateChange={(date) => setSelectedStartDate(date || subMonths(new Date(), 6))}
                />
                <span>to</span>
                <DatePicker
                  date={selectedEndDate}
                  onDateChange={(date) => setSelectedEndDate(date || new Date())}
                />
              </div>

              <Tabs 
                value={viewMode} 
                onValueChange={(value) => setViewMode(value as 'calendar' | 'compact')}
                className="w-[200px]"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="calendar">Calendar</TabsTrigger>
                  <TabsTrigger value="compact">Compact</TabsTrigger>
                </TabsList>
              </Tabs>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Export
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>Export Settings</DialogTitle>
                    <DialogDescription>
                      Configure your export preferences
                    </DialogDescription>
                  </DialogHeader>
                  <Tabs defaultValue="general">
                    <TabsList className="bg-muted">
                      <TabsTrigger value="general">General</TabsTrigger>
                      <TabsTrigger value="templates">Templates</TabsTrigger>
                      <TabsTrigger value="csv">CSV Options</TabsTrigger>
                      <TabsTrigger value="schedule">Schedule</TabsTrigger>
                      <TabsTrigger value="preview">Preview</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="general">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Start Date</Label>
                            <DatePicker
                              date={exportOptions.startDate}
                              onDateChange={(date) => 
                                setExportOptions(prev => ({ ...prev, startDate: date || prev.startDate }))
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>End Date</Label>
                            <DatePicker
                              date={exportOptions.endDate}
                              onDateChange={(date) => 
                                setExportOptions(prev => ({ ...prev, endDate: date || prev.endDate }))
                              }
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>File Name</Label>
                          <Input
                            value={exportOptions.fileName}
                            onChange={(e) => 
                              setExportOptions(prev => ({ ...prev, fileName: e.target.value }))
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-base">PDF Options</Label>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Orientation</Label>
                              <select
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                value={exportOptions.orientation}
                                onChange={(e) => 
                                  setExportOptions(prev => ({ 
                                    ...prev, 
                                    orientation: e.target.value as 'portrait' | 'landscape' 
                                  }))
                                }
                              >
                                <option value="portrait">Portrait</option>
                                <option value="landscape">Landscape</option>
                              </select>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-base">Content Options</Label>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="includeStats"
                                checked={exportOptions.includeStats}
                                onChange={(e) => 
                                  setExportOptions(prev => ({ ...prev, includeStats: e.target.checked }))
                                }
                                className="h-4 w-4 rounded border-gray-300"
                              />
                              <Label htmlFor="includeStats">Statistics</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="includeNotes"
                                checked={exportOptions.includeNotes}
                                onChange={(e) => 
                                  setExportOptions(prev => ({ ...prev, includeNotes: e.target.checked }))
                                }
                                className="h-4 w-4 rounded border-gray-300"
                              />
                              <Label htmlFor="includeNotes">Notes</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="includeMoodGraph"
                                checked={exportOptions.includeMoodGraph}
                                onChange={(e) => 
                                  setExportOptions(prev => ({ ...prev, includeMoodGraph: e.target.checked }))
                                }
                                className="h-4 w-4 rounded border-gray-300"
                              />
                              <Label htmlFor="includeMoodGraph">Mood Graph</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="includeHeatmap"
                                checked={exportOptions.includeHeatmap}
                                onChange={(e) => 
                                  setExportOptions(prev => ({ ...prev, includeHeatmap: e.target.checked }))
                                }
                                className="h-4 w-4 rounded border-gray-300"
                              />
                              <Label htmlFor="includeHeatmap">Heatmap</Label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="templates">
                      <div className="space-y-4">
                        <Label>Export Templates</Label>
                        <div className="grid gap-4">
                          {exportTemplates.map(template => (
                            <div
                              key={template.name}
                              className="flex items-start space-x-4 p-4 rounded-lg border cursor-pointer hover:bg-gray-50"
                              onClick={() => setExportOptions(prev => ({
                                ...prev,
                                ...template.options
                              }))}
                            >
                              <div>
                                <h4 className="font-medium">{template.name}</h4>
                                <p className="text-sm text-gray-500">{template.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="csv">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Delimiter</Label>
                            <Select
                              value={exportOptions.csvOptions.delimiter}
                              onValueChange={(value: ',' | ';' | '\t') => 
                                setExportOptions(prev => ({
                                  ...prev,
                                  csvOptions: { ...prev.csvOptions, delimiter: value }
                                }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value=",">Comma (,)</SelectItem>
                                <SelectItem value=";">Semicolon (;)</SelectItem>
                                <SelectItem value="\t">Tab</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Encoding</Label>
                            <Select
                              value={exportOptions.csvOptions.encoding}
                              onValueChange={(value: 'UTF-8' | 'UTF-16') => 
                                setExportOptions(prev => ({
                                  ...prev,
                                  csvOptions: { ...prev.csvOptions, encoding: value }
                                }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="UTF-8">UTF-8</SelectItem>
                                <SelectItem value="UTF-16">UTF-16</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Date Format</Label>
                          <Input
                            value={exportOptions.csvOptions.dateFormat}
                            onChange={(e) => 
                              setExportOptions(prev => ({
                                ...prev,
                                csvOptions: { ...prev.csvOptions, dateFormat: e.target.value }
                              }))
                            }
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Time Format</Label>
                          <Input
                            value={exportOptions.csvOptions.timeFormat}
                            onChange={(e) => 
                              setExportOptions(prev => ({
                                ...prev,
                                csvOptions: { ...prev.csvOptions, timeFormat: e.target.value }
                              }))
                            }
                          />
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={exportOptions.csvOptions.includeHeaders}
                            onCheckedChange={(checked) => 
                              setExportOptions(prev => ({
                                ...prev,
                                csvOptions: { ...prev.csvOptions, includeHeaders: checked }
                              }))
                            }
                          />
                          <Label>Include Headers</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={exportOptions.csvOptions.quoteStrings}
                            onCheckedChange={(checked) => 
                              setExportOptions(prev => ({
                                ...prev,
                                csvOptions: { ...prev.csvOptions, quoteStrings: checked }
                              }))
                            }
                          />
                          <Label>Quote Strings</Label>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="schedule">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={exportOptions.scheduledExport?.enabled}
                            onCheckedChange={(checked) => 
                              setExportOptions(prev => ({
                                ...prev,
                                scheduledExport: {
                                  ...prev.scheduledExport!,
                                  enabled: checked
                                }
                              }))
                            }
                          />
                          <Label>Enable Scheduled Export</Label>
                        </div>
                        
                        {exportOptions.scheduledExport?.enabled && (
                          <>
                            <div className="space-y-2">
                              <Label>Frequency</Label>
                              <Select
                                value={exportOptions.scheduledExport.frequency}
                                onValueChange={(value: 'daily' | 'weekly' | 'monthly') => 
                                  setExportOptions(prev => ({
                                    ...prev,
                                    scheduledExport: {
                                      ...prev.scheduledExport!,
                                      frequency: value
                                    }
                                  }))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="daily">Daily</SelectItem>
                                  <SelectItem value="weekly">Weekly</SelectItem>
                                  <SelectItem value="monthly">Monthly</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Time</Label>
                              <Input
                                type="time"
                                value={exportOptions.scheduledExport.time}
                                onChange={(e) => 
                                  setExportOptions(prev => ({
                                    ...prev,
                                    scheduledExport: {
                                      ...prev.scheduledExport!,
                                      time: e.target.value
                                    }
                                  }))
                                }
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Format</Label>
                              <Select
                                value={exportOptions.scheduledExport.format}
                                onValueChange={(value: 'pdf' | 'csv' | 'json') => 
                                  setExportOptions(prev => ({
                                    ...prev,
                                    scheduledExport: {
                                      ...prev.scheduledExport!,
                                      format: value
                                    }
                                  }))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pdf">PDF</SelectItem>
                                  <SelectItem value="csv">CSV</SelectItem>
                                  <SelectItem value="json">JSON</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </>
                        )}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="preview">
                      <div className="space-y-4">
                        <div className="rounded-lg border border-border bg-muted/50 p-4">
                          <pre className="text-sm overflow-auto max-h-[300px] text-foreground">
                            {previewContent}
                          </pre>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          This is a preview of the first 5 entries with your current export settings.
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
                  
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportAsJSON(moodData, exportOptions, setExporting, toast)}
                      className="flex items-center gap-2"
                      disabled={exporting}
                      aria-label="Export as JSON"
                    >
                      {exporting ? (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      ) : (
                        <Download className="h-4 w-4" aria-hidden="true" />
                      )}
                      <span>JSON</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportAsCSV(moodData, exportOptions, setExporting, toast)}
                      className="flex items-center gap-2"
                      disabled={exporting}
                      aria-label="Export as CSV"
                    >
                      {exporting ? (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      ) : (
                        <Download className="h-4 w-4" aria-hidden="true" />
                      )}
                      <span>CSV</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportAsPDF(moodData, heatmapRef, exportOptions, setExporting, setExportProgress, toast)}
                      className="flex items-center gap-2"
                      disabled={exporting}
                      aria-label="Export as PDF"
                    >
                      {exporting ? (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      ) : (
                        <Download className="h-4 w-4" aria-hidden="true" />
                      )}
                      <span>PDF</span>
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <CardDescription className="flex items-center gap-2">
            Mood intensity visualization
            <Badge variant="outline" className="text-xs">
              {format(selectedStartDate, 'MMM yyyy')} - {format(selectedEndDate, 'MMM yyyy')}
            </Badge>
          </CardDescription>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => {}}
              >
                Time Patterns
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => {}}
              >
                Insights
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="p-6 pt-0" ref={heatmapRef}>
            <div className={cn(
              "transition-all duration-300",
              viewMode === 'calendar' ? "max-h-[700px]" : "max-h-[500px]",
              "min-h-[300px]",
              "overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
            )}>
              <div className={cn(
                "grid gap-8 p-4",
                viewMode === 'calendar' ? "grid-cols-1 lg:grid-cols-4" : "grid-cols-1 lg:grid-cols-3"
              )}>
                {heatmapData.map(({ month, days }) => (
                  <motion.div
                    key={month}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                    layout
                  >
                    <h3 className="text-lg font-semibold text-foreground px-1">
                      {month}
                    </h3>
                    
                    <div className={cn(
                      "grid gap-2",
                      viewMode === 'calendar' ? "grid-cols-7" : "grid-cols-7",
                      "auto-rows-fr bg-card/50 p-3 rounded-lg border border-border/50"
                    )}>
                      {/* Day cells */}
                      {(() => {
                        const firstDay = days[0].date
                        const startOffset = firstDay.getDay()
                        
                        // Empty cells for start of month
                        const emptyCells = Array.from({ length: startOffset }).map((_, i) => (
                          <div key={`empty-start-${i}`} className="empty-box" />
                        ))
                        
                        // Day cells
                        const dayCells = days.map(day => {
                          const dateStr = format(day.date, 'yyyy-MM-dd')
                          return (
                            <motion.div
                              key={dateStr}
                              whileHover={{ scale: 1.05, zIndex: 20 }}
                              className="relative group"
                            >
                              <div
                                className={cn(
                                  getIntensityColor(day.avgMood || 0),
                                  "focus-ring w-full h-full min-h-[32px]"
                                )}
                                role="gridcell"
                                aria-label={`${format(day.date, 'MMMM d, yyyy')} - ${
                                  day.entries 
                                    ? `Mood: ${day.avgMood.toFixed(1)}, Entries: ${day.entries}`
                                    : 'No entries'
                                }`}
                              >
                                <span className="text-xs font-medium">{day.dayOfMonth}</span>
                              </div>
                              
                              {/* Tooltip */}
                              <div className="mood-tooltip">
                                <div className="font-semibold text-foreground">
                                  {format(day.date, 'EEEE')}
                                </div>
                                <div className="font-medium text-foreground">
                                  {format(day.date, 'MMMM d, yyyy')}
                                </div>
                                <div className="text-muted-foreground mt-1">
                                  {day.entries ? (
                                    <>
                                      <span className="font-medium">Mood: {day.avgMood.toFixed(1)}</span>
                                      <br />
                                      <span>Entries: {day.entries}</span>
                                    </>
                                  ) : (
                                    'No entries'
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )
                        })
                        
                        return [...emptyCells, ...dayCells]
                      })()}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            {/* Enhanced Legend */}
            <div className="mt-6 mood-legend">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="mood-legend-item">
                  <div className="w-5 h-5 rounded-md empty-box" />
                  <span className="text-sm font-medium text-muted-foreground">No entries</span>
                </div>
                {[
                  { level: 1, label: 'Very Bad' },
                  { level: 2, label: 'Bad' },
                  { level: 3, label: 'Okay' },
                  { level: 4, label: 'Good' },
                  { level: 5, label: 'Excellent' },
                ].map(({ level, label }) => (
                  <div key={label} className="mood-legend-item">
                    <div className={cn(
                      'w-5 h-5 rounded-md mood-box',
                      `bg-[hsl(var(--mood-${level}))]`
                    )} />
                    <span className="text-sm font-medium text-muted-foreground">{label}</span>
                  </div>
                ))}
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2 focus-ring"
              >
                <Share2 className="h-4 w-4" />
                Share Insights
              </Button>
            </div>
          </div>
        </CardContent>
      </div>
      {exporting && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 max-w-sm w-full mx-4 border border-border shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Exporting Data</h3>
            <Progress 
              value={exportProgress} 
              className="mb-2" 
              aria-label="Export progress"
              title="Export progress"
            />
            <p className="text-sm text-muted-foreground">
              {exportProgress < 100 ? 'Please wait while we prepare your export...' : 'Almost done!'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
} 