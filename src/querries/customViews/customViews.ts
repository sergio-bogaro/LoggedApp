const API_BASE_URL = "http://localhost:8000";

import type { CustomView, CustomViewCreate, CustomViewUpdate, CustomViewReorder } from "@/types/customView";

export const customViewsApi = {
  async getUserViews(userId: number): Promise<CustomView[]> {
    const response = await fetch(`${API_BASE_URL}/custom-views/user/${userId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to fetch custom views");
    }

    return response.json();
  },

  async getView(viewId: number, userId: number): Promise<CustomView> {
    const response = await fetch(`${API_BASE_URL}/custom-views/${viewId}?user_id=${userId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to fetch custom view");
    }

    return response.json();
  },

  async createView(data: CustomViewCreate): Promise<CustomView> {
    const response = await fetch(`${API_BASE_URL}/custom-views/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to create custom view");
    }

    return response.json();
  },

  async updateView(viewId: number, userId: number, data: CustomViewUpdate): Promise<CustomView> {
    const response = await fetch(`${API_BASE_URL}/custom-views/${viewId}?user_id=${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to update custom view");
    }

    return response.json();
  },

  async deleteView(viewId: number, userId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/custom-views/${viewId}?user_id=${userId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to delete custom view");
    }
  },

  async reorderViews(userId: number, reorderData: CustomViewReorder[]): Promise<CustomView[]> {
    const response = await fetch(`${API_BASE_URL}/custom-views/user/${userId}/reorder`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reorderData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to reorder views");
    }

    return response.json();
  },

  async createDefaultViews(userId: number): Promise<CustomView[]> {
    const response = await fetch(`${API_BASE_URL}/custom-views/user/${userId}/default`, {
      method: "POST",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to create default views");
    }

    return response.json();
  },
};
