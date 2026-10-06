import { FileUp, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImportDropzoneProps {
  id: string;
  accept?: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export function ImportDropzone({ id, accept, file, onFileChange }: ImportDropzoneProps) {
  const { t } = useTranslation("import");
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  if (file) {
    return (
      <div className="flex items-center gap-3 rounded-control border border-border bg-muted/40 p-3">
        <FileUp className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-step-1">{file.name}</p>
          <p className="text-step-0 tabular-nums text-muted-foreground">{formatBytes(file.size)}</p>
        </div>
        <Button
          type="button"
          size="xs"
          variant="ghost"
          onClick={() => {
            onFileChange(null);
            if (inputRef.current) inputRef.current.value = "";
          }}
          aria-label={t("input.dropzone.remove")}
        >
          <X />
        </Button>
      </div>
    );
  }

  return (
    <div>
      <input
        ref={inputRef}
        id={id}
        name={id}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          const dropped = event.dataTransfer.files?.[0];
          if (dropped) onFileChange(dropped);
        }}
        className={cn(
          "flex w-full flex-col items-center gap-1.5 rounded-control border border-dashed p-6 text-center transition-colors",
          "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
          dragOver ? "border-primary bg-primary/5" : "border-border hover:bg-accent/40"
        )}
      >
        <Upload className="size-5 text-muted-foreground" aria-hidden="true" />
        <span className="text-step-1">{t("input.dropzone.title")}</span>
        <span className="text-step-0 text-muted-foreground">{t("input.dropzone.hint")}</span>
      </button>
    </div>
  );
}
