// src/routes/sync.ts
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { DonorService } from "../services/donor.service";
import { SyncService } from "../services/sync.service";

const app = new Hono();
const prisma = new PrismaClient();
const donorService = new DonorService(prisma);
const syncService = new SyncService(prisma, donorService);

const syncParamsSchema = z.object({
  batchSize: z.string().optional().transform(Number),
  totalLimit: z.string().optional().transform(Number),
});

app.post("/sync", zValidator("query", syncParamsSchema), async (c) => {
  try {
    const { batchSize, totalLimit } = c.req.valid("query");
    const results = await syncService.syncDonors({ batchSize, totalLimit });
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
