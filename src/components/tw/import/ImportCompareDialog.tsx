import { useTranslation } from "react-i18next";

import { TypeMark } from "@/components/tw/generic/badges";
import { ImportExternalLink } from "@/components/tw/import/ImportExternalLink";
import { ImportMatchMark } from "@/components/tw/import/ImportStatusMark";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { ImportCandidate, ImportEntry, ImportMatchResult } from "@/types/import";
import { metadataProviderKey, metadataUrl } from "@/utils/importLinks";

interface ImportCompareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: ImportEntry;
  match?: ImportMatchResult;
  selected: ImportCandidate | null;
  candidates: ImportCandidate[];
  sourceHref: string | null;
  sourceLabel: string;
  onSelect: (candidate: ImportCandidate) => void;
}

export function ImportCompareDialog({
  open,
  onOpenChange,
  entry,
  match,
  selected,
  candidates,
  sourceHref,
  sourceLabel,
  onSelect,
}: ImportCompareDialogProps) {
  const { t } = useTranslation("import");

  const status = match?.status ?? "not_found";
  const cover = selected?.coverUrl ?? match?.match?.coverUrl ?? null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="pr-8">
            {entry.title}
            {entry.year ? (
              <span className="ml-2 text-step-2 tabular-nums text-muted-foreground">
                {entry.year}
              </span>
            ) : null}
          </DialogTitle>
          <DialogDescription className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <TypeMark type={entry.mediaType} />
            <ImportMatchMark status={status} />
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="mx-auto h-56 w-40 shrink-0 overflow-hidden rounded-control bg-muted sm:mx-0">
            {cover ? (
              <img src={cover} alt="" className="h-full w-full object-cover" />
            ) : null}
          </div>

          <div className="min-w-0 flex-1 space-y-3">
            <div className="space-y-1">
              <p className="text-step-0 font-medium text-muted-foreground">
                {t("dialog.sourceTitle")}
              </p>
              <p className="text-step-1">{sourceLabel}</p>
              {sourceHref ? (
                <ImportExternalLink href={sourceHref}>{t("dialog.source")}</ImportExternalLink>
              ) : null}
            </div>

            {entry.overview ? (
              <p className="text-step-1 text-muted-foreground">{entry.overview}</p>
            ) : null}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-step-0 font-medium text-muted-foreground">
            {t("dialog.candidatesTitle")}
          </p>

          {candidates.length > 0 ? (
            <ul className="space-y-2">
              {candidates.map((candidate) => {
                const href = metadataUrl(candidate);
                const isSelected = selected?.externalId === candidate.externalId;

                return (
                  <li
                    key={candidate.externalId}
                    className={cn(
                      "flex items-center gap-3 rounded-control border border-border p-2",
                      isSelected && "border-primary"
                    )}
                  >
                    <div className="h-16 w-11 shrink-0 overflow-hidden rounded-control bg-muted">
                      {candidate.coverUrl ? (
                        <img
                          src={candidate.coverUrl}
                          alt=""
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : null}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-step-1">
                        {candidate.title}
                        {candidate.year ? ` (${candidate.year})` : ""}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-step-0 text-muted-foreground">
                        <span>
                          {t(metadataProviderKey(candidate.provider), {
                            defaultValue: candidate.provider,
                          })}
                        </span>
                        <span className="tabular-nums">
                          {t("dialog.score", { score: Math.round(candidate.score * 100) })}
                        </span>
                      </div>
                    </div>

                    {href ? (
                      <ImportExternalLink href={href} className="shrink-0">
                        {t("compare.open")}
                      </ImportExternalLink>
                    ) : null}

                    <Button
                      type="button"
                      size="xs"
                      variant={isSelected ? "default" : "outline"}
                      aria-pressed={isSelected}
                      onClick={() => onSelect(candidate)}
                      className="shrink-0"
                    >
                      {isSelected ? t("dialog.selected") : t("dialog.use")}
                    </Button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="rounded-control border border-dashed border-border p-3 text-step-1 text-muted-foreground">
              {t("dialog.noCandidates")}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
