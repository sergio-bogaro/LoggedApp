import { useTranslation } from "react-i18next";

import { Select } from "./ui/select";

const languageOptions = [
  { value: "en", label: "English" },
  { value: "ptBr", label: "Português (BR)" },
];

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation("common");

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <Select
      label={t("common.language")}
      name="language"
      value={i18n.language}
      options={languageOptions}
      onValueChange={(e) => changeLanguage(e)}
    />
  );
};

export default LanguageSwitcher;