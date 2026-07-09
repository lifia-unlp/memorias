"use server";

import { auth } from "@/auth";
import {
  statisticsService,
  StatisticsData,
  ProductionDataPoint,
  ActiveTrendDataPoint,
  ScholarshipTrendDataPoint,
  DistributionDataPoint,
} from "@/lib/services/statisticsService";

export async function ensureActiveUser() {
  const session = await auth();
  if (!session || !session.user?.active) {
    throw new Error("Unauthorized. Active session required.");
  }
}

export type {
  ProductionDataPoint,
  ActiveTrendDataPoint,
  ScholarshipTrendDataPoint,
  DistributionDataPoint,
  StatisticsData,
};

export async function getStatisticsData(): Promise<StatisticsData> {
  await ensureActiveUser();
  return statisticsService.getStatisticsData();
}
