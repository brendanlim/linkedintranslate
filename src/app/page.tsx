import type { Metadata } from "next";
import { Readable } from "stream";
import { createInflateRaw } from "zlib";
import { redirect } from "next/navigation";
import { redis } from "@/lib/redis";
import Translator from "./translator";

const siteUrl = "https://linkedintranslate.com";

async function decodeShareParam(
  s: string
): Promise<{ q: string; t: string } | null> {
  try {
    let b64 = s.replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4) b64 += "=";
    const compressed = Buffer.from(b64, "base64");

    return new Promise((resolve) => {
      const inflate = createInflateRaw();
      const chunks: Buffer[] = [];
      inflate.on("data", (chunk: Buffer) => chunks.push(chunk));
      inflate.on("end", () => {
        try {
          const json = Buffer.concat(chunks).toString("utf-8");
          const data = JSON.parse(json);
          if (data.q && data.t) resolve(data);
          else resolve(null);
        } catch {
          resolve(null);
        }
      });
      inflate.on("error", () => resolve(null));
      Readable.from(compressed).pipe(inflate);
    });
  } catch {
    return null;
  }
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; t?: string; s?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;

  let q = params.q || "";
  let t = params.t || "";

  if (params.s) {
    const decoded = await decodeShareParam(params.s);
    if (decoded) {
      q = decoded.q;
      t = decoded.t;
    }
  }

  if (q && t) {
    const truncatedInput = q.slice(0, 80) + (q.length > 80 ? "..." : "");
    const truncatedOutput = t.slice(0, 150) + (t.length > 150 ? "..." : "");
    const title = `"${truncatedInput}" → LinkedIn Translate`;
    const description = truncatedOutput;
    const ogUrl = `${siteUrl}/api/og?q=${encodeURIComponent(q)}&t=${encodeURIComponent(t)}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: [{ url: ogUrl, width: 1200, height: 630 }],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [ogUrl],
      },
    };
  }

  return {};
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; t?: string; s?: string }>;
}) {
  const params = await searchParams;

  // If ?s= param exists, decode server-side and redirect to ?q=&t=
  if (params.s) {
    const decoded = await decodeShareParam(params.s);
    if (decoded) {
      const newParams = new URLSearchParams();
      newParams.set("q", decoded.q);
      newParams.set("t", decoded.t);
      redirect(`/?${newParams.toString()}`);
    }
  }

  // Fetch top trending translations for the zero state
  const trending = await getTopTranslations();

  return <Translator trending={trending} />;
}

async function getTopTranslations(): Promise<
  { id: string; q: string; t: string }[]
> {
  try {
    const raw = await redis.zrange("leaderboard", 0, 9, {
      rev: true,
      withScores: true,
    });

    const ids: string[] = [];
    for (let i = 0; i < raw.length; i += 2) {
      ids.push(raw[i] as string);
    }

    if (ids.length === 0) return [];

    const pipe = redis.pipeline();
    for (const id of ids) {
      pipe.get(`share:${id}`);
    }
    const results = await pipe.exec();

    const entries: { id: string; q: string; t: string }[] = [];
    for (let i = 0; i < ids.length; i++) {
      const data = results[i] as { q: string; t: string } | null;
      if (data?.q && data?.t) {
        entries.push({ id: ids[i], q: data.q, t: data.t });
      }
    }
    return entries;
  } catch {
    return [];
  }
}
