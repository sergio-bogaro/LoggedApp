import { useTranslation } from "react-i18next"

import { cn } from "@/lib/utils"
import { MediaStatusEnum, MediaTypeEnum } from "@/types/media"

/*
 * One hue per media type — the categorical ramp. A short rule is the only
 * place color carries type meaning, so there are no colored pills and no
 * badge soup competing with the artwork.
 */
const typeRule: Record<MediaTypeEnum, string> = {
  [MediaTypeEnum.MOVIES]: "bg-type-film",
  [MediaTypeEnum.ANIME]: "bg-type-anime",
  [MediaTypeEnum.MANGA]: "bg-type-manga",
  [MediaTypeEnum.GAME]: "bg-type-game",
  [MediaTypeEnum.BOOK]: "bg-type-book",
  [MediaTypeEnum.MUSIC]: "bg-type-music",
}

interface TypeMarkProps {
  type: MediaTypeEnum
  /** "overlay" sits on artwork and needs its own scrim; "plain" sits on a plane. */
  tone?: "overlay" | "plain"
  className?: string
}

export const TypeMark = ({ type, tone = "plain", className }: TypeMarkProps) => {
  const { t } = useTranslation("media")
  const label = t(`type.${type}`)

  if (tone === "overlay") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-control bg-black/70 px-2 py-0.5",
          "text-step-1 font-medium text-white backdrop-blur-sm",
          className
        )}
      >
        <span aria-hidden="true" className={cn("size-1.5 rounded-full", typeRule[type])} />
        {label}
      </span>
    )
  }

  return (
    <span className={cn("inline-flex items-center gap-2 text-step-1 text-muted-foreground", className)}>
      <span aria-hidden="true" className={cn("h-0.5 w-5 rounded-full", typeRule[type])} />
      {label}
    </span>
  )
}

/*
 * Status is encoded by a mark, not by hue: the categorical ramp already owns
 * color, so the mark only separates active / done / inactive and the label
 * carries the specific status.
 */
type StatusSpec = { mark: string; text: string }

const statusSpec: Record<MediaStatusEnum, StatusSpec> = {
  [MediaStatusEnum.IN_PROGRESS]: { mark: "border-primary bg-primary", text: "text-foreground" },
  [MediaStatusEnum.FOLLOWING]: { mark: "border-primary bg-primary", text: "text-foreground" },
  [MediaStatusEnum.FINISHED]: { mark: "border-foreground bg-foreground", text: "text-foreground" },
  [MediaStatusEnum.ON_HOLD]: { mark: "border-muted-foreground bg-transparent", text: "text-muted-foreground" },
  [MediaStatusEnum.DROPPED]: { mark: "border-muted-foreground bg-transparent", text: "text-muted-foreground" },
}

/*
 * Status is nullable in the API — a title can be tracked without one. An
 * unknown or absent status renders nothing rather than guessing.
 */
export const StatusMark = ({ status, className }: { status?: MediaStatusEnum | null; className?: string }) => {
  const { t } = useTranslation("media")
  const spec = status ? statusSpec[status] : undefined

  if (!spec) return null

  return (
    <span className={cn("inline-flex items-center gap-2 text-step-1", spec.text, className)}>
      <span aria-hidden="true" className={cn("size-2 rounded-[2px] border", spec.mark)} />
      {t(`status.${status}`)}
    </span>
  )
}
