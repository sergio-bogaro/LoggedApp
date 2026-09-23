/* eslint-disable @typescript-eslint/no-explicit-any */
import * as SelectPrimitive from "@radix-ui/react-select"
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react"
import * as React from "react"
import { Control } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { fieldSurface } from "./fieldStyles"
import { FormControl, FormField, FormItem, FormMessage } from "./form"
import { Label } from "./label"

import { cn } from "@/lib/utils"

type SelectOptions = {
  label: string;
  value: string;
}

type SelectProps = React.ComponentProps<typeof SelectPrimitive.Root> & {
  options: SelectOptions[];
  label?: string;
  name: string;
  id?: string;
  required?: boolean;
  control?: Control<any>;
  placeholder?: string;
  width?: number;
}

function SelectBase({ ...props }: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectGroup({ ...props }: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />
}

function SelectValue({ ...props }: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & { size?: "sm" | "default"}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        fieldSurface,
        "flex w-fit items-center justify-between gap-2 px-3 py-2",
        "cursor-pointer text-step-2 whitespace-nowrap",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        "data-placeholder:text-muted-foreground",
        "data-[size=default]:h-9 data-[size=sm]:h-8",
        "pointer-coarse:h-11",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0",
        "[&_svg:not([class*='size-'])]:size-4",
        "[&_svg:not([class*='text-'])]:text-muted-foreground",
        "*:data-[slot=select-value]:flex",
        "*:data-[slot=select-value]:items-center",
        "*:data-[slot=select-value]:gap-2",
        "*:data-[slot=select-value]:line-clamp-1",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="size-4 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          "relative z-50 min-w-32 max-h-(--radix-select-content-available-height) origin-(--radix-select-content-transform-origin)",
          "overflow-x-hidden overflow-y-auto rounded-lg border border-border shadow-xl",
          "bg-popover text-popover-foreground",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "p-1",
            position === "popper" &&
            "h-(--radix-select-trigger-height) w-full min-w-(--radix-select-trigger-width) scroll-my-1"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("text-muted-foreground px-2 py-1.5 text-step-1", className)}
      {...props}
    />
  )
}

function SelectItem({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex w-full items-center gap-2 cursor-pointer select-none",
        "rounded-control py-1.5 pr-8 pl-2 text-step-1 outline-hidden",
        "focus:bg-accent focus:text-accent-foreground",
        "data-disabled:pointer-events-none data-disabled:opacity-50",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0",
        "[&_svg:not([class*='size-'])]:size-4",
        "[&_svg:not([class*='text-'])]:text-muted-foreground",
        "*:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className
      )}
      {...props}
    >
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("bg-border pointer-events-none -mx-1 my-1 h-px", className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        "flex cursor-pointer items-center justify-center py-1",
        className
      )}
      {...props}
    >
      <ChevronUpIcon className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  )
}

function SelectScrollDownButton({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "flex cursor-pointer items-center justify-center py-1",
        className
      )}
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  )
}

export function Select({
  label,
  name,
  id,
  required,
  control,
  options,
  width,
  placeholder,
  ...props
}: SelectProps) {
  const { t } = useTranslation("common")
  const resolvedPlaceholder = placeholder ?? t("form.selectPlaceholder")

  if (control) {
    return (
      <div className="flex flex-col gap-1" style={width ? { width: `${width}px` } : { width: "100%" }}>
        <Label htmlFor={id ?? name}>
          {label}
          {required && <span aria-hidden="true" className="-ml-1 text-destructive">*</span>}
        </Label>

        <FormField
          control={control}
          name={name}
          render={({ field }) => (
            <FormItem >
              <SelectBase
                {...props}
                onValueChange={field.onChange}
                value={field.value ?? ""}
              >
                <FormControl>
                  <SelectTrigger className={cn("w-full")} id={id ?? name}>
                    <SelectValue placeholder={resolvedPlaceholder} />
                  </SelectTrigger>
                </FormControl>

                <SelectContent>
                  <SelectGroup>
                    {options.map(({ value, label }) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </SelectBase>

              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1" style={width ? { width: `${width}px` } : { width: "100%" }}>
      <Label htmlFor={id ?? name}>
        {label}
        {required && <span aria-hidden="true" className="-ml-1 text-destructive">*</span>}
      </Label>

      <SelectBase {...props}>
        <SelectTrigger className="w-full" id={id ?? name}>
          <SelectValue placeholder={resolvedPlaceholder} />
        </SelectTrigger>

        <SelectContent>
          <SelectGroup>
            {options.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </SelectBase>
    </div>
  )
}


export {
  SelectBase,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
