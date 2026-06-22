import { notFound } from "next/navigation";
import { ACCOUNT_ENABLED } from "@/lib/commerce/config";
import { getCustomerDetails } from "@/lib/commerce/customer";
import { DetailsForms } from "./details-forms";

// /account/details — name + email + password change (Woo customer mutation). Personalised + noindex.
export const metadata = { title: "Account details" };

export default async function DetailsPage() {
  if (!ACCOUNT_ENABLED) notFound(); // commerce account module off → not a route on this site
  const details = await getCustomerDetails().catch(() => null);

  return (
    <div className="space-y-5">
      <h2 className="display-xs text-foreground">Account details</h2>
      <DetailsForms
        initial={{
          firstName: details?.firstName ?? "",
          lastName: details?.lastName ?? "",
          email: details?.email ?? "",
        }}
      />
    </div>
  );
}
