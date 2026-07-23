import { db } from "./db";
import bcrypt from "bcryptjs";

export const isDbConnected = true;

export async function registerUser(name: string, email: string, rawPassword: string, role: string) {
  const passwordHash = await bcrypt.hash(rawPassword, 10);
  const user = await db.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: role as any,
    },
  });
  return user;
}

export async function getBrands(userId: string) {
  const brands = await db.brand.findMany({
    where: { userId },
    orderBy: { brandName: "asc" },
  });
  return brands.map(b => ({
    ...b,
    name: b.brandName,
    industry: "Various",
    logoUrl: "",
    description: b.notes || "",
    website: ""
  }));
}

export async function createBrand(name: string, industry: string, description: string, website: string, userId: string) {
  const brand = await db.brand.create({
    data: { brandName: name, notes: description, email: `contact-${Date.now()}@example.com`, userId },
  });
  return {
    ...brand,
    name: brand.brandName,
    industry: "Various",
    logoUrl: "",
    description: brand.notes || "",
    website: ""
  };
}

export async function getDeals(athleteId: string) {
  const deals = await db.deal.findMany({
    where: { userId: athleteId },
    include: { brand: true, followUps: true },
    orderBy: { createdAt: "desc" },
  });
  return deals.map(d => ({
    ...d,
    value: d.dealValue,
    amountReceived: d.amountReceived,
    pendingAmount: d.pendingAmount,
    expectedPaymentDate: d.expectedPaymentDate,
    followUps: d.followUps || [],
    description: d.notes || "",
    athleteId: d.userId,
    brand: d.brand ? {
      ...d.brand,
      name: d.brand.brandName,
      industry: "Various",
      logoUrl: "",
      description: d.brand.notes || "",
      website: ""
    } : null
  }));
}

export async function createDeal(
  title: string,
  description: string,
  value: number,
  startDate: Date,
  endDate: Date,
  brandId: string,
  athleteId: string
) {
  const deal = await db.deal.create({
    data: {
      title,
      notes: description,
      dealValue: value,
      startDate,
      endDate,
      expectedPaymentDate: endDate,
      brandId,
      userId: athleteId,
      status: "DRAFT",
    },
    include: { brand: true },
  });
  return {
    ...deal,
    value: deal.dealValue,
    description: deal.notes || "",
    athleteId: deal.userId,
    brand: deal.brand ? {
      ...deal.brand,
      name: deal.brand.brandName,
      industry: "Various",
      logoUrl: "",
      description: deal.brand.notes || "",
      website: ""
    } : null
  };
}

export async function getDealById(id: string) {
  const deal = await db.deal.findUnique({
    where: { id },
    include: { brand: true, followUps: true },
  });
  if (deal) {
    return {
      ...deal,
      value: deal.dealValue,
      description: deal.notes || "",
      athleteId: deal.userId,
      brand: deal.brand ? {
        ...deal.brand,
        name: deal.brand.brandName,
        email: deal.brand.email || `sponsorships@${deal.brand.brandName.toLowerCase().replace(/[^a-z]/g, "")}.com`,
      } : null,
    };
  }
  return null;
}

export async function createFollowUp(dealId: string, subject: string, body: string, status = "DRAFT") {
  return await db.followUp.create({
    data: {
      dealId,
      subject,
      body,
    },
  });
}

export async function updateDealStatus(id: string, status: string, userId: string) {
  const deal = await db.deal.update({
    where: { id, userId },
    data: { status: status as any },
    include: { brand: true },
  });
  return {
    ...deal,
    value: deal.dealValue,
    description: deal.notes || "",
    athleteId: deal.userId,
    brand: deal.brand ? {
      ...deal.brand,
      name: deal.brand.brandName,
      industry: "Various",
      logoUrl: "",
      description: deal.brand.notes || "",
      website: ""
    } : null
  };
}

export async function getContracts(userId: string) {
  const contracts = await db.contract.findMany({
    where: { userId },
    include: { brand: true, user: true, analysis: true },
    orderBy: { createdAt: "desc" },
  });
  return contracts.map(c => ({
    ...c,
    brand: c.brand ? {
      ...c.brand,
      name: c.brand.brandName,
      industry: "Various",
      logoUrl: "",
      description: c.brand.notes || "",
      website: ""
    } : null
  }));
}

export async function createContract(data: {
  title: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  cloudinaryUrl: string;
  cloudinaryPublicId: string;
  expiryDate: Date;
  status: string;
  brandId: string;
  userId: string;
}) {
  const contract = await db.contract.create({
    data: {
      title: data.title,
      fileName: data.fileName,
      fileType: data.fileType,
      fileSize: data.fileSize,
      cloudinaryUrl: data.cloudinaryUrl,
      cloudinaryPublicId: data.cloudinaryPublicId,
      expiryDate: data.expiryDate,
      status: data.status,
      brandId: data.brandId,
      userId: data.userId,
    },
    include: { brand: true },
  });
  return contract;
}

export async function getContractById(id: string) {
  return await db.contract.findUnique({
    where: { id },
    include: { analysis: true, brand: true },
  });
}

export async function saveContractAnalysis(contractId: string, analysisData: any) {
  const existing = await db.contractAnalysis.findUnique({ where: { contractId } });
  if (existing) {
    return await db.contractAnalysis.update({
      where: { id: existing.id },
      data: analysisData,
    });
  } else {
    return await db.contractAnalysis.create({
      data: {
        ...analysisData,
        contractId,
      },
    });
  }
}

export async function deleteContract(id: string, userId: string) {
  const contract = await db.contract.findUnique({ where: { id } });
  if (contract) {
    if (contract.cloudinaryPublicId && !contract.cloudinaryPublicId.startsWith("local_")) {
      try {
        const { v2: cloudinary } = await import("cloudinary");
        await cloudinary.uploader.destroy(contract.cloudinaryPublicId);
      } catch (e) {}
    }
    await db.contract.delete({ where: { id } });
    return true;
  }
  return false;
}

export const MOCK_ATHLETES = [
  {
    id: "ath-1",
    name: "Alex Johnson",
    sport: "Track & Field / Sprint",
    followers: "450K",
    rating: "4.9 ⭐",
    activeDealValue: "$45,000",
    status: "ACTIVE_SPONSORSHIP",
    location: "Los Angeles, CA",
    avatar: "🏃‍♂️",
    bio: "Olympic sprinter and 100m national champion.",
  }
];

export const MOCK_BRAND_CAMPAIGNS = [
  {
    id: "bcam-1",
    title: "Q3 Global Apparel Launch",
    athleteName: "Alex Johnson",
    sport: "Track & Field",
    budget: 85000,
    spent: 45000,
    status: "ACTIVE",
    deliverables: "4 Instagram Reels",
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
  }
];

export async function getAthletes() {
  return MOCK_ATHLETES;
}

export async function getBrandCampaigns() {
  return MOCK_BRAND_CAMPAIGNS;
}

export async function signContract(id: string) {
  return null;
}
