"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  FileText,
  Calendar,
  Building,
  Upload,
  Download,
  Trash2,
  FileArchive,
  Loader2,
  ExternalLink,
  Brain
} from "lucide-react";
import { ContractAnalysisDialog } from "./contract-analysis-dialog";

interface Brand {
  id: string;
  name: string;
}

interface Contract {
  id: string;
  title: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  cloudinaryUrl: string;
  uploadDate: Date;
  expiryDate: Date;
  status: string;
  brand: {
    name: string;
  };
  analysis?: any;
}

export function ContractsList({ initialContracts, brands }: { initialContracts: Contract[], brands: Brand[] }) {
  const router = useRouter();
  const [contracts, setContracts] = useState<Contract[]>(initialContracts);
  
  // Upload Modal State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [brandId, setBrandId] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [error, setError] = useState("");

  // Analysis Modal State
  const [analysisDialogOpen, setAnalysisDialogOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

  const openAnalysis = (contract: Contract) => {
    setSelectedContract(contract);
    setAnalysisDialogOpen(true);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title || !brandId || !expiryDate) {
      setError("Please fill all fields and select a file.");
      return;
    }
    
    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("brandId", brandId);
    formData.append("expiryDate", expiryDate);

    try {
      const res = await fetch("/api/contracts", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setIsUploadOpen(false);
      setFile(null);
      setTitle("");
      setBrandId("");
      setExpiryDate("");
      router.refresh();
      
      // Update local state temporarily until refresh completes
      const newContract: Contract = {
        ...data.contract,
        brand: { name: brands.find(b => b.id === brandId)?.name || "" },
        uploadDate: new Date(data.contract.uploadDate),
        expiryDate: new Date(data.contract.expiryDate)
      };
      setContracts([newContract, ...contracts]);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this contract?")) return;
    try {
      const res = await fetch(`/api/contracts/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Delete failed");
      }
      setContracts(contracts.filter(c => c.id !== id));
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setIsUploadOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/20">
          <Upload className="mr-2 h-4 w-4" /> Upload Contract
        </Button>
      </div>

      {/* Contracts table */}
      <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-200">Legal Agreements</CardTitle>
          <CardDescription className="text-slate-400 text-xs">
            Review sponsorship terms, manage files, and track expirations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-300">
              <thead>
                <tr className="border-b border-slate-800/80 text-xs font-semibold text-slate-400 uppercase">
                  <th className="py-3 px-3">Agreement</th>
                  <th className="py-3 px-3">Brand Partner</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Expiry Date</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {contracts.map((contract) => (
                  <tr key={contract.id} className="hover:bg-slate-800/20 transition-all duration-150">
                    <td className="py-4 px-3 font-semibold text-slate-200">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-400 flex-shrink-0" />
                        <div>
                          <div className="truncate max-w-[200px]">{contract.title}</div>
                          <div className="text-xs text-slate-500 font-normal mt-0.5 truncate max-w-[200px]">{contract.fileName} ({formatFileSize(contract.fileSize)})</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-3 text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Building className="h-3.5 w-3.5 text-slate-500" />
                        {contract.brand.name}
                      </div>
                    </td>
                    <td className="py-4 px-3">
                      <Badge
                        className={
                          contract.status === "Active"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : contract.status === "Expiring Soon"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-red-500/10 text-red-400 border-red-500/20"
                        }
                      >
                        {contract.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-3 text-slate-500 text-xs">
                       <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(contract.expiryDate).toLocaleDateString()}
                        </span>
                    </td>
                    <td className="py-4 px-3 text-right">
                      <div className="flex justify-end gap-2">
                         <Button
                           variant="ghost"
                           size="sm"
                           onClick={() => openAnalysis(contract)}
                           className={`h-8 w-8 p-0 rounded-xl ${contract.analysis ? "text-indigo-400 hover:bg-indigo-900/20" : "text-slate-400 hover:text-indigo-300 hover:bg-indigo-900/20"}`}
                           title={contract.analysis ? "View AI Analysis" : "Analyze Contract"}
                         >
                           <Brain className="h-4 w-4" />
                         </Button>
                         <a href={contract.cloudinaryUrl} target="_blank" rel="noopener noreferrer">
                           <Button
                             variant="ghost"
                             size="sm"
                             className="text-blue-400 hover:bg-blue-600/10 h-8 w-8 p-0 rounded-xl"
                             title="View Document"
                           >
                             <ExternalLink className="h-4 w-4" />
                           </Button>
                         </a>
                         <Button
                           variant="ghost"
                           size="sm"
                           onClick={() => handleDelete(contract.id)}
                           className="text-red-400 hover:bg-red-900/20 h-8 w-8 p-0 rounded-xl"
                           title="Delete"
                         >
                           <Trash2 className="h-4 w-4" />
                         </Button>
                      </div>
                    </td>
                  </tr>
                ))}

                {contracts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-slate-500 text-sm">
                      <FileArchive className="mx-auto h-8 w-8 text-slate-700 mb-3" />
                      No contracts uploaded yet. Click 'Upload Contract' to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Upload Modal */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-slate-200">
          <DialogHeader>
            <DialogTitle>Upload Contract</DialogTitle>
            <DialogDescription className="text-slate-400 text-xs mt-1">
              Upload a signed PDF or DOCX agreement. Max size 10MB.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleUpload} className="space-y-4 py-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="title">Contract Title</Label>
              <Input 
                id="title" 
                placeholder="e.g. 2026 Sponsorship Agreement" 
                className="bg-slate-950/80 border-slate-800 text-slate-200 focus:border-blue-500 rounded-xl"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">Partner Brand</Label>
              <Select value={brandId} onValueChange={(v) => setBrandId(v || "")}>
                <SelectTrigger className="bg-slate-950/80 border-slate-800 text-slate-200 focus:border-blue-500 rounded-xl">
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                  {brands.map(b => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiry">Expiry Date</Label>
              <Input 
                id="expiry" 
                type="date"
                className="bg-slate-950/80 border-slate-800 text-slate-200 focus:border-blue-500 rounded-xl"
                value={expiryDate}
                onChange={e => setExpiryDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">Document (PDF/DOCX)</Label>
              <Input 
                id="file" 
                type="file" 
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="bg-slate-950/80 border-slate-800 text-slate-200 focus:border-blue-500 rounded-xl cursor-pointer file:text-slate-300"
                onChange={e => setFile(e.target.files?.[0] || null)}
              />
            </div>

            <DialogFooter className="pt-4 border-t border-slate-800/40">
              <Button type="button" variant="ghost" onClick={() => setIsUploadOpen(false)} className="text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl">
                Cancel
              </Button>
              <Button type="submit" disabled={uploading} className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                {uploading ? "Uploading..." : "Upload File"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {selectedContract && (
        <ContractAnalysisDialog
          contractId={selectedContract.id}
          contractTitle={selectedContract.title}
          existingAnalysis={selectedContract.analysis}
          isOpen={analysisDialogOpen}
          onOpenChange={setAnalysisDialogOpen}
        />
      )}
    </div>
  );
}
