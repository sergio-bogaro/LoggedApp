import { useTranslation } from "react-i18next"

import { useAppDispatch, useAppSelector } from "../store/settings/hooks"
import { ALL_THEMES, setTheme } from "../store/settings/slice"
import type { Theme } from "../store/settings/slice"

import { Select } from "./ui/select"

function ThemeSwitcher() {
  const { t } = useTranslation(["common", "themes"])
  const { theme } = useAppSelector(state => state.ui)
  const dispatch = useAppDispatch()

  const themeOptions = ALL_THEMES.map((value) => ({
    value,
    label: t(value, { ns: "themes" }),
  }))

  const handleThemeChange = (newTheme: Theme) => {
    dispatch(setTheme(newTheme))
  }

  return (
    <Select
      label={t("theme")}
      name="theme"
      options={themeOptions}
      value={theme}
      onValueChange={(e) => handleThemeChange(e as Theme)}
    />
  )
}

export default ThemeSwitcher;
