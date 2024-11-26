// src/routes/donors.ts
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { DonorService } from "../services/donor.service";

const app = new Hono();
const prisma = new PrismaClient();
const donorService = new DonorService(prisma);

const querySchema = z.object({
  page: z.string().optional().transform(Number),
  limit: z.string().optional().transform(Number),
  stage: z.enum(["NEW", "ACTIVE", "AT_RISK", "LAPSED"]).optional(),
  searchTerm: z.string().optional(),
});

app.get("/", zValidator("query", querySchema), async (c) => {
  const query = c.req.valid("query");
  const result = await donorService.getDonors(query);
  return c.json(result);
});

app.post("/:id/comments", async (c) => {
  const id = c.req.param("id");
  const { content } = await c.req.json();

  const comment = await donorService.addComment({
    donorId: id,
    content,
    createdBy: "SYSTEM",
  });

  return c.json(comment);
});

app.put("/:id/lifecycle-stage", async (c) => {
  const id = c.req.param("id");
  const { lifecycleStage } = await c.req.json();

  const validStages = ["NEW", "ACTIVE", "AT_RISK", "LAPSED"];
  if (!validStages.includes(lifecycleStage)) {
    return c.json({ error: "Invalid lifecycle stage" }, 400);
  }

  try {
    const updatedDonor = await donorService.updateLifecycleStage(
      id,
      lifecycleStage
    );
    return c.json(updatedDonor);
  } catch (error) {
    console.error("Error updating lifecycle stage:", error);
    return c.json({ error: "Failed to update lifecycle stage" }, 500);
  }
});

app.get("/stats", async (c) => {
  try {
    const stats = await donorService.getDonorStats();
    return c.json(stats);
  } catch (error) {
    console.error("Error fetching donor stats:", error);
    return c.json({ error: "Failed to fetch donor statistics" }, 500);
  }
});

export default app;
