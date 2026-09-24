import { API_BASE_URL } from "@/querries/apiBase";
import { CustomView, CustomViewCreate, CustomViewReorder, CustomViewUpdate } from "@/types/customView";

async function apiFetch<T>(path: string, options?: globalThis.RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API error ${res.status}: ${body}`);
  }

  if (res.status === 204) return undefined as T;

  return (await res.json()) as T;
}

export async function getCustomViews(userId: number): Promise<CustomView[]> {
  return apiFetch<CustomView[]>(`/custom-views/user/${userId}`);
}

export async function createCustomView(data: CustomViewCreate): Promise<CustomView> {
  return apiFetch<CustomView>("/custom-views/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateCustomView(
  viewId: number,
  userId: number,
  data: CustomViewUpdate
): Promise<CustomView> {
  return apiFetch<CustomView>(`/custom-views/${viewId}?user_id=${userId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteCustomView(viewId: number, userId: number): Promise<void> {
  await apiFetch<void>(`/custom-views/${viewId}?user_id=${userId}`, { method: "DELETE" });
}

export async function reorderCustomViews(
  userId: number,
  items: CustomViewReorder[]
): Promise<CustomView[]> {
  return apiFetch<CustomView[]>(`/custom-views/user/${userId}/reorder`, {
    method: "POST",
    body: JSON.stringify(items),
  });
}
