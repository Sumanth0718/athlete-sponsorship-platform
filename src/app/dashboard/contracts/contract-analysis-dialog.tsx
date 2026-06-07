"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Brain, CheckCircle2, FileText, Calendar, Building, DollarSign, Clock, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

interface ContractAnalysisDialogProps {
  contractId: string;
  contractTitle: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  existingAnalysis: any;
}

export function ContractAnalysisDialog({ contractId, contractTitle, isOpen, onOpenChange, existingAnalysis }: ContractAnalysisDialogProps) {
  const router = useRouter();
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState<any>(existingAnalysis);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setError("");

    try {
      const res = await fetch(`/api/contracts/${contractId}/analyze`, {
        method: "POST",
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to analyze contract");
      }
      
      setAnalysis(data.analysis);
      router.refresh();
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setAnalyzing(false);
    }
  };

  const hasAnalysis = !!analysis;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-slate-900 border-slate-800 text-slate-200 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-indigo-400" />
            AI Contract Analysis
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {contractTitle}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {!hasAnalysis && !analyzing && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
              <div className="h-16 w-16 bg-indigo-500/10 rounded-full flex items-center justify-center mb-2">
                <Brain className="h-8 w-8 text-indigo-400" />
              </div>
              <div>
                <h3 className="font-medium text-slate-200">No Analysis Found</h3>
                <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
                  Run our AI to extract key clauses, terms, and deliverables automatically from your document.
                </p>
              </div>
              <Button onClick={handleAnalyze} className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl">
                Start Analysis
              </Button>
            </div>
          )}

          {analyzing && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
              <div className="text-center">
                <h3 className="font-medium text-slate-200">Analyzing Document...</h3>
                <p className="text-sm text-slate-400 mt-1">This may take 10-30 seconds depending on the file size.</p>
              </div>
            </div>
          )}

          {hasAnalysis && !analyzing && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/60">
                  <div className="flex items-center gap-2 text-slate-400 mb-1 text-sm">
                    <Building className="h-4 w-4" /> Brand Name
                  </div>
                  <div className="font-medium">{analysis.brandName || "Not specified"}</div>
                </div>
                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/60">
                  <div className="flex items-center gap-2 text-slate-400 mb-1 text-sm">
                    <DollarSign className="h-4 w-4" /> Contract Value
                  </div>
                  <div className="font-medium text-emerald-400">{analysis.contractValue || "Not specified"}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/60">
                  <div className="flex items-center gap-2 text-slate-400 mb-1 text-sm">
                    <Calendar className="h-4 w-4" /> Start Date
                  </div>
                  <div className="font-medium">{analysis.startDate || "Not specified"}</div>
                </div>
                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/60">
                  <div className="flex items-center gap-2 text-slate-400 mb-1 text-sm">
                    <Clock className="h-4 w-4" /> End Date
                  </div>
                  <div className="font-medium">{analysis.endDate || "Not specified"}</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/60">
                  <h4 className="text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Payment Terms
                  </h4>
                  <p className="text-sm leading-relaxed">{analysis.paymentTerms || "Not specified"}</p>
                </div>

                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/60">
                  <h4 className="text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" /> Deliverables
                  </h4>
                  <p className="text-sm leading-relaxed">{analysis.deliverables || "Not specified"}</p>
                </div>

                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/60">
                  <h4 className="text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" /> Renewal & Termination
                  </h4>
                  <div className="space-y-2 text-sm leading-relaxed">
                    <p><strong className="text-slate-300">Renewal:</strong> {analysis.renewalClause || "Not specified"}</p>
                    <p><strong className="text-slate-300">Termination:</strong> {analysis.terminationClause || "Not specified"}</p>
                  </div>
                </div>

                {analysis.importantDeadlines && (
                  <div className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/20">
                    <h4 className="text-sm font-medium text-amber-400 mb-2 flex items-center gap-2">
                      <Clock className="h-4 w-4" /> Important Deadlines
                    </h4>
                    <p className="text-sm text-amber-200/80 leading-relaxed">{analysis.importantDeadlines}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {hasAnalysis && !analyzing && (
          <DialogFooter className="pt-4 border-t border-slate-800/40">
            <Button variant="ghost" onClick={handleAnalyze} className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-xl">
              <RefreshCw className="h-4 w-4 mr-2" /> Re-analyze Document
            </Button>
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl">
              Close
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
