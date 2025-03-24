import React from 'react'
import { Card } from './ui/card'
import { Progress } from './ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { emailService } from '@/lib/email-service'
import type { EmailAnalytics as EmailAnalyticsType } from '@/types/email'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

export function EmailAnalytics() {
  const [activeTab, setActiveTab] = React.useState('overview')
  const [analytics, setAnalytics] = React.useState<EmailAnalyticsType[]>([])
  const summary = emailService.getAnalyticsSummary()

  React.useEffect(() => {
    const data = emailService.getAnalytics() as EmailAnalyticsType[]
    setAnalytics(data)
  }, [])

  // Prepare data for charts - focus on daily mood-related metrics
  const openRateData = React.useMemo(() => {
    return analytics
      .filter(a => a.openedAt)
      .map(a => ({
        date: new Date(a.sentAt).toLocaleDateString(),
        opens: 1
      }))
      .reduce((acc, curr) => {
        const existing = acc.find(d => d.date === curr.date)
        if (existing) {
          existing.opens += 1
        } else {
          acc.push(curr)
        }
        return acc
      }, [] as { date: string; opens: number }[])
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [analytics])

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="details">Recent Activity</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Notification Stats</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span>Delivery Success</span>
                  <span>{summary.deliveryRate.toFixed(1)}%</span>
                </div>
                <Progress value={summary.deliveryRate} />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span>Engagement Rate</span>
                  <span>{summary.openRate.toFixed(1)}%</span>
                </div>
                <Progress value={summary.openRate} />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Notifications</span>
                <span>{summary.totalSent}</span>
              </div>
              <div className="flex justify-between">
                <span>Successfully Delivered</span>
                <span>{summary.delivered}</span>
              </div>
              <div className="flex justify-between">
                <span>User Interactions</span>
                <span>{summary.opened}</span>
              </div>
            </div>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="details" className="space-y-4">
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Engagement Trend</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={openRateData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="opens"
                  stroke="#3b82f6"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Recent Notifications</h3>
          <div className="space-y-4">
            {analytics.slice(0, 5).map(email => (
              <div
                key={email.id}
                className="p-4 bg-muted rounded-lg space-y-2"
              >
                <div className="flex justify-between">
                  <span className="font-medium">{email.templateName}</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(email.sentAt).toLocaleString()}
                  </span>
                </div>
                <div className="text-sm">
                  To: {email.recipientEmail}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${
                    email.deliveryStatus === 'delivered' ? 'text-green-500' :
                    email.deliveryStatus === 'failed' ? 'text-red-500' :
                    'text-yellow-500'
                  }`}>
                    {email.deliveryStatus}
                  </span>
                  {email.openedAt && (
                    <span className="text-sm text-blue-500">
                      viewed
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </TabsContent>
    </Tabs>
  )
} 