"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, Copy, CheckCircle2, ExternalLink, MessageSquare, History } from "lucide-react";
import { useRouter } from "next/navigation";

interface FollowUp {
  id: string;
  subject: string;
  body: string;
  createdAt: Date | string;
}

interface FollowUpDialogProps {
  dealId: string;
  dealTitle: string;
  brandName: string;
  pendingAmount: number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  existingFollowUps?: FollowUp[];
}

export function FollowUpDialog({
  dealId,
  dealTitle,
  brandName,
  pendingAmount,
  isOpen,
  onOpenChange,
  existingFollowUps = [],
}: FollowUpDialogProps) {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [activeFollowUp, setActiveFollowUp] = useState<FollowUp | null>(existingFollowUps.length > 0 ? existingFollowUps[0] : null);
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    setError("");

    try {
      const res = await fetch(`/api/deals/${dealId}/follow-up`, {
        method: "POST",
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate follow-up");
      }
      
      setActiveFollowUp(data.followUp);
      router.refresh();
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = async (text: string, type: "subject" | "body") => {
    await navigator.clipboard.writeText(text);
    if (type === "subject") {
      setCopiedSubject(true);
      setTimeout(() => setCopiedSubject(false), 2000);
    } else {
      setCopiedBody(true);
      setTimeout(() => setCopiedBody(false), 2000);
    }
  };

  const openGmail = () => {
    if (!activeFollowUp) return;
    const subject = encodeURIComponent(activeFollowUp.subject);
    const body = encodeURIComponent(activeFollowUp.body);
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`, "_blank");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] bg-slate-900 border-slate-800 text-slate-200 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-400" />
            AI Follow-Up Email
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Generate professional payment follow-ups for {brandName} (${pendingAmount.toLocaleString()} pending).
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {!activeFollowUp && !generating && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
              <div className="h-16 w-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-2">
                <MessageSquare className="h-8 w-8 text-blue-400" />
              </div>
              <div>
                <h3 className="font-medium text-slate-200">No Drafts Generated</h3>
                <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
                  Use our AI to draft a polite, professional follow-up email requesting the pending payment from the brand.
                </p>
              </div>
              <Button onClick={handleGenerate} className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl">
                Generate Draft Now
              </Button>
            </div>
          )}

          {generating && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
              <div className="text-center">
                <h3 className="font-medium text-slate-200">Drafting Email...</h3>
                <p className="text-sm text-slate-400 mt-1">Analyzing deal terms and payment schedules...</p>
              </div>
            </div>
          )}

          {activeFollowUp && !generating && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Subject</label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => copyToClipboard(activeFollowUp.subject, "subject")}
                    className="h-6 px-2 text-xs text-slate-400 hover:text-slate-200"
                  >
                    {copiedSubject ? <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                    {copiedSubject ? "Copied!" : "Copy"}
                  </Button>
                </div>
                <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800/60 font-medium">
                  {activeFollowUp.subject}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Message Body</label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => copyToClipboard(activeFollowUp.body, "body")}
                    className="h-6 px-2 text-xs text-slate-400 hover:text-slate-200"
                  >
                    {copiedBody ? <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                    {copiedBody ? "Copied!" : "Copy"}
                  </Button>
                </div>
                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/60 text-sm leading-relaxed whitespace-pre-wrap font-sans text-slate-300">
                  {activeFollowUp.body}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button 
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-xl"
                  onClick={openGmail}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Gmail Draft
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl"
                  onClick={() => copyToClipboard(`${activeFollowUp.subject}\n\n${activeFollowUp.body}`, "body")}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Entire Message
                </Button>
              </div>

              {existingFollowUps.length > 1 && (
                <div className="mt-8 pt-4 border-t border-slate-800/60">
                  <h4 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                    <History className="h-4 w-4" /> Previous Drafts
                  </h4>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {existingFollowUps.map((fu, idx) => (
                      <Button
                        key={fu.id}
                        variant={activeFollowUp.id === fu.id ? "default" : "secondary"}
                        size="sm"
                        onClick={() => setActiveFollowUp(fu)}
                        className={`rounded-lg text-xs whitespace-nowrap ${
                          activeFollowUp.id === fu.id 
                            ? "bg-slate-700 text-slate-100 hover:bg-slate-600" 
                            : "bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800"
                        }`}
                      >
                        Draft {existingFollowUps.length - idx}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {activeFollowUp && !generating && (
          <DialogFooter className="pt-2">
            <Button variant="ghost" onClick={handleGenerate} className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-xl mr-auto">
              Regenerate Email
            </Button>
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl">
              Close
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
