import {
  FaLinkedin,
  FaTiktok,
  FaInstagram,
  FaFacebook,
  FaYoutube,
  FaThreads,
  FaPinterest,
  FaWhatsapp,
  FaGithub,
  FaMastodon,
  FaSnapchat,
  FaVimeo,
  FaSpotify,
  FaDiscord,
  FaReddit,
  FaXTwitter,
} from "react-icons/fa6";
import { FiLink } from "react-icons/fi";
import type { IconType } from "react-icons";
import { cn } from "@/lib/utils";

// Primitive — no CMS knowledge. Resolve a social link → a brand glyph by matching
// its URL/label; the editor just pastes the URL. Unknown hosts fall back to a
// generic link icon. Specific hosts are ordered before the looser X/Twitter match.
// (Font Awesome brands — Simple Icons dropped the major social trademarks.)
const MAP: { test: RegExp; Icon: IconType }[] = [
  { test: /linkedin/i, Icon: FaLinkedin },
  { test: /tiktok/i, Icon: FaTiktok },
  { test: /instagram/i, Icon: FaInstagram },
  { test: /facebook|fb\.com|fb\.me/i, Icon: FaFacebook },
  { test: /youtube|youtu\.be/i, Icon: FaYoutube },
  { test: /threads\.net|threads/i, Icon: FaThreads },
  { test: /pinterest/i, Icon: FaPinterest },
  { test: /wa\.me|whatsapp/i, Icon: FaWhatsapp },
  { test: /github/i, Icon: FaGithub },
  { test: /mastodon/i, Icon: FaMastodon },
  { test: /snapchat/i, Icon: FaSnapchat },
  { test: /vimeo/i, Icon: FaVimeo },
  { test: /spotify/i, Icon: FaSpotify },
  { test: /discord/i, Icon: FaDiscord },
  { test: /reddit/i, Icon: FaReddit },
  { test: /twitter|x\.com|\bx\b/i, Icon: FaXTwitter },
];

export function socialIcon(input: string): IconType {
  return MAP.find((m) => m.test.test(input))?.Icon ?? FiLink;
}

// Shared row of accessible brand-icon links (footer, header, team member cards).
// Server component — no client needed. `itemClassName` sets colour/size per context.
export function SocialLinks({
  links,
  className,
  itemClassName,
}: {
  links: { label: string; href: string }[];
  className?: string;
  itemClassName?: string;
}) {
  if (!links.length) return null;
  return (
    <ul className={cn("flex flex-wrap items-center gap-1", className)}>
      {links.map((s) => {
        const Icon = socialIcon(`${s.href} ${s.label}`);
        return (
          <li key={s.href}>
            <a
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              className={cn(
                "inline-flex h-11 w-11 items-center justify-center rounded-card transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                itemClassName,
              )}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
