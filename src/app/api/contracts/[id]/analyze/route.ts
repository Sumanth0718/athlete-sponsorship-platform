import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getContractById, saveContractAnalysis } from "@/lib/services";
import { analyzeContractText } from "@/lib/openai";
import mammoth from "mammoth";

function extractPdfTextFromBuffer(buffer: Buffer): string {
  const str = buffer.toString("utf-8");
  const textMatches: string[] = [];

  const matches = str.matchAll(/\(([^)]+)\)\s*T[jJ]/g);
  for (const m of matches) {
    if (m[1] && m[1].trim()) {
      textMatches.push(m[1].trim());
    }
  }

  if (textMatches.length > 0) {
    return textMatches.join("\n");
  }

  const printable = str.replace(/[^\x20-\x7E\n]/g, "\n");
  const lines = printable.split("\n").map(l => l.trim()).filter(l => l.length >= 4 && !l.startsWith("%PDF") && !l.includes("obj") && !l.includes("endobj") && !l.includes("xref") && !l.includes("stream"));
  return lines.join("\n");
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Fetch contract from service layer (DB or dynamic store)
    const contract = await getContractById(id);

    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    let buffer: Buffer;
    if (contract.cloudinaryUrl.startsWith("/uploads/")) {
      const fs = await import("fs");
      const path = await import("path");
      const localFilePath = path.join(process.cwd(), "public", contract.cloudinaryUrl);
      buffer = fs.readFileSync(localFilePath);
    } else {
      const fileResponse = await fetch(contract.cloudinaryUrl);
      if (!fileResponse.ok) {
        throw new Error("Failed to fetch contract file from storage");
      }
      const arrayBuffer = await fileResponse.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    }

    let extractedText = "";

    // Parse the file based on its type
    if (contract.fileType === "application/pdf" || contract.fileName.endsWith(".pdf")) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const pdfParseModule = require("pdf-parse");
        if (typeof pdfParseModule === "function") {
          const data = await pdfParseModule(buffer);
          extractedText = data.text || "";
        }
      } catch (pdfErr) {
        console.warn("PDF parse library fallback:", pdfErr);
      }

      if (!extractedText || !extractedText.trim()) {
        extractedText = extractPdfTextFromBuffer(buffer);
      }
    } else if (
      contract.fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      contract.fileName.endsWith(".docx")
    ) {
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
    } else {
      extractedText = buffer.toString("utf-8").replace(/[^\x20-\x7E\n\r\t]/g, " ");
    }

    if (!extractedText.trim()) {
      return NextResponse.json({ error: "No text could be extracted from the document." }, { status: 400 });
    }

    // Send to OpenAI or regex extractor
    const analysisData = await analyzeContractText(extractedText);

    // Save to Database or dynamic store
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

    const contractAnalysis = await saveContractAnalysis(contract.id, dbPayload);

    return NextResponse.json({ success: true, analysis: contractAnalysis }, { status: 200 });
  } catch (error: unknown) {
    console.error("Contract analysis error:", error);
    return NextResponse.json({ error: (error as Error).message || "Analysis failed" }, { status: 500 });
  }
}
