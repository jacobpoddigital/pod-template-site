import { notFound } from "next/navigation";
import { ACCOUNT_ENABLED } from "@/lib/commerce/config";
import { getCustomerAddresses } from "@/lib/commerce/customer";
import { EMPTY_ADDRESS } from "@/app/(shop)/_components/address-form";
import { AddressesForm } from "./addresses-form";

// /account/addresses — view & edit billing + shipping (Woo customer mutation). Personalised + noindex.
export const metadata = { title: "Addresses" };

export default async function AddressesPage() {
  if (!ACCOUNT_ENABLED) notFound(); // commerce account module off → not a route on this site
  const data = await getCustomerAddresses().catch(() => null);
  const billing = data?.billing ?? EMPTY_ADDRESS;
  const shipping = data?.shipping ?? EMPTY_ADDRESS;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="display-xs text-foreground">Addresses</h2>
        <p className="mt-1 body-sm text-muted-foreground">Used to pre-fill checkout and calculate delivery.</p>
      </div>
      <AddressesForm billing={billing} shipping={shipping} />
    </div>
  );
}
