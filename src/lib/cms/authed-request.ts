import { GraphQLClient } from "graphql-request";
import type { TypedDocumentNode } from "@graphql-typed-document-node/core";
import { reportError } from "@/lib/observability/report-error";

// The AUTHENTICATED twin of cmsRequest (src/lib/cms/client.ts). Attaches a Bearer JWT
// and is ALWAYS uncached (`no-store`) — gated/personalised responses are never edge-
// cached (workflow/28 §10). Used only server-side (session + actions); the browser never
// calls WP directly. In offline/mock mode it routes to the CMS dev mock, so the auth
// scaffolding builds + renders with no WordPress (ADR 0013). cms-internal.

const endpoint = process.env.WPGRAPHQL_URL;
const useMock = !endpoint || process.env.CMS_MODE === "mock";

/** Run a query/mutation with an optional Bearer token, never cached. `token` omitted →
 *  an anonymous-but-uncached request (e.g. login itself, or a public read in an authed flow). */
export async function authedRequest<TResult>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  document: TypedDocumentNode<TResult, any>,
  variables: Record<string, unknown>,
  token?: string | null,
): Promise<TResult> {
  if (useMock) {
    const { mockRequest } = await import("./mock");
    return mockRequest(document, variables);
  }

  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const client = new GraphQLClient(endpoint as string, {
    headers,
    fetch: (input: RequestInfo | URL, init?: RequestInit) =>
      fetch(input, { ...init, cache: "no-store" }),
  });

  const send = client.request.bind(client) as (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    document: TypedDocumentNode<TResult, any>,
    variables: Record<string, unknown>,
  ) => Promise<TResult>;
  try {
    return await send(document, variables);
  } catch (err) {
    reportError(err, { scope: "auth" });
    throw err;
  }
}
