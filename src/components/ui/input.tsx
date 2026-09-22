/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react"
import { Control } from "react-hook-form"

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
        "flex h-9 w-full min-w-0 rounded-md border bg-transparent border-default px-3 py-1 text-base",
        "pointer-coarse:h-11",
        "shadow-xs outline-none transition-[color,box-shadow]",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",
        "dark:bg-input/30 md:text-sm",
        "disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-50",
        "focus-visible:border-ring focus-visible:ring-[1px] focus-visible:ring-ring/20",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
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
          <Label className="font-bold" htmlFor={id ?? name}>
            {label}
            {required && <span aria-hidden="true" className="text-destructive font-extrabold -ml-1.5">*</span>}
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
        <Label className="font-bold" htmlFor={id ?? name}>
          {label}
          {required && <span aria-hidden="true" className="text-destructive font-extrabold -ml-1.5">*</span>}
        </Label>
      )}
      <BaseInput id={id ?? name} name={name} required={required} {...props} />
    </div>
  )
}

export { BaseInput, Input }
