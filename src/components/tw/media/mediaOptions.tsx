import { MoreVertical } from "lucide-react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { MediaHistoryDialog } from "../dialogs/mediaHistoryDialog";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { MediaResponse } from "@/types/logged";
import { MediaItem } from "@/types/media";
import { useHandleBacklog } from "@/utils/mediaStore";


interface MediaOptionsButtonProps {
  mediaItem: MediaItem;
  existingItem?: MediaResponse;
}

export const MediaOptionsButton = ({ mediaItem, existingItem }: MediaOptionsButtonProps) => {
  const { t } = useTranslation("media");
  const [isOpen, setIsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const handleBacklog = useHandleBacklog();

  const isInBacklog = existingItem?.onList;

  function handleTreeDotsClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  function onHandleBacklog(event: Event) {
    event.preventDefault();
    event.stopPropagation();

    handleBacklog(mediaItem, existingItem);
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
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
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
          {isInBacklog ? (
            <DropdownMenuItem onSelect={onHandleBacklog}>{t("actions.removeFromBacklog")}</DropdownMenuItem>
          ) : (
            <DropdownMenuItem onSelect={onHandleBacklog}>{t("actions.addToBacklog")}</DropdownMenuItem>
          )}
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
