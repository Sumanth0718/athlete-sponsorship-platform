import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { generateFollowUpEmail } from "@/lib/openai";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Fetch the deal
    const deal = await db.deal.findUnique({
      where: { id },
      include: { brand: true },
    });

    if (!deal) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    if (deal.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden: Not authorized to generate follow-up for this deal." }, { status: 403 });
    }

    if (deal.pendingAmount <= 0) {
      return NextResponse.json({ error: "Deal is fully paid. No pending amount to follow up on." }, { status: 400 });
    }

    const context = {
      brandName: deal.brand?.brandName || "Brand",
      dealValue: deal.dealValue,
      amountReceived: deal.amountReceived,
      pendingAmount: deal.pendingAmount,
      expectedPaymentDate: deal.expectedPaymentDate,
      notes: deal.notes,
    };

    // Generate via OpenAI
    const aiResult = await generateFollowUpEmail(context);

    // Save to Database
    const followUp = await db.followUp.create({
      data: {
        dealId: deal.id,
        subject: aiResult.subject,
        body: aiResult.body,
      },
    });

    return NextResponse.json({ success: true, followUp }, { status: 200 });
  } catch (error: unknown) {
    console.error("Follow-up generation error:", error);
    return NextResponse.json({ error: (error as Error).message || "Follow-up generation failed" }, { status: 500 });
  }
}
