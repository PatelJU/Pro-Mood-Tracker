import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Brain, Users, Sparkles, Settings } from "lucide-react"
import { MoodData, MoodLevel } from "@/types/mood"
import { MoodInsights } from "@/components/mood-insights"
import { MoodSocial } from "@/components/mood-social"
import { MoodDataManager } from "@/components/mood-data-manager"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

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

interface SharedInsight {
  id: string
  title: string
  description: string
  date: Date
  isPublic: boolean
  likes: number
  comments: number
  author: {
    name: string
    avatar?: string
  }
}

interface SupportContact {
  id: string
  name: string
  email: string
  relationship: string
  canViewMoods: boolean
  canViewNotes: boolean
  canReceiveAlerts: boolean
}

interface MoodDashboardProps {
  moodData: MoodData
  className?: string
}

interface DashboardState {
  goals: MoodGoal[]
  insights: SharedInsight[]
  contacts: SupportContact[]
}

interface NotificationSettings {
  goalProgress: boolean
  goalAchieved: boolean
  newInsights: boolean
  supportMessages: boolean
  emailNotifications: boolean
  desktopNotifications: boolean
}

const STORAGE_KEY = "mood-dashboard-state"

export function MoodDashboard({ moodData, className }: MoodDashboardProps) {
  const [activeTab, setActiveTab] = useState("insights")
  const [dashboardState, setDashboardState] = useState<DashboardState>({
    goals: [],
    insights: [],
    contacts: []
  })
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    goalProgress: true,
    goalAchieved: true,
    newInsights: true,
    supportMessages: true,
    emailNotifications: false,
    desktopNotifications: true
  })
  const { toast } = useToast()

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY)
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState, (key, value) => {
          // Convert date strings back to Date objects
          if (key === "date" || key === "deadline" || key === "createdAt") {
            return new Date(value)
          }
          return value
        })
        setDashboardState(parsed)
      } catch (error) {
        console.error("Error loading dashboard state:", error)
        toast({
          title: "Error Loading Data",
          description: "There was an error loading your saved data. Starting fresh.",
          variant: "destructive"
        })
      }
    }
  }, [toast])

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dashboardState))
  }, [dashboardState])

  const handleSetGoal = (goal: MoodGoal) => {
    setDashboardState(prev => ({
      ...prev,
      goals: [...prev.goals, goal]
    }))

    toast({
      title: "Goal Set",
      description: "Your new mood goal has been saved.",
    })
  }

  const handleImportData = (data: DashboardState) => {
    setDashboardState(data)
    toast({
      title: "Data Imported",
      description: "Your data has been successfully imported and restored.",
    })
  }

  const handleUpdateNotificationSettings = (settings: NotificationSettings) => {
    setNotificationSettings(settings)
    
    // Save notification settings to localStorage
    localStorage.setItem("mood-notification-settings", JSON.stringify(settings))
    
    toast({
      title: "Settings Updated",
      description: "Your notification preferences have been saved.",
    })
  }

  const showNotification = (title: string, body: string) => {
    if (notificationSettings.desktopNotifications && "Notification" in window) {
      new Notification(title, { body })
    }
  }

  const handleShareInsight = (insight: SharedInsight) => {
    setDashboardState(prev => ({
      ...prev,
      insights: [insight, ...prev.insights]
    }))

    // Notify contacts if they have alerts enabled
    if (notificationSettings.supportMessages) {
      dashboardState.contacts
        .filter(contact => contact.canReceiveAlerts)
        .forEach(contact => {
          // TODO: Implement email notifications
          if (notificationSettings.emailNotifications) {
            console.log(`Sending email to ${contact.email} about new insight`)
          }
        })
    }

    // Show desktop notification
    if (notificationSettings.newInsights) {
      showNotification(
        "New Mood Insight Shared",
        insight.isPublic 
          ? "Your insight has been shared with the community."
          : "Your insight has been shared with your support network."
      )
    }

    toast({
      title: "Insight Shared",
      description: insight.isPublic 
        ? "Your insight has been shared with the community."
        : "Your insight has been shared with your support network.",
    })
  }

  const handleAddSupport = (contact: SupportContact) => {
    setDashboardState(prev => ({
      ...prev,
      contacts: [...prev.contacts, contact]
    }))

    toast({
      title: "Contact Added",
      description: `${contact.name} has been added to your support network.`,
    })
  }

  const handleDeleteGoal = (goalId: string) => {
    setDashboardState(prev => ({
      ...prev,
      goals: prev.goals.filter(goal => goal.id !== goalId)
    }))

    toast({
      title: "Goal Deleted",
      description: "The goal has been removed from your dashboard.",
    })
  }

  const handleDeleteContact = (contactId: string) => {
    setDashboardState(prev => ({
      ...prev,
      contacts: prev.contacts.filter(contact => contact.id !== contactId)
    }))

    toast({
      title: "Contact Removed",
      description: "The contact has been removed from your support network.",
    })
  }

  const handleUpdateGoalProgress = (goalId: string, progress: number) => {
    setDashboardState(prev => ({
      ...prev,
      goals: prev.goals.map(goal => 
        goal.id === goalId
          ? { ...goal, progress, achieved: progress >= 100 }
          : goal
      )
    }))

    // Show progress notification
    if (notificationSettings.goalProgress && progress % 25 === 0) {
      const goal = dashboardState.goals.find(g => g.id === goalId)
      if (goal) {
        showNotification(
          "Goal Progress Update",
          `You're ${progress}% of the way to your goal: ${goal.description}`
        )
      }
    }

    // Check if goal was just achieved
    const goal = dashboardState.goals.find(g => g.id === goalId)
    if (goal && !goal.achieved && progress >= 100) {
      if (notificationSettings.goalAchieved) {
        showNotification(
          "Goal Achieved! 🎉",
          `Congratulations! You've achieved your goal: ${goal.description}`
        )
      }

      toast({
        title: "Goal Achieved! 🎉",
        description: `Congratulations! You've achieved your goal: ${goal.description}`,
      })
    }
  }

  return (
    <Card className={cn("p-6", className)}>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="insights" className="gap-2">
            <Brain className="h-4 w-4" />
            Insights & Goals
          </TabsTrigger>
          <TabsTrigger value="social" className="gap-2">
            <Users className="h-4 w-4" />
            Support Network
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="mt-0">
          <MoodInsights 
            moodData={moodData}
            onSetGoal={handleSetGoal}
            goals={dashboardState.goals}
            onDeleteGoal={handleDeleteGoal}
            onUpdateProgress={handleUpdateGoalProgress}
          />
        </TabsContent>

        <TabsContent value="social" className="mt-0">
          <MoodSocial
            moodData={moodData}
            onShareInsight={handleShareInsight}
            onAddSupport={handleAddSupport}
            insights={dashboardState.insights}
            contacts={dashboardState.contacts}
            onDeleteContact={handleDeleteContact}
          />
        </TabsContent>

        <TabsContent value="settings" className="mt-0">
          <MoodDataManager
            dashboardState={dashboardState}
            onImportData={handleImportData}
            onUpdateNotificationSettings={handleUpdateNotificationSettings}
          />
        </TabsContent>
      </Tabs>
    </Card>
  )
} 