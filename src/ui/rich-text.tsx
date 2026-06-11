import { cn } from "@/lib/utils";
import { sanitize } from "@/lib/sanitize";

// Renders a WordPress WYSIWYG/HTML field with prose typography. WP content is
// semi-trusted editor input, so it is SANITISED here (strips script/on*/javascript:
// etc.) before injection — the single chokepoint for rich_text + columns. No
// @tailwindcss/typography in the template, so child elements are styled with
// arbitrary variants — the one sanctioned place utilities apply to injected tags
// we don't author. Measure capped at 65ch (KB).
export function RichText({ html, className }: { html?: string | null; className?: string }) {
  if (!html) return null;
  const clean = sanitize(html);
  return (
    <div
      className={cn(
        "body-lg max-w-[65ch] text-ink-muted",
        "[&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:text-ink",
        "[&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-ink",
        "[&_p]:mt-4 [&_p:first-child]:mt-0",
        "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2",
        "[&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mt-1",
        "[&_strong]:font-semibold [&_strong]:text-ink",
        "[&_blockquote]:mt-6 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:italic",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
