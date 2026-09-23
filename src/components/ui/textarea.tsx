/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react"
import { Control } from "react-hook-form"

import { FormControl, FormField, FormItem } from "./form"
import { Label } from "./label"

import { cn } from "@/lib/utils"

type BaseTextAreaProps = React.ComponentProps<"textarea"> & {
  className?: string;
}

const BaseTextArea = React.forwardRef<HTMLTextAreaElement, BaseTextAreaProps>(
  function BaseTextArea({ className, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        data-slot="textarea"
        className={cn(
          "flex field-sizing-content min-h-16 w-full rounded-control border border-input bg-background px-3 py-2 text-step-2",
          "outline-none transition-colors",
          "placeholder:text-muted-foreground",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/25",
          "aria-invalid:border-destructive aria-invalid:ring-destructive/25",
          className
        )}
        {...props}
      />
    )
  })

type TextareaProps = {
  label?: string;
  name: string;
  id?: string;
  required?: boolean;
  control?: Control<any>;
} & Omit<React.ComponentProps<typeof BaseTextArea>, "name" | "id">

function TextArea({ label, name, id, required, control, ...props }: TextareaProps) {
  if (control) {
    return (
      <div className="flex flex-col w-full gap-1">
        <Label htmlFor={id ?? name}>
          {label}
          {required && <span aria-hidden="true" className="-ml-1 text-destructive">*</span>}
        </Label>

        <FormField
          control={control}
          name={name}
          render={({ field }) => {
            const { value, ...fieldRest } = field
            return (
              <FormItem>
                <FormControl className="m-0">
                  <BaseTextArea
                    {...props}
                    {...fieldRest}
                    id={id ?? name}
                    value={value ?? ""}
                  />
                </FormControl>
              </FormItem>
            )
          }}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full gap-1">
      <Label htmlFor={id ?? name}>
        {label}
        {required && <span aria-hidden="true" className="-ml-1 text-destructive">*</span>}
      </Label>
      <BaseTextArea id={id ?? name} name={name} {...props} />
    </div>
  )
}

export { BaseTextArea, TextArea }
