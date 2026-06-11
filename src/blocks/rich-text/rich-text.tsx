import { Section } from "@/ui/section";
import { RichText as Prose } from "@/ui/rich-text";
import { sectionProps } from "@/lib/section-settings";
import type { RichTextProps } from "./schema";

export function RichTextBlock({ content, tone, spacing, container }: RichTextProps) {
  if (!content) return null;
  // Prose reads best at a narrow measure; editor can widen via the container setting.
  return (
    <Section dataBlock="rich_text" {...sectionProps({ tone, spacing, container: container ?? "narrow" })}>
      <Prose html={content} />
    </Section>
  );
}
