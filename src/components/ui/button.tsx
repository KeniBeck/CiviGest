import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
          {
            "neomorph-button text-[var(--color-text-primary)]":
              variant === 'default',
            "neomorph-flat border-2 border-[var(--color-primary)] text-[var(--color-primary)]":
              variant === 'outline',
            "hover:bg-zinc-100/50 text-[var(--color-text-primary)]":
              variant === 'ghost',
          },
          {
            "h-11 px-6 py-3 text-base": size === 'default',
            "h-9 px-4 py-2 text-sm": size === 'sm',
            "h-13 px-8 py-4 text-lg": size === 'lg',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
