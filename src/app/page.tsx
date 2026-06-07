import React from "react";
import Link from "next/link";
import { Trophy, Briefcase, Handshake, FileText, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-50 relative overflow-hidden font-sans">
      {/* Background radial blurs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl" />

      {/* Header */}
      <header className="w-full h-20 px-6 md:px-12 flex items-center justify-between border-b border-slate-900 bg-slate-950/50 backdrop-blur-md relative z-10">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-lg shadow-lg shadow-blue-500/20">
            A
          </div>
          <span className="font-semibold text-lg tracking-wider bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
            ApexSponsor
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="text-slate-400 hover:text-slate-100 rounded-xl">
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md shadow-blue-500/20">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 relative z-10 max-w-4xl mx-auto space-y-8">
        {/* Sub-header badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-blue-400 font-medium">
          <Star className="h-3 w-3 text-blue-400 fill-blue-400" />
          The Sponsorship Suite for Modern Athletes
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight md:leading-none">
          Manage your Sponsorships
          <span className="block mt-2 bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
            Like a Professional.
          </span>
        </h1>

        <p className="text-slate-400 text-lg md:text-xl max-w-2xl font-light">
          Track campaign negotiations, sign secure digital contracts, and manage relationships with global brands—all inside one unified, premium dashboard.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 w-full sm:w-auto">
          <Link href="/dashboard">
            <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/35 px-8 py-6 text-base font-semibold group transition-all duration-300">
              Enter Dashboard
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="/register">
            <Button size="lg" variant="outline" className="w-full sm:w-auto border-slate-800 bg-slate-900/20 hover:bg-slate-900 text-slate-300 rounded-xl px-8 py-6 text-base">
              Create Account
            </Button>
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 w-full text-left">
          <div className="p-6 bg-slate-900/35 border border-slate-900 hover:border-slate-800/60 rounded-2xl space-y-3 backdrop-blur-sm transition-all duration-300">
            <div className="h-10 w-10 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-blue-400" />
            </div>
            <h3 className="font-bold text-slate-200 text-base">Brand Registry</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Explore profiles of partner brands, filter by industries, and pitch campaign collaborations.
            </p>
          </div>

          <div className="p-6 bg-slate-900/35 border border-slate-900 hover:border-slate-800/60 rounded-2xl space-y-3 backdrop-blur-sm transition-all duration-300">
            <div className="h-10 w-10 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center">
              <Handshake className="h-5 w-5 text-indigo-400" />
            </div>
            <h3 className="font-bold text-slate-200 text-base">Deal Pipeline</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Track deal statuses from drafts, through active negotiations, to completed sponsorships.
            </p>
          </div>

          <div className="p-6 bg-slate-900/35 border border-slate-900 hover:border-slate-800/60 rounded-2xl space-y-3 backdrop-blur-sm transition-all duration-300">
            <div className="h-10 w-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center">
              <FileText className="h-5 w-5 text-emerald-400" />
            </div>
            <h3 className="font-bold text-slate-200 text-base">Contracts Manager</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Securely execute partnership terms using built-in electronic signatures and visual contract clause viewers.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 text-center text-xs text-slate-650 border-t border-slate-900 bg-slate-950 z-10">
        &copy; {new Date().getFullYear()} ApexSponsor Platform. All rights reserved.
      </footer>
    </div>
  );
}
