import { ExternalLink } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";

interface ImportExternalLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
}

export function ImportExternalLink({ href, children, className }: ImportExternalLinkProps) {
  const { t } = useTranslation("import");

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "inline-flex items-center gap-1 rounded-control text-step-0 text-primary underline-offset-4 transition-colors hover:underline",
        "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
        className
      )}
    >
      {children}
      <ExternalLink className="size-3 shrink-0" aria-hidden="true" />
      <span className="sr-only">{t("external.newTab")}</span>
    </a>
  );
}
