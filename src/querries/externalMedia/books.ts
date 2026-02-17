/* eslint-disable @typescript-eslint/no-explicit-any */
import { MediaItem } from "@/types/media";
import { MediaTypeEnum } from "@/types/media";

export type BookItem = {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
  coverUrl?: string;
};

const OPENLIB_BASE = "https://openlibrary.org";

export async function searchBooks(title: string): Promise<BookItem[]> {
  if (!title || title.trim().length === 0) return [];
  const params = new URLSearchParams();
  params.set("title", title);
  params.set("limit", "20");

  const res = await fetch(`${OPENLIB_BASE}/search.json?${params.toString()}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenLibrary API error: ${res.status} ${text}`);
  }

  const data = await res.json();

  const docs = data.docs || [];
  const rawItems: BookItem[] = docs.map((d: any) => {
    const cover_i = d.cover_i;
    const coverUrl = cover_i ? `https://covers.openlibrary.org/b/id/${cover_i}-M.jpg` : undefined;
    return { key: d.key, title: d.title, author_name: d.author_name, first_publish_year: d.first_publish_year, cover_i, coverUrl } as BookItem;
  });


  const seen = new Set<string>();
  const items: BookItem[] = [];
  for (const it of rawItems) {
    const titleNorm = (it.title || "").trim().toLowerCase();
    const author = Array.isArray(it.author_name) && it.author_name.length > 0 ? String(it.author_name[0]).trim().toLowerCase() : "";
    const key = `${titleNorm}||${author}`;
    if (!seen.has(key)) {
      seen.add(key);
      items.push(it);
    }
  }

  return items;
}

export async function searchBooksNormalized(title: string): Promise<MediaItem[]> {
  const books = await searchBooks(title);

  return books.map((book) => ({
    id: book.key.split("/")[2],
    title: book.title,
    coverUrl: book.coverUrl || "",
    year: book.first_publish_year,
    type: MediaTypeEnum.BOOK,
    description: book.author_name ? `Author: ${book.author_name.join(", ")}` : "",
    provider: "openlibrary",
    raw: book,
  }));
}


export async function getBookDetails(key: string) {
  // key typically looks like '/works/OL12345W' or '/books/OL...'
  const path = key.startsWith("/") ? key : `/works/${key}`;
  const res = await fetch(`https://openlibrary.org${path}.json`);
  if (!res.ok) throw new Error("OpenLibrary details error");
  return res.json();
}


