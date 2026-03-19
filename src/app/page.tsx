"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const PLACEHOLDER_EXAMPLES = [
  "I got fired for falling asleep during a board meeting...",
  "I accidentally replied-all with a meme about my boss...",
  "I've been pretending to work from home for 6 months...",
  "I got caught padding my resume with fake credentials...",
];

function SwapIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

function TranslatorApp() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [placeholder] = useState(
    () => PLACEHOLDER_EXAMPLES[Math.floor(Math.random() * PLACEHOLDER_EXAMPLES.length)]
  );

  // Load shared translation from URL params on mount
  useEffect(() => {
    const sharedInput = searchParams.get("q");
    const sharedOutput = searchParams.get("t");
    if (sharedInput) {
      setInput(sharedInput);
    }
    if (sharedOutput) {
      setOutput(sharedOutput);
    }
  }, [searchParams]);

  const handleTranslate = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    setLoading(true);
    setError("");
    setOutput("");

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }

      setOutput(data.translation);

      // Update URL with shareable params (without full page reload)
      const params = new URLSearchParams();
      params.set("q", trimmed);
      params.set("t", data.translation);
      router.replace(`?${params.toString()}`, { scroll: false });
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, [input, router]);

  async function handleCopy() {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleShareLink() {
    if (!output) return;
    const params = new URLSearchParams();
    params.set("q", input.trim());
    params.set("t", output);
    const shareUrl = `${window.location.origin}?${params.toString()}`;

    await navigator.clipboard.writeText(shareUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2500);
  }

  function handleShareLinkedIn() {
    if (!output) return;
    const params = new URLSearchParams();
    params.set("q", input.trim());
    params.set("t", output);
    const shareUrl = `${window.location.origin}?${params.toString()}`;

    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(linkedInUrl, "_blank", "noopener,noreferrer,width=600,height=600");
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      {/* Header */}
      <header className="border-b border-border bg-surface-alt sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <div className="spin-gradient w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">
              Li
            </div>
            <div>
              <h1 className="text-lg font-semibold text-text leading-tight">
                LinkedIn Translate
              </h1>
              <p className="text-xs text-text-secondary leading-tight">
                linkedintranslate.com
              </p>
            </div>
          </a>
          <div className="hidden sm:flex items-center gap-2 text-sm text-text-secondary">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-xs font-medium border border-border">
              Powered by Gemini 2.5 Flash
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10">
        {/* Language Selector Bar */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm">
            English
          </div>
          <div className="text-text-secondary">
            <SwapIcon />
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm">
            LinkedIn Speak
          </div>
        </div>

        {/* Translation Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Input Panel */}
          <div className="bg-surface-alt rounded-xl border border-border shadow-sm flex flex-col">
            <div className="px-4 py-3 border-b border-border">
              <span className="text-sm font-medium text-text-secondary">
                Honest Truth
              </span>
            </div>
            <div className="flex-1 p-4">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    handleTranslate();
                  }
                }}
                placeholder={placeholder}
                className="w-full h-full min-h-[200px] lg:min-h-[300px] resize-none text-text text-base leading-relaxed bg-transparent placeholder:text-text-secondary/50"
                maxLength={2000}
              />
            </div>
            <div className="px-4 py-3 border-t border-border flex items-center justify-between">
              <span className="text-xs text-text-secondary">
                {input.length} / 2,000
              </span>
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline text-xs text-text-secondary/50">
                  {"\u2318"}+Enter
                </span>
                <button
                  onClick={handleTranslate}
                  disabled={loading || !input.trim()}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-full text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span className="animate-pulse-subtle">Optimizing Vibe...</span>
                    </>
                  ) : (
                    "Translate"
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Output Panel */}
          <div className="bg-surface-alt rounded-xl border border-border shadow-sm flex flex-col">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <span className="text-sm font-medium text-text-secondary">
                LinkedIn-Ready Post
              </span>
              {output && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text hover:bg-surface rounded-lg transition-colors"
                    title="Copy translation to clipboard"
                  >
                    {copied ? <CheckIcon /> : <CopyIcon />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                  <button
                    onClick={handleShareLink}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text hover:bg-surface rounded-lg transition-colors"
                    title="Copy shareable link"
                  >
                    {linkCopied ? <CheckIcon /> : <ShareIcon />}
                    {linkCopied ? "Link copied!" : "Share link"}
                  </button>
                  <button
                    onClick={handleShareLinkedIn}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-linkedin hover:bg-linkedin-hover rounded-lg transition-colors"
                    title="Share to LinkedIn"
                  >
                    <LinkedInIcon />
                    LinkedIn
                  </button>
                </div>
              )}
            </div>
            <div className="flex-1 p-4 relative group">
              {error ? (
                <div className="text-red-600 text-sm bg-red-50 rounded-lg p-3 border border-red-200">
                  {error}
                </div>
              ) : output ? (
                <>
                  <div
                    className="text-text text-base leading-relaxed whitespace-pre-wrap cursor-text select-all"
                    onClick={(e) => {
                      const selection = window.getSelection();
                      const range = document.createRange();
                      range.selectNodeContents(e.currentTarget);
                      selection?.removeAllRanges();
                      selection?.addRange(range);
                    }}
                  >
                    {output}
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={handleCopy}
                      className="p-2 bg-surface-alt border border-border rounded-lg shadow-sm hover:bg-surface transition-colors"
                      title="Copy to clipboard"
                    >
                      {copied ? <CheckIcon /> : <CopyIcon />}
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full min-h-[200px] lg:min-h-[300px] text-text-secondary/40">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-3">
                    <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                  <p className="text-sm">Your LinkedIn masterpiece will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Example Prompts */}
        <div className="mt-8">
          <p className="text-sm text-text-secondary mb-3 text-center">Try an example:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              "I got fired on my first day",
              "I lied on my resume about knowing Python",
              "I fell asleep during my own presentation",
              "I've been using ChatGPT to do my entire job",
            ].map((example) => (
              <button
                key={example}
                onClick={() => setInput(example)}
                className="px-4 py-2 text-sm text-text-secondary bg-surface-alt border border-border rounded-full hover:border-primary hover:text-primary transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-surface-alt py-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-text-secondary">
          <p>LinkedIn Translate &mdash; Turning career catastrophes into LinkedIn gold.</p>
          <p>For entertainment purposes only. Please don&apos;t actually post these.</p>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense>
      <TranslatorApp />
    </Suspense>
  );
}
