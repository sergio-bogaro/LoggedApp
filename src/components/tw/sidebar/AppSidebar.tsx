import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router";

import { bottomNavigation, mainNavigation, mediaTypes } from "./const";

import { BrandMark } from "@/components/tw/generic/BrandMark";
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
    (item) =>
      hasTrackedMedia || (item.path !== "/search" && item.path !== "/media/views")
  );

  const isPathActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center py-2">
          <BrandMark size="sm" />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleMainNavigation.map((item) => {
                const label = t(item.titleKey, { ns: "common" });
                const active = isPathActive(item.path);

                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild isActive={active} tooltip={label}>
                      <Link to={item.path} aria-current={active ? "page" : undefined}>
                        <item.icon aria-hidden="true" />
                        <span>{label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {hasTrackedMedia && <SidebarSeparator />}

        {hasTrackedMedia && (
          <SidebarGroup className="overflow-y-auto">
            <SidebarGroupLabel className="text-step-0 font-medium text-muted-foreground">
              {t("label", { ns: "media" })}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu >
                {visibleMediaTypes.map((item) => {
                  const label = t(`type.${item.type}`, { ns: "media" });
                  const active =
                    isPathActive(item.path) ||
                    location.pathname.startsWith(`/media/${item.type}/details`);

                  return (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton asChild isActive={active} tooltip={label}>
                        <Link to={item.path} aria-current={active ? "page" : undefined}>
                          <item.icon aria-hidden="true" />
                          <span>{label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {bottomNavigation.map((item) => {
            const label = t(item.titleKey, { ns: "common" });
            const active = isPathActive(item.path);

            return (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton asChild isActive={active} tooltip={label}>
                  <Link to={item.path} aria-current={active ? "page" : undefined}>
                    <item.icon aria-hidden="true" />
                    <span>{label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
