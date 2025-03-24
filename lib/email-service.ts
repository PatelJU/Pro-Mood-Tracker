import { EmailConfig } from "@/types/email"
import { emailTemplates } from "@/components/email-templates"

interface EmailOptions {
  to: string
  subject: string
  body: string
  trackingId?: string
}

interface EmailAnalytics {
  id: string
  emailId: string
  recipientEmail: string
  templateName: string
  sentAt: Date
  openedAt?: Date
  deliveryStatus: 'sent' | 'delivered' | 'failed'
  error?: string
}

class EmailService {
  private config: EmailConfig | null = null
  private worker: Worker | null = null
  private analytics: Map<string, EmailAnalytics> = new Map()

  constructor() {
    if (typeof window !== "undefined") {
      // Load email config and analytics from localStorage
      const savedConfig = localStorage.getItem("mood-email-config")
      const savedAnalytics = localStorage.getItem("mood-email-analytics")
      
      if (savedConfig) {
        this.config = JSON.parse(savedConfig)
      }
      if (savedAnalytics) {
        const analyticsData = JSON.parse(savedAnalytics)
        this.analytics = new Map(Object.entries(analyticsData))
      }

      // Initialize web worker for background email processing
      try {
        this.worker = new Worker(new URL("@/workers/email.worker.ts", import.meta.url))
        this.worker.onmessage = this.handleWorkerMessage.bind(this)
      } catch (error) {
        console.error("Failed to initialize email worker:", error)
      }
    }
  }

  private handleWorkerMessage(event: MessageEvent) {
    const { type, status, error, emailId, analyticsData } = event.data
    if (type === "emailSent") {
      if (status === "success") {
        console.log("Email sent successfully")
        if (emailId && analyticsData) {
          this.updateAnalytics(emailId, {
            ...analyticsData,
            deliveryStatus: 'sent'
          })
        }
      } else {
        console.error("Failed to send email:", error)
        if (emailId) {
          this.updateAnalytics(emailId, {
            deliveryStatus: 'failed',
            error: error instanceof Error ? error.message : String(error)
          })
        }
      }
    }
  }

  private updateAnalytics(emailId: string, data: Partial<EmailAnalytics>) {
    const existing = this.analytics.get(emailId) || {
      id: emailId,
      emailId,
      recipientEmail: '',
      templateName: '',
      sentAt: new Date(),
      deliveryStatus: 'sent'
    }

    this.analytics.set(emailId, { ...existing, ...data })
    this.saveAnalytics()
  }

  private saveAnalytics() {
    if (typeof window !== "undefined") {
      const analyticsData = Object.fromEntries(this.analytics)
      localStorage.setItem("mood-email-analytics", JSON.stringify(analyticsData))
    }
  }

  public async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.config || !this.worker) {
      console.error("Email service not configured")
      return false
    }

    try {
      const emailId = options.trackingId || crypto.randomUUID()
      const trackingPixel = `<img src="${window.location.origin}/api/email/track/${emailId}" style="display:none" />`
      const bodyWithTracking = options.body + trackingPixel

      // Initialize analytics
      this.updateAnalytics(emailId, {
        recipientEmail: options.to,
        templateName: options.subject,
        sentAt: new Date(),
        deliveryStatus: 'sent'
      })

      // Send email data to worker
      this.worker.postMessage({
        type: "sendEmail",
        config: this.config,
        options: {
          ...options,
          body: bodyWithTracking,
          trackingId: emailId
        }
      })
      return true
    } catch (error) {
      console.error("Error sending email:", error)
      return false
    }
  }

  // Core notification methods for mood tracking
  public async sendMoodReminder(
    to: string,
    userName: string,
    reminderTime: string
  ): Promise<boolean> {
    const template = emailTemplates.dailyReminder({
      userName,
      reminderTime
    })
    return this.sendEmail({ to, ...template })
  }

  public async sendWeeklyReport(
    to: string,
    userName: string,
    weeklyStats: {
      averageMood: number
      totalEntries: number
      topMood: number
      improvement: number
    }
  ): Promise<boolean> {
    const template = emailTemplates.weeklyReport({
      userName,
      weeklyStats
    })
    return this.sendEmail({ to, ...template })
  }

  public async sendNewInsight(
    to: string,
    userName: string,
    insightTitle: string,
    insightDescription: string
  ): Promise<boolean> {
    const template = emailTemplates.newInsight({
      userName,
      insightTitle,
      insightDescription
    })
    return this.sendEmail({ to, ...template })
  }

  public updateConfig(config: EmailConfig) {
    this.config = config
    if (typeof window !== "undefined") {
      localStorage.setItem("mood-email-config", JSON.stringify(config))
    }
  }

  public getAnalytics(emailId?: string): EmailAnalytics | EmailAnalytics[] {
    if (emailId) {
      const analytics = this.analytics.get(emailId)
      if (!analytics) {
        throw new Error(`No analytics found for email ID: ${emailId}`)
      }
      return analytics
    }
    return Array.from(this.analytics.values())
  }

  public getAnalyticsSummary() {
    const analytics = Array.from(this.analytics.values())
    return {
      totalSent: analytics.length,
      delivered: analytics.filter(a => a.deliveryStatus === 'delivered').length,
      failed: analytics.filter(a => a.deliveryStatus === 'failed').length,
      opened: analytics.filter(a => a.openedAt).length,
      deliveryRate: analytics.length ? 
        (analytics.filter(a => a.deliveryStatus === 'delivered').length / analytics.length) * 100 : 0,
      openRate: analytics.length ?
        (analytics.filter(a => a.openedAt).length / analytics.length) * 100 : 0
    }
  }

  public trackEmailOpen(emailId: string) {
    const analytics = this.analytics.get(emailId)
    if (analytics && !analytics.openedAt) {
      this.updateAnalytics(emailId, {
        openedAt: new Date()
      })
    }
  }
}

export const emailService = new EmailService() 