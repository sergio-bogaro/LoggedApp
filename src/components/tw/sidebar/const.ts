import { Film, Tv, BookOpen, BookText, Gamepad2, Home, Settings, Search, Star, Bookmark, Music } from "lucide-react";

import { MediaTypeEnum } from "@/types/media";
import { mediaTypeToPath } from "@/utils/mediaText";

export const mediaTypes = [
  {
    icon: Film,
    type: MediaTypeEnum.MOVIES,
    path: `/media/list/${mediaTypeToPath(MediaTypeEnum.MOVIES)}`,
  },
  {
    icon: Tv,
    type: MediaTypeEnum.ANIME,
    path: `/media/list/${mediaTypeToPath(MediaTypeEnum.ANIME)}`,
  },
  {
    icon: BookOpen,
    type: MediaTypeEnum.MANGA,
    path: `/media/list/${mediaTypeToPath(MediaTypeEnum.MANGA)}`,
  },
  {
    icon: BookText,
    type: MediaTypeEnum.BOOK,
    path: `/media/list/${mediaTypeToPath(MediaTypeEnum.BOOK)}`,
  },
  {
    icon: Gamepad2,
    type: MediaTypeEnum.GAME,
    path: `/media/list/${mediaTypeToPath(MediaTypeEnum.GAME)}`,
  },
  {
    icon: Music,
    type: MediaTypeEnum.MUSIC,
    path: `/media/list/${mediaTypeToPath(MediaTypeEnum.MUSIC)}`,
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
  {
    titleKey: "navigation.favorites",
    icon: Star,
    path: "/media/favorites",
  },
  {
    titleKey: "navigation.backlog",
    icon: Bookmark,
    path: "/media/backlog",
  },
];

export const bottomNavigation = [
  {
    titleKey: "navigation.settings",
    icon: Settings,
    path: "/settings",
  },
];
