import React from "react";
import { getBrands, getAthletes } from "@/lib/services";
import { BrandsList } from "./brands-list";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, MapPin, Trophy, Star, Send } from "lucide-react";

export const dynamic = "force-dynamic";

import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function BrandsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;
  const isBrandRep = session.user.role === "BRAND_REPRESENTATIVE";

  if (isBrandRep) {
    const athletes = await getAthletes();

    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-3">
              <Users className="h-8 w-8 text-purple-400" />
              Athlete Talent Directory
            </h1>
            <p className="text-slate-400 mt-1">
              Discover, pitch, and sponsor elite professional athletes across sports.
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {athletes.map((ath) => (
            <Card key={ath.id} className="bg-slate-900/40 border-slate-800/60 backdrop-blur-sm shadow-xl hover:border-slate-700/60 transition-all duration-300 flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl p-2 bg-slate-950/60 border border-slate-800 rounded-2xl">
                      {ath.avatar}
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-slate-100">{ath.name}</CardTitle>
                      <CardDescription className="text-purple-400 text-xs mt-0.5 font-medium flex items-center gap-1">
                        <Trophy className="h-3 w-3" />
                        {ath.sport}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-xs">
                    {ath.rating}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-400 leading-relaxed">
                  {ath.bio}
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800/50 text-slate-400">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-500" />
                    <span>{ath.location}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500">Audience: </span>
                    <span className="font-semibold text-slate-200">{ath.followers}</span>
                  </div>
                </div>
                <div className="pt-2">
                  <Button className="w-full bg-purple-600 hover:bg-purple-500 text-white rounded-xl shadow-md shadow-purple-500/20">
                    <Send className="mr-2 h-4 w-4" /> Send Sponsorship Pitch
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

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

