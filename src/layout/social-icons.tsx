// Social brand-icon links moved to the `ui` primitive layer (src/ui/social-links)
// so blocks can use them too (the boundaries rule forbids blocks → layout). This
// re-export keeps existing layout/header/footer imports working unchanged.
export { socialIcon, SocialLinks } from "@/ui/social-links";
