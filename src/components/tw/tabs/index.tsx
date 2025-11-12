import { ReactNode } from "react"

import {
  Tabs as BaseTabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs"

type TabOption = {
  label: string
  value: string
  content: ReactNode
}

type TabsProps = {
  defaultValue?: string
  options: TabOption[]
  className?: string
}

export function AppTabs({ defaultValue, options, className }: TabsProps) {
  return (
    <BaseTabs defaultValue={defaultValue} className={className}>
      <TabsList className="flex gap-2">
        {options.map(({ label, value }) => (
          <TabsTrigger key={value} value={value}>
            {label}
          </TabsTrigger>
        ))}
      </TabsList>

      {options.map(({ value, content }) => (
        <TabsContent key={value} value={value}>
          {content}
        </TabsContent>
      ))}
    </BaseTabs>
  )
}
