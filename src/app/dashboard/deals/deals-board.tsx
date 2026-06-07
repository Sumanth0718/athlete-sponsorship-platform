"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { updateDealStatusAction } from "@/app/actions";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AddDealDialog } from "./add-deal-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  DollarSign,
  ChevronRight,
  Sparkles,
  Trophy,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { FollowUpDialog } from "./follow-up-dialog";

interface Brand {
  id: string;
  name: string;
}

interface Deal {
  id: string;
  title: string;
  description: string;
  status: "DRAFT" | "NEGOTIATING" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  value: number;
  amountReceived: number;
  pendingAmount: number;
  expectedPaymentDate: Date;
  startDate: Date;
  endDate: Date;
  brand: Brand;
  followUps?: any[];
}

const COLUMNS: { id: Deal["status"]; label: string; colorClass: string }[] = [
  { id: "DRAFT", label: "Draft Proposals", colorClass: "border-t-slate-500 bg-slate-900/10" },
  { id: "NEGOTIATING", label: "In Negotiation", colorClass: "border-t-amber-500 bg-amber-950/5" },
  { id: "ACTIVE", label: "Active Deals", colorClass: "border-t-blue-500 bg-blue-950/5" },
  { id: "COMPLETED", label: "Completed", colorClass: "border-t-emerald-500 bg-emerald-950/5" },
];

export function DealsBoard({ initialDeals, brands }: { initialDeals: Deal[]; brands: Brand[] }) {
  const router = useRouter();
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [followUpDialogOpen, setFollowUpDialogOpen] = useState(false);
  const [selectedFollowUpDeal, setSelectedFollowUpDeal] = useState<Deal | null>(null);

  const openFollowUp = (deal: Deal) => {
    setSelectedFollowUpDeal(deal);
    setFollowUpDialogOpen(true);
  };

  const handleAdvanceStatus = async (deal: Deal) => {
    let nextStatus: Deal["status"] | null = null;
    if (deal.status === "DRAFT") nextStatus = "NEGOTIATING";
    else if (deal.status === "NEGOTIATING") nextStatus = "ACTIVE";
    else if (deal.status === "ACTIVE") nextStatus = "COMPLETED";

    if (!nextStatus) return;

    setUpdatingId(deal.id);
    try {
      await updateDealStatusAction(deal.id, nextStatus);
      // Optimistic state sync
      setDeals((prev) =>
        prev.map((d) => (d.id === deal.id ? { ...d, status: nextStatus! } : d))
      );
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCancelDeal = async (id: string) => {
    setUpdatingId(id);
    try {
      await updateDealStatusAction(id, "CANCELLED");
      setDeals((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status: "CANCELLED" } : d))
      );
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/40 border border-slate-800/60 p-5 rounded-2xl backdrop-blur-sm">
        <div>
          <h2 className="text-lg font-semibold text-slate-200">Deals Pipeline</h2>
          <p className="text-slate-400 text-xs mt-0.5">
            Manage terms, negotiate sponsors, and advance deal lifecycle.
          </p>
        </div>
        <div>
          <AddDealDialog brands={brands} />
        </div>
      </div>

      {/* Board columns container */}
      <div className="grid gap-6 md:grid-cols-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const colDeals = deals.filter((d) => d.status === col.id);
          return (
            <div
              key={col.id}
              className={`flex flex-col min-h-[500px] border-t-2 rounded-2xl p-4 bg-slate-900/25 border border-slate-850/60 backdrop-blur-sm ${col.colorClass}`}
            >
              <div className="flex items-center justify-between mb-4 border-b border-slate-800/40 pb-2">
                <h3 className="text-sm font-semibold text-slate-350">{col.label}</h3>
                <Badge className="bg-slate-800 text-slate-400 hover:bg-slate-800/80 rounded-md">
                  {colDeals.length}
                </Badge>
              </div>

              <div className="flex-1 space-y-4">
                {colDeals.map((deal) => (
                  <Card
                    key={deal.id}
                    className="bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:shadow-lg transition-all duration-300 rounded-xl"
                  >
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-[10px] font-bold text-blue-400 tracking-wider uppercase bg-blue-500/10 border border-blue-500/15 py-0.5 px-2 rounded-full">
                          {deal.brand.name}
                        </span>
                        <span className="text-xs font-semibold text-emerald-400 flex items-center">
                          <DollarSign className="h-3 w-3" />
                          {deal.value.toLocaleString()}
                        </span>
                      </div>
                      <CardTitle className="text-sm font-bold text-slate-100 mt-2 line-clamp-1">
                        {deal.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 pb-2 text-xs text-slate-400 line-clamp-2">
                      {deal.description}
                    </CardContent>
                    <CardFooter className="p-4 pt-2 border-t border-slate-800/40 flex justify-between items-center gap-2">
                      <span className="text-[10px] text-slate-500 flex items-center">
                        <Calendar className="mr-1 h-3 w-3" />
                        {new Date(deal.startDate).toLocaleDateString()}
                      </span>

                      <div className="flex gap-1">
                        {deal.status !== "COMPLETED" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCancelDeal(deal.id)}
                            disabled={updatingId === deal.id}
                            className="h-7 w-7 p-0 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {deal.pendingAmount > 0 && deal.status !== "DRAFT" && deal.status !== "NEGOTIATING" && deal.status !== "CANCELLED" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openFollowUp(deal)}
                            className="h-7 w-7 p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg"
                            title="Generate Follow-Up Email"
                          >
                            <Sparkles className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {col.id !== "COMPLETED" && (
                          <Button
                            size="sm"
                            disabled={updatingId === deal.id}
                            onClick={() => handleAdvanceStatus(deal)}
                            className="h-7 px-2 text-[10px] bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-300 rounded-lg flex items-center"
                          >
                            {col.id === "NEGOTIATING" ? "Sign" : "Next"}
                            <ChevronRight className="ml-1 h-3 w-3" />
                          </Button>
                        )}
                        {col.id === "COMPLETED" && (
                          <span className="text-emerald-400 text-xs flex items-center font-medium">
                            <CheckCircle className="h-3.5 w-3.5 mr-1" /> Done
                          </span>
                        )}
                      </div>
                    </CardFooter>
                  </Card>
                ))}

                {colDeals.length === 0 && (
                  <div className="h-full flex items-center justify-center border border-dashed border-slate-800 rounded-2xl py-12 px-4 text-center">
                    <p className="text-xs text-slate-500">No deals in this stage</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedFollowUpDeal && (
        <FollowUpDialog
          dealId={selectedFollowUpDeal.id}
          dealTitle={selectedFollowUpDeal.title}
          brandName={selectedFollowUpDeal.brand.name}
          pendingAmount={selectedFollowUpDeal.pendingAmount}
          existingFollowUps={selectedFollowUpDeal.followUps}
          isOpen={followUpDialogOpen}
          onOpenChange={setFollowUpDialogOpen}
        />
      )}
    </div>
  );
}
