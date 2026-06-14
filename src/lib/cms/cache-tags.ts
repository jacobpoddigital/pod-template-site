// On-demand ISR cache tags (cms-internal so both index.ts and blog.ts can use them
// without crossing the public boundary). Re-exported from index.ts as the public API
// the /api/revalidate route imports. revalidateTag("pages") / ("page:<slug>") etc.

/** Cache tag convention: revalidateTag("pages") / ("page:<slug>") via /api/revalidate. */
export const PAGES_TAG = "pages";

/** Cache tag for post listings + posts (post_grid, blog index/archives, single posts). */
export const POSTS_TAG = "posts";

/** Cache tag for the header/footer chrome (menus + options). */
export const CHROME_TAG = "chrome";

/** Cache tag for the Case Study CPT listing + single entries (the CPT example). */
export const CASE_STUDIES_TAG = "case-studies";
