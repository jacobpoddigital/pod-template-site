"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/ui/tabs";

// Client leaf — Radix Tabs. Content is ALREADY sanitised on the server (the block
// component calls sanitize()), so this just injects clean HTML with prose styles.
const prose =
  "body max-w-[min(65ch,90vw)] text-ink-muted [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-ink [&_p]:mt-3 [&_p:first-child]:mt-0 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mt-1 [&_a]:text-primary [&_a]:underline";

export function TabbedTabs({ tabs }: { tabs: { label: string; html: string }[] }) {
  return (
    <Tabs defaultValue="tab-0">
      <TabsList className="mb-6 flex-wrap">
        {tabs.map((t, i) => (
          <TabsTrigger key={`${t.label}-${i}`} value={`tab-${i}`}>
            {t.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((t, i) => (
        <TabsContent key={`${t.label}-${i}`} value={`tab-${i}`} className={prose}>
          <div dangerouslySetInnerHTML={{ __html: t.html }} />
        </TabsContent>
      ))}
    </Tabs>
  );
}
