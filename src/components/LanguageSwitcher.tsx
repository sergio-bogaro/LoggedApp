import { useTranslation } from "react-i18next";

import { Select } from "./ui/select";

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation("common");
  const languageOptions = [
    { value: "en", label: t("languageOptions.en") },
    { value: "ptBr", label: t("languageOptions.ptBr") },
  ];

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("i18nextLng", lng);
  };

  return (
    <Select
      label={t("language")}
      name="language"
      value={i18n.language}
      options={languageOptions}
      onValueChange={(e) => changeLanguage(e)}
    />
  );
};

export default LanguageSwitcher;
