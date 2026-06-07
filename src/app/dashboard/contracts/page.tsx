import React from "react";
import { getContracts, getBrands } from "@/lib/services";
import { ContractsList } from "./contracts-list";

export const dynamic = "force-dynamic";

import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function ContractsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const contracts = await getContracts(userId);
  const brands = await getBrands(userId);

  // Cast prisma database types to client component interface
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

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
          Contracts Manager
        </h1>
        <p className="text-slate-400 mt-1">
          Review legal terms, manage documents, and track contract expiry dates.
        </p>
      </div>

      <ContractsList initialContracts={formattedContracts} brands={formattedBrands} />
    </div>
  );
}
