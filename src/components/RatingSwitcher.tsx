import { useTranslation } from "react-i18next"

import { useAppDispatch, useAppSelector } from "../store/settings/hooks"
import { setRatingMode } from "../store/settings/slice"
import type { RatingMode } from "../store/settings/slice"

import { Select } from "./ui/select"

import { RatingModeEnum } from "@/types/settings"

function RatingSwitcher() {
  const { t } = useTranslation(["common"])
  const { ratingMode } = useAppSelector(state => state.ui)
  const dispatch = useAppDispatch();

  const ratingOptions = [
    { value: RatingModeEnum.Numeric, label: t("rating_numeric", { ns: "common" }) },
    { value: RatingModeEnum.Stars5, label: t("rating_stars5", { ns: "common" }) },
    { value: RatingModeEnum.Stars10, label: t("rating_stars10", { ns: "common" }) },
  ]

  return (
    <Select
      label={t("rating_mode", { ns: "common" })}
      name="ratingMode"
      options={ratingOptions}
      value={ratingMode}
      onValueChange={(v) => dispatch(setRatingMode(v as RatingMode))}
    />
  )
}

export default RatingSwitcher
