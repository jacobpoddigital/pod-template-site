import type { Metadata } from "next";
import { Header } from "@/layout/header";
import { Footer } from "@/layout/footer";
import { StructuredData } from "./structured-data";
import { siteConfig } from "../../site.config";
import "./globals.css";

// TEMPLATE: add the client typeface here before any design work.
// See KB 01 §Font selection — display serif + grotesque body is the default pair.
// Load only the weights you use (each weight = separate network request).
// Example:
//   import { Inter } from "next/font/google";
//   const sans = Inter({ variable: "--font-sans", subsets: ["latin"] });
//   Then pass className={sans.variable} to <html>.

// Canonical/OG URLs point at the FRONTEND domain, never the WP origin.
export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  // Canonicals always point at the FRONTEND domain, never the WP origin (workflow/04 §3).
  alternates: { canonical: "/" },
  openGraph: {
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-surface text-ink font-sans">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-brand focus:px-4 focus:py-2 focus:text-on-brand"
        >
          Skip to content
        </a>
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
        <StructuredData />
      </body>
    </html>
  );
}
