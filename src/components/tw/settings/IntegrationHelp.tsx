import { HelpCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";

type IntegrationHelpProps = {
  api: "tmdb" | "igdb";
};

function IntegrationHelp({ api }: IntegrationHelpProps) {
  const { t } = useTranslation("common");

  const steps = t(`settings.integrations.help.${api}.steps`, { returnObjects: true });
  const stepList = Array.isArray(steps) ? (steps as string[]) : [];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={t("settings.integrations.help.openHelp")}
          className="size-6 text-muted-foreground"
        >
          <HelpCircle className="size-4" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80">
        <PopoverHeader>
          <PopoverTitle>{t(`settings.integrations.help.${api}.title`)}</PopoverTitle>
          <PopoverDescription>
            {t(`settings.integrations.help.${api}.description`)}
          </PopoverDescription>
        </PopoverHeader>

        <ol className="mt-3 list-decimal space-y-1 pl-4 text-step-0 text-muted-foreground">
          {stepList.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>

        <a
          href={t(`settings.integrations.help.${api}.linkUrl`)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block text-step-0 font-medium text-primary underline-offset-4 hover:underline"
        >
          {t(`settings.integrations.help.${api}.linkLabel`)}
        </a>
      </PopoverContent>
    </Popover>
  );
}

export default IntegrationHelp;
