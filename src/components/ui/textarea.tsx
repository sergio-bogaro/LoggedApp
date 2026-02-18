/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react"
import { Control } from "react-hook-form"

import { FormControl, FormField, FormItem } from "./form"
import { Label } from "./label"

import { cn } from "@/lib/utils"

type BaseTextAreaProps = React.ComponentProps<"textarea"> & {
  className?: string;
}

const BaseTextArea = React.forwardRef<HTMLTextAreaElement, BaseTextAreaProps>(function BaseTextArea(
  { className, ...props },
  ref
) {
  return (
    <textarea
      ref={ref}
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[1px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
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
        <Label className="font-bold" htmlFor={id ?? name}>
          {label}
          {required && <span className="text-destructive font-extrabold -ml-1.5">*</span>}
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
      <Label className="font-bold" htmlFor={id ?? name}>
        {label}
        {required && <span className="text-destructive font-extrabold -ml-1.5">*</span>}
      </Label>
      <BaseTextArea id={id ?? name} name={name} {...props} />
    </div>
  )
}

export { BaseTextArea, TextArea }
