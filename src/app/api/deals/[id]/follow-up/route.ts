import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDealById, createFollowUp } from "@/lib/services";
import { generateFollowUpEmail } from "@/lib/openai";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const bodyJson = await req.json().catch(() => ({}));
    const tone = bodyJson.tone || "professional";
    const customNote = bodyJson.customNote || "";

    // Fetch the deal via service layer
    const deal = await getDealById(id);

    if (!deal) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    const dealAny = deal as any;
    const context = {
      brandName: deal.brand?.name || "Brand Partner",
      dealValue: deal.value || dealAny.dealValue || 0,
      amountReceived: deal.amountReceived || 0,
      pendingAmount: deal.pendingAmount || deal.value || 0,
      expectedPaymentDate: deal.expectedPaymentDate || new Date(),
      notes: deal.description || dealAny.notes || "",
      tone: tone as "friendly" | "professional" | "firm",
      customNote,
      athleteName: session.user.name || "Alex Johnson",
    };

    // Generate via OpenAI / dynamic engine
    const aiResult = await generateFollowUpEmail(context);

    // Save to Database or dynamic store
    const followUp = await createFollowUp(deal.id, aiResult.subject, aiResult.body);

    return NextResponse.json({ success: true, followUp }, { status: 200 });
  } catch (error: unknown) {
    console.error("Follow-up generation error:", error);
    return NextResponse.json({ error: (error as Error).message || "Follow-up generation failed" }, { status: 500 });
  }
}
