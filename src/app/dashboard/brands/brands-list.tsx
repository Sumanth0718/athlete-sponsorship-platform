"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AddBrandDialog } from "./add-brand-dialog";
import { Search, Globe, Building } from "lucide-react";

interface Brand {
  id: string;
  name: string;
  industry: string;
  description: string | null;
  website: string | null;
}

export function BrandsList({ initialBrands }: { initialBrands: Brand[] }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredBrands = initialBrands.filter(
    (brand) =>
      brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brand.industry.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search & Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/40 border border-slate-800/60 p-5 rounded-2xl backdrop-blur-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search brands or industries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-950/50 border-slate-800 focus:border-blue-500 rounded-xl text-slate-200"
          />
        </div>
        <div>
          <AddBrandDialog />
        </div>
      </div>

      {/* Brands Grid */}
      {filteredBrands.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredBrands.map((brand) => (
            <Card
              key={brand.id}
              className="bg-slate-900/40 border-slate-800/60 hover:border-slate-700/60 backdrop-blur-sm transition-all duration-300 shadow-lg flex flex-col justify-between"
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <CardTitle className="text-lg font-bold text-slate-100">{brand.name}</CardTitle>
                    <CardDescription className="text-blue-400 text-xs mt-1 flex items-center gap-1 font-medium">
                      <Building className="h-3 w-3" />
                      {brand.industry}
                    </CardDescription>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-slate-800/50 border border-slate-700/30 flex items-center justify-center font-bold text-lg text-slate-300">
                    {brand.name.charAt(0)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-400 text-sm line-clamp-3">
                  {brand.description || "No description provided. Click below to add details."}
                </p>
                {brand.website && (
                  <div className="pt-2 border-t border-slate-800/40 flex justify-between items-center">
                    <span className="text-xs text-slate-500">Website</span>
                    <a
                      href={brand.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1"
                    >
                      <Globe className="h-3.5 w-3.5" />
                      Visit Site
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl bg-slate-900/10">
          <p className="text-slate-500">No brands found matching your search.</p>
        </div>
      )}
    </div>
  );
}
