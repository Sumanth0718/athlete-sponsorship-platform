"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard segment error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <div className="h-16 w-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-4 border border-red-500/20">
        <AlertTriangle className="h-8 w-8 text-red-400" />
      </div>
      <h2 className="text-xl font-bold text-slate-100 mb-2">Something went wrong loading dashboard</h2>
      <p className="text-sm text-slate-400 max-w-md mb-6">
        {error?.message || "An unexpected error occurred while loading this view. Please click below to refresh."}
      </p>
      <div className="flex gap-3">
        <Button onClick={() => reset()} className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl">
          <RefreshCw className="mr-2 h-4 w-4" /> Reload View
        </Button>
        <Button onClick={() => window.location.reload()} variant="outline" className="border-slate-800 text-slate-300 rounded-xl">
          Refresh Page
        </Button>
      </div>
    </div>
  );
}
