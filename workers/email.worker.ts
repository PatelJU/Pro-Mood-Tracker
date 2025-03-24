import { EmailConfig } from "@/types/email"
import nodemailer from "nodemailer"

interface EmailWorkerMessage {
  type: "sendEmail"
  config: EmailConfig
  options: {
    to: string
    subject: string
    body: string
  }
}

// Handle messages from the main thread
self.onmessage = async (event: MessageEvent<EmailWorkerMessage>) => {
  const { type, config, options } = event.data

  if (type === "sendEmail") {
    try {
      // Create transporter based on service
      const transporter = createTransporter(config)

      // Send email
      await transporter.sendMail({
        from: `"${config.from}" <${config.username}>`,
        to: options.to,
        subject: options.subject,
        html: options.body
      })

      // Notify success
      self.postMessage({ type: "emailSent", status: "success" })
    } catch (error) {
      // Notify error
      self.postMessage({ 
        type: "emailSent", 
        status: "error", 
        error: error instanceof Error ? error.message : "Unknown error" 
      })
    }
  }
}

function createTransporter(config: EmailConfig) {
  const transportConfig: any = {
    auth: {
      user: config.username,
      pass: config.password
    }
  }

  switch (config.service) {
    case "gmail":
      transportConfig.service = "gmail"
      break
    case "outlook":
      transportConfig.service = "outlook365"
      break
    case "custom":
      transportConfig.host = config.host
      transportConfig.port = config.port
      transportConfig.secure = config.port === 465
      break
  }

  return nodemailer.createTransport(transportConfig)
}

// Prevent TypeScript errors about self
declare const self: Worker 