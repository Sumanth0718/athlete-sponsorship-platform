import { db } from "./db";
import bcrypt from "bcryptjs";

// Mock Data Store in memory (resilient fallbacks when database is not connected/ready)
const MOCK_BRANDS = [
  {
    id: "brand-1",
    name: "Nike",
    industry: "Athletic Wear",
    logoUrl: "",
    description: "Global leader in athletic footwear, apparel, equipment, and accessories.",
    website: "https://nike.com",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "brand-2",
    name: "Red Bull",
    industry: "Beverages & Extreme Sports",
    logoUrl: "",
    description: "Energy drinks and major sponsor of extreme sports and athletic events worldwide.",
    website: "https://redbull.com",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "brand-3",
    name: "Gatorade",
    industry: "Sports Nutrition",
    logoUrl: "",
    description: "Sports-themed beverage and food products, formulated to help athletes rehydrate.",
    website: "https://gatorade.com",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const MOCK_DEALS = [
  {
    id: "deal-1",
    title: "Summer Footwear Campaign",
    description: "Promotional campaign showcasing Nike's new running shoe line across social channels.",
    status: "ACTIVE",
    value: 45000,
    amountReceived: 10000,
    pendingAmount: 35000,
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),  // 60 days from now
    expectedPaymentDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    brandId: "brand-1",
    athleteId: "mock-athlete-id",
    createdAt: new Date(),
    updatedAt: new Date(),
    brand: MOCK_BRANDS[0],
    followUps: [],
  },
  {
    id: "deal-2",
    title: "Red Bull Action Photo Shoot",
    description: "Feature shoot and mini-documentary sponsorship for regional event.",
    status: "NEGOTIATING",
    value: 25000,
    amountReceived: 0,
    pendingAmount: 25000,
    startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    expectedPaymentDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    brandId: "brand-2",
    athleteId: "mock-athlete-id",
    createdAt: new Date(),
    updatedAt: new Date(),
    brand: MOCK_BRANDS[1],
    followUps: [],
  },
  {
    id: "deal-3",
    title: "Gatorade Hydro-Fuel Launch",
    description: "Endorsement deal for the national release of the Hydro-Fuel product.",
    status: "DRAFT",
    value: 60000,
    amountReceived: 0,
    pendingAmount: 60000,
    startDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
    expectedPaymentDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
    brandId: "brand-3",
    athleteId: "mock-athlete-id",
    createdAt: new Date(),
    updatedAt: new Date(),
    brand: MOCK_BRANDS[2],
    followUps: [],
  },
];

const MOCK_CONTRACTS: any[] = [];

// Memory state for fallbacks in user's current session lifecycle
const dynamicBrands = [...MOCK_BRANDS];
const dynamicDeals = [...MOCK_DEALS];
const dynamicContracts = [...MOCK_CONTRACTS];

export const DYNAMIC_USERS: Array<{
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: string;
}> = [
  {
    id: "mock-athlete-id",
    name: "Alex Johnson",
    email: "athlete@example.com",
    passwordHash: bcrypt.hashSync("password123", 10),
    role: "ATHLETE",
  },
  {
    id: "mock-brand-id",
    name: "Nike Deals Team",
    email: "brand@example.com",
    passwordHash: bcrypt.hashSync("password123", 10),
    role: "BRAND_REPRESENTATIVE",
  },
];

const rawConnStr = process.env.DATABASE_URL || "";
export const isDbConnected = Boolean(
  rawConnStr &&
  !rawConnStr.includes("hostname") &&
  !rawConnStr.includes("dummy") &&
  !rawConnStr.includes("user:password")
);

export async function registerUser(name: string, email: string, rawPassword: string, role: string) {
  const passwordHash = await bcrypt.hash(rawPassword, 10);
  if (isDbConnected) {
    try {
      const user = await db.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: role as any,
        },
      });
      DYNAMIC_USERS.push({
        id: user.id,
        name: user.name,
        email: user.email,
        passwordHash,
        role: user.role,
      });
      return user;
    } catch (error) {
      console.warn("Database register fallback:", error);
    }
  }

  const newUser = {
    id: "mock-user-id-" + Math.random().toString(36).substring(7),
    name,
    email,
    passwordHash,
    role,
  };
  DYNAMIC_USERS.push(newUser);
  return {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function getBrands(userId: string) {
  if (isDbConnected) {
    try {
      const brands = await db.brand.findMany({
        where: { userId },
        orderBy: { brandName: "asc" },
      });
      const mapped = brands.map(b => ({
        ...b,
        name: b.brandName,
        industry: "Various",
        logoUrl: "",
        description: b.notes || "",
        website: ""
      }));
      if (mapped.length > 0) return mapped;
    } catch (e) {
      // fallback
    }
  }
  return dynamicBrands;
}

export async function createBrand(name: string, industry: string, description: string, website: string, userId: string) {
  if (isDbConnected) {
    try {
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
    } catch (e) {
      // fallback
    }
  }

  const newBrand = {
    id: "brand-" + Math.random().toString(36).substring(7),
    name,
    industry,
    logoUrl: "",
    description,
    website,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  dynamicBrands.push(newBrand);
  return newBrand;
}

export async function getDeals(athleteId: string) {
  if (isDbConnected) {
    try {
      const deals = await db.deal.findMany({
        where: { userId: athleteId },
        include: { brand: true, followUps: true },
        orderBy: { createdAt: "desc" },
      });
      const mapped = deals.map(d => ({
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
      if (mapped.length > 0) return mapped;
    } catch (e) {
      // fallback
    }
  }
  return dynamicDeals;
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
  if (isDbConnected) {
    try {
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
    } catch (e) {
      // fallback
    }
  }

  const brand = dynamicBrands.find((b) => b.id === brandId) || dynamicBrands[0];
  const newDeal = {
    id: "deal-" + Math.random().toString(36).substring(7),
    title,
    description,
    status: "DRAFT" as const,
    value,
    amountReceived: 0,
    pendingAmount: value,
    startDate,
    endDate,
    expectedPaymentDate: endDate,
    brandId,
    athleteId,
    createdAt: new Date(),
    updatedAt: new Date(),
    brand,
    followUps: [],
  };
  dynamicDeals.push(newDeal);
  return newDeal;
}

export async function getDealById(id: string) {
  if (isDbConnected) {
    try {
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
    } catch (e) {
      // fallback
    }
  }

  const found = dynamicDeals.find((d) => d.id === id);
  if (found) {
    return {
      ...found,
      brand: found.brand ? {
        ...found.brand,
        email: `sponsorships@${found.brand.name.toLowerCase().replace(/[^a-z]/g, "")}.com`,
      } : null,
    };
  }
  return null;
}

export async function createFollowUp(dealId: string, subject: string, body: string, status = "DRAFT") {
  if (isDbConnected) {
    try {
      return await db.followUp.create({
        data: {
          dealId,
          subject,
          body,
        },
      });
    } catch (e) {
      console.warn("DB follow-up create fallback:", e);
    }
  }

  const deal = dynamicDeals.find((d) => d.id === dealId) as any;
  const newFollowUp = {
    id: "fu-" + Math.random().toString(36).substring(7),
    dealId,
    subject,
    body,
    status,
    createdAt: new Date(),
  };

  if (deal) {
    if (!deal.followUps) deal.followUps = [];
    deal.followUps.unshift(newFollowUp);
  }

  return newFollowUp;
}

export async function updateDealStatus(id: string, status: string, userId: string) {
  if (isDbConnected) {
    try {
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
    } catch (e) {
      // fallback
    }
  }

  const index = dynamicDeals.findIndex((d) => d.id === id);
  if (index !== -1) {
    dynamicDeals[index] = {
      ...dynamicDeals[index],
      status: status as any,
      updatedAt: new Date(),
    };
    return dynamicDeals[index];
  }
  return null;
}

export async function getContracts(userId: string) {
  if (isDbConnected) {
    try {
      const contracts = await db.contract.findMany({
        where: { userId },
        include: { brand: true, user: true, analysis: true },
        orderBy: { createdAt: "desc" },
      });
      const mapped = contracts.map(c => ({
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
      if (mapped.length > 0) return mapped;
    } catch (e) {
      // fallback
    }
  }
  return dynamicContracts;
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
  if (isDbConnected) {
    try {
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
    } catch (e) {
      console.warn("Prisma contract create error, switching to dynamic store:", e);
    }
  }

  const brand = dynamicBrands.find((b) => b.id === data.brandId) || dynamicBrands[0];
  const newContract = {
    id: "contract-" + Math.random().toString(36).substring(7),
    title: data.title,
    fileName: data.fileName,
    fileType: data.fileType,
    fileSize: data.fileSize,
    cloudinaryUrl: data.cloudinaryUrl,
    cloudinaryPublicId: data.cloudinaryPublicId,
    uploadDate: new Date(),
    expiryDate: data.expiryDate,
    status: data.status,
    brandId: data.brandId,
    userId: data.userId,
    brand: brand ? {
      ...brand,
      name: brand.name,
    } : null,
    analysis: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  dynamicContracts.unshift(newContract);
  return newContract;
}

export async function getContractById(id: string) {
  if (isDbConnected) {
    try {
      const contract = await db.contract.findUnique({
        where: { id },
        include: { analysis: true, brand: true },
      });
      if (contract) return contract;
    } catch (e) {
      // fallback
    }
  }
  return dynamicContracts.find((c) => c.id === id) || null;
}

export async function saveContractAnalysis(contractId: string, analysisData: any) {
  if (isDbConnected) {
    try {
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
    } catch (e) {
      // fallback
    }
  }

  const target = dynamicContracts.find((c) => c.id === contractId);
  if (target) {
    target.analysis = {
      id: "analysis-" + Math.random().toString(36).substring(7),
      contractId,
      ...analysisData,
    };
    return target.analysis;
  }
  return null;
}

export async function deleteContract(id: string, userId: string) {
  if (isDbConnected) {
    try {
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
    } catch (e) {
      console.warn("DB contract deletion fallback:", e);
    }
  }

  const idx = dynamicContracts.findIndex((c) => c.id === id);
  if (idx !== -1) {
    const target = dynamicContracts[idx];
    if (target.cloudinaryUrl && target.cloudinaryUrl.startsWith("/uploads/")) {
      try {
        const fs = await import("fs");
        const path = await import("path");
        const localPath = path.join(process.cwd(), "public", target.cloudinaryUrl);
        if (fs.existsSync(localPath)) {
          fs.unlinkSync(localPath);
        }
      } catch (err) {}
    }
    dynamicContracts.splice(idx, 1);
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
    bio: "Olympic sprinter and 100m national champion. High engagement audience in athletic performance & fitness.",
  },
  {
    id: "ath-2",
    name: "Elena Rostova",
    sport: "Tennis",
    followers: "820K",
    rating: "5.0 ⭐",
    activeDealValue: "$65,000",
    status: "ACTIVE_SPONSORSHIP",
    location: "Miami, FL",
    avatar: "🎾",
    bio: "Top 20 WTA singles player. Global reach across North America & Europe.",
  },
  {
    id: "ath-3",
    name: "Marcus Vance",
    sport: "Basketball",
    followers: "1.2M",
    rating: "4.8 ⭐",
    activeDealValue: "$120,000",
    status: "NEGOTIATING",
    location: "Chicago, IL",
    avatar: "🏀",
    bio: "Pro basketball point guard. Heavy influence on youth culture and lifestyle streetwear.",
  },
  {
    id: "ath-4",
    name: "Chloe Bennett",
    sport: "Extreme Snowboarding",
    followers: "310K",
    rating: "4.9 ⭐",
    activeDealValue: "$30,000",
    status: "PITCH_SENT",
    location: "Denver, CO",
    avatar: "🏂",
    bio: "X-Games Gold Medalist. Dedicated extreme sports fanbase.",
  },
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
    deliverables: "4 Instagram Reels, 2 TikTok posts, 1 Event Appearance",
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
  },
  {
    id: "bcam-2",
    title: "Summer Hydration Tour",
    athleteName: "Elena Rostova",
    sport: "Tennis",
    budget: 65000,
    spent: 65000,
    status: "ACTIVE",
    deliverables: "Tournament branded apparel & courtside bottle placement",
    startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000),
  },
  {
    id: "bcam-3",
    title: "Signature Streetwear Line",
    athleteName: "Marcus Vance",
    sport: "Basketball",
    budget: 120000,
    spent: 0,
    status: "NEGOTIATING",
    deliverables: "Co-branded shoe line & capsule collection",
    startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
  },
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

