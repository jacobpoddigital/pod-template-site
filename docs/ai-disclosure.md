# AI transparency (EU AI Act Article 50)

**In force 2 August 2026.** We build chatbots and use AI-generated imagery, so this applies.
Source: `web-ai-automation/research/2026-06-13-build-gap-analysis.md` §9.

## The two obligations that hit marketing sites

1. **Conversational AI must be disclosed.** When a visitor *interacts* with an AI system —
   a live chatbot or voice agent — it must be self-evident they're dealing with AI, "unless
   this is obvious from the point of view of a reasonably well-informed person."
2. **AI-generated/manipulated content must be marked.** Synthetic images, audio, video
   (esp. deep-fakes) must be disclosed/labelled, ideally machine-readable.

## How we meet it

- **Live chatbot / voice agent →** render `<AiDisclosure>` (`src/ui/ai-disclosure.tsx`) in the
  chat header or first message: *"You're chatting with an AI assistant."* Do **not** style it
  away — it must be visible.
  ```tsx
  import { AiDisclosure } from "@/ui/ai-disclosure";
  // …in the chat widget header:
  <AiDisclosure />
  ```
- **AI-generated imagery →** label it in the visible **caption/credit** (e.g. "Illustration:
  AI-generated") and keep the generator's C2PA/metadata intact where possible. No component —
  it's a content convention on the image block's caption field. Don't pass AI images off as
  real photography of the client's team/premises (also an E-E-A-T authenticity issue).

## What is NOT covered (don't over-apply)

- A **scripted/demo chat animation** (a canned sequence the visitor watches, not a live AI they
  converse with) is not an Art. 50 "interaction" — e.g. Website Navigator's demo widgets. Use
  `<AiDisclosure>` only on genuine conversational AI.
- Spam-filter/recommendation models behind the scenes aren't "interaction" either.

## Per-client gate

On the go-live checklist: if the site ships a live chatbot/voice agent, confirm the disclosure
renders; if it uses AI imagery, confirm the captions label it.
