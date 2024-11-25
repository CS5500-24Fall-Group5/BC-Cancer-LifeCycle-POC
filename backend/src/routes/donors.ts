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

export default app;
