"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ShareRedirect({ q, t }: { q: string; t: string }) {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("q", q);
    params.set("t", t);
    router.replace(`/?${params.toString()}`);
  }, [q, t, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-text-tertiary text-sm">Loading translation...</p>
    </div>
  );
}
