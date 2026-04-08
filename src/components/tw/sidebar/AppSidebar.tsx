import { Film, Tv, BookOpen, Gamepad2, Home, Settings } from "lucide-react";
import { Link, useLocation } from "react-router";

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
import { MediaTypeEnum } from "@/types/media";

const mediaTypes = [
  {
    title: "Filmes",
    icon: Film,
    type: MediaTypeEnum.MOVIES,
    path: "/media/list/movies",
  },
  {
    title: "Animes",
    icon: Tv,
    type: MediaTypeEnum.ANIME,
    path: "/media/list/anime",
  },
  {
    title: "Mangás",
    icon: BookOpen,
    type: MediaTypeEnum.MANGA,
    path: "/media/list/manga",
  },
  {
    title: "Livros",
    icon: BookOpen,
    type: MediaTypeEnum.BOOK,
    path: "/media/list/books",
  },
  {
    title: "Jogos",
    icon: Gamepad2,
    type: MediaTypeEnum.GAME,
    path: "/media/list/games",
  },
];

const mainNavigation = [
  {
    title: "Home",
    icon: Home,
    path: "/media/home",
  },
];

const bottomNavigation = [
  {
    title: "Configurações",
    icon: Settings,
    path: "/settings",
  },
];

export function AppSidebar() {
  const location = useLocation();

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
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
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
          <SidebarGroupLabel>Mídias</SidebarGroupLabel>
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
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
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
