-- CreateTable
CREATE TABLE `Donor` (
    `id` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NULL,
    `totalDonations` DOUBLE NOT NULL,
    `lastGiftAmount` DOUBLE NOT NULL,
    `lastGiftDate` DATETIME(3) NOT NULL,
    `lifecycleStage` ENUM('NEW', 'ACTIVE', 'AT_RISK', 'LAPSED') NOT NULL,
    `notes` VARCHAR(191) NULL,
    `firstGiftDate` DATETIME(3) NULL,
    `totalGiftsLastFiscal` DOUBLE NULL,
    `totalGiftsCurrentFiscal` DOUBLE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Donor_lifecycleStage_idx`(`lifecycleStage`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Comment` (
    `id` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `donorId` VARCHAR(191) NOT NULL,
    `createdBy` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Comment_donorId_idx`(`donorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DonorAction` (
    `id` VARCHAR(191) NOT NULL,
    `donorId` VARCHAR(191) NOT NULL,
    `previousStage` ENUM('NEW', 'ACTIVE', 'AT_RISK', 'LAPSED') NOT NULL,
    `newStage` ENUM('NEW', 'ACTIVE', 'AT_RISK', 'LAPSED') NOT NULL,
    `actionType` VARCHAR(191) NOT NULL,
    `note` TEXT NULL,
    `createdBy` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `DonorAction_donorId_idx`(`donorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_donorId_fkey` FOREIGN KEY (`donorId`) REFERENCES `Donor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DonorAction` ADD CONSTRAINT `DonorAction_donorId_fkey` FOREIGN KEY (`donorId`) REFERENCES `Donor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
