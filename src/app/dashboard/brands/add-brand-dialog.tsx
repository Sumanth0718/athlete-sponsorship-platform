"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createBrandAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

const brandSchema = z.object({
  name: z.string().min(2, "Brand name must be at least 2 characters"),
  industry: z.string().min(2, "Industry must be at least 2 characters"),
  description: z.string().optional(),
  website: z.string().url("Invalid website URL").or(z.string().length(0)),
});

type BrandFormValues = z.infer<typeof brandSchema>;

export function AddBrandDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BrandFormValues>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: "",
      industry: "",
      description: "",
      website: "",
    },
  });

  const onSubmit = async (data: BrandFormValues) => {
    setError(null);
    setLoading(true);

    try {
      await createBrandAction(
        data.name,
        data.industry,
        data.description || "",
        data.website || ""
      );
      reset();
      setOpen(false);
      router.refresh();
    } catch (e: unknown) {
      setError((e as Error).message || "Failed to create brand");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/20 inline-flex items-center justify-center px-4 py-2 text-sm font-medium transition-colors cursor-pointer select-none">
        <Plus className="mr-2 h-4 w-4" /> Add Brand
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-slate-200">
        <DialogHeader>
          <DialogTitle className="text-slate-100">Add New Partner Brand</DialogTitle>
          <DialogDescription className="text-slate-400">
            Create a profile for a brand to associate deals and campaigns.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          {error && (
            <div className="p-3 text-sm text-red-400 bg-red-950/20 border border-red-500/20 rounded-xl text-center">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-300">Brand Name</Label>
            <Input
              id="name"
              placeholder="e.g. Under Armour"
              className="bg-slate-950/50 border-slate-800 focus:border-blue-500 rounded-xl text-slate-200"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-red-400">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry" className="text-slate-300">Industry</Label>
            <Input
              id="industry"
              placeholder="e.g. Sports Equipment"
              className="bg-slate-950/50 border-slate-800 focus:border-blue-500 rounded-xl text-slate-200"
              {...register("industry")}
            />
            {errors.industry && (
              <p className="text-xs text-red-400">{errors.industry.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-slate-300">Description</Label>
            <Input
              id="description"
              placeholder="Brief description of the brand"
              className="bg-slate-950/50 border-slate-800 focus:border-blue-500 rounded-xl text-slate-200"
              {...register("description")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website" className="text-slate-300">Website</Label>
            <Input
              id="website"
              placeholder="https://brand.com"
              className="bg-slate-950/50 border-slate-800 focus:border-blue-500 rounded-xl text-slate-200"
              {...register("website")}
            />
            {errors.website && (
              <p className="text-xs text-red-400">{errors.website?.message}</p>
            )}
          </div>

          <DialogFooter className="pt-4 border-t border-slate-800/40">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl"
            >
              {loading ? "Saving..." : "Create Brand"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
