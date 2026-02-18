import { t } from "i18next";

import { MediaStatusEnum } from "@/types/media";

export const statusAnimeOptions = [
  { value: MediaStatusEnum.IN_PROGRESS, label: t("status.in_progress", { ns: "media" }) },
  { value: MediaStatusEnum.DROPPED, label: t("status.dropped", { ns: "media" }) },
  { value: MediaStatusEnum.ON_HOLD, label: t("status.on_hold", { ns: "media" }) },
  { value: MediaStatusEnum.FOLLOWING, label: t("status.following", { ns: "media" }) },
  { value: MediaStatusEnum.FINISHED, label: t("status.finished", { ns: "media" }) },
]