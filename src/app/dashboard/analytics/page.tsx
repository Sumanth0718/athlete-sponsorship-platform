import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAnalyticsDashboard } from "@/lib/analytics";
import { AnalyticsCharts } from "./analytics-charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Briefcase, FileText, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const data = await getAnalyticsDashboard(userId);
  const { metrics } = data;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900/60 via-indigo-950/20 to-slate-900/60 p-6 rounded-2xl border border-slate-800/60 backdrop-blur-md">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
            Analytics
          </h1>
          <p className="text-slate-400 mt-1">
            Track your sponsorship revenue, deal statuses, and brand performance.
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-5">
        {/* Total Revenue */}
        <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-sm shadow-xl hover:border-slate-700/60 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total Revenue</CardTitle>
            <div className="h-9 w-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-100">
              ${metrics.totalRevenue.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        {/* Total Received */}
        <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-sm shadow-xl hover:border-slate-700/60 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total Received</CardTitle>
            <div className="h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <ArrowDownToLine className="h-5 w-5 text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-100">
              ${metrics.totalReceived.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        {/* Total Pending */}
        <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-sm shadow-xl hover:border-slate-700/60 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total Pending</CardTitle>
            <div className="h-9 w-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <ArrowUpFromLine className="h-5 w-5 text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-100">
              ${metrics.totalPending.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        {/* Active Brands */}
        <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-sm shadow-xl hover:border-slate-700/60 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Active Brands</CardTitle>
            <div className="h-9 w-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-100">{metrics.activeBrands}</div>
          </CardContent>
        </Card>

        {/* Active Contracts */}
        <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-sm shadow-xl hover:border-slate-700/60 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Active Contracts</CardTitle>
            <div className="h-9 w-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <FileText className="h-5 w-5 text-indigo-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-100">{metrics.activeContracts}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts section */}
      <AnalyticsCharts data={data.charts} />
    </div>
  );
}
