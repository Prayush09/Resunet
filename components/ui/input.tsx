import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input";


const LabeledInput = React.forwardRef<HTMLInputElement, InputProps & { label: string }>(
  ({ className, type, label, ...props }, ref) => {
    return (
      <div className="flex flex-col space-y-1">
        <label className="text-sm font-medium text-muted-foreground">{label}</label>
        <Input ref={ref} type={type} className={className} {...props} />
      </div>
    );
  }
);
LabeledInput.displayName = "LabeledInput";

export { Input, LabeledInput };


