import * as React from "react"
import { cn } from "@/lib/utils"

export interface FloatingInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
}

const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ className, type = 'text', label, id, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)
    const [hasValue, setHasValue] = React.useState(false)

    const handleFocus = () => setIsFocused(true)
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      setHasValue(e.target.value !== '')
      props.onBlur?.(e)
    }

    const isFloating = isFocused || hasValue || props.value !== '' && props.value !== undefined

    return (
      <div className="relative">
        <input
          type={type}
          id={id}
          className={cn(
            "neomorph-input peer flex h-14 w-full px-4 pt-6 pb-2 text-base text-[var(--color-text-primary)] placeholder:text-transparent disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          placeholder={label}
          ref={ref}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        <label
          htmlFor={id}
          className={cn(
            "absolute left-4 text-[var(--color-text-secondary)] transition-all duration-200 pointer-events-none",
            isFloating
              ? "top-2 text-xs font-semibold text-[var(--color-primary)]"
              : "top-1/2 -translate-y-1/2 text-base"
          )}
        >
          {label}
        </label>
      </div>
    )
  }
)
FloatingInput.displayName = "FloatingInput"

export { FloatingInput }
