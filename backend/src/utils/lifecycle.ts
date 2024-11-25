// src/utils/lifecycle.ts
import { LifecycleStage } from "@prisma/client";

export function calculateLifecycleStage(params: {
  firstGiftDate?: Date;
  lastGiftDate: Date;
  totalGiftsCurrentFiscal?: number;
  totalGiftsLastFiscal?: number;
}): LifecycleStage {
  const {
    firstGiftDate,
    lastGiftDate,
    totalGiftsCurrentFiscal,
    totalGiftsLastFiscal,
  } = params;
  const now = new Date();
  const daysSinceLastGift = Math.floor(
    (now.getTime() - lastGiftDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (
    firstGiftDate &&
    Math.floor(
      (now.getTime() - firstGiftDate.getTime()) / (1000 * 60 * 60 * 24)
    ) <= 90
  ) {
    return "NEW";
  }

  if (daysSinceLastGift > 730) {
    return "LAPSED";
  }

  if (
    daysSinceLastGift > 365 ||
    (totalGiftsCurrentFiscal !== undefined &&
      totalGiftsLastFiscal !== undefined &&
      totalGiftsCurrentFiscal < totalGiftsLastFiscal * 0.5)
  ) {
    return "AT_RISK";
  }

  return "ACTIVE";
}
