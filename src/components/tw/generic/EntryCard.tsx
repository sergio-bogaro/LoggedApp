import { ReactNode } from "react";

import { Card } from "./card";

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
 * inside the card: the card is what is centred, not the text.
 */
export const EntryCard = ({ title, subtitle, icon, children, footer, className }: EntryCardProps) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 sm:p-6">
      <Card className={cn("w-full max-w-md gap-6 p-6 sm:p-8", className)}>
        <header className="space-y-2">
          {icon}

          <h1 className="font-serif text-step-5 font-medium">{title}</h1>

          {subtitle && <p className="text-step-1 text-muted-foreground">{subtitle}</p>}
        </header>

        {children}

        {footer && <div className="text-step-1 text-muted-foreground">{footer}</div>}
      </Card>
    </div>
  );
};
