import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";

const markSizes = {
  sm: "size-8 rounded-lg text-step-3",
  md: "size-9 rounded-lg text-step-4",
  lg: "size-11 rounded-xl text-step-5",
} as const;

const wordSizes = {
  sm: "text-step-3",
  md: "text-step-4",
  lg: "text-step-5",
} as const;

interface BrandMarkProps {
  size?: keyof typeof markSizes;
  /** Hide the wordmark when the surrounding context already names the app. */
  wordmark?: boolean;
  className?: string;
}

/*
 * The one lockup: a paper-green tile with the serif L, followed by the
 * wordmark. It is intentionally quiet — the app earns its personality from
 * the register and the artwork, not from a large logo.
 */
export const BrandMark = ({ size = "md", wordmark = true, className }: BrandMarkProps) => {
  const { t } = useTranslation("common");

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        aria-hidden="true"
        className={cn(
          "flex shrink-0 items-center justify-center bg-primary font-serif font-medium leading-none text-primary-foreground",
          markSizes[size]
        )}
      >
        L
      </span>

      {wordmark && (
        <span className={cn("font-serif font-medium tracking-[-0.02em]", wordSizes[size])}>
          {t("branding.sidebarName")}
        </span>
      )}
    </span>
  );
};
