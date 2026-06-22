"use client";

import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import type { Address } from "@/lib/commerce/checkout";

// Shared address field set + validation — used by checkout (guest billing/shipping) AND the account
// Addresses editor, so the field shape, labels, autocomplete tokens and required-field rules stay
// identical everywhere. Generic → graduates to the template commerce module at M5.

export const EMPTY_ADDRESS: Address = {
  firstName: "",
  lastName: "",
  address1: "",
  address2: "",
  city: "",
  postcode: "",
  country: "GB",
  email: "",
};

// Required fields (excl. the optional address2/email). Email is required only on a contact/billing set.
const NAME_ADDR: { key: keyof Address; label: string }[] = [
  { key: "firstName", label: "First name" },
  { key: "lastName", label: "Last name" },
  { key: "address1", label: "Address" },
  { key: "city", label: "Town / city" },
  { key: "postcode", label: "Postcode" },
];

/** First missing required field's message, or null. Email is only required when `requireEmail`. */
export function firstMissingAddress(a: Address, requireEmail: boolean): string | null {
  if (requireEmail && !String(a.email ?? "").trim()) return "Email is required.";
  const m = NAME_ADDR.find((f) => !String(a[f.key] ?? "").trim());
  return m ? `${m.label} is required.` : null;
}

// Fields that change Woo's shipping/tax quote — postcode, city, country (a street-line edit doesn't).
// A re-quote is keyed on these so we don't re-hit Woo on every keystroke of a name/email field.
export const shippingKey = (a: Address): string => `${a.country}|${a.postcode.trim()}|${a.city.trim()}`;

function Field({ id, label, value, onChange, type = "text", autoComplete }: {
  id: string; label: string; value: string; onChange: (v: string) => void; type?: string; autoComplete?: string;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} autoComplete={autoComplete} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1.5" />
    </div>
  );
}

export function AddressForm({ idPrefix, address, onChange, showEmail }: {
  idPrefix: string; address: Address; onChange: (k: keyof Address, v: string) => void; showEmail: boolean;
}) {
  const f = (k: keyof Address) => (v: string) => onChange(k, v);
  return (
    <div className="space-y-4">
      {showEmail && <Field id={`${idPrefix}-email`} label="Email" type="email" autoComplete="email" value={address.email ?? ""} onChange={f("email")} />}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field id={`${idPrefix}-first`} label="First name" autoComplete="given-name" value={address.firstName} onChange={f("firstName")} />
        <Field id={`${idPrefix}-last`} label="Last name" autoComplete="family-name" value={address.lastName} onChange={f("lastName")} />
      </div>
      <Field id={`${idPrefix}-addr1`} label="Address" autoComplete="address-line1" value={address.address1} onChange={f("address1")} />
      <Field id={`${idPrefix}-addr2`} label="Apartment, suite, etc. (optional)" autoComplete="address-line2" value={address.address2 ?? ""} onChange={f("address2")} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field id={`${idPrefix}-city`} label="Town / city" autoComplete="address-level2" value={address.city} onChange={f("city")} />
        <Field id={`${idPrefix}-postcode`} label="Postcode" autoComplete="postal-code" value={address.postcode} onChange={f("postcode")} />
      </div>
      <p className="body-sm text-muted-foreground">Delivery to United Kingdom (UK only for now).</p>
    </div>
  );
}
