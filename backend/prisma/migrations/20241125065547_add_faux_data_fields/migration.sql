-- AlterTable
ALTER TABLE `Donor` ADD COLUMN `address1` VARCHAR(191) NULL,
    ADD COLUMN `address2` VARCHAR(191) NULL,
    ADD COLUMN `communicationRestrictions` TEXT NULL,
    ADD COLUMN `contactPhone` VARCHAR(191) NULL,
    ADD COLUMN `deceasedFlag` VARCHAR(191) NULL,
    ADD COLUMN `excludeFlag` VARCHAR(191) NULL,
    ADD COLUMN `firstGiftAmount` DOUBLE NULL,
    ADD COLUMN `largestGiftAmount` DOUBLE NULL,
    ADD COLUMN `largestGiftAppeal` VARCHAR(191) NULL,
    ADD COLUMN `lastGiftAppeal` VARCHAR(191) NULL,
    ADD COLUMN `pmm` VARCHAR(191) NULL,
    ADD COLUMN `postalCode` VARCHAR(191) NULL,
    ADD COLUMN `primaryAccount` TEXT NULL,
    ADD COLUMN `province` VARCHAR(191) NULL,
    ADD COLUMN `smm` VARCHAR(191) NULL,
    ADD COLUMN `snapshotSummary` TEXT NULL,
    ADD COLUMN `vmm` VARCHAR(191) NULL,
    MODIFY `notes` TEXT NULL;

-- CreateIndex
CREATE INDEX `Donor_firstName_lastName_city_idx` ON `Donor`(`firstName`, `lastName`, `city`);
