import { t } from "i18next";
import { Film, Tv, BookOpen, Gamepad2, Home, Settings } from "lucide-react";


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
    path: "/media/list/books",
  },
  {
    icon: Gamepad2,
    type: MediaTypeEnum.GAME,
    path: "/media/list/games",
  },
];

export const mainNavigation = [
  {
    title: "Home",
    icon: Home,
    path: "/media/home",
  },
];

export const bottomNavigation = [
  {
    title: "Configurações",
    icon: Settings,
    path: "/settings",
  },
];