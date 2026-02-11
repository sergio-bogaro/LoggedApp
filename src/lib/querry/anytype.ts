import { MediaItem } from "@/types/mediaItem";
import { MediaTypeEnum } from "@/utils/mediaText";

const API_KEY = import.meta.env.VITE_ANYTYPE_API_KEY;

const headers = {
  Accept: "application/json",
  Authorization: `Bearer ${API_KEY}`,
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};

const SPACE_ID = "bafyreihbicmzhvtmeibtddykhtafcjd6lgowolxnc6po6gzkajbwqyb63m.2dz2jk9v9oytn"

const ANYTYPE_BASE = import.meta.env.DEV
  ? "/anytype-api"
  : "http://127.0.0.1:31009/v1";

export async function anytypeTest(): Promise<any> {
  const res = await fetch(`${ANYTYPE_BASE}/spaces/${SPACE_ID}/objects`, {
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

// ==================== MEDIA DATABASE ====================

export interface MediaRecord {
  id?: string; // ID do Anytype (gerado após criação)
  idLocal: number; // Sequencial
  idExterno: string;
}

/**
 * Cria um registro de Media no Anytype
 * Pré-requisito: Criar o Object Type "Media" na interface do Anytype com as relations idLocal e idExterno
 */
export async function createMedia(data: Omit<MediaRecord, "id">): Promise<MediaRecord> {
  const payload = {
    typeKey: "Media", // Nome do Object Type criado no Anytype
    fields: {
      idLocal: data.idLocal,
      idExterno: data.idExterno,
    }
  };

  const res = await fetch(`${ANYTYPE_BASE}/spaces/${SPACE_ID}/objects`, {
    method: "POST",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Anytype API error ao criar Media: ${res.status} ${text}`);
  }

  const result = await res.json();
  return {
    id: result.id,
    idLocal: data.idLocal,
    idExterno: data.idExterno,
  };
}

/**
 * Busca Media por idLocal
 */
export async function getMediaByIdLocal(idLocal: number): Promise<MediaRecord | null> {
  const params = new URLSearchParams();
  params.set("query", `idLocal:${idLocal}`);
  params.set("limit", "1");

  const res = await fetch(`${ANYTYPE_BASE}/spaces/${SPACE_ID}/search?${params.toString()}`, {
    method: "GET",
    headers,
  });

  if (!res.ok) return null;

  const data = await res.json();
  const obj = data.records?.[0];

  if (!obj) return null;

  return {
    id: obj.id,
    idLocal: obj.fields?.idLocal,
    idExterno: obj.fields?.idExterno,
  };
}

/**
 * Busca Media por idExterno
 */
export async function getMediaByIdExterno(idExterno: string): Promise<MediaRecord | null> {
  const params = new URLSearchParams();
  params.set("query", `idExterno:"${idExterno}"`);
  params.set("limit", "1");

  const res = await fetch(`${ANYTYPE_BASE}/spaces/${SPACE_ID}/search?${params.toString()}`, {
    method: "GET",
    headers,
  });

  if (!res.ok) return null;

  const data = await res.json();
  const obj = data.records?.[0];

  if (!obj) return null;

  return {
    id: obj.id,
    idLocal: obj.fields?.idLocal,
    idExterno: obj.fields?.idExterno,
  };
}

/**
 * Lista todos os registros de Media
 */
export async function getAllMedia(): Promise<MediaRecord[]> {
  const params = new URLSearchParams();
  params.set("query", "type:Media");
  params.set("limit", "100");

  const res = await fetch(`${ANYTYPE_BASE}/spaces/${SPACE_ID}/search?${params.toString()}`, {
    method: "GET",
    headers,
  });

  if (!res.ok) return [];

  const data = await res.json();
  return (data.records || []).map((obj: any) => ({
    id: obj.id,
    idLocal: obj.fields?.idLocal,
    idExterno: obj.fields?.idExterno,
  }));
}

// ==================== MEDIA LOG DATABASE ====================

export interface MediaLogRecord {
  id?: string; // ID do Anytype (gerado após criação)
  mediaId: string; // ID do objeto Media (relation)
  titulo: string;
  descricao: string;
  status: "planejado" | "em andamento" | "concluído";
  dataRegistro: string; // ISO 8601 format
  fotoCapa?: string;
}

/**
 * Cria um registro de Media Log no Anytype
 * Pré-requisito: Criar o Object Type "Media Log" na interface do Anytype
 */
export async function createMediaLog(data: Omit<MediaLogRecord, "id" | "dataRegistro"> & { dataRegistro?: string }): Promise<MediaLogRecord> {
  const dataRegistro = data.dataRegistro || new Date().toISOString();

  const payload = {
    typeKey: "Media Log", // Nome do Object Type criado no Anytype
    fields: {
      mediaId: data.mediaId, // Relation com o objeto Media
      titulo: data.titulo,
      descricao: data.descricao,
      status: data.status,
      dataRegistro: dataRegistro,
      fotoCapa: data.fotoCapa || "",
    }
  };

  const res = await fetch(`${ANYTYPE_BASE}/spaces/${SPACE_ID}/objects`, {
    method: "POST",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Anytype API error ao criar Media Log: ${res.status} ${text}`);
  }

  const result = await res.json();
  return {
    id: result.id,
    mediaId: data.mediaId,
    titulo: data.titulo,
    descricao: data.descricao,
    status: data.status,
    dataRegistro: dataRegistro,
    fotoCapa: data.fotoCapa,
  };
}

/**
 * Busca todos os logs de uma media específica (ordenados por data desc)
 */
export async function getMediaLogsByMediaId(mediaId: string): Promise<MediaLogRecord[]> {
  const params = new URLSearchParams();
  params.set("query", `type:"Media Log" AND mediaId:"${mediaId}"`);
  params.set("limit", "100");
  params.set("sort", "dataRegistro:desc");

  const res = await fetch(`${ANYTYPE_BASE}/spaces/${SPACE_ID}/search?${params.toString()}`, {
    method: "GET",
    headers,
  });

  if (!res.ok) return [];

  const data = await res.json();
  return (data.records || []).map((obj: any) => ({
    id: obj.id,
    mediaId: obj.fields?.mediaId,
    titulo: obj.fields?.titulo,
    descricao: obj.fields?.descricao,
    status: obj.fields?.status,
    dataRegistro: obj.fields?.dataRegistro,
    fotoCapa: obj.fields?.fotoCapa,
  }));
}

/**
 * Busca um log específico pelo ID
 */
export async function getMediaLogById(logId: string): Promise<MediaLogRecord | null> {
  const res = await fetch(`${ANYTYPE_BASE}/spaces/${SPACE_ID}/objects/${logId}`, {
    method: "GET",
    headers,
  });

  if (!res.ok) return null;

  const data = await res.json();
  const obj = data.object;

  return {
    id: obj.id,
    mediaId: obj.fields?.mediaId,
    titulo: obj.fields?.titulo,
    descricao: obj.fields?.descricao,
    status: obj.fields?.status,
    dataRegistro: obj.fields?.dataRegistro,
    fotoCapa: obj.fields?.fotoCapa,
  };
}

/**
 * Lista todos os logs (ordenados por data desc)
 */
export async function getAllMediaLogs(): Promise<MediaLogRecord[]> {
  const params = new URLSearchParams();
  params.set("query", "type:\"Media Log\"");
  params.set("limit", "100");
  params.set("sort", "dataRegistro:desc");

  const res = await fetch(`${ANYTYPE_BASE}/spaces/${SPACE_ID}/search?${params.toString()}`, {
    method: "GET",
    headers,
  });

  if (!res.ok) return [];

  const data = await res.json();
  return (data.records || []).map((obj: any) => ({
    id: obj.id,
    mediaId: obj.fields?.mediaId,
    titulo: obj.fields?.titulo,
    descricao: obj.fields?.descricao,
    status: obj.fields?.status,
    dataRegistro: obj.fields?.dataRegistro,
    fotoCapa: obj.fields?.fotoCapa,
  }));
}