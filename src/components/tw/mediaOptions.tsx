import { t } from "i18next";
import { MoreVertical } from "lucide-react";
import React from "react";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";


interface MediaOptionsButtonProps {
  onClickFunction: (e: React.MouseEvent) => void;
}

const MediaOptionsButton = ({ onClickFunction }: MediaOptionsButtonProps) => {

  function handleTreeDotsClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    onClickFunction(e);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <button
          onClick={handleTreeDotsClick}
          className="bg-black/40 hover:bg-black/60 text-white rounded p-1"
        >
          <MoreVertical size={20} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuItem>{t("addList")}</DropdownMenuItem>
        <DropdownMenuItem>{t("viewHistory")}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default MediaOptionsButton;