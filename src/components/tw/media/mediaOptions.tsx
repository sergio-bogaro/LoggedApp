import { t } from "i18next";
import { MoreVertical } from "lucide-react";
import React, { useState } from "react";

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
  const [isOpen, setIsOpen] = useState(false);
  const handleBacklog = useHandleBacklog();

  const isInBacklog = existingItem?.onList;

  function handleTreeDotsClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  function onHandleBacklog(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    handleBacklog(mediaItem, existingItem);
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
          <MoreVertical size={20} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        {isInBacklog ? (
          <DropdownMenuItem onClick={onHandleBacklog}>Remover do Backlog</DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={onHandleBacklog}>Adicionar ao Backlog</DropdownMenuItem>
        )}
        <DropdownMenuItem>{t("viewHistory")}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}