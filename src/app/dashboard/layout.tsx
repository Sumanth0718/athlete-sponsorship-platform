"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Briefcase,
  Handshake,
  FileText,
  Menu,
  X,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Hardcoded fallback for testing UI when not logged in
  const user = session?.user ?? {
    name: "Alex Johnson",
    email: "athlete@example.com",
    role: "ATHLETE",
  };

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Brands", href: "/dashboard/brands", icon: Briefcase },
    { name: "Deals", href: "/dashboard/deals", icon: Handshake },
    { name: "Contracts", href: "/dashboard/contracts", icon: FileText },
  ];

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col border-r border-slate-800/60 bg-slate-900/40 backdrop-blur-md">
        <div className="flex h-16 items-center px-6 border-b border-slate-800/60 gap-2">
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-lg shadow-lg shadow-blue-500/30">
            A
          </div>
          <span className="font-semibold text-lg tracking-wider bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
            ApexSponsor
          </span>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-6">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? "bg-blue-600/15 text-blue-400 border border-blue-500/20"
                    : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
                }`}
              >
                <Icon className={`mr-3 h-5 w-5 ${isActive ? "text-blue-400" : "text-slate-400"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User profile section at the bottom of the sidebar */}
        <div className="p-4 border-t border-slate-800/60 bg-slate-900/20">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
              <UserIcon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-slate-200">{user.name}</p>
              <p className="text-xs text-slate-500 truncate capitalize">{user.role?.toLowerCase()?.replace("_", " ")}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full mt-4 justify-start text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl"
          >
            <LogOut className="mr-3 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-slate-950/80 backdrop-blur-sm">
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-slate-900 border-r border-slate-800/60">
            <div className="absolute top-4 right-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
                className="text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>

            <div className="flex h-16 items-center px-6 border-b border-slate-800/60 gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-lg">
                A
              </div>
              <span className="font-semibold text-lg tracking-wider bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
                ApexSponsor
              </span>
            </div>

            <nav className="flex-1 space-y-1 px-4 py-6">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? "bg-blue-600/15 text-blue-400 border border-blue-500/20"
                        : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
                    }`}
                  >
                    <Icon className={`mr-3 h-5 w-5 ${isActive ? "text-blue-400" : "text-slate-400"}`} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-slate-800/60 bg-slate-900/20">
              <div className="flex items-center gap-3 px-2 py-2">
                <div className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                  <UserIcon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate text-slate-200">{user.name}</p>
                  <p className="text-xs text-slate-500 truncate capitalize">{user.role?.toLowerCase()?.replace("_", " ")}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full mt-4 justify-start text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl"
              >
                <LogOut className="mr-3 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="flex h-16 items-center justify-between px-6 border-b border-slate-800/60 bg-slate-900/20 backdrop-blur-md md:hidden">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-lg">
              A
            </div>
            <span className="font-semibold text-md tracking-wider bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
              ApexSponsor
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(true)}
            className="text-slate-400 hover:text-slate-200"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-950 via-slate-900/50 to-slate-950 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
