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

// Resolve a social link → a brand glyph by matching its URL/label — the editor
// just pastes the URL. Unknown hosts fall back to a generic link icon. Specific
// hosts are ordered before the looser X/Twitter match. (Font Awesome brands —
// Simple Icons dropped the major social trademarks.)
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
