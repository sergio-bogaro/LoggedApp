import LanguageSwitcher from "@/components/LanguageSwitcher";
import RatingSwitcher from "@/components/RatingSwitcher";
import ThemeSwitcher from "@/components/ThemeSwitcher";

function SettingsPage() {
  return (
    <div>
      <LanguageSwitcher />
      <ThemeSwitcher />
      <RatingSwitcher />
    </div>
  )
}

export default SettingsPage;