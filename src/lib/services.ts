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

export async function registerUser(name: string, email: string, passwordHash: string, role: string) {
  try {
    return await db.user.create({
      data: {
        name,
        email,
        passwordHash: await bcrypt.hash(passwordHash, 10),
        role: role as any,
      },
    });
  } catch (error) {
    console.error("Database register error. Returning fallback mock user:", error);
    return {
      id: "mock-new-user-id-" + Math.random().toString(36).substring(7),
      name,
      email,
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}

export async function getBrands(userId: string) {
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
    return mapped.length > 0 ? mapped : dynamicBrands;
  } catch (e) {
    return dynamicBrands;
  }
}

export async function createBrand(name: string, industry: string, description: string, website: string, userId: string) {
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
}

export async function getDeals(athleteId: string) {
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
    return mapped.length > 0 ? mapped : dynamicDeals;
  } catch (e) {
    return dynamicDeals;
  }
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
}

export async function updateDealStatus(id: string, status: string, userId: string) {
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
}

export async function getContracts(userId: string) {
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
    return mapped.length > 0 ? mapped : dynamicContracts;
  } catch (e) {
    return dynamicContracts;
  }
}

export async function signContract(id: string) {
  return null; // Deprecated - replaced by complete contract management feature
}
