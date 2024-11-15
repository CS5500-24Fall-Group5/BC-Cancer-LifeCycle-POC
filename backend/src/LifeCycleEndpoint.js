import express from 'express';
import { PrismaClient } from '@prisma/client';
import cors from "cors";



const app = express();
app.use(cors());
const prisma = new PrismaClient();
const PORT = 5000;

// Get all donors information:/donors
// Get donors information with filtered liftecycleStage: /donors?lifecycleStage=Active
app.get('/donors', async (req, res) => {
    try {
      // Get the lifecycleStage from query parameters
      const { lifecycleStage } = req.query;
  
      // Define the filter condition, only if lifecycleStage is provided
      const filterCondition = lifecycleStage ? { lifecycleStage } : {};
  
      // Fetch records with optional filtering and order by lastGiftDate descending
      const donors = await prisma.donorData.findMany({
        where: filterCondition, // Apply filter if lifecycleStage is provided
        orderBy: {
          lastGiftDate: 'desc',
        },
      });
  
      res.json(donors);
    } catch (error) {
      console.error('Error fetching donors:', error);
      res.status(500).json({ error: 'An error occurred while fetching donors' });
    }
  });

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
