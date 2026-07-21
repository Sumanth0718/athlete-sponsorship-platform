"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  Mail, 
  Copy, 
  CheckCircle2, 
  ExternalLink, 
  Sparkles, 
  History, 
  Send,
  UserCheck,
  Zap,
  ShieldCheck
} from "lucide-react";
import { useRouter } from "next/navigation";

interface FollowUp {
  id: string;
  subject: string;
  body: string;
  status?: string;
  createdAt: Date | string;
}

interface FollowUpDialogProps {
  dealId: string;
  dealTitle: string;
  brandName: string;
  brandEmail?: string;
  pendingAmount: number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  existingFollowUps?: FollowUp[];
}

export function FollowUpDialog({
  dealId,
  dealTitle,
  brandName,
  brandEmail = "",
  pendingAmount,
  isOpen,
  onOpenChange,
  existingFollowUps = [],
}: FollowUpDialogProps) {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [tone, setTone] = useState<"friendly" | "professional" | "firm">("professional");
  const [recipientEmail, setRecipientEmail] = useState(
    brandEmail || `sponsorships@${brandName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`
  );
  const [customNote, setCustomNote] = useState("");

  const [activeFollowUp, setActiveFollowUp] = useState<FollowUp | null>(
    existingFollowUps.length > 0 ? existingFollowUps[0] : null
  );

  // Editable fields
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);
  const [dispatched, setDispatched] = useState(false);

  useEffect(() => {
    if (activeFollowUp) {
      setSubject(activeFollowUp.subject);
      setBody(activeFollowUp.body);
    }
  }, [activeFollowUp]);

  useEffect(() => {
    if (brandName && !recipientEmail) {
      setRecipientEmail(`sponsorships@${brandName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`);
    }
  }, [brandName]);

  const handleGenerate = async (selectedTone = tone) => {
    setGenerating(true);
    setError("");

    try {
      const res = await fetch(`/api/deals/${dealId}/follow-up`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tone: selectedTone, customNote }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate follow-up");
      }
      
      setActiveFollowUp(data.followUp);
      setSubject(data.followUp.subject);
      setBody(data.followUp.body);
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
    const encTo = encodeURIComponent(recipientEmail);
    const encSub = encodeURIComponent(subject);
    const encBody = encodeURIComponent(body);
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${encTo}&su=${encSub}&body=${encBody}`, "_blank");
    setDispatched(true);
  };

  const openMailto = () => {
    const encTo = encodeURIComponent(recipientEmail);
    const encSub = encodeURIComponent(subject);
    const encBody = encodeURIComponent(body);
    window.location.href = `mailto:${encTo}?subject=${encSub}&body=${encBody}`;
    setDispatched(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px] bg-slate-900 border-slate-800 text-slate-200 max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-blue-400" />
            AI Follow-Up Email Assistant
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-xs mt-1">
            Generate and dispatch context-aware payment reminders for <strong className="text-slate-200">{brandName}</strong> (${pendingAmount.toLocaleString()} pending).
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs">
              {error}
            </div>
          )}

          {/* Tone Selector & Options */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 space-y-3">
            <Label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              1. Select Email Tone & Context
            </Label>
            
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => { setTone("friendly"); handleGenerate("friendly"); }}
                className={`rounded-xl text-xs justify-start px-3 py-2 h-auto border transition-all ${
                  tone === "friendly"
                    ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
                    : "bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                <div className="text-left">
                  <div className="font-semibold flex items-center gap-1.5">
                    <span>🤝</span> Friendly Check-In
                  </div>
                  <div className="text-[10px] text-slate-500 font-normal">Warm, polite balance inquiry</div>
                </div>
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => { setTone("professional"); handleGenerate("professional"); }}
                className={`rounded-xl text-xs justify-start px-3 py-2 h-auto border transition-all ${
                  tone === "professional"
                    ? "bg-blue-500/10 border-blue-500/40 text-blue-300"
                    : "bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                <div className="text-left">
                  <div className="font-semibold flex items-center gap-1.5">
                    <span>💼</span> Professional
                  </div>
                  <div className="text-[10px] text-slate-500 font-normal">Standard formal payment reminder</div>
                </div>
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => { setTone("firm"); handleGenerate("firm"); }}
                className={`rounded-xl text-xs justify-start px-3 py-2 h-auto border transition-all ${
                  tone === "firm"
                    ? "bg-amber-500/10 border-amber-500/40 text-amber-300"
                    : "bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                <div className="text-left">
                  <div className="font-semibold flex items-center gap-1.5">
                    <span>⚡</span> Urgent / Overdue
                  </div>
                  <div className="text-[10px] text-slate-500 font-normal">Firm notice for overdue accounts</div>
                </div>
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <Label htmlFor="rec-email" className="text-[11px] text-slate-400">Brand Recipient Email</Label>
                <Input
                  id="rec-email"
                  placeholder="brand-contact@company.com"
                  className="bg-slate-900 border-slate-800 text-slate-200 text-xs rounded-xl h-9"
                  value={recipientEmail}
                  onChange={e => setRecipientEmail(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="custom-note" className="text-[11px] text-slate-400">Custom Note (Optional)</Label>
                <Input
                  id="custom-note"
                  placeholder="e.g. Invoice #1042 sent June 15"
                  className="bg-slate-900 border-slate-800 text-slate-200 text-xs rounded-xl h-9"
                  value={customNote}
                  onChange={e => setCustomNote(e.target.value)}
                />
              </div>
            </div>
          </div>

          {!activeFollowUp && !generating && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
              <div className="h-14 w-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-1">
                <Mail className="h-7 w-7 text-blue-400" />
              </div>
              <div>
                <h3 className="font-medium text-slate-200 text-sm">Ready to Generate Draft</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Click below to generate an AI-tailored payment email using the chosen tone and deal parameters.
                </p>
              </div>
              <Button onClick={() => handleGenerate(tone)} className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl">
                <Sparkles className="h-4 w-4 mr-2" /> Generate Email Draft
              </Button>
            </div>
          )}

          {generating && (
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
              <Loader2 className="h-9 w-9 text-blue-500 animate-spin" />
              <div className="text-center">
                <h3 className="font-medium text-slate-200 text-sm">Drafting AI Follow-Up...</h3>
                <p className="text-xs text-slate-400 mt-1">Applying {tone} tone and computing deal balances...</p>
              </div>
            </div>
          )}

          {activeFollowUp && !generating && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  2. Review & Edit Email Draft
                </Label>
                {dispatched && (
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                    <ShieldCheck className="h-3 w-3 mr-1" /> Dispatched via Gmail
                  </Badge>
                )}
              </div>

              {/* Editable Subject */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Subject Line</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => copyToClipboard(subject, "subject")}
                    className="h-6 px-2 text-[11px] text-slate-400 hover:text-slate-200"
                  >
                    {copiedSubject ? <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                    {copiedSubject ? "Copied!" : "Copy Subject"}
                  </Button>
                </div>
                <Input
                  className="bg-slate-950/80 border-slate-800 text-slate-200 font-medium text-xs rounded-xl focus:border-blue-500"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                />
              </div>

              {/* Editable Message Body */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Message Body</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => copyToClipboard(body, "body")}
                    className="h-6 px-2 text-[11px] text-slate-400 hover:text-slate-200"
                  >
                    {copiedBody ? <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                    {copiedBody ? "Copied!" : "Copy Body"}
                  </Button>
                </div>
                <Textarea
                  rows={8}
                  className="bg-slate-950/80 border-slate-800 text-slate-200 font-sans text-xs leading-relaxed rounded-xl focus:border-blue-500 resize-y"
                  value={body}
                  onChange={e => setBody(e.target.value)}
                />
              </div>

              {/* Dispatch Action Panel */}
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 space-y-3">
                <Label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  3. Dispatch Email to Brand
                </Label>
                
                <div className="flex gap-2">
                  <Button 
                    className="flex-1 bg-red-600 hover:bg-red-500 text-white rounded-xl shadow-lg shadow-red-600/20 text-xs font-semibold"
                    onClick={openGmail}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open & Dispatch in Gmail
                  </Button>
                  <Button 
                    variant="secondary"
                    className="bg-blue-900/40 hover:bg-blue-800/60 text-blue-300 border border-blue-700/40 rounded-xl text-xs"
                    onClick={openMailto}
                  >
                    <Send className="h-3.5 w-3.5 mr-1.5" />
                    Send via Default Mail
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white rounded-xl text-xs"
                    onClick={() => copyToClipboard(`${subject}\n\n${body}`, "body")}
                  >
                    <Copy className="h-3.5 w-3.5 mr-1.5" />
                    Copy All
                  </Button>
                </div>
              </div>

              {/* Previous Drafts History */}
              {existingFollowUps.length > 0 && (
                <div className="pt-2 border-t border-slate-800/60">
                  <h4 className="text-xs font-medium text-slate-400 mb-2 flex items-center gap-1.5">
                    <History className="h-3.5 w-3.5" /> Sent & Saved History ({existingFollowUps.length})
                  </h4>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {existingFollowUps.map((fu, idx) => (
                      <Button
                        key={fu.id}
                        variant={activeFollowUp?.id === fu.id ? "default" : "secondary"}
                        size="sm"
                        onClick={() => setActiveFollowUp(fu)}
                        className={`rounded-xl text-[11px] whitespace-nowrap ${
                          activeFollowUp?.id === fu.id 
                            ? "bg-blue-600 text-white" 
                            : "bg-slate-950 border border-slate-800 text-slate-400 hover:bg-slate-800"
                        }`}
                      >
                        Draft {existingFollowUps.length - idx} ({new Date(fu.createdAt).toLocaleDateString()})
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="pt-2 border-t border-slate-800/40">
          <Button variant="ghost" onClick={() => handleGenerate(tone)} className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-xl mr-auto text-xs">
            <Sparkles className="h-3.5 w-3.5 mr-1.5" /> Regenerate Draft
          </Button>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl text-xs">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
