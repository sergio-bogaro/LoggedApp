import { useQuery } from "@tanstack/react-query";
import { t } from "i18next";
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
import { customViewsApi } from "@/querries/customViews/customViews";
import { useAppSelector } from "@/store/auth/hooks";
import type { CustomView } from "@/types/customView";

export function AppSidebar() {
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);

  const { data: customViews } = useQuery<CustomView[]>({
    queryKey: ["custom-views", user?.id],
    queryFn: () => customViewsApi.getUserViews(user!.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  const visibleViews = customViews
    ?.filter((v) => v.isVisible)
    .sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return a.order - b.order;
    }) ?? [];

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground font-bold">
            L
          </div>
          <span className="text-lg font-semibold">Logged</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavigation.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.path}
                  >
                    <Link to={item.path}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>{t("label", { ns: "media" })}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mediaTypes.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.path}
                  >
                    <Link to={item.path}>
                      <item.icon />
                      <span>{ t(`type.${item.type}`, { ns: "media" }) }</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {visibleViews.length > 0 && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Views</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {visibleViews.map((view) => {
                    const viewTypes = view.filters?.media_types;
                    const singleType = viewTypes?.length === 1 ? viewTypes[0] : undefined;
                    const href = singleType
                      ? `/media/list/${singleType}?view=${view.id}`
                      : `/media/list?view=${view.id}`;
                    const isActive =
                      location.pathname === (singleType ? `/media/list/${singleType}` : "/media/list") &&
                      location.search === `?view=${view.id}`;

                    return (
                      <SidebarMenuItem key={view.id}>
                        <SidebarMenuButton asChild isActive={isActive}>
                          <Link to={href}>
                            <span>{view.icon ?? "📁"}</span>
                            <span>{view.name}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
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
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
