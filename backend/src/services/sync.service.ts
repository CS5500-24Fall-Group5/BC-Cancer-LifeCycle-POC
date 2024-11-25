// src/services/sync.service.ts
import { PrismaClient } from "@prisma/client";
import { DonorService } from "./donor.service";

interface FauxDonorResponse {
  success: boolean;
  message: string;
  data: Array<{
    first_name: string;
    last_name: string;
    city: string;
    total_gifts_last_fiscal: number;
    total_gifts_current_fiscal: number;
    first_gift_amount: number;
    first_gift_date: number;
    last_gift_amount: number;
    last_gift_date: number;
  }>;
}

export class SyncService {
  private readonly FAUX_API_URL =
    "https://bc-cancer-donor-lifecycle-faux-data.onrender.com/donors";

  constructor(
    private prisma: PrismaClient,
    private donorService: DonorService
  ) {}

  async syncDonors(params?: { batchSize?: number; totalLimit?: number }) {
    const { batchSize = 10, totalLimit = 10 } = params || {};

    try {
      const url = `${this.FAUX_API_URL}?limit=${batchSize}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const fauxData: FauxDonorResponse = await response.json();

      if (!fauxData.success) {
        throw new Error("Failed to fetch data from Faux API");
      }

      const results = {
        total: fauxData.data.length,
        processed: 0,
        created: 0,
        updated: 0,
        errors: 0,
      };

      for (const fauxDonor of fauxData.data) {
        try {
          const existing = await this.prisma.donor.findFirst({
            where: {
              firstName: fauxDonor.first_name,
              lastName: fauxDonor.last_name,
              city: fauxDonor.city,
            },
          });

          await this.donorService.createOrUpdateDonor({
            firstName: fauxDonor.first_name,
            lastName: fauxDonor.last_name,
            city: fauxDonor.city,
            totalDonations:
              fauxDonor.total_gifts_current_fiscal +
              fauxDonor.total_gifts_last_fiscal,
            lastGiftAmount: fauxDonor.last_gift_amount,
            lastGiftDate: new Date(fauxDonor.last_gift_date),
            firstGiftDate: new Date(fauxDonor.first_gift_date),
            totalGiftsLastFiscal: fauxDonor.total_gifts_last_fiscal,
            totalGiftsCurrentFiscal: fauxDonor.total_gifts_current_fiscal,
          });

          existing ? results.updated++ : results.created++;
          results.processed++;
        } catch (error) {
          console.error("Error processing donor:", error);
          results.errors++;
        }
      }

      return results;
    } catch (error) {
      console.error("Sync failed:", error);
      throw error;
    }
  }
}
