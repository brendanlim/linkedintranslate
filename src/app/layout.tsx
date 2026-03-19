import type { Metadata } from "next";
import { DM_Sans, Instrument_Serif } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

const siteUrl = "https://linkedintranslate.com";

export const metadata: Metadata = {
  title: {
    default: "LinkedIn Translate — I'm Thrilled to Share...",
    template: "%s | LinkedIn Translate",
  },
  description:
    "Translate your career catastrophes into perfectly polished LinkedIn posts. The free AI-powered tool that turns brutal honesty into corporate optimism.",
  keywords: [
    "LinkedIn post generator",
    "LinkedIn translator",
    "LinkedIn speak",
    "corporate jargon translator",
    "LinkedIn post writer",
    "career post generator",
    "funny LinkedIn posts",
    "LinkedIn parody",
    "AI LinkedIn writer",
    "professional spin doctor",
  ],
  authors: [{ name: "Brendan G. Lim" }],
  creator: "Brendan G. Lim",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "LinkedIn Translate",
    title: "LinkedIn Translate — I'm Thrilled to Share...",
    description:
      "Translate your career catastrophes into perfectly polished LinkedIn posts. Free AI-powered corporate jargon translator.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "LinkedIn Translate — Turn honest truths into LinkedIn gold",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LinkedIn Translate — I'm Thrilled to Share...",
    description:
      "Translate your career catastrophes into perfectly polished LinkedIn posts.",
    images: ["/og-image.png"],
    creator: "@brendanlim",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-C7GETQVL01"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-C7GETQVL01');
          `}
        </Script>
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
