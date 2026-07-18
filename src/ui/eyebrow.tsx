// Shared section eyebrow — the small label above a section heading (the wireframe's `.label`).
// Styling lives in one place so every section's eyebrow is consistent. Blocks render it above
// their heading: `{eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}`.
export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 label text-brand-accent">{children}</p>;
}
