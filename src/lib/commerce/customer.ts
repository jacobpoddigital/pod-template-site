import "server-only";
import { authedCommerceRequest } from "./client";
import type { Address } from "./checkout";
export { statusLabel, statusTone, type OrderStatus } from "./order-status";
import {
  AccountDashboardDocument,
  CustomerOrdersDocument,
  CustomerOrderDocument,
  CustomerAddressesDocument,
  CustomerDetailsDocument,
  CustomerDownloadsDocument,
  UpdateCustomerAddressesDocument,
  UpdateCustomerDetailsDocument,
  UpdateCustomerPasswordDocument,
} from "./generated/graphql";

// Customer (My Account) data layer — authed WooGraphQL reads + customer mutations behind the gated
// /account area. Every call goes through authedCommerceRequest (Bearer JWT, never cached). The UI
// only ever sees the normalised view types below, never a raw WooGraphQL shape. Generic → template M5.

// ── view types ───────────────────────────────────────────────────────────────
export type OrderCard = {
  id: number;
  number: string;
  status: string;
  date: string | null; // ISO
  total: string; // FORMATTED
  needsPayment: boolean;
};
export type AccountSummary = {
  firstName: string;
  lastName: string;
  displayName: string;
  email: string | null;
  orderCount: number;
  lastOrder: OrderCard | null;
};
export type OrderLine = {
  name: string;
  slug: string | null;
  quantity: number;
  total: string;
  image: { url: string; alt: string } | null;
  variation: string | null;
  /** Store-API add-item id for reorder: the variation id (variable) else the product id. */
  addId: number | null;
  /** Woo per-product "purchase note" — shown to the customer after purchase (HTML-stripped). */
  purchaseNote: string | null;
};
export type OrderDownload = {
  name: string;
  downloadId: string;
  url: string | null;
  downloadsRemaining: string | null; // Woo returns "∞" / number-as-string / null
  accessExpires: string | null;
};
export type OrderDetail = OrderCard & {
  paymentMethodTitle: string | null;
  customerNote: string | null;
  subtotal: string | null;
  shippingTotal: string | null;
  shippingTax: string | null;
  totalTax: string | null;
  discountTotal: string | null;
  billing: Address | null;
  shipping: Address | null;
  lines: OrderLine[];
  downloads: OrderDownload[];
};
export type CustomerAddresses = {
  firstName: string;
  lastName: string;
  email: string | null;
  billing: Address;
  shipping: Address;
};
export type CustomerDetails = { databaseId: number; firstName: string; lastName: string; displayName: string; email: string | null };
export type DownloadItem = OrderDownload & { productName: string | null; productSlug: string | null };

// ── adapters ───────────────────────────────────────────────────────────────
// WooGraphQL fields are pervasively nullable; these tiny coercers keep the per-field `?? fallback`
// branches out of the adapter functions (so they stay under the complexity budget).
const s = (v: string | null | undefined): string => v ?? "";
const num = (v: number | null | undefined): number => v ?? 0;
const orNull = (v: string | null | undefined): string | null => v ?? null;

type RawAddress = {
  firstName?: string | null; lastName?: string | null; company?: string | null;
  address1?: string | null; address2?: string | null; city?: string | null; state?: string | null;
  postcode?: string | null; country?: string | null; email?: string | null; phone?: string | null;
};

/** True when a Woo address holds any street-level detail (vs an all-null placeholder). */
const hasAddress = (a: RawAddress | null | undefined): boolean =>
  Boolean(a?.address1 || a?.city || a?.postcode);

/** CustomerAddress → our Address (the shape AddressForm edits). A Woo address can be all-null. */
function adaptAddress(a: RawAddress | null | undefined): Address {
  const x: RawAddress = a ?? {};
  return {
    firstName: s(x.firstName),
    lastName: s(x.lastName),
    address1: s(x.address1),
    address2: s(x.address2),
    city: s(x.city),
    postcode: s(x.postcode),
    country: x.country || "GB",
    email: s(x.email),
    phone: s(x.phone),
  };
}

/** Our Address → CustomerAddressInput. */
function toAddressInput(a: Address) {
  return {
    firstName: a.firstName,
    lastName: a.lastName,
    address1: a.address1,
    address2: a.address2 ?? "",
    city: a.city,
    postcode: a.postcode,
    country: a.country,
    ...(a.email ? { email: a.email } : {}),
    ...(a.phone ? { phone: a.phone } : {}),
  };
}

type RawOrderCard = {
  databaseId?: number | null; orderNumber?: string | null; status?: string | null;
  date?: string | null; total?: string | null; needsPayment?: boolean | null;
};
function adaptOrderCard(o: RawOrderCard): OrderCard {
  const id = num(o.databaseId);
  return {
    id,
    number: o.orderNumber || String(id),
    status: o.status || "PENDING",
    date: o.date ?? null,
    total: s(o.total),
    needsPayment: Boolean(o.needsPayment),
  };
}

// ── product-union + line/download readers (extracted so the connection .map callbacks stay simple) ──
type RawProductNode = { databaseId?: number | null; name?: string | null; slug?: string | null; purchaseNote?: string | null; image?: { sourceUrl?: string | null; altText?: string | null } | null };
const pName = (p: RawProductNode | null | undefined): string => (p && "name" in p ? p.name : null) || "Item";
const pSlug = (p: RawProductNode | null | undefined): string | null => (p && "slug" in p ? p.slug : null) ?? null;
const pId = (p: RawProductNode | null | undefined): number | null => (p && "databaseId" in p ? p.databaseId : null) ?? null;
function pImage(p: RawProductNode | null | undefined): { url: string; alt: string } | null {
  const img = p && "image" in p ? p.image : null;
  return img?.sourceUrl ? { url: img.sourceUrl, alt: s(img.altText) } : null;
}
// Woo purchase notes can carry HTML; strip to plain text (mirrors product-map's description handling).
const pNote = (p: RawProductNode | null | undefined): string | null =>
  (p && "purchaseNote" in p ? (p.purchaseNote ?? "").replace(/<[^>]+>/g, "").trim() : "") || null;

