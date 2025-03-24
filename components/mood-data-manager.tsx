import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { 
  Download, 
  Upload, 
  Bell, 
  Settings, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp,
  Brain,
  Users,
  Mail
} from "lucide-react"
import { motion } from "framer-motion"
import { format } from "date-fns"

interface DashboardState {
  goals: any[]
  insights: any[]
  contacts: any[]
}

interface NotificationSettings {
  goalProgress: boolean
  goalAchieved: boolean
  newInsights: boolean
  supportMessages: boolean
  emailNotifications: boolean
  desktopNotifications: boolean
}

interface EmailConfig {
  service: "gmail" | "outlook" | "custom"
  host?: string
  port?: number
  username: string
  password: string
  from: string
}

interface MoodDataManagerProps {
  dashboardState: DashboardState
  onImportData: (data: DashboardState) => void
  onUpdateNotificationSettings: (settings: NotificationSettings) => void
}

export function MoodDataManager({ 
  dashboardState, 
  onImportData, 
  onUpdateNotificationSettings 
}: MoodDataManagerProps) {
  const [exportProgress, setExportProgress] = useState(0)
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    goalProgress: true,
    goalAchieved: true,
    newInsights: true,
    supportMessages: true,
    emailNotifications: false,
    desktopNotifications: true
  })
  const [emailConfig, setEmailConfig] = useState<EmailConfig>({
    service: "gmail",
    username: "",
    password: "",
    from: ""
  })
  const [showEmailConfig, setShowEmailConfig] = useState(false)
  const { toast } = useToast()

  const handleExportData = async () => {
    try {
      // Simulate export progress
      for (let i = 0; i <= 100; i += 20) {
        setExportProgress(i)
        await new Promise(resolve => setTimeout(resolve, 200))
      }

      // Create export data
      const exportData = {
        version: "1.0",
        timestamp: new Date().toISOString(),
        data: dashboardState
      }

      // Create and download file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `mood-tracker-data-${format(new Date(), "yyyy-MM-dd")}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setExportProgress(0)
      toast({
        title: "Data Exported",
        description: "Your data has been successfully exported.",
      })
    } catch (error) {
      console.error("Export error:", error)
      toast({
        title: "Export Failed",
        description: "There was an error exporting your data. Please try again.",
        variant: "destructive"
      })
      setExportProgress(0)
    }
  }

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string
        const importData = JSON.parse(content)

        // Validate import data
        if (!importData.version || !importData.data) {
          throw new Error("Invalid import file format")
        }

        // Convert date strings back to Date objects
        const processedData = {
          goals: importData.data.goals.map((goal: any) => ({
            ...goal,
            deadline: goal.deadline ? new Date(goal.deadline) : undefined,
            createdAt: new Date(goal.createdAt)
          })),
          insights: importData.data.insights.map((insight: any) => ({
            ...insight,
            date: new Date(insight.date)
          })),
          contacts: importData.data.contacts
        }

        onImportData(processedData)
        toast({
          title: "Data Imported",
          description: "Your data has been successfully imported.",
        })
      } catch (error) {
        console.error("Import error:", error)
        toast({
          title: "Import Failed",
          description: "There was an error importing your data. Please check the file format.",
          variant: "destructive"
        })
      }
    }
    reader.readAsText(file)
  }

  const handleNotificationChange = (key: keyof NotificationSettings) => {
    const newSettings = {
      ...notificationSettings,
      [key]: !notificationSettings[key]
    }
    setNotificationSettings(newSettings)
    onUpdateNotificationSettings(newSettings)

    // Show email config when enabling email notifications
    if (key === "emailNotifications" && newSettings.emailNotifications) {
      setShowEmailConfig(true)
    }

    // Request notification permission if enabling desktop notifications
    if (key === "desktopNotifications" && newSettings.desktopNotifications) {
      requestNotificationPermission()
    }
  }

  const handleEmailConfigSave = () => {
    if (!emailConfig.username || !emailConfig.password || !emailConfig.from) {
      toast({
        title: "Missing Information",
        description: "Please fill in all email configuration fields.",
        variant: "destructive"
      })
      return
    }

    // Save email config to localStorage
    localStorage.setItem("mood-email-config", JSON.stringify(emailConfig))
    
    setShowEmailConfig(false)
    toast({
      title: "Email Configuration Saved",
      description: "Your email notification settings have been saved.",
    })
  }

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      toast({
        title: "Notifications Not Supported",
        description: "Your browser doesn't support desktop notifications.",
        variant: "destructive"
      })
      return
    }

    try {
      const permission = await Notification.requestPermission()
      if (permission === "granted") {
        toast({
          title: "Notifications Enabled",
          description: "You will now receive desktop notifications.",
        })
      } else {
        setNotificationSettings(prev => ({
          ...prev,
          desktopNotifications: false
        }))
        toast({
          title: "Notifications Disabled",
          description: "Permission to show notifications was denied.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Notification permission error:", error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Data Management */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Settings className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Data Management</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Export Data</CardTitle>
              <CardDescription>Download your mood tracking data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Export Progress</span>
                  <span className="font-medium">{exportProgress}%</span>
                </div>
                <Progress value={exportProgress} className="h-2" />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleExportData} 
                disabled={exportProgress > 0}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Import Data</CardTitle>
              <CardDescription>Restore from a backup file</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Label htmlFor="import-file">Select Backup File</Label>
                <Input
                  id="import-file"
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="cursor-pointer"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Notification Settings */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Bell className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Notification Settings</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Manage Notifications</CardTitle>
            <CardDescription>Choose what you want to be notified about</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  Goal Progress Updates
                  <Badge variant="outline">
                    <TrendingUp className="h-3 w-3" />
                  </Badge>
                </Label>
                <Switch
                  checked={notificationSettings.goalProgress}
                  onCheckedChange={() => handleNotificationChange("goalProgress")}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  Goal Achievements
                  <Badge variant="outline">
                    <CheckCircle2 className="h-3 w-3" />
                  </Badge>
                </Label>
                <Switch
                  checked={notificationSettings.goalAchieved}
                  onCheckedChange={() => handleNotificationChange("goalAchieved")}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  New AI Insights
                  <Badge variant="outline">
                    <Brain className="h-3 w-3" />
                  </Badge>
                </Label>
                <Switch
                  checked={notificationSettings.newInsights}
                  onCheckedChange={() => handleNotificationChange("newInsights")}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  Support Network Messages
                  <Badge variant="outline">
                    <Users className="h-3 w-3" />
                  </Badge>
                </Label>
                <Switch
                  checked={notificationSettings.supportMessages}
                  onCheckedChange={() => handleNotificationChange("supportMessages")}
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="flex items-center gap-2">
                      Email Notifications
                      <Badge variant="outline">
                        <Mail className="h-3 w-3" />
                      </Badge>
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={() => handleNotificationChange("emailNotifications")}
                  />
                </div>

                {showEmailConfig && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 pl-6 border-l-2"
                  >
                    <div className="space-y-2">
                      <Label>Email Service</Label>
                      <select
                        className="w-full rounded-md border border-input bg-background px-3 py-2"
                        value={emailConfig.service}
                        onChange={(e) => setEmailConfig(prev => ({ 
                          ...prev, 
                          service: e.target.value as EmailConfig["service"]
                        }))}
                      >
                        <option value="gmail">Gmail</option>
                        <option value="outlook">Outlook</option>
                        <option value="custom">Custom SMTP</option>
                      </select>
                    </div>

                    {emailConfig.service === "custom" && (
                      <>
                        <div className="space-y-2">
                          <Label>SMTP Host</Label>
                          <Input
                            placeholder="smtp.example.com"
                            value={emailConfig.host || ""}
                            onChange={(e) => setEmailConfig(prev => ({ 
                              ...prev, 
                              host: e.target.value 
                            }))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>SMTP Port</Label>
                          <Input
                            type="number"
                            placeholder="587"
                            value={emailConfig.port || ""}
                            onChange={(e) => setEmailConfig(prev => ({ 
                              ...prev, 
                              port: parseInt(e.target.value) 
                            }))}
                          />
                        </div>
                      </>
                    )}

                    <div className="space-y-2">
                      <Label>Email Username</Label>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        value={emailConfig.username}
                        onChange={(e) => setEmailConfig(prev => ({ 
                          ...prev, 
                          username: e.target.value 
                        }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Email Password</Label>
                      <Input
                        type="password"
                        placeholder="App-specific password"
                        value={emailConfig.password}
                        onChange={(e) => setEmailConfig(prev => ({ 
                          ...prev, 
                          password: e.target.value 
                        }))}
                      />
                      <p className="text-xs text-muted-foreground">
                        For Gmail, use an App Password. Never use your main account password.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>From Name</Label>
                      <Input
                        placeholder="Mood Tracker"
                        value={emailConfig.from}
                        onChange={(e) => setEmailConfig(prev => ({ 
                          ...prev, 
                          from: e.target.value 
                        }))}
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowEmailConfig(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleEmailConfigSave}>
                        Save Email Settings
                      </Button>
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="flex items-center gap-2">
                    Desktop Notifications
                    <Badge variant="outline">
                      <Bell className="h-3 w-3" />
                    </Badge>
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Show notifications on your desktop
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.desktopNotifications}
                  onCheckedChange={() => handleNotificationChange("desktopNotifications")}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
} 