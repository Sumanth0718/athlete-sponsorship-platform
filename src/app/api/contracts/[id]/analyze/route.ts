import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { analyzeContractText } from "@/lib/openai";
import mammoth from "mammoth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Fetch the contract
    const contract = await db.contract.findUnique({
      where: { id },
      include: { analysis: true },
    });

    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    if (contract.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden: Not authorized to analyze this contract." }, { status: 403 });
    }

    // Download the file from Cloudinary to extract text
    const fileResponse = await fetch(contract.cloudinaryUrl);
    if (!fileResponse.ok) {
      throw new Error("Failed to fetch contract file from storage");
    }

    const arrayBuffer = await fileResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let extractedText = "";

    // Parse the file based on its type
    if (contract.fileType === "application/pdf") {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require("pdf-parse");
      const data = await pdfParse(buffer);
      extractedText = data.text;
    } else if (
      contract.fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      contract.fileName.endsWith(".docx")
    ) {
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
    } else {
      return NextResponse.json({ error: "Unsupported file type for analysis. Only PDF and DOCX are supported." }, { status: 400 });
    }

    if (!extractedText.trim()) {
      return NextResponse.json({ error: "No text could be extracted from the document." }, { status: 400 });
    }

    // Send to OpenAI
    const analysisData = await analyzeContractText(extractedText);

    // Save to Database
    const dbPayload = {
      brandName: analysisData.brandName,
      contractValue: analysisData.contractValue,
      startDate: analysisData.startDate,
      endDate: analysisData.endDate,
      paymentTerms: analysisData.paymentTerms,
      renewalClause: analysisData.renewalClause,
      terminationClause: analysisData.terminationClause,
      deliverables: analysisData.deliverables,
      sponsorshipType: analysisData.sponsorshipType,
      importantDeadlines: analysisData.importantDeadlines,
      rawAiResponse: JSON.stringify(analysisData),
    };

    let contractAnalysis;
    if (contract.analysis) {
      // Update existing analysis
      contractAnalysis = await db.contractAnalysis.update({
        where: { id: contract.analysis.id },
        data: dbPayload,
      });
    } else {
      // Create new analysis
      contractAnalysis = await db.contractAnalysis.create({
        data: {
          ...dbPayload,
          contractId: contract.id,
        },
      });
    }

    return NextResponse.json({ success: true, analysis: contractAnalysis }, { status: 200 });
  } catch (error: unknown) {
    console.error("Contract analysis error:", error);
    return NextResponse.json({ error: (error as Error).message || "Analysis failed" }, { status: 500 });
  }
}
