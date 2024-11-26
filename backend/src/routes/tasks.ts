// src/routes/tasks.ts

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { TaskService } from "../services/task.service";

const app = new Hono();
const prisma = new PrismaClient();
const taskService = new TaskService(prisma);

// Validation schemas
const querySchema = z.object({
  page: z.string().optional().transform(Number),
  limit: z.string().optional().transform(Number),
  status: z
    .enum(["TODO", "IN_PROGRESS", "DONE", "CANCELED", "BACKLOG"])
    .optional(),
  targetGroup: z.enum(["NEW", "ACTIVE", "AT_RISK", "LAPSED"]).optional(),
});

const createTaskSchema = z.object({
  title: z.string(),
  type: z.enum(["OUTREACH", "FOLLOWUP", "REVIEW", "CAMPAIGN"]),
  description: z.string(),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]),
  targetGroup: z.enum(["NEW", "ACTIVE", "AT_RISK", "LAPSED"]),
  dueDate: z
    .string()
    .optional()
    .transform((str) => (str ? new Date(str) : undefined)),
  assignedTo: z.string().optional(),
});

// Routes
app.get("/", zValidator("query", querySchema), async (c) => {
  const query = c.req.valid("query");
  const result = await taskService.getTasks(query);
  return c.json(result);
});

app.post("/", zValidator("json", createTaskSchema), async (c) => {
  const data = c.req.valid("json");
  const task = await taskService.createTask(data);
  return c.json(task, 201);
});

app.patch("/:id/status", async (c) => {
  const id = c.req.param("id");
  const { status } = await c.req.json();
  const task = await taskService.updateTaskStatus(id, status);
  return c.json(task);
});

app.delete("/:id", async (c) => {
  const id = c.req.param("id");
  await taskService.deleteTask(id);
  return c.json({ success: true });
});

export default app;
