import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export async function GET() {
  return NextResponse.json({
    cloudinaryCloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
    cloudinaryApiKey: !!process.env.CLOUDINARY_API_KEY,
    cloudinaryApiSecret: !!process.env.CLOUDINARY_API_SECRET,
    openAiKey: !!process.env.OPENAI_API_KEY,
    authSecret: !!process.env.AUTH_SECRET,
    authUrl: process.env.AUTH_URL || null,
  });
}
