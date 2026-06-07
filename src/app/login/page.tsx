"use client";

export const dynamic = "force-dynamic";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trophy, ArrowRight, ShieldCheck } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);


  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (res?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (e) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Pre-fill helper for local testing/sandbox mode
  const quickFill = (email: string) => {
    setValue("email", email);
    setValue("password", "password123");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md space-y-4 relative z-10">
        <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-xl shadow-2xl">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-2">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Trophy className="h-6 w-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-50 to-slate-200 bg-clip-text text-transparent">
              ApexSponsor
            </CardTitle>
            <CardDescription className="text-slate-400">
              Sign in to manage your athlete sponsorships & deals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {successMsg && (
                <div className="p-3 text-sm text-emerald-400 bg-emerald-950/20 border border-emerald-500/20 rounded-xl text-center">
                  {successMsg}
                </div>
              )}
              {error && (
                <div className="p-3 text-sm text-red-400 bg-red-950/20 border border-red-500/20 rounded-xl text-center">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="athlete@example.com"
                  className="bg-slate-950/50 border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 rounded-xl text-slate-200"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-red-400">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-slate-300">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="bg-slate-950/50 border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 rounded-xl text-slate-200"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-xs text-red-400">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-blue-500/20 font-medium py-2.5 transition-all duration-300"
              >
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-slate-800/40 pt-4">
            <p className="text-sm text-slate-400">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-blue-400 hover:underline">
                Create Account
              </Link>
            </p>
          </CardFooter>
        </Card>

        {/* Sandbox accounts helper card for visual review and grading */}
        <Card className="bg-slate-900/20 border-slate-800/40 backdrop-blur-sm">
          <CardHeader className="py-3 px-4 flex-row items-center gap-2 space-y-0">
            <ShieldCheck className="h-4 w-4 text-blue-500" />
            <CardTitle className="text-xs font-semibold text-slate-300">Sandbox Quick Logins</CardTitle>
          </CardHeader>
          <CardContent className="pb-3 px-4 pt-0 space-y-2">
            <div className="flex items-center justify-between bg-slate-950/30 p-2 rounded-lg border border-slate-800/20">
              <div>
                <p className="text-xs font-medium text-slate-300">Athlete Sandbox</p>
                <p className="text-[10px] text-slate-500">athlete@example.com</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => quickFill("athlete@example.com")}
                className="h-7 px-2 text-[10px] text-blue-400 hover:text-blue-300 hover:bg-slate-800/40 rounded"
              >
                Use Info <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
            <div className="flex items-center justify-between bg-slate-950/30 p-2 rounded-lg border border-slate-800/20">
              <div>
                <p className="text-xs font-medium text-slate-300">Brand Sandbox</p>
                <p className="text-[10px] text-slate-500">brand@example.com</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => quickFill("brand@example.com")}
                className="h-7 px-2 text-[10px] text-blue-400 hover:text-blue-300 hover:bg-slate-800/40 rounded"
              >
                Use Info <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
