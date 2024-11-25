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

  // New donor: first gift within 90 days
  if (daysSinceFirstGift <= 90) {
    return "NEW";
  }

  // Lapsed donor: no gift in over 2 years (730 days)
  if (daysSinceLastGift > 730) {
    return "LAPSED";
  }

  // At-risk donor conditions:
  // - No gift in over a year
  // - OR current fiscal year donations significantly decreased (below 50% of last year)
  if (
    daysSinceLastGift > 365 ||
    (data.totalGiftsCurrentFiscal < data.totalGiftsLastFiscal * 0.5 &&
      daysSinceLastGift > 180) // Added time condition to avoid early fiscal year false positives
  ) {
    return "AT_RISK";
  }

  // Default to active donor
  return "ACTIVE";
}
