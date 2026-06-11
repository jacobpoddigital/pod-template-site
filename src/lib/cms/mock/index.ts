import type { TypedDocumentNode } from "@graphql-typed-document-node/core";
import { PageBySlugDocument, AllPagesDocument, RecentPostsDocument } from "../generated/graphql";
import { mockHome, mockPosts } from "./fixtures";

// DEV-ONLY GraphQL mock (ADR 0013 amendment). Serves the committed-schema queries
// from curated fixtures so the template builds + renders with no WordPress. It is
// NOT shipped: client.ts imports this dynamically only when WPGRAPHQL_URL is unset
// or CMS_MODE=mock. Alternative: @graphql-tools/mock can auto-generate random data
// from schema.graphql — fixtures are used here for a deterministic, real demo.
//
// Document identity (===) keys the response — both sides import the same const.

export async function mockRequest<TResult>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  document: TypedDocumentNode<TResult, any>,
  variables: Record<string, unknown>,
): Promise<TResult> {
  if ((document as unknown) === PageBySlugDocument) {
    const slug = variables.slug as string | undefined;
    const isHome = slug === "home" || slug === "/" || slug === "";
    return (isHome ? mockHome : { page: null }) as TResult;
  }

  if ((document as unknown) === AllPagesDocument) {
    return {
      pages: { nodes: [{ databaseId: 1, title: "Home", slug: "home", uri: "/" }] },
    } as TResult;
  }

  if ((document as unknown) === RecentPostsDocument) {
    return { posts: { nodes: mockPosts } } as TResult;
  }

  return {} as TResult;
}
