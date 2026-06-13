import { GraphQLClient } from "graphql-request";
import type { TypedDocumentNode } from "@graphql-typed-document-node/core";
import { reportError } from "@/lib/observability/report-error";

// graphql-request server-side client (ADR 0007 §1). Marketing sites render via
// SSG/ISR — fetch at build/server time, no client cache. Client-side reads
// (search, filters, cart, member-interactive) use TanStack Query through Server
// Actions/route handlers — never browser→WP. See AGENTS.md.
//
// OFFLINE MODE (ADR 0013): when WPGRAPHQL_URL is unset OR CMS_MODE=mock, requests
// are served by the DEV-ONLY mock (./mock) over the committed schema, so blocks
// build + render with no WordPress. The mock is dynamically imported so it never
// enters the production bundle once a real endpoint is configured.

const endpoint = process.env.WPGRAPHQL_URL;
const useMock = !endpoint || process.env.CMS_MODE === "mock";

export async function cmsRequest<TResult>(
  // `any` for the document's Variables param: it's contravariant, so narrowing it
  // would reject the concrete generated documents. TResult still infers cleanly.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  document: TypedDocumentNode<TResult, any>,
  variables: Record<string, unknown>,
  tags: string[],
  // Preview (draft) reads bypass the ISR cache so an editor sees unpublished content
  // immediately (boilerplate §4 — draft preview). Off for all normal traffic.
  opts: { preview?: boolean } = {},
): Promise<TResult> {
  if (useMock) {
    const { mockRequest } = await import("./mock");
    return mockRequest(document, variables);
  }

  const next: { tags?: string[]; revalidate?: number } = opts.preview ? { revalidate: 0 } : { tags };
  const client = new GraphQLClient(endpoint as string, {
    // Tag every fetch for on-demand ISR: WP publish webhook → /api/revalidate →
    // revalidateTag (use { expire: 0 } there if a publish must show instantly).
    // Preview reads use { revalidate: 0 } (uncached) so drafts are always fresh.
    fetch: (input: RequestInfo | URL, init?: RequestInit) =>
      fetch(input, { ...init, cache: opts.preview ? "no-store" : undefined, next }),
  });

  // graphql-request v7's overloads use a conditional variables tuple that can't
  // resolve through a generic wrapper — cast to a plain 2-arg signature.
  const send = client.request.bind(client) as (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    document: TypedDocumentNode<TResult, any>,
    variables: Record<string, unknown>,
  ) => Promise<TResult>;
  try {
    return await send(document, variables);
  } catch (err) {
    // Report CMS/GraphQL failures to the observability seam, then rethrow so the
    // page's error boundary / build still fails loud (boilerplate §17).
    reportError(err, { scope: "cms", tags });
    throw err;
  }
}
