import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router";

import { bottomNavigation, mainNavigation, mediaTypes } from "./const";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { useAppSelector } from "@/store/auth/hooks";
import { getTrackFlags } from "@/utils/mediaTrack";

export function AppSidebar() {
  const { t } = useTranslation(["common", "media"]);
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);

  const trackFlags = getTrackFlags(user);
  const visibleMediaTypes = mediaTypes.filter((item) => trackFlags[item.type]);
  const hasTrackedMedia = visibleMediaTypes.length > 0;

  const visibleMainNavigation = mainNavigation.filter(
    (item) => hasTrackedMedia || item.path !== "/search"
  );

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 py-2">
          <div className="flex items-center justify-center w-8 h-8 shrink-0 rounded-lg bg-primary text-primary-foreground font-bold">
             L
          </div>

          <SidebarGroupLabel className="text-lg font-semibold">{t("branding.sidebarName", { ns: "common" })}</SidebarGroupLabel>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleMainNavigation.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.path}
                  >
                    <Link to={item.path}>
                      <item.icon />
                      <span>{t(item.titleKey, { ns: "common" })}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {hasTrackedMedia && <SidebarSeparator />}

        {hasTrackedMedia && (
          <SidebarGroup className="overflow-y-auto">
            <SidebarGroupLabel> {t("label", { ns: "media" })} </SidebarGroupLabel>
            <SidebarGroupContent >
              <SidebarMenu >
                {visibleMediaTypes.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === item.path}
                    >
                      <Link to={item.path}>
                        <item.icon />
                        <span>{t(`type.${item.type}`, { ns: "media" })}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {bottomNavigation.map((item) => (
            <SidebarMenuItem key={item.path}>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === item.path}
              >
                <Link to={item.path}>
                  <item.icon />
                  <span>{t(item.titleKey, { ns: "common" })}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
