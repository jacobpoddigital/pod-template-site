import Link from "next/link";
import { notFound } from "next/navigation";
import { Download } from "lucide-react";
import { ACCOUNT_ENABLED } from "@/lib/commerce/config";
import { getCustomerDownloads } from "@/lib/commerce/customer";
import { EmptyState } from "../_components/empty-state";
import { formatOrderDate } from "../_lib/format";

// /account/downloads — virtual/downloadable products the customer can access. Personalised + noindex.
export const metadata = { title: "Downloads" };

export default async function DownloadsPage() {
  if (!ACCOUNT_ENABLED) notFound(); // commerce account module off → not a route on this site
  const downloads = await getCustomerDownloads().catch(() => []);

  return (
    <div className="space-y-5">
      <h2 className="display-xs text-foreground">Downloads</h2>
      {downloads.length === 0 ? (
        <EmptyState
          icon={<Download className="size-8" aria-hidden="true" />}
          title="No downloads"
          body="Digital products you buy will appear here, ready to download."
          cta={{ href: "/shop", label: "Browse the shop" }}
        />
      ) : (
        <ul className="space-y-3">
          {downloads.map((d) => (
            <li
              key={d.downloadId}
              className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-surface-raised p-4"
            >
              <div className="min-w-0">
                <p className="body-sm font-medium text-foreground">{d.name}</p>
                <p className="mt-0.5 body-sm text-muted-foreground">
                  {d.productSlug ? (
                    <Link href={`/product/${d.productSlug}`} className="text-link hover:underline">{d.productName ?? "View product"}</Link>
                  ) : (
                    d.productName
                  )}
                  {d.downloadsRemaining ? ` · ${d.downloadsRemaining} downloads left` : ""}
                  {d.accessExpires ? ` · expires ${formatOrderDate(d.accessExpires)}` : ""}
                </p>
              </div>
              {d.url ? (
                <a href={d.url} rel="nofollow" className="inline-flex items-center gap-1.5 body-sm font-medium text-link hover:underline">
                  <Download className="size-4" aria-hidden="true" /> Download
                </a>
              ) : (
                <span className="body-sm text-muted-foreground">Unavailable</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
