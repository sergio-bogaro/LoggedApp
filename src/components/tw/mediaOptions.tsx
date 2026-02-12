import { t } from "i18next";
import { MoreVertical, Check } from "lucide-react";
import React, { useState } from "react";

import { Button } from "../ui/button";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MediaResponse } from "@/lib/querry/logged";
import { cn } from "@/lib/utils";
import { MediaItem } from "@/types/mediaItem";
import { useHandleBacklog } from "@/utils/mediaStore";


interface MediaOptionsButtonProps {
  mediaItem: MediaItem;
  existingItem?: MediaResponse;
}

const MediaOptionsButton = ({ mediaItem, existingItem }: MediaOptionsButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const handleBacklog = useHandleBacklog();
  const isInLibrary = !!existingItem;

  function handleTreeDotsClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  function onAddToBacklog() {
    handleBacklog(mediaItem);
    setIsOpen(false);
  }

  return (
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
          {isInLibrary && (
            <span className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5">
              <Check size={12} className="text-white" />
            </span>
          )}
          <MoreVertical size={20} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        {!isInLibrary && (
          <DropdownMenuItem onClick={onAddToBacklog}>{t("addList")}</DropdownMenuItem>
        )}
        {isInLibrary && (
          <>
            <DropdownMenuItem disabled className="text-xs text-muted-foreground">
              Status: {existingItem.status}
            </DropdownMenuItem>
            {existingItem.rating && (
              <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                Rating: {existingItem.rating}/10
              </DropdownMenuItem>
            )}
          </>
        )}
        <DropdownMenuItem>{t("viewHistory")}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default MediaOptionsButton;