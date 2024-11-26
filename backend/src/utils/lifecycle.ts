// src/utils/lifecycle.ts

import { LifecycleStage } from "@prisma/client";

export function calculateLifecycleStage(data: {
  excludeFlag: string;
  deceasedFlag: string;
  firstGiftDate: number | Date;
  lastGiftDate: number | Date;
  totalGiftsLastFiscal: number;
  totalGiftsCurrentFiscal: number;
}): LifecycleStage {
  // Primary rules: automatically set to LAPSED if excluded or deceased
  if (data.excludeFlag === "Yes" || data.deceasedFlag === "Yes") {
    return "LAPSED";
  }

  const now = new Date().getTime();
  const firstGiftTimestamp =
    data.firstGiftDate instanceof Date
      ? data.firstGiftDate.getTime()
      : data.firstGiftDate;
  const lastGiftTimestamp =
    data.lastGiftDate instanceof Date
      ? data.lastGiftDate.getTime()
      : data.lastGiftDate;

  const daysSinceLastGift = Math.floor(
    (now - lastGiftTimestamp) / (1000 * 60 * 60 * 24)
  );
  const daysSinceFirstGift = Math.floor(
    (now - firstGiftTimestamp) / (1000 * 60 * 60 * 24)
  );

  // New donor: first gift within 180 days
  if (daysSinceFirstGift <= 180) {
    return "NEW";
  }

  // Lapsed donor: no gift in over 4 years
  if (daysSinceLastGift > 1460) {
    return "LAPSED";
  }

  // Evaluate risk based on multiple criteria
  const isAtRisk =
    // No gifts for over 18 months
    daysSinceLastGift > 540 ||
    // Or no gifts for over 1 year with significant decrease in current fiscal year
    (daysSinceLastGift > 365 &&
      data.totalGiftsCurrentFiscal < data.totalGiftsLastFiscal * 0.6) ||
    // Or major decrease in donation amount (below 40% of last fiscal year)
    (data.totalGiftsCurrentFiscal < data.totalGiftsLastFiscal * 0.4 &&
      daysSinceLastGift > 180);

  if (isAtRisk) {
    return "AT_RISK";
  }

  // Default to active donor
  return "ACTIVE";
}
