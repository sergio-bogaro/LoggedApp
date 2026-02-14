import { t } from "i18next"

import { MediaTypeEnum } from "@/utils/mediaText"

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
    <span className="bg-primary text-sm px-2 py-1 rounded">
      {getTypeText(type)}
    </span>
  )
}