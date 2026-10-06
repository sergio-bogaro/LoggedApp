import { Check } from "lucide-react";

import { TypeMark } from "@/components/tw/generic/badges";
import { cn } from "@/lib/utils";
import type { ImportProviderInfo } from "@/types/import";

interface ImportProviderCardProps {
  provider: ImportProviderInfo;
  label: string;
  selected: boolean;
  onSelect: () => void;
}

export function ImportProviderCard({
  provider,
  label,
  selected,
  onSelect,
}: ImportProviderCardProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        "flex flex-col gap-2 rounded-lg border bg-card p-3 text-left transition-colors",
        "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
        selected ? "border-primary ring-1 ring-primary" : "border-border hover:bg-accent/50"
      )}
    >
      <span className="flex items-center justify-between gap-2">
        <span className="font-serif text-step-3 font-medium">{label}</span>
        {selected && <Check className="size-4 shrink-0 text-primary" aria-hidden="true" />}
      </span>
      <span className="flex flex-wrap gap-x-3 gap-y-1">
        {provider.mediaTypes.map((type) => (
          <TypeMark key={type} type={type} />
        ))}
      </span>
    </button>
  );
}
