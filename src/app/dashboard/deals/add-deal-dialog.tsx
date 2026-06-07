"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createDealAction } from "@/app/actions";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";

interface Brand {
  id: string;
  name: string;
}

const dealSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  value: z.number().positive("Value must be a positive number"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  brandId: z.string().min(1, "Please select a brand"),
});

type DealFormValues = z.infer<typeof dealSchema>;

export function AddDealDialog({ brands }: { brands: Brand[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<DealFormValues>({
    resolver: zodResolver(dealSchema),
    defaultValues: {
      title: "",
      description: "",
      value: undefined,
      startDate: "",
      endDate: "",
      brandId: "",
    },
  });

  const selectedBrandId = watch("brandId");

  const onSubmit = async (data: DealFormValues) => {
    setError(null);
    setLoading(true);

    try {
      await createDealAction(
        data.title,
        data.description,
        data.value,
        data.startDate,
        data.endDate,
        data.brandId
      );
      reset();
      setOpen(false);
      router.refresh();
    } catch (e: unknown) {
      setError((e as Error).message || "Failed to create deal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/20 inline-flex items-center justify-center px-4 py-2 text-sm font-medium transition-colors cursor-pointer select-none">
        <Plus className="mr-2 h-4 w-4" /> New Deal Proposal
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-800 text-slate-200">
        <DialogHeader>
          <DialogTitle className="text-slate-100">Propose New Sponsorship Deal</DialogTitle>
          <DialogDescription className="text-slate-400">
            Set details for a sponsorship campaign proposal. This automatically creates a pending contract.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          {error && (
            <div className="p-3 text-sm text-red-400 bg-red-950/20 border border-red-500/20 rounded-xl text-center">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="title" className="text-slate-300">Campaign Title</Label>
              <Input
                id="title"
                placeholder="e.g. Winter Apparel Endorsement"
                className="bg-slate-950/50 border-slate-800 focus:border-blue-500 rounded-xl text-slate-200"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-xs text-red-400">{errors.title.message}</p>
              )}
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="brandId" className="text-slate-300">Select Brand</Label>
              <Select
                value={selectedBrandId}
                onValueChange={(val) => setValue("brandId", val as string)}
              >
                <SelectTrigger className="bg-slate-950/50 border-slate-800 focus:border-blue-500 rounded-xl text-slate-200">
                  <SelectValue placeholder="Select partner brand" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                  {brands.map((b) => (
                    <SelectItem key={b.id} value={b.id} className="focus:bg-slate-800 focus:text-slate-100">
                      {b.name}
                    </SelectItem>
                  ))}
                  {brands.length === 0 && (
                    <SelectItem value="none" disabled>
                      No brands available. Please create one.
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {errors.brandId && (
                <p className="text-xs text-red-400">{errors.brandId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="value" className="text-slate-300">Contract Value ($)</Label>
              <Input
                id="value"
                type="number"
                placeholder="50000"
                className="bg-slate-950/50 border-slate-800 focus:border-blue-500 rounded-xl text-slate-200"
                onWheel={(e) => (e.target as HTMLElement).blur()}
                onChange={(e) => setValue("value", Number(e.target.value))}
              />
              {errors.value && (
                <p className="text-xs text-red-400">{errors.value.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-slate-300">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                className="bg-slate-950/50 border-slate-800 focus:border-blue-500 rounded-xl text-slate-200"
                {...register("startDate")}
              />
              {errors.startDate && (
                <p className="text-xs text-red-400">{errors.startDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-slate-300">End Date</Label>
              <Input
                id="endDate"
                type="date"
                className="bg-slate-950/50 border-slate-800 focus:border-blue-500 rounded-xl text-slate-200"
                {...register("endDate")}
              />
              {errors.endDate && (
                <p className="text-xs text-red-400">{errors.endDate.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-slate-300">Deliverables & Details</Label>
            <textarea
              id="description"
              rows={3}
              placeholder="Detail out standard terms, deliverables, social posts required, photo shoot days, etc."
              className="w-full bg-slate-950/50 border border-slate-800 focus:border-blue-500 rounded-xl text-slate-200 p-2.5 text-sm outline-none"
              onChange={(e) => setValue("description", e.target.value)}
            />
            {errors.description && (
              <p className="text-xs text-red-400">{errors.description.message}</p>
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
              {loading ? "Creating..." : "Propose Deal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
