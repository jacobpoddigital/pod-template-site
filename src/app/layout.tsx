import type { Metadata, Viewport } from "next";
import { Header } from "@/layout/header";
import { Footer } from "@/layout/footer";
import { StructuredData } from "./structured-data";
import { getSiteChrome } from "@/lib/cms";
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

// Mobile browser chrome matches the theme (surface colour per mode).
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1c1f27" },
  ],
};

// No-flash: apply a saved light/dark choice to <html> before paint. Absent = follow the OS
// (pure CSS, no flash). The only sanctioned inline script — runs as the body parses.
const THEME_INIT = `try{var t=localStorage.theme;if(t==='dark'||t==='light')document.documentElement.dataset.theme=t}catch(e){}`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Chrome is editor-managed in WP — fetched once here, passed to header + footer.
  const chrome = await getSiteChrome();
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-surface text-ink font-sans">
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
        <a
          href="#main-content"
          className="sr-only rounded focus-visible:not-sr-only focus-visible:absolute focus-visible:left-4 focus-visible:top-4 focus-visible:z-[60] focus-visible:bg-primary focus-visible:px-4 focus-visible:py-2 focus-visible:font-medium focus-visible:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Skip to content
        </a>
        <Header chrome={chrome} />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer chrome={chrome} />
        <StructuredData />
      </body>
    </html>
  );
}
