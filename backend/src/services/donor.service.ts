// src/services/donor.service.ts

import { PrismaClient, LifecycleStage, Prisma } from "@prisma/client";

export class DonorService {
  constructor(private prisma: PrismaClient) {}

  async getDonors(params?: {
    page?: number;
    limit?: number;
    stage?: LifecycleStage;
    searchTerm?: string;
  }) {
    // Ensure parameters have valid defaults
    const page = Number(params?.page || 1);
    const limit = Number(params?.limit || 10);
    const skip = (page - 1) * limit;

    // Build query configuration
    const queryArgs: Prisma.DonorFindManyArgs = {
      take: limit,
      skip: skip,
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        comments: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    };

    // Add filtering conditions if provided
    if (params?.stage || params?.searchTerm) {
      queryArgs.where = queryArgs.where || {};

      if (params?.stage) {
        queryArgs.where.lifecycleStage = params.stage;
      }

      if (params?.searchTerm) {
        queryArgs.where.OR = [
          { firstName: { contains: params.searchTerm } },
          { lastName: { contains: params.searchTerm } },
          { city: { contains: params.searchTerm } },
        ];
      }
    }

    try {
      // Execute queries
      const [donors, total] = await Promise.all([
        this.prisma.donor.findMany(queryArgs),
        this.prisma.donor.count({
          where: queryArgs.where,
        }),
      ]);

      // Format dates for API response
      const formattedDonors = donors.map((donor) => ({
        ...donor,
        lastGiftDate: donor.lastGiftDate.toISOString(),
        firstGiftDate: donor.firstGiftDate?.toISOString(),
        createdAt: donor.createdAt.toISOString(),
        updatedAt: donor.updatedAt.toISOString(),
      }));

      return {
        data: formattedDonors,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Error in getDonors:", error);
      throw error;
    }
  }

  async addComment(params: {
    donorId: string;
    content: string;
    createdBy: string;
  }) {
    const { donorId, content, createdBy } = params;

    const donor = await this.prisma.donor.findUnique({
      where: { id: donorId },
    });

    if (!donor) {
      throw new Error("Donor not found");
    }

    return this.prisma.$transaction([
      this.prisma.comment.create({
        data: {
          donorId,
          content,
          createdBy,
        },
      }),
      this.prisma.donor.update({
        where: { id: donorId },
        data: { updatedAt: new Date() },
      }),
    ]);
  }

  async checkInitialData() {
    try {
      const count = await this.prisma.donor.count();
      return count > 0;
    } catch (error) {
      console.error("Error checking initial data:", error);
      return false;
    }
  }

  async updateLifecycleStage(donorId: string, lifecycleStage: LifecycleStage) {
    const donor = await this.prisma.donor.findUnique({
      where: { id: donorId },
    });

    if (!donor) {
      throw new Error("Donor not found");
    }

    return this.prisma.donor.update({
      where: { id: donorId },
      data: { lifecycleStage, updatedAt: new Date() },
    });
  }
}
