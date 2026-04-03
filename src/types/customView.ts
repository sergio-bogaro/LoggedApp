export interface CustomViewFilters {
  media_types?: string[];
  status?: string[];
  min_rating?: number;
  max_rating?: number;
  tags?: string[];
  year_from?: number;
  year_to?: number;
  on_list?: boolean;
}

export interface CustomViewDisplaySettings {
  view_mode?: "list" | "grid";
  sort_by?: "title" | "rating" | "created_at" | "release_date" | "updated_at";
  sort_order?: "asc" | "desc";
  show_completed?: boolean;
  items_per_page?: number;
}

export interface CustomView {
  id: number;
  userId: number;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  order: number;
  isVisible: boolean;
  isPinned: boolean;
  filters?: CustomViewFilters;
  displaySettings?: CustomViewDisplaySettings;
  createdAt: string;
  updatedAt: string;
}

export interface CustomViewCreate {
  userId: number;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  order?: number;
  isVisible?: boolean;
  isPinned?: boolean;
  filters?: CustomViewFilters;
  displaySettings?: CustomViewDisplaySettings;
}

export interface CustomViewUpdate {
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
  order?: number;
  isVisible?: boolean;
  isPinned?: boolean;
  filters?: CustomViewFilters;
  displaySettings?: CustomViewDisplaySettings;
}

export interface CustomViewReorder {
  viewId: number;
  newOrder: number;
}
