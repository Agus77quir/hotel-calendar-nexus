import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    // iOS/Safari optimizations for date inputs
    const isDateInput = type === "date" || type === "datetime-local" || type === "time";
    const iosOptimizations = isDateInput ? {
      // Prevent iOS zoom on focus
      style: { fontSize: '16px' },
      // Better touch handling
      inputMode: 'none' as const,
    } : {};

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...iosOptimizations}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
