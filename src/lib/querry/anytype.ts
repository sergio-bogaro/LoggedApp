import { MediaItem } from "@/types/mediaItem";
import { MediaTypeEnum } from "@/utils/mediaText";

const API_KEY = import.meta.env.VITE_ANYTYPE_API_KEY;

const headers = {
  Accept: "application/json",
  Authorization: `Bearer ${API_KEY}`,
  // "Access-Control-Allow-Origin": "*",
  // "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  // "Access-Control-Allow-Headers": "Content-Type, Authorization"
};

const ANYTYPE_BASE = "http://127.0.0.1:31009/v1";

export async function anytypeTest(): Promise<any> {
  const res = await fetch(`${ANYTYPE_BASE}/spaces`, {
    method: "GET",
    headers,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Anytype API error: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data;
}

export async function searchAnytypeObjects(query: string): Promise<MediaItem[]> {
  if (!query || query.trim().length === 0) return [];
  const params = new URLSearchParams();
  params.set("query", query);
  params.set("limit", "20");

  const res = await fetch(`${ANYTYPE_BASE}/objects?${params.toString()}`, {
    method: "GET",
    headers,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Anytype API error: ${res.status} ${text}`);
  }

  const data = await res.json();
  return (data.data || []).map((obj: any) => ({
    id: obj.id,
    title: obj.attributes.title || "",
    coverUrl: obj.attributes.icon || "",
    year: obj.attributes.createdAt ? new Date(obj.attributes.createdAt).getFullYear() : undefined,
    type: obj.attributes.type as MediaTypeEnum,
    description: obj.attributes.description || "",
    provider: "anytype",
    raw: obj,
  }));
}

export async function getAnytypeObjectDetails(id: string): Promise<MediaItem> {
  if (!id || id.trim().length === 0) throw new Error("ID is required");

  const res = await fetch(`${ANYTYPE_BASE}/objects/${id}`, {
    method: "GET",
    headers,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Anytype API error: ${res.status} ${text}`);
  }

  const data = await res.json();
  const obj = data.data;

  return {
    id: obj.id,
    title: obj.attributes.title || "",
    coverUrl: obj.attributes.icon || "",
    year: obj.attributes.createdAt ? new Date(obj.attributes.createdAt).getFullYear() : undefined,
    type: obj.attributes.type as MediaTypeEnum,
    description: obj.attributes.description || "",
    provider: "anytype",
    raw: obj,
  };
}