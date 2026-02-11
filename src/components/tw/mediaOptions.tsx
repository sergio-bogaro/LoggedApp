import { t } from "i18next";
import { MoreVertical } from "lucide-react";
import React, { useState } from "react";

import { Button } from "../ui/button";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { handleBacklog } from "@/utils/mediaStore";
import { MediaTypeEnum } from "@/utils/mediaText";


interface MediaOptionsButtonProps {
  mediaId: string;
  mediaType: MediaTypeEnum
}

const MediaOptionsButton = ({ mediaId, mediaType }: MediaOptionsButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  function handleTreeDotsClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          onClick={handleTreeDotsClick}
          variant="ghost"
          size="xs"
          className={cn("bg-popover/70 p-2 transition-all", isOpen ? "opacity-100 bg-popover" : "opacity-0 group-hover:opacity-100")}
        >
          <MoreVertical size={20} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleBacklog(mediaId, mediaType)}>{t("addList")}</DropdownMenuItem>
        <DropdownMenuItem>{t("viewHistory")}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default MediaOptionsButton;