// src/index.ts
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import donorRoutes from "./routes/donors";
import syncRoutes from "./routes/sync";
import { PrismaClient } from "@prisma/client";
import { DonorService } from "./services/donor.service";
import { SyncService } from "./services/sync.service";
import { errorHandler } from "./middleware/errorHandler";

const app = new Hono();
const prisma = new PrismaClient();
const donorService = new DonorService(prisma);
const syncService = new SyncService(prisma, donorService);

// Load initial data on startup
async function loadInitialData() {
  try {
    const hasData = await donorService.checkInitialData();

    if (!hasData) {
      console.log("Loading initial demonstration data...");
      await syncService.syncDonors({
        batchSize: 10,
        totalLimit: 10,
      });
      console.log("Initial data loaded successfully");
    } else {
      console.log("Database already contains data, skipping initial load");
    }
  } catch (error) {
    console.error("Failed to load initial data:", error);
  }
}

// Middleware
app.use("*", logger());
app.use("*", cors());
app.use("*", prettyJSON());
app.use("*", errorHandler());

// Routes
app.route("/api/donors", donorRoutes);
app.route("/api/sync", syncRoutes);

// Health check
app.get("/health", (c) =>
  c.json({ status: "ok", timestamp: new Date().toISOString() })
);

// Start server and load initial data
loadInitialData();

export default {
  port: 3000,
  fetch: app.fetch,
};
