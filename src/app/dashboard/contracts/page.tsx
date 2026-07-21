import React from "react";
import { getContracts, getBrands } from "@/lib/services";
import { ContractsList } from "./contracts-list";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export default async function ContractsPage() {
  const session = await auth();
  const userId = session?.user?.id || "ath-1";

  const rawContracts = (await getContracts(userId).catch(() => [])) || [];
  const rawBrands = (await getBrands(userId).catch(() => [])) || [];

  const contracts = Array.isArray(rawContracts) ? rawContracts : [];
  const brands = Array.isArray(rawBrands) ? rawBrands : [];

  const formattedContracts = contracts.map((c) => ({
    id: c.id,
    title: c.title,
    fileName: c.fileName,
    fileSize: c.fileSize,
    fileType: c.fileType,
    cloudinaryUrl: c.cloudinaryUrl,
    uploadDate: c.uploadDate,
    expiryDate: c.expiryDate,
    status: c.status,
    brand: {
      name: c.brand?.name || "Unknown Brand",
    },
  }));

  const formattedBrands = brands.map(b => ({
    id: b.id,
    name: b.name
  }));

  const isBrandRep = session?.user?.role === "BRAND_REPRESENTATIVE";

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
          {isBrandRep ? "Issued Contracts & Compliance" : "Contracts Manager"}
        </h1>
        <p className="text-slate-400 mt-1">
          {isBrandRep
            ? "Manage endorsement agreements issued to athletes, legal terms, and contract expirations."
            : "Review legal terms, manage documents, and track contract expiry dates."}
        </p>
      </div>

      <ContractsList initialContracts={formattedContracts} brands={formattedBrands} />
    </div>
  );
}
