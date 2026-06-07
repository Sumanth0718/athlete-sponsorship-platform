import { db } from "./db";

export async function getAnalyticsDashboard(userId: string) {
  try {
    // Basic Counts
    const activeBrandsCount = await db.brand.count({ where: { userId } });
    const activeContractsCount = await db.contract.count({
      where: { userId, status: "Active" },
    });

    // Fetch Deals for aggregation
    const deals = await db.deal.findMany({
      where: { userId },
      include: { brand: true },
      orderBy: { startDate: "asc" },
    });

    // High level metrics
    let totalRevenue = 0;
    let totalReceived = 0;
    let totalPending = 0;

    deals.forEach((d) => {
      totalRevenue += d.dealValue;
      totalReceived += d.amountReceived;
      totalPending += d.pendingAmount; // Or d.dealValue - d.amountReceived
    });

    // 1. Monthly Revenue Trend (Current Year)
    const currentYear = new Date().getFullYear();
    const monthlyRevenueMap: Record<string, number> = {};
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    months.forEach((m) => (monthlyRevenueMap[m] = 0));

    deals.forEach((d) => {
      const dYear = new Date(d.startDate).getFullYear();
      if (dYear === currentYear) {
        const monthName = months[new Date(d.startDate).getMonth()];
        monthlyRevenueMap[monthName] += d.dealValue;
      }
    });
    
    const monthlyRevenue = months.map((month) => ({
      month,
      revenue: monthlyRevenueMap[month],
    }));

    // 2. Deal Status Distribution
    let pendingDeals = 0;
    let partialDeals = 0;
    let paidDeals = 0;

    deals.forEach((d) => {
      if (d.amountReceived === 0) {
        pendingDeals++;
      } else if (d.amountReceived < d.dealValue) {
        partialDeals++;
      } else {
        paidDeals++;
      }
    });

    const statusDistribution = [
      { name: "Pending", value: pendingDeals },
      { name: "Partial", value: partialDeals },
      { name: "Paid", value: paidDeals },
    ].filter((s) => s.value > 0);

    // 3. Revenue Breakdown by Brand
    const brandRevenueMap: Record<string, number> = {};
    deals.forEach((d) => {
      const bName = d.brand?.brandName || "Unknown";
      brandRevenueMap[bName] = (brandRevenueMap[bName] || 0) + d.dealValue;
    });

    const brandRevenue = Object.entries(brandRevenueMap)
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue);

    // 4. Pending vs Received Amount
    const pendingVsReceived = [
      { name: "Received", value: totalReceived },
      { name: "Pending", value: totalPending },
    ];

    return {
      metrics: {
        totalRevenue,
        totalReceived,
        totalPending,
        activeBrands: activeBrandsCount,
        activeContracts: activeContractsCount,
      },
      charts: {
        monthlyRevenue,
        statusDistribution,
        brandRevenue,
        pendingVsReceived,
      },
    };
  } catch (error) {
    console.error("Analytics Error:", error);
    // Fallback empty state
    return {
      metrics: {
        totalRevenue: 0,
        totalReceived: 0,
        totalPending: 0,
        activeBrands: 0,
        activeContracts: 0,
      },
      charts: {
        monthlyRevenue: [],
        statusDistribution: [],
        brandRevenue: [],
        pendingVsReceived: [],
      },
    };
  }
}
