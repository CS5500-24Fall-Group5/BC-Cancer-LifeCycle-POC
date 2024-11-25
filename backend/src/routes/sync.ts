// src/routes/sync.ts
import { Hono } from "hono";
import { PrismaClient } from "@prisma/client";
import { DonorService } from "../services/donor.service";
import { SyncService } from "../services/sync.service";

const app = new Hono();
const prisma = new PrismaClient();
const donorService = new DonorService(prisma);
const syncService = new SyncService(prisma, donorService);

app.post("/", async (c) => {
  try {
    const { batchSize, totalLimit } = c.req.query();

    const results = await syncService.syncDonors({
      batchSize: batchSize ? parseInt(batchSize) : undefined,
      totalLimit: totalLimit ? parseInt(totalLimit) : undefined,
    });

    return c.json({ success: true, results });
  } catch (error) {
    console.error("Sync failed:", error);
    return c.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      500
    );
  }
});

export default app;
