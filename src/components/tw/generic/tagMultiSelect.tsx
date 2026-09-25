import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";

import { fieldSurface } from "@/components/ui/fieldStyles";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface TagMultiSelectProps {
  value: string[];
  onChange: (tags: string[]) => void;
  options: string[];
  label?: string;
  placeholder?: string;
  emptyLabel?: string;
}

/*
 * Multi-select for tags that already exist. Unlike TagInput — free text,
 * because a media's own tags can be created on the spot — a view filter should
 * only reference tags present in the selected media type.
 */
export function TagMultiSelect({
  value,
  onChange,
  options,
  label,
  placeholder,
  emptyLabel,
}: TagMultiSelectProps) {
  const [open, setOpen] = useState(false);

  const toggle = (tag: string) => {
    onChange(value.includes(tag) ? value.filter((item) => item !== tag) : [...value, tag]);
  };

  return (
    <div className="flex flex-col gap-1">
      {label && <Label>{label}</Label>}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              fieldSurface,
              "flex min-h-9 w-full cursor-pointer items-start justify-between gap-2 px-3 py-1.5 text-left text-step-2 pointer-coarse:min-h-11"
            )}
          >
            {value.length > 0 ? (
              <span className="flex flex-wrap gap-1">
                {value.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-control border border-border px-2 py-0.5 text-step-1"
                  >
                    {tag}
                  </span>
                ))}
              </span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}

            <ChevronDown className="mt-1 size-4 shrink-0 opacity-50" aria-hidden="true" />
          </button>
        </PopoverTrigger>

        <PopoverContent align="start" className="w-(--radix-popover-trigger-width) p-1">
          {options.length === 0 ? (
            <p className="px-2 py-1.5 text-step-1 text-muted-foreground">{emptyLabel}</p>
          ) : (
            <ul role="listbox" aria-multiselectable="true" className="max-h-64 overflow-y-auto">
              {options.map((tag) => {
                const selected = value.includes(tag);

                return (
                  <li key={tag}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onClick={() => toggle(tag)}
                      className="flex w-full cursor-pointer items-center gap-2 rounded-control px-2 py-1.5 text-left text-step-1 hover:bg-accent hover:text-accent-foreground"
                    >
                      <span aria-hidden="true" className="flex size-4 items-center justify-center">
                        {selected && <Check className="size-4" />}
                      </span>
                      {tag}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
