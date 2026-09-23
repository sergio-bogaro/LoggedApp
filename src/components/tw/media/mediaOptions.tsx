import { MoreVertical } from "lucide-react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { MediaHistoryDialog } from "../dialogs/mediaHistoryDialog";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useMediaListStatus } from "@/hooks/useMediaListStatus";
import { cn } from "@/lib/utils";
import { MediaResponse } from "@/types/logged";
import { MediaItem } from "@/types/media";
import { useHandleBacklog, useHandleFavorites } from "@/utils/mediaStore";


interface MediaOptionsButtonProps {
  mediaItem: MediaItem;
  existingItem?: MediaResponse;
}

export const MediaOptionsButton = ({ mediaItem, existingItem }: MediaOptionsButtonProps) => {
  const { t } = useTranslation("media");

  const [isOpen, setIsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const handleBacklog = useHandleBacklog();
  const handleFavorites = useHandleFavorites();

  const { backlogStatus, favoritesStatus, isLoading } = useMediaListStatus(mediaItem);

  function handleTreeDotsClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  function onHandleBacklog(event: Event) {
    event.preventDefault();
    event.stopPropagation();

    handleBacklog(mediaItem, backlogStatus.inList, backlogStatus.itemId);
    setIsOpen(false);
  }

  function onHandleFavorite(event: Event) {
    event.preventDefault();
    event.stopPropagation();

    handleFavorites(mediaItem, favoritesStatus.inList, favoritesStatus.itemId);
    setIsOpen(false);
  }

  function onViewHistory(event: Event) {
    event.preventDefault();
    event.stopPropagation();

    if (!existingItem) return;

    setIsOpen(false);
    setIsHistoryOpen(true);
  }

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            onClick={handleTreeDotsClick}
            variant="ghost"
            size="xs"
            aria-label={t("actions.more")}
            className={cn(
              "bg-popover/70 p-2 transition-all relative",
              isOpen
                ? "opacity-100 bg-popover"
                : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100 pointer-coarse:opacity-100"
            )}
          >
            <MoreVertical className="size-5" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          {backlogStatus.inList ? (
            <DropdownMenuItem disabled={isLoading} onSelect={onHandleBacklog}>{t("actions.removeFromBacklog")}</DropdownMenuItem>
          ) : (
            <DropdownMenuItem disabled={isLoading} onSelect={onHandleBacklog}>{t("actions.addToBacklog")}</DropdownMenuItem>
          )}
          {favoritesStatus.inList ? (
            <DropdownMenuItem disabled={isLoading} onSelect={onHandleFavorite}>{t("actions.removeFavorite")}</DropdownMenuItem>
          ) : (
            <DropdownMenuItem disabled={isLoading} onSelect={onHandleFavorite}>{t("actions.addFavorite")}</DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled={!existingItem} onSelect={onViewHistory}>
            {t("actions.viewHistory")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <MediaHistoryDialog
        media={existingItem}
        open={isHistoryOpen}
        onOpenChange={setIsHistoryOpen}
      />
    </>
  )
}