type RawLine = { quantity?: number | null; total?: string | null; product?: { node?: RawProductNode | null } | null; variation?: { node?: { databaseId?: number | null; name?: string | null } | null } | null };
function adaptLine(li: RawLine): OrderLine {
  const p = li.product?.node;
  const variationId = li.variation?.node?.databaseId ?? null;
  return {
    name: pName(p),
    slug: pSlug(p),
    quantity: li.quantity ?? 1,
    total: s(li.total),
    image: pImage(p),
    variation: li.variation?.node?.name ?? null,
    addId: variationId ?? pId(p),
    purchaseNote: pNote(p),
  };
}

type RawDownload = { name?: string | null; downloadId: string; downloadUrl?: string | null; downloadsRemaining?: number | string | null; accessExpires?: string | null };
function adaptDownload(d: RawDownload): OrderDownload {
  return {
    name: d.name || "Download",
    downloadId: d.downloadId,
    url: d.downloadUrl ?? null,
    downloadsRemaining: d.downloadsRemaining != null ? String(d.downloadsRemaining) : null,
    accessExpires: d.accessExpires ?? null,
  };
}

// ── reads ──────────────────────────────────────────────────────────────────
export async function getAccountSummary(): Promise<AccountSummary | null> {
  const data = await authedCommerceRequest(AccountDashboardDocument);
  const c = data.customer;
  if (!c) return null;
  const last = c.orders?.nodes?.[0];
  return {
    firstName: c.firstName ?? "",
    lastName: c.lastName ?? "",
    displayName: c.displayName ?? "",
    email: c.email ?? null,
    orderCount: c.orderCount ?? 0,
    lastOrder: last ? adaptOrderCard(last) : null,
  };
}

export async function getCustomerOrders(
  first = 10,
  after?: string,
): Promise<{ orders: OrderCard[]; hasNextPage: boolean; endCursor: string | null }> {
  const data = await authedCommerceRequest(CustomerOrdersDocument, { first, after: after ?? null });
  const conn = data.customer?.orders;
  const nodes = conn?.nodes ?? [];
  const pageInfo = conn?.pageInfo;
  return {
    orders: nodes.map(adaptOrderCard),
    hasNextPage: Boolean(pageInfo?.hasNextPage),
    endCursor: pageInfo?.endCursor ?? null,
  };
}

export async function getCustomerOrder(id: number): Promise<OrderDetail | null> {
  const data = await authedCommerceRequest(CustomerOrderDocument, { id: String(id) });
  const o = data.order;
  if (!o) return null;
  return {
    ...adaptOrderCard(o),
    paymentMethodTitle: orNull(o.paymentMethodTitle),
    customerNote: orNull(o.customerNote),
    subtotal: orNull(o.subtotal),
    shippingTotal: orNull(o.shippingTotal),
    shippingTax: orNull(o.shippingTax),
    totalTax: orNull(o.totalTax),
    discountTotal: orNull(o.discountTotal),
    billing: hasAddress(o.billing) ? adaptAddress(o.billing) : null,
    shipping: hasAddress(o.shipping) ? adaptAddress(o.shipping) : null,
    lines: (o.lineItems?.nodes ?? []).map(adaptLine),
    downloads: (o.downloadableItems?.nodes ?? []).map(adaptDownload),
  };
}

export async function getCustomerAddresses(): Promise<CustomerAddresses | null> {
  const data = await authedCommerceRequest(CustomerAddressesDocument);
  const c = data.customer;
  if (!c) return null;
  return {
    firstName: c.firstName ?? "",
    lastName: c.lastName ?? "",
    email: c.email ?? null,
    billing: adaptAddress(c.billing),
    shipping: adaptAddress(c.shipping),
  };
}

export async function getCustomerDetails(): Promise<CustomerDetails | null> {
  const data = await authedCommerceRequest(CustomerDetailsDocument);
  const c = data.customer;
  if (!c) return null;
  return {
    databaseId: c.databaseId ?? 0,
    firstName: c.firstName ?? "",
    lastName: c.lastName ?? "",
    displayName: c.displayName ?? "",
    email: c.email ?? null,
  };
}

export async function getCustomerDownloads(): Promise<DownloadItem[]> {
  const data = await authedCommerceRequest(CustomerDownloadsDocument);
  return (data.customer?.downloadableItems?.nodes ?? []).map((d) => ({
    ...adaptDownload(d),
    productName: d.product && "name" in d.product ? (d.product.name ?? null) : null,
    productSlug: d.product && "slug" in d.product ? (d.product.slug ?? null) : null,
  }));
}

// ── mutations ────────────────────────────────────────────────────────────────
export async function updateCustomerAddresses(billing: Address, shipping: Address): Promise<void> {
  await authedCommerceRequest(UpdateCustomerAddressesDocument, {
    billing: toAddressInput(billing),
    shipping: toAddressInput(shipping),
  });
}

export async function updateCustomerDetails(args: { firstName: string; lastName: string; email: string }): Promise<void> {
  await authedCommerceRequest(UpdateCustomerDetailsDocument, args);
}

export async function updateCustomerPassword(password: string): Promise<void> {
  await authedCommerceRequest(UpdateCustomerPasswordDocument, { password });
}
