//Request api to get csv, mock pulling data: https://bc-cancer-faux.onrender.com/donors?format=csv?limit=50

import { PrismaClient } from '@prisma/client'; // Import Prisma client
import fs from 'fs'; // Import file system module
import csv from 'csv-parser'; // Import CSV parser

const prisma = new PrismaClient();

// Helper function to categorize donors based on donation history
function categorizeDonor(lastGiftDate) {
  if (!lastGiftDate) return 'New';

  const currentDate = new Date();
  const lastGift = new Date(lastGiftDate);
  const monthsSinceLastGift = (currentDate.getFullYear() - lastGift.getFullYear()) * 12 + (currentDate.getMonth() - lastGift.getMonth());

  if (monthsSinceLastGift < 6) {
    return 'New';
  } else if (monthsSinceLastGift < 48) {
    return 'Active';
  } else if (monthsSinceLastGift < 120) {
    return 'At-Risk';
  } else {
    return 'Lapsed';
  }
}

async function main() {
  const records = [];

  // Read the CSV file
  fs.createReadStream('./resource/donors.csv') // Update with the actual CSV path
    .pipe(csv())
    .on('data', (row) => {
      

      // Parse and validate lastGiftDate
      const lastGiftDateRaw = row['last_gift_date'];
      const lastGiftDate = lastGiftDateRaw && !isNaN(parseInt(lastGiftDateRaw, 10))
        ? new Date(parseInt(lastGiftDateRaw, 10) * 1000)
        : null;

      // Check if lastGiftDate is invalid or zero
      if (!lastGiftDate || isNaN(lastGiftDate.getTime())) {
        console.log(`Skipping row due to invalid or zero lastGiftDate: ${row['first_name']} ${row['last_name']}`);
        return;
      }

      // Map CSV data to match Prisma schema fields
      records.push({
        firstName: row['first_name'],
        lastName: row['last_name'],
        address: row['address_line1'] || '' + (row['address_line2'] || ''),
        city: row['city'],
        totalDonations: parseFloat(row['total_donations']) || 0.0,
        lastGiftAmount: parseFloat(row['last_gift_amount']) || 0.0,
        lastGiftDate: lastGiftDate,
        lifecycleStage: categorizeDonor(lastGiftDate),
        comment: row['comment'] || null,
        communicationRestrictions: row['communication_restrictions'] || null,
      });
    })
    .on('end', async () => {
      console.log('CSV file successfully processed');
      try {
        for (const record of records) {
          // Check if a donor with the same primary key exists
          const existingDonor = await prisma.donorData.findUnique({
            where: {
              firstName_lastName_address: {
                firstName: record.firstName,
                lastName: record.lastName,
                address: record.address,
              },
            },
          });

          if (existingDonor) {
            // Update the existing record with new data and categorized lifecycleStage
            await prisma.donorData.update({
              where: {
                firstName_lastName_address: {
                  firstName: record.firstName,
                  lastName: record.lastName,
                  address: record.address,
                },
              },
              data: {
                city: record.city,
                totalDonations: record.totalDonations,
                lastGiftAmount: record.lastGiftAmount,
                lastGiftDate: record.lastGiftDate,
                lifecycleStage: record.lifecycleStage,
                comment: record.comment,
                communicationRestrictions: record.communicationRestrictions,
              },
            });
            console.log(`Updated donor: ${record.firstName} ${record.lastName}`);
          } else {
            // Insert a new record if it doesn't exist
            await prisma.donorData.create({
              data: record,
            });
            console.log(`Inserted new donor: ${record.firstName} ${record.lastName}`);
          }
        }
        console.log('Data processing complete');
      } catch (error) {
        console.error('Error processing data:', error);
      } finally {
        await prisma.$disconnect();
      }
    });
}

// Execute the main function
main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
});
