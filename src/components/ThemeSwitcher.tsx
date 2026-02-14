import { useTranslation } from "react-i18next"

import { useAppDispatch, useAppSelector } from "../store/settings/hooks"
import { setTheme } from "../store/settings/slice"
import type { Theme } from "../store/settings/slice"

import { Select } from "./ui/select"

function ThemeSwitcher() {
  const { t } = useTranslation(["common", "themes"])
  const { theme } = useAppSelector(state => state.ui)
  const dispatch = useAppDispatch()

  const themeOptions = [
    { value: "light", label: t("light", { ns: "themes" }) },
    { value: "dark", label: t("dark", { ns: "themes" }) },
    { value: "test", label: t("test", { ns: "themes" }) },
  ]

  const handleThemeChange = (newTheme: Theme) => {
    dispatch(setTheme(newTheme))
  }

  return (
    <Select
      label={t("common.theme")}
      name="theme"
      options={themeOptions}
      value={theme}
      onValueChange={(e) => handleThemeChange(e as Theme)}
    />
  )
}

export default ThemeSwitcher;