import { useNavigate } from "react-router";
import { toast } from "sonner";

import LanguageSwitcher from "@/components/LanguageSwitcher";
import RatingSwitcher from "@/components/RatingSwitcher";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/auth/hooks";
import { logout } from "@/store/auth/slice";
import CustomViewsManager from "./views";

function SettingsPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-4">Settings</h1>
        {user && (
          <div className="mb-4 p-4 bg-accent rounded">
            <p className="text-sm text-muted-foreground">Logged in as</p>
            <p className="font-semibold">{user.username}</p>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">Appearance</h2>
          <div className="space-y-2">
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Display</h2>
          <RatingSwitcher />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Custom Views</h2>
          <CustomViewsManager />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Account</h2>
          <Button onClick={handleLogout} variant="destructive">
            Logout
          </Button>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage;