import * as TabsPrimitive from "@radix-ui/react-tabs"
import * as React from "react"

import { cn } from "@/lib/utils"

function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-4", className)}
      {...props}
    />
  )
}

function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        /*
         * Long tab sets (anime/manga) overflow a phone, so the list scrolls
         * instead of widening the page. The scrollbar stays visible on purpose:
         * a mouse wheel does not scroll a horizontal container, so hiding it
         * would leave the off-screen tabs unreachable.
         *
         * `pb-px` keeps the active-tab underline — which sits 1px past the
         * trigger, inside the border area — out of the scroll clip region.
         */
        "inline-flex w-fit max-w-full items-center gap-6 overflow-x-auto overscroll-x-contain",
        "border-b border-border pb-px",
        "[scrollbar-width:thin] [scrollbar-color:var(--border)_transparent]",
        "[&::-webkit-scrollbar]:h-1.5",
        "[&::-webkit-scrollbar-thumb]:rounded-full",
        "[&::-webkit-scrollbar-thumb]:bg-border",
        "[&::-webkit-scrollbar-thumb:hover]:bg-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "relative inline-flex items-center justify-center gap-1.5 whitespace-nowrap",
        "rounded-control px-0.5 pt-1 pb-3 text-step-1 font-medium",
        "text-muted-foreground transition-colors hover:text-foreground",
        "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40",
        "disabled:pointer-events-none disabled:opacity-50",
        "data-[state=active]:text-foreground",
        "after:pointer-events-none after:absolute after:inset-x-0 after:-bottom-px after:h-[2px] after:rounded-full after:bg-transparent",
        "data-[state=active]:after:bg-foreground",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
