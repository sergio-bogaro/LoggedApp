import { LogOut } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppDispatch, useAppSelector } from "@/store/auth/hooks";
import { logout } from "@/store/auth/slice";

export function UserMenu() {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());

    toast.success(t("settings.logoutSuccess"));
    navigate("/");
  };

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label={`${t("settings.loggedInAs")} ${user.username}`}
          className="h-9 gap-2 px-1.5 pointer-coarse:h-11"
        >
          <span
            aria-hidden="true"
            className="flex size-7 items-center justify-center rounded-full bg-secondary font-serif text-step-1 font-medium text-secondary-foreground"
          >
            {user.username.slice(0, 1).toUpperCase()}
          </span>
          <span className="hidden max-w-28 truncate text-step-1 sm:inline">{user.username}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <span className="block text-step-0 font-normal text-muted-foreground">
            {t("settings.loggedInAs")}
          </span>
          <span className="font-medium">{user.username}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          {t("actions.logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
