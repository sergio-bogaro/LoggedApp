import { ReactNode } from "react"
import { useTranslation } from "react-i18next"

import { cn } from "@/lib/utils"
import { MediaStatusEnum, MediaTypeEnum } from "@/types/media"

const Badge = ({ children, className }: { children: ReactNode, className?: string }) => {
  return (
    <span className={cn("text-sm px-2 py-1 rounded-sm", className)}>
      {children}
    </span>
  )
}

export const MediaTypeBadge = ({ type }: { type: MediaTypeEnum }) => {
  const { t } = useTranslation("media")

  function getTypeText(type: MediaTypeEnum) {
    switch (type) {
      case MediaTypeEnum.MOVIES:
        return t("type.movie")
      case MediaTypeEnum.ANIME:
        return t("type.anime")
      case MediaTypeEnum.MANGA:
        return t("type.manga")
      case MediaTypeEnum.BOOK:
        return t("type.book")
      case MediaTypeEnum.GAME:
        return t("type.game")
      default:
        return type
    }
  }

  return (
    <Badge className="bg-primary text-primary-foreground">
      {getTypeText(type)}
    </Badge>
  )
}

export const StatusBadge = ({ status }: { status: MediaStatusEnum }) => {
  const { t } = useTranslation("media")

  const statusColors: Record<MediaStatusEnum, string> = {
    [MediaStatusEnum.IN_PROGRESS]: "bg-blue-600 text-white dark:bg-blue-500",
    [MediaStatusEnum.FOLLOWING]: "bg-slate-600 text-white dark:bg-slate-500",
    [MediaStatusEnum.ON_HOLD]: "bg-amber-500 text-amber-950",
    [MediaStatusEnum.DROPPED]: "bg-red-600 text-white dark:bg-red-500",
    [MediaStatusEnum.FINISHED]: "bg-green-600 text-white dark:bg-green-500",
  };

  function getStatusText(status: MediaStatusEnum) {
    switch (status) {
      case MediaStatusEnum.IN_PROGRESS:
        return t("status.in_progress")
      case MediaStatusEnum.FOLLOWING:
        return t("status.following")
      case MediaStatusEnum.ON_HOLD:
        return t("status.on_hold")
      case MediaStatusEnum.DROPPED:
        return t("status.dropped")
      case MediaStatusEnum.FINISHED:
        return t("status.finished")
      default:
        return status
    }
  }

  return (
    <Badge className={statusColors[status]}>
      {getStatusText(status)}
    </Badge>
  )
}
