import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { v2 as cloudinary } from "cloudinary";

// Since cloudinary.ts configures cloudinary, we just need to use its configured instance.
// Ensure env vars are loaded and it's configured.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // We need to await params in Next.js 15
    const { id } = await params;

    const contract = await db.contract.findUnique({
      where: { id },
    });

    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    if (contract.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden: Not authorized to delete this contract." }, { status: 403 });
    }

    // Delete from Cloudinary
    if (contract.cloudinaryPublicId) {
      await cloudinary.uploader.destroy(contract.cloudinaryPublicId);
    }

    // Delete from DB
    await db.contract.delete({
      where: { id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    console.error("Contract deletion error:", error);
    return NextResponse.json({ error: (error as Error).message || "Deletion failed" }, { status: 500 });
  }
}
