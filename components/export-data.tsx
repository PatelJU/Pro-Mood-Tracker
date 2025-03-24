"use client"

import React, { useRef, useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Download, Loader2, Settings2 } from 'lucide-react'
import { MoodData, MoodLevel, moodDescriptions } from "../types/mood"
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { format, subMonths } from 'date-fns'
import { useToast } from "@/components/ui/use-toast"
import { Progress } from "@/components/ui/progress"
import domtoimage from 'dom-to-image-more'
import { saveAs } from 'file-saver'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface ExportDataProps {
  moodData: MoodData
  containerRef: React.RefObject<HTMLDivElement>
}

interface ExportSettings {
  startDate: Date
  endDate: Date
  fileName: string
  orientation: 'portrait' | 'landscape'
  quality: 'standard' | 'high' | 'ultra'
  includeStatistics: boolean
  includeMoodGraph: boolean
  includeNotes: boolean
  includeHeatmap: boolean
}

interface QualitySettings {
  scale: number
}

export function ExportData({ moodData, containerRef }: ExportDataProps) {
  const { toast } = useToast()
  const [exporting, setExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [settings, setSettings] = useState<ExportSettings>({
    startDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), // 6 months ago
    endDate: new Date(),
    fileName: `mood-tracker-export-${new Date().toISOString().split('T')[0]}.pdf`,
    orientation: 'portrait',
    quality: 'high',
    includeStatistics: true,
    includeMoodGraph: true,
    includeNotes: true,
    includeHeatmap: true,
  })

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  const getQualitySettings = (quality: 'standard' | 'high' | 'ultra'): QualitySettings => {
    switch (quality) {
      case 'ultra':
        return { scale: window.devicePixelRatio * 4 }
      case 'high':
        return { scale: window.devicePixelRatio * 2 }
      default:
        return { scale: window.devicePixelRatio }
    }
  }

  const captureComponentAsPNG = async (element: HTMLElement): Promise<string | null> => {
    try {
      const qualitySettings = getQualitySettings(settings.quality)
      
      // Prepare element for high-quality capture
      const originalTransform = element.style.transform
      const originalOpacity = element.style.opacity
      element.style.transform = 'none'
      element.style.opacity = '1'
      
      // Attempt to use dom-to-image first
      const dataUrl = await domtoimage.toPng(element, {
        scale: qualitySettings.scale,
        cacheBust: true,
        style: {
          transform: 'none',
          opacity: '1'
        }
      })
      
      // Reset element styles
      element.style.transform = originalTransform
      element.style.opacity = originalOpacity
      
      return dataUrl
    } catch (error) {
      console.error('dom-to-image failed, falling back to html2canvas:', error)
      try {
        const qualitySettings = getQualitySettings(settings.quality)
        const canvas = await html2canvas(element, {
          scale: qualitySettings.scale,
          useCORS: true,
          logging: false,
          allowTaint: true,
          backgroundColor: '#ffffff'
        })
        return canvas.toDataURL('image/png')
      } catch (error) {
        console.error('html2canvas also failed:', error)
        return null
      }
    }
  }

  const calculateMoodStats = (data: MoodData) => {
    let totalMoods = 0
    let moodSum = 0
    const moodCounts: Record<MoodLevel, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    
    Object.values(data).forEach(entries => {
      Object.values(entries).forEach(entry => {
        totalMoods++
        moodSum += entry.level
        moodCounts[entry.level as MoodLevel]++
      })
    })

    const averageMood = totalMoods > 0 ? moodSum / totalMoods : 0
    return { averageMood, moodCounts, totalEntries: totalMoods }
  }

  const exportAsPDF = async () => {
    if (!containerRef.current) {
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Could not find components to export",
      })
      return
    }

    try {
      setExporting(true)
      setExportProgress(5)

      const scrollPos = window.scrollY

      // Create PDF with enhanced quality settings
      const pdf = new jsPDF({
        orientation: settings.orientation,
        unit: 'mm',
        format: 'a4',
        compress: true,
        hotfixes: ["px_scaling"],
        precision: 16
      })

      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 20
      let yPos = margin

      // Title Page with better formatting
      pdf.setFontSize(24)
      pdf.setTextColor(0, 0, 0)
      pdf.text('Mood Tracker Report', margin, yPos, { baseline: 'top' })
      yPos += 15

      pdf.setFontSize(12)
      pdf.setTextColor(100, 100, 100)
      pdf.text(`Generated on ${format(new Date(), 'PPP')}`, margin, yPos, { baseline: 'top' })
      yPos += 20

      // Add Summary Statistics
      const stats = calculateMoodStats(moodData)
      pdf.setFontSize(16)
      pdf.setTextColor(0, 0, 0)
      pdf.text('Summary Statistics', margin, yPos)
      yPos += 10

      pdf.setFontSize(12)
      pdf.text(`Total Entries: ${stats.totalEntries}`, margin + 5, yPos)
      yPos += 8
      pdf.text(`Average Mood: ${stats.averageMood.toFixed(2)}`, margin + 5, yPos)
      yPos += 8

      pdf.text('Mood Distribution:', margin + 5, yPos)
      yPos += 8
      Object.entries(stats.moodCounts).forEach(([level, count]) => {
        const percentage = ((count / stats.totalEntries) * 100).toFixed(1)
        pdf.text(`${moodDescriptions[level as unknown as MoodLevel]}: ${count} (${percentage}%)`, margin + 10, yPos)
        yPos += 6
      })

      setExportProgress(20)

      // Find all visualization components
      const components = Array.from(containerRef.current.querySelectorAll('.visualization-component'))
      const totalComponents = components.length
      let currentComponent = 0

      // Process components one at a time for better quality
      for (const component of components) {
        try {
          // Ensure component is visible and rendered
          component.scrollIntoView({ behavior: 'auto', block: 'start' })
          await delay(1000) // Longer delay for better rendering

          // Capture with high quality
          const imgData = await captureComponentAsPNG(component as HTMLElement)
          if (imgData) {
            pdf.addPage()
            yPos = margin

            // Add component title
            const title = component.getAttribute('data-title') || 'Visualization'
            pdf.setFontSize(16)
            pdf.setTextColor(0, 0, 0)
            pdf.text(title, margin, yPos, { baseline: 'top' })
            yPos += 10

            // Calculate optimal image dimensions
            const imgWidth = pageWidth - (margin * 2)
            const imgHeight = (imgWidth * 0.6)

            // Add the image with high quality settings
            try {
              pdf.addImage(imgData, 'PNG', margin, yPos, imgWidth, imgHeight, undefined, 'FAST', 0)
            } catch (imgError) {
              console.error('Error adding image to PDF:', imgError)
              pdf.text('Error: Could not add visualization', margin, yPos)
            }

            yPos += imgHeight + margin
          }

          currentComponent++
          setExportProgress(20 + ((60 / totalComponents) * currentComponent))
        } catch (componentError) {
          console.error('Error processing component:', componentError)
          continue
        }

        await delay(500) // Delay between components
      }

      // Restore scroll position
      window.scrollTo(0, scrollPos)

      setExportProgress(90)

      // Add page numbers with better formatting
      const pageCount = (pdf as any).internal.pages.length
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i)
        pdf.setFontSize(10)
        pdf.setTextColor(150, 150, 150)
        pdf.text(
          `Page ${i} of ${pageCount}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center', baseline: 'bottom' }
        )
      }

      setExportProgress(95)

      // Save with optimal quality
      try {
        pdf.save(settings.fileName, { returnPromise: true })
      } catch (saveError) {
        console.error('Direct save failed, trying blob method:', saveError)
        try {
          const blob = pdf.output('blob')
          saveAs(blob, settings.fileName)
        } catch (blobError) {
          console.error('Blob save failed, trying data URL method:', blobError)
          const dataUri = pdf.output('datauristring')
          const link = document.createElement('a')
          link.href = dataUri
          link.download = settings.fileName
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }
      }

      setExportProgress(100)
      toast({
        title: "Export Successful",
        description: "Your high-quality mood report has been exported as PDF",
      })
    } catch (error) {
      console.error('Error exporting PDF:', error)
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "There was an error generating your report. Please try again.",
      })
    } finally {
      setExporting(false)
      setExportProgress(0)
      window.scrollTo(0, 0)
    }
  }

  const exportAsJSON = async () => {
    try {
      setExporting(true)
      const jsonString = JSON.stringify(moodData, null, 2)
      const blob = new Blob([jsonString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = settings.fileName
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
        description: "There was an error exporting your data",
      })
    } finally {
      setExporting(false)
    }
  }

  const exportAsCSV = async () => {
    try {
      setExporting(true)
      const rows = [['Date', 'Time of Day', 'Mood Level', 'Mood Description', 'Note', 'Sleep Quality', 'Symptoms', 'Triggers']]
      
      Object.entries(moodData).forEach(([date, entries]) => {
        Object.entries(entries).forEach(([timeOfDay, entry]) => {
          const symptoms = entry.questionnaire?.symptoms 
            ? Object.entries(entry.questionnaire.symptoms)
                .filter(([_, active]) => active)
                .map(([symptom]) => symptom)
                .join('; ')
            : ''
            
          const triggers = entry.questionnaire?.triggers
            ? Object.entries(entry.questionnaire.triggers)
                .filter(([_, active]) => active)
                .map(([trigger]) => trigger)
                .join('; ')
            : ''
            
          rows.push([
            format(new Date(date), 'PPP'),
            timeOfDay,
            entry.level.toString(),
            moodDescriptions[entry.level as MoodLevel],
            entry.note || '',
            entry.questionnaire?.sleepQuality || '',
            symptoms,
            triggers
          ])
        })
      })
      
      const csvContent = rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = settings.fileName
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
        description: "There was an error exporting your data",
      })
    } finally {
      setExporting(false)
    }
  }

  const handleDateChange = (type: 'start' | 'end', date: Date | undefined) => {
    if (date) {
      setSettings(prev => ({
        ...prev,
        [type === 'start' ? 'startDate' : 'endDate']: date
      }))
    }
  }

  return (
    <Card className="border border-black/10 bg-white/95 backdrop-blur-sm shadow-xl">
      <CardHeader>
        <CardTitle>Export Data</CardTitle>
        <CardDescription>
          Export your mood tracking data in different formats
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full flex items-center gap-2">
                <Settings2 className="h-4 w-4" />
                Export Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
              <DialogHeader className="p-6 pb-3 border-b">
                <DialogTitle className="text-2xl">Export Settings</DialogTitle>
                <DialogDescription>
                  Configure your export preferences
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="general" className="w-full">
                <TabsList className="w-full justify-start px-6 border-b sticky top-0 bg-white z-10">
                  <TabsTrigger value="general" className="data-[state=active]:bg-muted/50">General</TabsTrigger>
                  <TabsTrigger value="content" className="data-[state=active]:bg-muted/50">Content</TabsTrigger>
                  <TabsTrigger value="format" className="data-[state=active]:bg-muted/50">Format</TabsTrigger>
                  <TabsTrigger value="preview" className="data-[state=active]:bg-muted/50">Preview</TabsTrigger>
                </TabsList>

                <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
                  <TabsContent value="general" className="mt-0 space-y-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Start Date</Label>
                          <div className="relative w-full">
                            <DatePicker
                              date={settings.startDate}
                              onDateChange={(date) => handleDateChange('start', date)}
                            />
                            <div className="absolute top-[calc(100%+8px)] left-0 z-[9999]" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>End Date</Label>
                          <div className="relative w-full">
                            <DatePicker
                              date={settings.endDate}
                              onDateChange={(date) => handleDateChange('end', date)}
                            />
                            <div className="absolute top-[calc(100%+8px)] left-0 z-[9999]" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>File Name</Label>
                        <Input
                          value={settings.fileName}
                          onChange={(e) => setSettings(prev => ({ ...prev, fileName: e.target.value }))}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="content" className="mt-0 space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Statistics</Label>
                          <p className="text-sm text-muted-foreground">Include mood statistics and trends</p>
                        </div>
                        <Switch
                          checked={settings.includeStatistics}
                          onCheckedChange={(checked) => setSettings(prev => ({ ...prev, includeStatistics: checked }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Mood Graph</Label>
                          <p className="text-sm text-muted-foreground">Include mood trend visualization</p>
                        </div>
                        <Switch
                          checked={settings.includeMoodGraph}
                          onCheckedChange={(checked) => setSettings(prev => ({ ...prev, includeMoodGraph: checked }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Notes</Label>
                          <p className="text-sm text-muted-foreground">Include mood notes and comments</p>
                        </div>
                        <Switch
                          checked={settings.includeNotes}
                          onCheckedChange={(checked) => setSettings(prev => ({ ...prev, includeNotes: checked }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Heatmap</Label>
                          <p className="text-sm text-muted-foreground">Include mood heatmap visualization</p>
                        </div>
                        <Switch
                          checked={settings.includeHeatmap}
                          onCheckedChange={(checked) => setSettings(prev => ({ ...prev, includeHeatmap: checked }))}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="format" className="mt-0 space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Page Orientation</Label>
                        <Select
                          value={settings.orientation}
                          onValueChange={(value: 'portrait' | 'landscape') => 
                            setSettings(prev => ({ ...prev, orientation: value }))
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select orientation" />
                          </SelectTrigger>
                          <SelectContent
                            position="popper"
                            className="w-full z-[100] bg-white"
                            align="start"
                            side="bottom"
                            sideOffset={8}
                          >
                            <SelectItem value="portrait">Portrait</SelectItem>
                            <SelectItem value="landscape">Landscape</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="preview" className="mt-0">
                    <div className="h-[300px] rounded-md border border-dashed border-muted-foreground/25 flex items-center justify-center">
                      <p className="text-sm text-muted-foreground">Preview coming soon...</p>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>

              <div className="flex items-center justify-end gap-4 p-6 pt-4 border-t bg-white sticky bottom-0">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <div className="flex items-center gap-2">
                  <Button onClick={exportAsJSON}>
                    Export JSON
                  </Button>
                  <Button onClick={exportAsCSV}>
                    Export CSV
                  </Button>
                  <Button onClick={exportAsPDF}>
                    Export PDF
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              onClick={exportAsJSON}
              disabled={exporting}
              className="w-full flex items-center gap-2"
            >
              {exporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Export as JSON
            </Button>
            <Button
              variant="outline"
              onClick={exportAsCSV}
              disabled={exporting}
              className="w-full flex items-center gap-2"
            >
              {exporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Export as CSV
            </Button>
            <Button
              variant="default"
              onClick={exportAsPDF}
              disabled={exporting}
              className="w-full flex items-center gap-2 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
            >
              {exporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Export Complete Report (PDF)
            </Button>
          </div>
          
          {exporting && (
            <div className="space-y-2">
              <Progress value={exportProgress} className="w-full" />
              <p className="text-sm text-center text-muted-foreground">
                Exporting... {exportProgress}%
              </p>
            </div>
          )}

          <div className="text-sm text-gray-500 space-y-2">
            <p>
              <strong>JSON Export:</strong> Raw data export for backup or import into other applications
            </p>
            <p>
              <strong>CSV Export:</strong> Spreadsheet-friendly format for analysis in Excel or similar tools
            </p>
            <p>
              <strong>PDF Report:</strong> Complete report with all visualizations, statistics, and detailed data
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 