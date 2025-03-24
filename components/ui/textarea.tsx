import * as React from "react"

import { cn } from "@/lib/utils"

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex w-full rounded-md border border-input px-3 py-2",
        "text-base ring-offset-background",
        "placeholder:text-muted-foreground",
        "focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "md:text-sm min-h-[100px]",
        "bg-white border-black/10",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"
