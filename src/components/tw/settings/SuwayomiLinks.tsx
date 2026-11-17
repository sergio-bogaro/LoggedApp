import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, RotateCcw, Search, SkipForward } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { getMediaList } from "@/querries/media/logged";
import { suwayomiApi } from "@/querries/suwayomi";
import { useAppSelector } from "@/store/auth/hooks";
import { MediaTypeEnum } from "@/types/media";
import type { SuwayomiLink, SuwayomiLinkStatus, SuwayomiLinkUpdate } from "@/types/suwayomi";

const TABS: SuwayomiLinkStatus[] = ["pending", "ignored"];

function statusTabKey(status: SuwayomiLinkStatus): string {
  return status === "pending" ? "links.tabPending" : "links.tabIgnored";
}

export function SuwayomiLinks() {
  const { t } = useTranslation("suwayomi");
  const { user } = useAppSelector((state) => state.auth);
  const queryClient = useQueryClient();

  const [status, setStatus] = useState<SuwayomiLinkStatus>("pending");
  const [linkingId, setLinkingId] = useState<number | null>(null);
  const [queryText, setQueryText] = useState("");
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  const { data: links, isLoading } = useQuery({
    queryKey: ["suwayomi", "links", user?.id, status],
    queryFn: () => suwayomiApi.getLinks(user!.id, status),
    enabled: !!user,
    refetchOnWindowFocus: false,
  });

  const { data: results, isFetching: searching } = useQuery({
    queryKey: ["suwayomi", "links", "search", user?.id, search],
    queryFn: () =>
      getMediaList(user!.id, {
        types: [MediaTypeEnum.MANGA],
        search,
        limit: 15,
      }),
    enabled: !!user && search.length >= 2 && linkingId !== null,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(queryText.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [queryText]);

  const updateLink = async (
    link: SuwayomiLink,
    data: SuwayomiLinkUpdate,
    successKey: string
  ) => {
    if (!user) return;
    setBusyId(link.id);
    try {
      await suwayomiApi.updateLink(user.id, link.id, data);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["suwayomi", "links"] }),
        queryClient.invalidateQueries({ queryKey: ["sync-suggestions"] }),
      ]);
      toast.success(t(successKey));
      if (data.mediaId !== undefined) {
        setLinkingId(null);
        setQueryText("");
        setSearch("");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("errors.linkUpdate"));
    } finally {
      setBusyId(null);
    }
  };

  const openSearch = (link: SuwayomiLink) => {
    setLinkingId(link.id);
    setQueryText("");
    setSearch("");
  };

  return (
    <div className="space-y-3 rounded-control border border-border p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-medium text-step-1">{t("links.title")}</p>
          <p className="text-step-0 text-muted-foreground">{t("links.description")}</p>
          <Button asChild size="xs" variant="outline" className="mt-2">
            <Link to="/import?tab=auto&provider=suwayomi">
              {t("links.openReview")}
            </Link>
          </Button>
        </div>
        <div className="flex rounded-control border border-border p-0.5">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              aria-pressed={status === tab}
              className={cn(
                "rounded-[calc(var(--radius-control)-2px)] px-2 py-1 text-step-0",
                status === tab
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => {
                setStatus(tab);
                setLinkingId(null);
                setQueryText("");
                setSearch("");
              }}
            >
              {t(statusTabKey(tab))}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-16 w-full" />
      ) : !links || links.length === 0 ? (
        <p className="text-step-0 text-muted-foreground">
          {t(status === "pending" ? "links.emptyPending" : "links.emptyIgnored")}
        </p>
      ) : (
        <div className="space-y-2">
          {links.map((link) => (
            <div key={link.id} className="space-y-2 border-t border-border pt-2 first:border-t-0 first:pt-0">
              <div className="flex flex-wrap items-start gap-2">
                <div className="min-w-0 flex-1">
                  <p className="break-words text-step-1 font-medium">{link.title}</p>
                  <p className="text-step-0 text-muted-foreground">
                    {link.matchError ||
                      t(status === "ignored" ? "links.ignoredHint" : "links.pendingHint")}
                  </p>
                  {link.matchAttempts > 0 && (
                    <p className="text-step-0 text-muted-foreground">
                      {t("links.attempts", { count: link.matchAttempts })}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 flex-wrap gap-1">
                  {status === "pending" && (
                    <Button
                      type="button"
                      size="xs"
                      variant="outline"
                      onClick={() => openSearch(link)}
                      disabled={busyId === link.id}
                    >
                      <Search />
                      {t("links.link")}
                    </Button>
                  )}
                  <Button
                    type="button"
                    size="xs"
                    variant="outline"
                    onClick={() =>
                      void updateLink(
                        link,
                        { ignored: status !== "ignored" },
                        status === "ignored" ? "links.restored" : "links.ignored"
                      )
                    }
                    disabled={busyId === link.id}
                  >
                    {busyId === link.id ? (
                      <Loader2 className="animate-spin" />
                    ) : status === "ignored" ? (
                      <RotateCcw />
                    ) : (
                      <SkipForward />
                    )}
                    {t(status === "ignored" ? "links.restore" : "links.ignore")}
                  </Button>
                </div>
              </div>

              {linkingId === link.id && (
                <div className="space-y-2 rounded-control border border-border p-2">
                  <Input
                    name="suwayomi-link-search"
                    value={queryText}
                    placeholder={t("links.searchPlaceholder")}
                    onChange={(event) => setQueryText(event.target.value)}
                  />
                  {search.length < 2 ? (
                    <p className="text-step-0 text-muted-foreground">
                      {t("links.searchHint")}
                    </p>
                  ) : searching ? (
                    <p className="flex items-center gap-2 text-step-0 text-muted-foreground">
                      <Loader2 className="size-3 animate-spin" />
                      {t("links.searching")}
                    </p>
                  ) : results && results.length > 0 ? (
                    <div className="max-h-56 space-y-1 overflow-auto">
                      {results.map((media) => (
                        <div
                          key={media.id}
                          className="flex items-center gap-2 rounded-control px-1 py-0.5"
                        >
                          <span className="min-w-0 flex-1 truncate text-step-0">
                            {media.title}
                          </span>
                          <Button
                            type="button"
                            size="xs"
                            onClick={() =>
                              void updateLink(link, { mediaId: media.id }, "links.linked")
                            }
                            disabled={busyId === link.id}
                          >
                            {t("links.select")}
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-step-0 text-muted-foreground">
                      {t("links.noResults")}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
