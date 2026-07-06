import { MoreVertical } from "lucide-react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { MediaHistoryDialog } from "../dialogs/mediaHistoryDialog";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { checkBacklog, checkFavorite } from "@/querries/media/listItems";
import { useAppSelector } from "@/store/auth/hooks";
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
  const { user } = useAppSelector((state) => state.auth);

  const [backlogStatus, setBacklogStatus] = useState<{ inList: boolean; itemId: number | null }>({ inList: false, itemId: null });
  const [favoritesStatus, setFavoritesStatus] = useState<{ inList: boolean; itemId: number | null }>({ inList: false, itemId: null });

  // Check backlog and favorites status when menu opens
  const handleOpenChange = async (open: boolean) => {
    setIsOpen(open);
    if (open && user && mediaItem.id) {
      const [backlog, favorites] = await Promise.all([
        checkBacklog(user.id, mediaItem.id, mediaItem.type),
        checkFavorite(user.id, mediaItem.id, mediaItem.type),
      ]);
      setBacklogStatus(backlog);
      setFavoritesStatus(favorites);
    }
  };

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

  function openMediaHistoryDialog() {
    setIsOpen(false);
    setIsHistoryOpen(true);
  }

  function onViewHistory(event: Event) {
    event.preventDefault();
    event.stopPropagation();

    if (!existingItem) return;

    openMediaHistoryDialog();
  }

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button
            onClick={handleTreeDotsClick}
            variant="ghost"
            size="xs"
            className={cn(
              "bg-popover/70 p-2 transition-all relative",
              isOpen ? "opacity-100 bg-popover" : "opacity-0 group-hover:opacity-100"
            )}
          >
            <MoreVertical size={20} />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          {backlogStatus.inList ? (
            <DropdownMenuItem onSelect={onHandleBacklog}>{t("actions.removeFromBacklog")}</DropdownMenuItem>
          ) : (
            <DropdownMenuItem onSelect={onHandleBacklog}>{t("actions.addToBacklog")}</DropdownMenuItem>
          )}
          {favoritesStatus.inList ? (
            <DropdownMenuItem onSelect={onHandleFavorite}>{t("actions.removeFavorite")}</DropdownMenuItem>
          ) : (
            <DropdownMenuItem onSelect={onHandleFavorite}>{t("actions.addFavorite")}</DropdownMenuItem>
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
