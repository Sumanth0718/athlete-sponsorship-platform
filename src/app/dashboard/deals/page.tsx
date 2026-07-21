import React from "react";
import { getDeals, getBrands } from "@/lib/services";
import { DealsBoard } from "./deals-board";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export default async function DealsPage() {
  const session = await auth();
  const userId = session?.user?.id || "ath-1";

  const rawDeals = (await getDeals(userId).catch(() => [])) || [];
  const rawBrands = (await getBrands(userId).catch(() => [])) || [];

  const deals = Array.isArray(rawDeals) ? rawDeals : [];
  const brands = Array.isArray(rawBrands) ? rawBrands : [];

  const formattedDeals = deals.map((d) => ({
    id: d.id,
    title: d.title,
    description: d.description,
    status: d.status as any,
    value: Number(d.value) || 0,
    amountReceived: Number(d.amountReceived) || 0,
    pendingAmount: Number(d.pendingAmount) || Number(d.value) || 0,
    expectedPaymentDate: d.expectedPaymentDate ? new Date(d.expectedPaymentDate) : new Date(),
    followUps: d.followUps || [],
    startDate: d.startDate ? new Date(d.startDate) : new Date(),
    endDate: d.endDate ? new Date(d.endDate) : new Date(),
    brand: {
      id: d.brand?.id || "",
      name: d.brand?.name || "Unknown Brand",
    },
  }));

  const formattedBrands = brands.map((b) => ({
    id: b.id,
    name: b.name,
  }));

  const isBrandRep = session?.user?.role === "BRAND_REPRESENTATIVE";

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
