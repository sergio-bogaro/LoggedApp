import { t } from "i18next"
import { ReactNode } from "react"

import { MediaStatusEnum, MediaTypeEnum } from "@/types/media"

const Badge = ({ children, className }: { children: ReactNode, className?: string }) => {
  return (
    <span className={`text-sm px-2 py-1 rounded ${className}`}>
      {children}
    </span>
  )
}

export const MediaTypeBadge = ({ type }: { type: MediaTypeEnum }) => {
  function getTypeText(type: MediaTypeEnum) {
    switch (type) {
      case MediaTypeEnum.MOVIES:
        return t("type.movie", { ns: "media" })
      case MediaTypeEnum.ANIME:
        return t("type.anime", { ns: "media" })
      case MediaTypeEnum.MANGA:
        return t("type.manga", { ns: "media" })
      default:
        return type
    }
  }


  return (
    <Badge className="bg-primary">
      {getTypeText(type)}
    </Badge>
  )
}

export const StatusBadge = ({ status }: { status: MediaStatusEnum }) => {
  const statusColors: Record<MediaStatusEnum, string> = {
    [MediaStatusEnum.IN_PROGRESS]: "bg-blue-500",
    [MediaStatusEnum.FOLLOWING]: "bg-gray-500",
    [MediaStatusEnum.ON_HOLD]: "bg-yellow-500",
    [MediaStatusEnum.DROPPED]: "bg-red-500",
    [MediaStatusEnum.FINISHED]: "bg-green-500",
  };

  function getStatusText(status: MediaStatusEnum) {
    switch (status) {
      case MediaStatusEnum.IN_PROGRESS:
        return t("status.in_progress", { ns: "media" })
      case MediaStatusEnum.FOLLOWING:
        return t("status.following", { ns: "media" })
      case MediaStatusEnum.ON_HOLD:
        return t("status.on_hold", { ns: "media" })
      case MediaStatusEnum.DROPPED:
        return t("status.dropped", { ns: "media" })
      case MediaStatusEnum.FINISHED:
        return t("status.finished", { ns: "media" })
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