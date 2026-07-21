import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { uploadContractFile } from "@/lib/cloudinary";
import { createContract } from "@/lib/services";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const brandId = formData.get("brandId") as string;
    const expiryDateStr = formData.get("expiryDate") as string;

    if (!file || !title || !brandId || !expiryDateStr) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validation
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Only PDF and DOCX are allowed." }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File size exceeds 10 MB limit." }, { status: 400 });
    }

    const expiryDate = new Date(expiryDateStr);
    if (isNaN(expiryDate.getTime())) {
       return NextResponse.json({ error: "Invalid expiry date." }, { status: 400 });
    }

    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    let status = "Active";
    if (diffDays < 0) {
      status = "Expired";
    } else if (diffDays <= 30) {
      status = "Expiring Soon";
    }

    // Convert File to Buffer for storage
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload file
    const { url, publicId } = await uploadContractFile(buffer, file.name, file.type);

    // Save contract metadata via service layer (DB & dynamic fallback)
    const contract = await createContract({
      brandId,
      userId: session.user.id,
      title,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      cloudinaryUrl: url,
      cloudinaryPublicId: publicId,
      expiryDate,
      status,
    });

    return NextResponse.json({ success: true, contract }, { status: 201 });
  } catch (error: unknown) {
    console.error("Contract upload error:", error);
    return NextResponse.json({ error: (error as Error).message || "Upload failed" }, { status: 500 });
  }
}
