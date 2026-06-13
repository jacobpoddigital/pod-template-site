import { WIDGETS } from "./registry";

// Renders the widget a block's `widget` field selects. Empty / unregistered → nothing
// (the block's zod schema validates the slug LOUD at build/ISR via widgetSlotFields,
// so this stays quiet at render). Drop <WidgetSlot widget={widget} /> into any block
// that spreads `widgetSlotFields` into its schema.
export function WidgetSlot({ widget }: { widget?: string | null }) {
  if (!widget) return null;
  const W = WIDGETS[widget];
  return W ? <W /> : null;
}
