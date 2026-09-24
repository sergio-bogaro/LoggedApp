import { X } from "lucide-react";
import { KeyboardEvent, useState } from "react";
import { useTranslation } from "react-i18next";

import { BaseInput } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  label?: string;
  placeholder?: string;
}

/** Editor simples de tags: digite e pressione Enter (ou vírgula) para adicionar. */
export function TagInput({ value, onChange, label, placeholder }: TagInputProps) {
  const { t } = useTranslation("media");
  const [draft, setDraft] = useState("");

  const addTag = (raw: string) => {
    const name = raw.trim().toLowerCase();
    if (!name || value.includes(name)) return;
    onChange([...value, name]);
  };

  const removeTag = (name: string) => onChange(value.filter((tag) => tag !== name));

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTag(draft);
      setDraft("");
    } else if (event.key === "Backspace" && !draft && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  const commitDraft = () => {
    if (!draft) return;
    addTag(draft);
    setDraft("");
  };

  return (
    <div className="flex flex-col gap-1">
      {label && <Label>{label}</Label>}

      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-control border border-border px-2 py-1 text-step-1"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                aria-label={`${t("actions.deleteLog")} ${tag}`}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="size-3" aria-hidden="true" />
              </button>
            </span>
          ))}
        </div>
      )}

      <BaseInput
        value={draft}
        placeholder={placeholder}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commitDraft}
      />
    </div>
  );
}
