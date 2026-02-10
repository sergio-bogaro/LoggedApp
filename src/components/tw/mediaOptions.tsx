import { t } from "i18next";
import { MoreVertical } from "lucide-react";
import React, { useState } from "react";

import { Button } from "../ui/button";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";


interface MediaOptionsButtonProps {
  mediaId?: string;
}

const MediaOptionsButton = ({ mediaId }: MediaOptionsButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  function handleTreeDotsClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    console.log(mediaId)
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
        <DropdownMenuItem>{t("addList")}</DropdownMenuItem>
        <DropdownMenuItem>{t("viewHistory")}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default MediaOptionsButton;