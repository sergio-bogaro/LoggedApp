/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react"
import { Control } from "react-hook-form"

import { fieldSurface } from "./fieldStyles"
import { FormControl, FormField, FormItem, FormMessage } from "./form"
import { Label } from "./label"

import { cn } from "@/lib/utils"

type BaseInputProps = React.ComponentProps<"input"> & {
  className?: string;
}

type InputProps = {
  label?: string;
  name: string;
  id?: string;
  required?: boolean;
  control?: Control<any>;
} & Omit<React.ComponentProps<typeof BaseInput>, "name" | "id">

const BaseInput = React.forwardRef<HTMLInputElement, BaseInputProps>(function BaseInput(
  { className, type, ...props },
  ref
) {
  return (
    <input
      ref={ref}
      type={type}
      data-slot="input"
      className={cn(
        fieldSurface,
        "flex h-9 w-full min-w-0 px-3 py-1 text-step-2",
        "pointer-coarse:h-11",
        "disabled:pointer-events-none",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-step-1 file:font-medium file:text-foreground",
        "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/25",
        className
      )}
      {...props}
    />
  )
})



function Input({ label, name, id, required, control, ...props }: InputProps) {
  if (control) {
    return (
      <div className="flex flex-col w-full gap-1">
        {label && (
          <Label htmlFor={id ?? name}>
            {label}
            {required && <span aria-hidden="true" className="-ml-1 text-destructive">*</span>}
          </Label>
        )}

        <FormField
          control={control}
          name={name}
          render={({ field }) => {
            const { value, ...fieldRest } = field
            return (
              <FormItem>
                <FormControl className="m-0">
                  <BaseInput
                    {...props}
                    {...fieldRest}
                    id={id ?? name}
                    value={value ?? ""}
                    aria-required={required || undefined}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )
          }}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full gap-1">
      {label && (
        <Label htmlFor={id ?? name}>
          {label}
          {required && <span aria-hidden="true" className="-ml-1 text-destructive">*</span>}
        </Label>
      )}
      <BaseInput id={id ?? name} name={name} required={required} {...props} />
    </div>
  )
}

export { BaseInput, Input }
