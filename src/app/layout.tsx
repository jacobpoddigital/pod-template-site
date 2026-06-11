import type { Metadata } from "next";
import { Header } from "@/layout/header";
import { Footer } from "@/layout/footer";
import { StructuredData } from "./structured-data";
import { siteConfig } from "../../site.config";
import "./globals.css";

// TEMPLATE: load the client typeface here.
// See KB 01 §Font selection — display serif + grotesque body is the default pair.
// Load only the weights you use (each weight = separate network request).
// Example:
//   import { Inter } from "next/font/google";
//   const sans = Inter({ variable: "--font-sans", subsets: ["latin"] });
//   Pass className={sans.variable} to <html>.

// Canonical/OG URLs always point at the FRONTEND domain, never the WP origin.
export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
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
          href="#main-content"
          className="sr-only rounded focus-visible:not-sr-only focus-visible:absolute focus-visible:left-4 focus-visible:top-4 focus-visible:z-[60] focus-visible:bg-primary focus-visible:px-4 focus-visible:py-2 focus-visible:font-medium focus-visible:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Skip to content
        </a>
        <Header />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
        <StructuredData />
      </body>
    </html>
  );
}
