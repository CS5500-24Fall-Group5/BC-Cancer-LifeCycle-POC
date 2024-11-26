// src/services/sync.service.ts

import { PrismaClient } from "@prisma/client";
import { DonorService } from "./donor.service";
import { calculateLifecycleStage } from "../utils/lifecycle";

export class SyncService {
  private readonly FAUX_API_URL = process.env.FAUX_API_URL || "";

  constructor(
    private prisma: PrismaClient,
    private donorService: DonorService
  ) {}

  async syncDonors(params?: { batchSize?: number; totalLimit?: number }) {
    const batchSize = params?.batchSize || 10;
    const url = `${this.FAUX_API_URL}?limit=${batchSize}`;

    try {
      const response = await fetch(url);
      const { data: fauxDonors } = await response.json();

      const results = {
        total: fauxDonors.length,
        processed: 0,
        created: 0,
        updated: 0,
        errors: 0,
      };

      for (const fauxDonor of fauxDonors) {
        try {
          // Calculate lifecycle stage based on donor data
          const lifecycleStage = calculateLifecycleStage({
            excludeFlag: fauxDonor.exclude,
            deceasedFlag: fauxDonor.deceased,
            firstGiftDate: fauxDonor.first_gift_date,
            lastGiftDate: fauxDonor.last_gift_date,
            totalGiftsLastFiscal: fauxDonor.total_gifts_last_fiscal,
            totalGiftsCurrentFiscal: fauxDonor.total_gifts_current_fiscal,
          });

          // Transform faux data to our schema
          const donorData = {
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
            lifecycleStage,

            // Store original faux data fields
            excludeFlag: fauxDonor.exclude,
            deceasedFlag: fauxDonor.deceased,
            pmm: fauxDonor.pmm,
            smm: fauxDonor.smm,
            vmm: fauxDonor.vmm,
            primaryAccount: fauxDonor.primary_account,
            largestGiftAmount: fauxDonor.largest_gift_amount,
            largestGiftAppeal: fauxDonor.largest_gift_appeal,
            firstGiftAmount: fauxDonor.first_gift_amount,
            lastGiftAppeal: fauxDonor.last_gift_appeal,
            address1: fauxDonor.address_1,
            address2: fauxDonor.address_2,
            province: fauxDonor.province,
            postalCode: fauxDonor.postal_code,
            contactPhone: fauxDonor.contact_phone,
            communicationRestrictions: fauxDonor.communication_restrictions,
            snapshotSummary: fauxDonor.snapshot_summary,

            // Add status notes
            notes: `[System Generated] Lifecycle: ${lifecycleStage}${
              fauxDonor.exclude === "Yes" ? " (Excluded)" : ""
            }${
              fauxDonor.deceased === "Yes" ? " (Deceased)" : ""
            } - Auto-classified on ${new Date().toISOString()}`,
          };

          const existing = await this.prisma.donor.findFirst({
            where: {
              firstName: fauxDonor.first_name,
              lastName: fauxDonor.last_name,
              city: fauxDonor.city,
            },
          });

          if (existing) {
            // Update existing donor
            const updatedDonor = await this.prisma.donor.update({
              where: { id: existing.id },
              data: donorData,
            });

            // Record lifecycle stage change if any
            if (existing.lifecycleStage !== lifecycleStage) {
              await this.prisma.donorAction.create({
                data: {
                  donorId: existing.id,
                  previousStage: existing.lifecycleStage,
                  newStage: lifecycleStage,
                  actionType: "AUTO_UPDATE",
                  note: `Status updated based on: ${
                    fauxDonor.exclude === "Yes"
                      ? "Donor excluded"
                      : fauxDonor.deceased === "Yes"
                      ? "Donor deceased"
                      : "Donation patterns"
                  }`,
                  createdBy: "SYSTEM",
                },
              });
            }

            results.updated++;
          } else {
            // Create new donor
            await this.prisma.donor.create({
              data: donorData,
            });
            results.created++;
          }

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
