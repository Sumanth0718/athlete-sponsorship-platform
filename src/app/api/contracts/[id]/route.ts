import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { deleteContract } from "@/lib/services";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const deleted = await deleteContract(id, session.user.id);

    if (!deleted) {
      return NextResponse.json({ error: "Contract not found or deletion failed" }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    console.error("Contract deletion error:", error);
    return NextResponse.json({ error: (error as Error).message || "Deletion failed" }, { status: 500 });
  }
}
