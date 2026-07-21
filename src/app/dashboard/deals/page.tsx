import React from "react";
import { getDeals, getBrands } from "@/lib/services";
import { DealsBoard } from "./deals-board";

export const dynamic = "force-dynamic";

import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DealsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const deals = await getDeals(userId);
  const brands = await getBrands(userId);

  // Cast deal fields to strict front-end types
  const formattedDeals = deals.map((d) => ({
    id: d.id,
    title: d.title,
    description: d.description,
    status: d.status as any,
    value: d.value,
    amountReceived: d.amountReceived,
    pendingAmount: d.pendingAmount,
    expectedPaymentDate: new Date(d.expectedPaymentDate),
    followUps: d.followUps,
    startDate: new Date(d.startDate),
    endDate: new Date(d.endDate),
    brand: {
      id: d.brand?.id || "",
      name: d.brand?.name || "Unknown Brand",
    },
  }));

  const formattedBrands = brands.map((b) => ({
    id: b.id,
    name: b.name,
  }));

  const isBrandRep = session.user.role === "BRAND_REPRESENTATIVE";

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
          {isBrandRep ? "Campaign Sponsorship Offers" : "Sponsorship Deals"}
        </h1>
        <p className="text-slate-400 mt-1">
          {isBrandRep
            ? "Review, send offers, and advance athlete endorsement campaigns through the pipeline."
            : "Review, negotiate, and advance status of sponsorships through the pipeline."}
        </p>
      </div>

      <DealsBoard initialDeals={formattedDeals} brands={formattedBrands} />
    </div>
  );
}
