// The single WordPress transport (workflow/01 §Phase 4). Every WP call goes
// through wpFetch(): timeout, retry/backoff, typed expected-vs-unexpected errors.

/** "expected" = WP absent/unreachable/empty → callers may fall back gracefully.
 *  "unexpected" = WP answered with something wrong → fail loudly. */
export class CmsError extends Error {
  constructor(
    message: string,
    public readonly kind: "expected" | "unexpected",
    options?: { cause?: unknown },
  ) {
    super(message, options);
    this.name = "CmsError";
  }
}

const TIMEOUT_MS = 10_000;
const RETRIES = 2;
const BACKOFF_MS = 400;

function baseUrl(): string {
  const url = process.env.WORDPRESS_API_URL;
  if (!url) {
    throw new CmsError("WORDPRESS_API_URL is not set", "expected");
  }
  return url.replace(/\/$/, "");
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function attempt(url: string, tags: string[]): Promise<unknown> {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
    next: { tags },
  });
  if (res.status === 404) {
    throw new CmsError(`WP 404: ${url}`, "expected");
  }
  if (!res.ok) {
    throw new CmsError(`WP ${res.status}: ${url}`, "unexpected");
  }
  return res.json();
}

/** Fetch a WP REST path (e.g. "/wp/v2/pages?slug=home"). Returns parsed JSON as
 *  `unknown` — callers MUST zod-parse the result at this boundary (workflow/02). */
export async function wpFetch(path: string, tags: string[]): Promise<unknown> {
  const url = `${baseUrl()}${path}`;
  let lastError: unknown;
  for (let i = 0; i <= RETRIES; i++) {
    try {
      return await attempt(url, tags);
    } catch (error) {
      lastError = error;
      // Don't retry deliberate "absent" answers — only transient failures.
      if (error instanceof CmsError && error.kind === "expected") throw error;
      if (i < RETRIES) await sleep(BACKOFF_MS * (i + 1));
    }
  }
  if (lastError instanceof CmsError) throw lastError;
  // Network refused / DNS / timeout → WP is unreachable → expected, fall back.
  throw new CmsError(`WP unreachable: ${url}`, "expected", { cause: lastError });
}
