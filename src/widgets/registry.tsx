import type { ComponentType } from "react";

// Widget registry — the headless-native equivalent of a shortcode: maps a slug to a
// self-contained, pre-configured widget so ANY block carrying a widget slot can embed
// a bespoke widget (chat demo, animated visual, etc.) WITHOUT a one-off block per
// placement. Engines should self-wrap (a scope class) + self-frame, so entries are
// zero-arg components.
//
// The template ships NO widgets. A site registers its own, e.g.:
//   import { ChatEngine } from "@/blocks/chat-demo/chat-engine";
//   import { SCENARIOS } from "@/blocks/chat-demo/scenarios";
//   export const WIDGETS: Record<string, ComponentType> = {
//     "hero-chat": () => <ChatEngine cfg={SCENARIOS["hero-chat"]} />,
//   };
// (and add the slug to ./slugs.ts so the block schema can validate it).
export const WIDGETS: Record<string, ComponentType> = {};
