import { Container } from "@/ui/container";
import { siteConfig } from "../../site.config";

export function Footer() {
  return (
    <footer id="contact" className="mt-auto bg-ink py-12 text-on-brand">
      <Container>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-semibold">{siteConfig.name}</p>
          <p className="text-sm opacity-80">
            {siteConfig.footer.strapline} — {siteConfig.footer.company}
          </p>
        </div>
      </Container>
    </footer>
  );
}
