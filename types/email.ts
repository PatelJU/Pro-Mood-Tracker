export interface EmailConfig {
  service: "gmail" | "outlook" | "custom"
  host?: string
  port?: number
  username: string
  password: string
  from: string
}

export interface EmailTemplate {
  subject: string
  body: string
}

export interface EmailTemplateVars {
  userName?: string
  goalTitle?: string
  goalProgress?: number
  insightTitle?: string
  insightDescription?: string
  contactName?: string
  moodLevel?: number
  moodDescription?: string
  weeklyStats?: {
    averageMood: number
    totalEntries: number
    topMood: number
    improvement: number
  }
  reminderTime?: string
  customMessage?: string
}

export interface EmailAnalytics {
  id: string
  emailId: string
  recipientEmail: string
  templateName: string
  sentAt: Date
  openedAt?: Date
  clickedLinks?: { url: string; timestamp: Date }[]
  deliveryStatus: 'sent' | 'delivered' | 'failed' | 'bounced'
  error?: string
} 