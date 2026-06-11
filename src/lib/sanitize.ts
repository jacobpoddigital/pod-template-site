import sanitizeHtml from "sanitize-html";

// Server-side sanitiser for WordPress WYSIWYG/HTML (semi-trusted editor content):
// strips <script>, on* handlers, javascript: URLs, etc., keeping a prose allowlist
// + content images. Pure-JS (no jsdom) so it bundles cleanly for SSG/ISR.
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "h1", "h2"]),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    img: ["src", "alt", "width", "height", "loading"],
  },
};

export function sanitize(html: string): string {
  return sanitizeHtml(html, OPTIONS);
}
