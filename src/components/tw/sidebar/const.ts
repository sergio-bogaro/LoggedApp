import { Film, Tv, BookOpen, BookText, Gamepad2, Home, Settings, Search, Star, Bookmark, Music, PlayCircle, Radio, PauseCircle, CheckCircle2, XCircle } from "lucide-react";

import { MediaStatusEnum, MediaTypeEnum } from "@/types/media";
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

export const mediaStatusViews = [
  {
    status: MediaStatusEnum.IN_PROGRESS,
    icon: PlayCircle,
    path: `/media/views/${MediaStatusEnum.IN_PROGRESS}`,
  },
  {
    status: MediaStatusEnum.FOLLOWING,
    icon: Radio,
    path: `/media/views/${MediaStatusEnum.FOLLOWING}`,
  },
  {
    status: MediaStatusEnum.ON_HOLD,
    icon: PauseCircle,
    path: `/media/views/${MediaStatusEnum.ON_HOLD}`,
  },
  {
    status: MediaStatusEnum.FINISHED,
    icon: CheckCircle2,
    path: `/media/views/${MediaStatusEnum.FINISHED}`,
  },
  {
    status: MediaStatusEnum.DROPPED,
    icon: XCircle,
    path: `/media/views/${MediaStatusEnum.DROPPED}`,
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
