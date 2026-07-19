import "server-only";
import { cookies } from "next/headers";
import { GraphQLClient } from "graphql-request";
import type { TypedDocumentNode } from "@graphql-typed-document-node/core";
import { reportError } from "@/lib/observability/report-error";
import { ACCESS_COOKIE } from "@/lib/auth/config";
import { siteConfig } from "../../../site.config";

// Commerce GraphQL client — self-contained (the bolt-on never reaches into cms internals;
// enforced by the boundaries lint rule). Reads hit the same WPGRAPHQL_URL endpoint with
// ISR cache tags. Unlike cms, there is NO mock: commerce needs a live WooCommerce store,
// so an unset endpoint fails loud rather than silently serving fixtures.
const endpoint = process.env.WPGRAPHQL_URL;

// True only when a live WooCommerce endpoint is configured. Commerce has no mock, so
// build-time pre-rendering (generateStaticParams) must skip when this is false — e.g. CI
// `pnpm build` with no WP. Routes still build (dynamicParams renders them on demand);
// they're simply not pre-rendered. The runtime read path still fails loud (below).
export function commerceConfigured(): boolean {
  // Gate on the brochure opt-in AND the endpoint: a non-commerce site (commerce:false) shares the
  // same WPGRAPHQL_URL for content but has no WooGraphQL, so an endpoint-only check would try to
  // pre-render the shop routes and fail the build.
  return Boolean(endpoint) && siteConfig.commerce;
}

export async function commerceRequest<TResult>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  document: TypedDocumentNode<TResult, any>,
  variables: Record<string, unknown>,
  tags: string[],
): Promise<TResult> {
  if (!endpoint) {
    throw new Error(
      "WPGRAPHQL_URL is required for commerce reads — the commerce module needs a live WooCommerce store (no mock).",
    );
  }
  const client = new GraphQLClient(endpoint, {
    fetch: (input: RequestInfo | URL, init?: RequestInit) =>
      fetch(input, { ...init, next: { tags } }),
  });
  const send = client.request.bind(client) as (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    document: TypedDocumentNode<TResult, any>,
    variables: Record<string, unknown>,
  ) => Promise<TResult>;
  try {
    return await send(document, variables);
  } catch (err) {
    reportError(err, { scope: "commerce", tags });
    throw err;
  }
}

/** Raised when an authed commerce read/write is attempted without a session token. Callers in the
 *  gated /account area should never hit this (the layout guard runs first), but it fails loud. */
export class NotAuthenticatedError extends Error {
  constructor() {
    super("Not authenticated — no session token for an authed commerce request.");
    this.name = "NotAuthenticatedError";
  }
}

// Authenticated commerce request — for the WooGraphQL `customer` reads + customer mutations that
// back the gated /account area. Attaches the session JWT (the httpOnly access cookie) as a Bearer
// header and is ALWAYS uncached (`no-store`): the response is personalised, never shared/ISR'd.
// Call only behind the account layout guard (which has already validated the token via `viewer`).
export async function authedCommerceRequest<TResult>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  document: TypedDocumentNode<TResult, any>,
  variables: Record<string, unknown> = {},
): Promise<TResult> {
  if (!endpoint) {
    throw new Error("WPGRAPHQL_URL is required for commerce — the customer/account area needs a live WooCommerce store.");
  }
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  if (!token) throw new NotAuthenticatedError();
  const client = new GraphQLClient(endpoint, {
    headers: { Authorization: `Bearer ${token}` },
    fetch: (input: RequestInfo | URL, init?: RequestInit) => fetch(input, { ...init, cache: "no-store" }),
  });
  const send = client.request.bind(client) as (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    document: TypedDocumentNode<TResult, any>,
    variables: Record<string, unknown>,
  ) => Promise<TResult>;
  try {
    return await send(document, variables);
  } catch (err) {
    reportError(err, { scope: "commerce-customer" });
    throw err;
  }
}
