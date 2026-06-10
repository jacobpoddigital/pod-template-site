import type { Metadata } from "next";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/ui/accordion";
import { Label } from "@/ui/label";
import { Input } from "@/ui/input";
import { Textarea } from "@/ui/textarea";
import { Checkbox } from "@/ui/checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/ui/select";
import { RadioGroup, RadioGroupItem } from "@/ui/radio-group";
import { Separator } from "@/ui/separator";
import { Skeleton } from "@/ui/skeleton";
import { Container } from "@/ui/container";

// Internal design-system reference — every shadcn primitive on the live theme. Not a client
// page: noindexed, and absent from the CMS-driven sitemap. The surface to eyeball a rebrand.
// (Blocks are deliberately commented out of the registry in the agnostic scaffold, so this
// shows the primitive layer; per-client block instances are reviewed on their own pages.)
export const metadata: Metadata = { title: "Styleguide", robots: { index: false, follow: false } };
export const dynamic = "error";

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="text-xl font-semibold text-ink">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function StyleguidePage() {
  return (
    <main>
      <Container>
        <div className="py-section">
          <h1 className="text-3xl font-bold text-ink">Styleguide</h1>
          <p className="mt-2 text-ink-muted">The live design system — shadcn primitives + blocks on the current theme. Internal reference (noindex).</p>

          <Group title="Buttons">
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
          </Group>

          <Group title="Badges">
            <div className="flex flex-wrap gap-3">
              <Badge>Default</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
          </Group>

          <Group title="Brand colours">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="h-10 w-10 rounded-md bg-primary" />
                <span className="text-sm text-ink-muted">primary (CTAs, links)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-10 w-10 rounded-md bg-brand-accent" />
                <span className="text-sm text-ink-muted">brand-accent (decorative pop)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-10 w-10 rounded-md bg-accent" />
                <span className="text-sm text-ink-muted">accent (shadcn muted hover)</span>
              </div>
              <span className="text-sm font-semibold uppercase tracking-[0.08em] text-brand-accent">
                Accent eyebrow
              </span>
            </div>
          </Group>

          <Group title="Form controls">
            <div className="max-w-md space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="sg-name">Name</Label>
                <Input id="sg-name" placeholder="Jane Doe" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sg-topic">Topic</Label>
                <Select>
                  <SelectTrigger id="sg-topic" className="w-full">
                    <SelectValue placeholder="Choose a topic…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General enquiry</SelectItem>
                    <SelectItem value="quote">Request a quote</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sg-msg">Message</Label>
                <Textarea id="sg-msg" placeholder="Tell us about the project…" />
              </div>
              <div className="flex items-center gap-3">
                <Checkbox id="sg-consent" />
                <Label htmlFor="sg-consent" className="font-normal text-ink-muted">Keep me updated</Label>
              </div>
              <RadioGroup defaultValue="email" className="flex gap-6">
                <div className="flex items-center gap-2">
                  <RadioGroupItem id="sg-email" value="email" />
                  <Label htmlFor="sg-email" className="font-normal text-ink-muted">Email</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem id="sg-phone" value="phone" />
                  <Label htmlFor="sg-phone" className="font-normal text-ink-muted">Phone</Label>
                </div>
              </RadioGroup>
            </div>
          </Group>

          <Group title="Accordion">
            <Accordion type="single" collapsible className="max-w-2xl">
              <AccordionItem value="a">
                <AccordionTrigger>What does the accordion look like?</AccordionTrigger>
                <AccordionContent>Themed via the shadcn bridge — accent ring, brand colours.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="b">
                <AccordionTrigger>Does it use the brand tokens?</AccordionTrigger>
                <AccordionContent>Yes — everything reads the canonical bridge in theme.css.</AccordionContent>
              </AccordionItem>
            </Accordion>
          </Group>

          <Group title="Skeleton & Separator">
            <div className="max-w-md space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <Separator className="my-8 max-w-md" />
          </Group>
        </div>
      </Container>
    </main>
  );
}
