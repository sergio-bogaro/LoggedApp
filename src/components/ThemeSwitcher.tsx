import { useTranslation } from "react-i18next"

import { useAppDispatch, useAppSelector } from "../store/settings/hooks"
import { setTheme } from "../store/settings/slice"
import type { Theme } from "../store/settings/slice"

import { Select } from "./ui/select"

const themeOptions = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "test", label: "Test" },
]

function ThemeSwitcher() {
  const { t } = useTranslation()
  const { theme } = useAppSelector(state => state.ui)
  const dispatch = useAppDispatch()

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