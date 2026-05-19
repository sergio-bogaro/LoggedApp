import { t } from "i18next";
import { Film, Tv, BookOpen, Gamepad2, Home, Settings, Search } from "lucide-react";


import { MediaTypeEnum } from "@/types/media";

export const mediaTypes = [
  {
    icon: Film,
    type: MediaTypeEnum.MOVIES,
    path: "/media/list/movies",
  },
  {
    icon: Tv,
    type: MediaTypeEnum.ANIME,
    path: "/media/list/anime",
  },
  {
    icon: BookOpen,
    type: MediaTypeEnum.MANGA,
    path: "/media/list/manga",
  },
  {
    icon: BookOpen,
    type: MediaTypeEnum.BOOK,
    path: "/media/list/book",
  },
  {
    icon: Gamepad2,
    type: MediaTypeEnum.GAME,
    path: "/media/list/game",
  },
];

export const mainNavigation = [
  {
    titleKey: "navigation.home",
    icon: Home,
    path: "/media/home",
  },
  {
    titleKey: "navigation.search",
    icon: Search,
    path: "/search",
  },
];

export const bottomNavigation = [
  {
    titleKey: "navigation.settings",
    icon: Settings,
    path: "/settings",
  },
];
