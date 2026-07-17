import sanitizeHtml from "sanitize-html";

// Server-side sanitiser for WordPress WYSIWYG/HTML (semi-trusted editor content):
// strips <script>, on* handlers, javascript: URLs, etc., keeping a prose allowlist
// + content images + safe embeds. Pure-JS (no jsdom) so it bundles cleanly for SSG/ISR
// (research 2026-06-13 §1.5 — allow-list, never build your own; DOMPurify needs a DOM).
// Used by RichText, the rich_text/columns blocks, post excerpts AND the blog post body.
const EMBED_HOSTS = ["www.youtube.com", "youtube.com", "www.youtube-nocookie.com", "player.vimeo.com"];

const OPTIONS: sanitizeHtml.IOptions = {
  // defaults already allow figure/figcaption, table*, blockquote, code/pre, lists, etc.
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "h1", "h2", "iframe"]),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    // Allow `class` on any element so WP WYSIWYG content can carry styling hooks — the
    // CONTENT escape hatch (workflow/29): editors add `<span class="badge">…</span>` etc.,
    // styled by the content-utility classes in globals.css. Classes don't execute → no XSS.
    "*": ["class"],
    img: ["src", "srcset", "sizes", "alt", "width", "height", "loading"],
    iframe: ["src", "width", "height", "allow", "allowfullscreen", "title", "loading"],
    a: ["href", "name", "target", "rel"],
  },
  // Drop javascript:/data: URLs (XSS). tel/mailto kept for content CTAs.
  allowedSchemes: ["http", "https", "mailto", "tel"],
  // Only embed from known providers — blocks arbitrary iframe injection (research §1.5).
  allowedIframeHostnames: EMBED_HOSTS,
  transformTags: {
    // target=_blank links get rel=noopener noreferrer (reverse-tabnabbing — MDN, research §3.4).
    a: (tagName, attribs) => {
      if (attribs.target === "_blank") {
        const rel = new Set(`${attribs.rel ?? ""} noopener noreferrer`.trim().split(/\s+/));
        attribs.rel = [...rel].join(" ");
      }
      return { tagName, attribs };
    },
  },
};

export function sanitize(html: string): string {
  return sanitizeHtml(html, OPTIONS);
}
