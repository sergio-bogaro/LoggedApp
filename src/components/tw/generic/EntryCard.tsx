import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { Card } from "./card";

import { BrandMark } from "@/components/tw/generic/BrandMark";
import { cn } from "@/lib/utils";

interface EntryCardProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

/*
 * The shell for the screens that are a single object in the middle of the
 * viewport — welcome, sign in, sign up, onboarding. Content stays left aligned
 * inside the card: the card is what is centred, not the text. The wordmark
 * sits above the card so a stranger knows what they are entering.
 */
export const EntryCard = ({ title, subtitle, icon, children, footer, className }: EntryCardProps) => {
  const { t } = useTranslation("common");

  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-4 sm:p-6">
      <div className="w-full max-w-md">
        <Link
          to="/"
          aria-label={t("branding.sidebarName")}
          className="mb-5 inline-flex rounded-control focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <BrandMark size="md" />
        </Link>

        <Card className={cn("gap-6 p-6 sm:p-8", className)}>
          <header className="space-y-2">
            {icon}

            <h1 className="font-serif text-step-5 font-medium tracking-[-0.02em]">{title}</h1>

            {subtitle && <p className="text-step-1 text-muted-foreground">{subtitle}</p>}
          </header>

          {children}

          {footer && <div className="text-step-1 text-muted-foreground">{footer}</div>}
        </Card>
      </div>
    </div>
  );
};
