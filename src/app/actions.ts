"use server";

import { revalidatePath } from "next/cache";
import {
  registerUser,
  createBrand,
  createDeal,
  updateDealStatus,
  signContract,
} from "@/lib/services";
import { auth } from "@/auth";

export async function registerUserAction(prevState: any, formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;

  if (!name || !email || !password || !role) {
    return { error: "All fields are required" };
  }

  try {
    await registerUser(name, email, password, role);
    return { success: true };
  } catch (error: unknown) {
    return { error: (error as Error).message || "Registration failed" };
  }
}

export async function createBrandAction(name: string, industry: string, description: string, website: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  if (!name || !industry) {
    throw new Error("Name and industry are required");
  }

  const brand = await createBrand(name, industry, description, website, userId);
  revalidatePath("/dashboard/brands");
  revalidatePath("/dashboard/deals");
  return brand;
}

export async function createDealAction(
  title: string,
  description: string,
  value: number,
  startDateStr: string,
  endDateStr: string,
  brandId: string
) {
  const session = await auth();
  const athleteId = session?.user?.id;
  if (!athleteId) throw new Error("Unauthorized");

  if (!title || !description || !value || !startDateStr || !endDateStr || !brandId) {
    throw new Error("All fields are required");
  }

  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  const deal = await createDeal(
    title,
    description,
    value,
    startDate,
    endDate,
    brandId,
    athleteId
  );

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/deals");
  revalidatePath("/dashboard/contracts");
  return deal;
}

export async function updateDealStatusAction(id: string, status: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized");
  const deal = await updateDealStatus(id, status, userId);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/deals");
  revalidatePath("/dashboard/contracts");
  return deal;
}

export async function signContractAction(id: string) {
  const contract = await signContract(id);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/deals");
  revalidatePath("/dashboard/contracts");
  return contract;
}
