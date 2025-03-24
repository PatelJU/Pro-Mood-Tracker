interface EmailTemplate {
  subject: string
  body: string
}

interface EmailTemplateVars {
  userName?: string
  weeklyStats?: {
    averageMood: number
    totalEntries: number
    topMood: number
    improvement: number
  }
  insightTitle?: string
  insightDescription?: string
  reminderTime?: string
  moodTrend?: 'improving' | 'steady' | 'declining'
  suggestedActions?: string[]
}

export const emailTemplates = {
  weeklyReport: (vars: EmailTemplateVars): EmailTemplate => ({
    subject: `Your Weekly Mood Summary Report`,
    body: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #374151;">
        <h2 style="color: #1f2937; margin-bottom: 20px;">Weekly Mood Summary</h2>
        <p>Hi ${vars.userName},</p>
        <p>Here's your mood tracking summary for the past week:</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 12px; margin: 20px 0;">
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
            <div style="background: white; padding: 16px; border-radius: 8px; text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #3b82f6;">
                ${vars.weeklyStats?.averageMood?.toFixed(1) ?? 'N/A'}/5
              </div>
              <div style="color: #6b7280; font-size: 14px;">Average Mood</div>
            </div>
            
            <div style="background: white; padding: 16px; border-radius: 8px; text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #10b981;">
                ${vars.weeklyStats?.totalEntries ?? 0}
              </div>
              <div style="color: #6b7280; font-size: 14px;">Total Entries</div>
            </div>
          </div>
          
          <div style="margin-top: 16px; background: white; padding: 16px; border-radius: 8px;">
            <div style="margin-bottom: 8px; color: #4b5563;">Mood Trend</div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-weight: 500;">
                ${vars.weeklyStats?.improvement != null ? (vars.weeklyStats.improvement > 0 ? '↗️' : '↘️') : '➡️'}
              </span>
              <span style="color: ${
                vars.weeklyStats?.improvement != null ? 
                  (vars.weeklyStats.improvement > 0 ? '#059669' : '#dc2626') : 
                  '#6b7280'
              }">
                ${vars.weeklyStats?.improvement != null ? 
                  `${Math.abs(vars.weeklyStats.improvement).toFixed(1)}% ${vars.weeklyStats.improvement > 0 ? 'improvement' : 'decrease'}` : 
                  '0% change'
                }
              </span>
            </div>
          </div>
        </div>
        
        <p style="color: #4b5563; font-style: italic;">Keep tracking your moods to gain more insights into your emotional well-being!</p>
      </div>
    `.trim()
  }),

  dailyReminder: (vars: EmailTemplateVars): EmailTemplate => ({
    subject: `Time for Your Daily Mood Check-in 🌟`,
    body: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #374151;">
        <h2 style="color: #1f2937; margin-bottom: 20px;">Daily Mood Check-in</h2>
        <p>Hi ${vars.userName},</p>
        <p>It's time for your daily mood reflection at ${vars.reminderTime}.</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 12px; margin: 20px 0;">
          <div style="background: white; padding: 16px; border-radius: 8px;">
            <h3 style="color: #1f2937; margin: 0 0 12px 0;">Why Track Your Mood?</h3>
            <div style="display: grid; gap: 12px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="color: #3b82f6;">📊</span>
                <span>Monitor your emotional patterns</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="color: #3b82f6;">🎯</span>
                <span>Identify triggers and trends</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="color: #3b82f6;">🌱</span>
                <span>Support your mental well-being</span>
              </div>
            </div>
          </div>
        </div>
        
        <a href="${process.env.NEXT_PUBLIC_APP_URL}" 
           style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; 
                  border-radius: 6px; text-decoration: none; margin-top: 16px;">
          Log Today's Mood
        </a>
      </div>
    `.trim()
  }),

  newInsight: (vars: EmailTemplateVars): EmailTemplate => ({
    subject: `New Mood Pattern Insight: ${vars.insightTitle}`,
    body: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #374151;">
        <h2 style="color: #1f2937; margin-bottom: 20px;">New Mood Pattern Discovered</h2>
        <p>Hi ${vars.userName},</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 12px; margin: 20px 0;">
          <div style="background: white; padding: 16px; border-radius: 8px;">
            <h3 style="color: #1f2937; margin: 0 0 12px 0;">${vars.insightTitle}</h3>
            <p style="margin: 0; line-height: 1.5;">${vars.insightDescription}</p>
          </div>
          
          ${vars.suggestedActions ? `
          <div style="background: white; padding: 16px; border-radius: 8px; margin-top: 16px;">
            <h4 style="color: #1f2937; margin: 0 0 12px 0;">Suggested Actions</h4>
            <ul style="margin: 0; padding-left: 24px;">
              ${vars.suggestedActions.map(action => `
                <li style="margin-bottom: 8px;">${action}</li>
              `).join('')}
            </ul>
          </div>
          ` : ''}
          
          <div style="background: white; padding: 16px; border-radius: 8px; margin-top: 16px;">
            <div style="color: #4b5563;">Current Trend</div>
            <div style="display: flex; align-items: center; gap: 8px; margin-top: 8px;">
              <span style="font-size: 20px;">
                ${vars.moodTrend === 'improving' ? '📈' : vars.moodTrend === 'declining' ? '📉' : '📊'}
              </span>
              <span style="color: ${
                vars.moodTrend === 'improving' ? '#059669' : 
                vars.moodTrend === 'declining' ? '#dc2626' : 
                '#6b7280'
              }">
                ${vars.moodTrend === 'improving' ? 'Positive trend' :
                  vars.moodTrend === 'declining' ? 'Needs attention' :
                  'Stable pattern'}
              </span>
            </div>
          </div>
        </div>
        
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/insights" 
           style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; 
                  border-radius: 6px; text-decoration: none; margin-top: 16px;">
          View Full Analysis
        </a>
      </div>
    `.trim()
  })
} 