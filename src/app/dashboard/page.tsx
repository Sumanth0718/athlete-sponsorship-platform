import React from "react";
import Link from "next/link";
import { getDeals, getBrands, getContracts } from "@/lib/services";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Briefcase,
  DollarSign,
  FileSpreadsheet,
  Handshake,
  TrendingUp,
  ArrowUpRight,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const deals = await getDeals(userId);
  const brands = await getBrands(userId);
  const contracts = await getContracts(userId);

  // Metrics calculations
  const activeDeals = deals.filter((d) => d.status === "ACTIVE");
  const negotiatingDeals = deals.filter((d) => d.status === "NEGOTIATING");
  const draftDeals = deals.filter((d) => d.status === "DRAFT");
  
  const totalValue = deals
    .filter((d) => d.status === "ACTIVE" || d.status === "NEGOTIATING")
    .reduce((acc, curr) => acc + curr.value, 0);

  const totalContracts = contracts.length;
  const activeContracts = contracts.filter((c) => c.status === "Active");
  const expiringContracts = contracts.filter((c) => c.status === "Expiring Soon");
  const expiredContracts = contracts.filter((c) => c.status === "Expired");

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900/60 via-indigo-950/20 to-slate-900/60 p-6 rounded-2xl border border-slate-800/60 backdrop-blur-md">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
            Dashboard
          </h1>
          <p className="text-slate-400 mt-1">
            Welcome back! Here is a summary of your active sponsorships and contracts.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/deals">
            <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/20">
              <Plus className="mr-2 h-4 w-4" /> New Deal
            </Button>
          </Link>
          <Link href="/dashboard/brands">
            <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl">
              Add Brand
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1 */}
        <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-sm shadow-xl hover:border-slate-700/60 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Pipeline Value</CardTitle>
            <div className="h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-100">
              ${totalValue.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-emerald-400" />
              Active & negotiating deals
            </p>
          </CardContent>
        </Card>

        {/* Metric 2 */}
        <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-sm shadow-xl hover:border-slate-700/60 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Active Sponsorships</CardTitle>
            <div className="h-9 w-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Handshake className="h-5 w-5 text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-100">{activeDeals.length}</div>
            <p className="text-xs text-slate-500 mt-1">Currently running campaigns</p>
          </CardContent>
        </Card>

        {/* Metric 3 */}
        <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-sm shadow-xl hover:border-slate-700/60 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total Contracts</CardTitle>
            <div className="h-9 w-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <FileSpreadsheet className="h-5 w-5 text-indigo-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-100">{totalContracts}</div>
            <div className="flex gap-2 mt-1">
               <p className="text-xs text-emerald-400">{activeContracts.length} Active</p>
               <p className="text-xs text-amber-400">{expiringContracts.length} Expiring</p>
               <p className="text-xs text-red-400">{expiredContracts.length} Expired</p>
            </div>
          </CardContent>
        </Card>

        {/* Metric 4 */}
        <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-sm shadow-xl hover:border-slate-700/60 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Partner Brands</CardTitle>
            <div className="h-9 w-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-100">{brands.length}</div>
            <p className="text-xs text-slate-500 mt-1">Brands in your portfolio</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Recent Deals & Active Brands */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Recent Deals Table */}
        <Card className="md:col-span-2 bg-slate-900/40 border-slate-800/60 backdrop-blur-sm shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-slate-200">Recent Deals</CardTitle>
              <CardDescription className="text-slate-400 text-xs">
                Review and update status of recent deal discussions
              </CardDescription>
            </div>
            <Link href="/dashboard/deals" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-0.5">
              View All <ArrowUpRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-300">
                <thead>
                  <tr className="border-b border-slate-800/80 text-xs font-semibold text-slate-400 uppercase">
                    <th className="py-3 px-2">Title</th>
                    <th className="py-3 px-2">Brand</th>
                    <th className="py-3 px-2">Value</th>
                    <th className="py-3 px-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {deals.slice(0, 5).map((deal) => (
                    <tr key={deal.id} className="hover:bg-slate-800/20 transition-all duration-150">
                      <td className="py-3.5 px-2 font-medium text-slate-200">{deal.title}</td>
                      <td className="py-3.5 px-2 text-slate-400">{deal.brand?.name}</td>
                      <td className="py-3.5 px-2 text-emerald-400 font-semibold">
                        ${deal.value.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-2">
                        <Badge
                          className={
                            deal.status === "ACTIVE"
                              ? "bg-blue-500/10 text-blue-400 hover:bg-blue-500/25 border-blue-500/20"
                              : deal.status === "NEGOTIATING"
                              ? "bg-amber-500/10 text-amber-400 hover:bg-amber-500/25 border-amber-500/20"
                              : "bg-slate-500/10 text-slate-400 hover:bg-slate-500/25 border-slate-500/20"
                          }
                        >
                          {deal.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Brands Overview */}
        <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-200">Featured Brands</CardTitle>
            <CardDescription className="text-slate-400 text-xs">
              Sponsorship opportunities directory
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {brands.slice(0, 3).map((brand) => (
              <div
                key={brand.id}
                className="p-3 bg-slate-950/40 border border-slate-800/40 rounded-xl flex items-center justify-between hover:border-slate-700 transition-all duration-200"
              >
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">{brand.name}</h4>
                  <p className="text-xs text-slate-500">{brand.industry}</p>
                </div>
                <Link href={`/dashboard/brands`}>
                  <Button variant="ghost" size="sm" className="h-8 text-blue-400 hover:bg-slate-800">
                    Details
                  </Button>
                </Link>
              </div>
            ))}
            <Link href="/dashboard/brands" className="block text-center mt-2">
              <Button variant="ghost" className="w-full text-xs text-slate-400 hover:text-slate-200">
                Manage all brands
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
