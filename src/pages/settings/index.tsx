import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import LanguageSwitcher from "@/components/LanguageSwitcher";
import RatingSwitcher from "@/components/RatingSwitcher";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/auth/hooks";
import { logout } from "@/store/auth/slice";

function SettingsPage() {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());

    toast.success(t("settings.logoutSuccess"));
    navigate("/");
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">{t("settings.title")}</h1>

      <div>
        {user && (
          <div className="mb-4 py-2 px-3 bg-accent rounded-sm">
            <p className="text-sm text-muted-foreground">{t("settings.loggedInAs")}</p>
            <p className="font-semibold">{user.username}</p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <LanguageSwitcher />

        <ThemeSwitcher />

        <RatingSwitcher />

        <div>
          <h2 className="text-lg font-semibold mb-2">{t("settings.account")}</h2>
          <Button onClick={handleLogout} variant="destructive">
            {t("actions.logout")}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage;
