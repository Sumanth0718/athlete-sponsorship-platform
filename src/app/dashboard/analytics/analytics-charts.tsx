"use client";

import React from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AnalyticsChartsProps {
  data: {
    monthlyRevenue: { month: string; revenue: number }[];
    statusDistribution: { name: string; value: number }[];
    brandRevenue: { name: string; revenue: number }[];
    pendingVsReceived: { name: string; value: number }[];
  };
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6"];
const PIE_COLORS = ["#10b981", "#f59e0b", "#3b82f6"];

// Custom Tooltip for Currency
const CurrencyTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl text-sm">
        <p className="text-slate-200 mb-1 font-semibold">{label || payload[0].name}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: ${entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Custom Tooltip for Counts
const CountTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl text-sm">
        <p className="text-slate-200 font-semibold">{payload[0].name}</p>
        <p style={{ color: payload[0].color }}>Deals: {payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export function AnalyticsCharts({ data }: AnalyticsChartsProps) {
  const { monthlyRevenue, statusDistribution, brandRevenue, pendingVsReceived } = data;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Monthly Revenue Trend */}
      <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-sm shadow-xl col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-200">Monthly Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyRevenue} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(val) => `$${val.toLocaleString()}`} 
                />
                <Tooltip content={<CurrencyTooltip />} />
                <Legend wrapperStyle={{ fontSize: "12px", color: "#cbd5e1" }} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Breakdown by Brand */}
      <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-200">Revenue by Brand</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full">
            {brandRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={brandRevenue.slice(0, 6)} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(val) => `$${val >= 1000 ? (val/1000)+'k' : val}`}
                  />
                  <Tooltip content={<CurrencyTooltip />} />
                  <Bar dataKey="revenue" name="Revenue" radius={[4, 4, 0, 0]}>
                    {brandRevenue.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-500 text-sm">
                No brand revenue data available.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pending vs Received Amount */}
      <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-200">Pending vs Received</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full flex items-center justify-center">
            {pendingVsReceived.some(item => item.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pendingVsReceived}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill="#10b981" /> {/* Received (Green) */}
                    <Cell fill="#f59e0b" /> {/* Pending (Amber) */}
                  </Pie>
                  <Tooltip content={<CurrencyTooltip />} />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: "12px", color: "#cbd5e1" }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-500 text-sm">No revenue data recorded.</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Deal Status Distribution */}
      <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-200">Deal Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full flex items-center justify-center">
            {statusDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CountTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-500 text-sm">No deal status data available.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
