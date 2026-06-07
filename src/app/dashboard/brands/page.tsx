import React from "react";
import { getBrands } from "@/lib/services";
import { BrandsList } from "./brands-list";

export const dynamic = "force-dynamic";

import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function BrandsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const brands = await getBrands(userId);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
          Partner Brands
        </h1>
        <p className="text-slate-400 mt-1">
          Explore and manage sponsor relationships, companies, and directories.
        </p>
      </div>

      <BrandsList initialBrands={brands} />
    </div>
  );
}
