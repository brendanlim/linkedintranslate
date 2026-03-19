import { Redis } from "@upstash/redis";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import ShareRedirect from "./redirect";

const redis = Redis.fromEnv();
const siteUrl = "https://linkedintranslate.com";

async function getShareData(
  id: string
): Promise<{ q: string; t: string } | null> {
  try {
    const data = await redis.get<string>(`share:${id}`);
    if (!data) return null;
    return typeof data === "string" ? JSON.parse(data) : data;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const data = await getShareData(id);

  if (!data) return {};

  const truncatedInput =
    data.q.slice(0, 80) + (data.q.length > 80 ? "..." : "");
  const truncatedOutput =
    data.t.slice(0, 150) + (data.t.length > 150 ? "..." : "");
  const title = `"${truncatedInput}" → LinkedIn Translate`;
  const description = truncatedOutput;
  const ogUrl = `${siteUrl}/api/og?q=${encodeURIComponent(data.q)}&t=${encodeURIComponent(data.t)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${siteUrl}/s/${id}`,
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

export default async function SharePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getShareData(id);

  if (!data) {
    redirect("/");
  }

  // Render the page (so crawlers get the meta tags in the HTML),
  // then redirect the browser client-side
  return <ShareRedirect q={data.q} t={data.t} />;
}
