import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { EmailTemplate, EmailTemplateVars } from '@/types/email'
import { emailTemplates } from './email-templates'

interface EmailPreviewProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  templateName: keyof typeof emailTemplates
  variables: EmailTemplateVars
}

export function EmailPreview({ open, onOpenChange, templateName, variables }: EmailPreviewProps) {
  const template = emailTemplates[templateName](variables)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Email Preview</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Subject</h3>
            <div className="p-3 bg-muted rounded-md">
              {template.subject}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Body</h3>
            <div 
              className="p-4 bg-white dark:bg-gray-800 rounded-md shadow-sm border"
              dangerouslySetInnerHTML={{ __html: template.body }}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 