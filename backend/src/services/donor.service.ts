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

  async getDonorStats() {
    // 获取所有状态的数量
    const stats = await this.prisma.donor.groupBy({
      by: ["lifecycleStage"],
      _count: {
        id: true,
      },
    });

    // 获取总捐赠者数量
    const totalDonors = await this.prisma.donor.count();

    // 获取每个状态的总捐赠金额
    const donationsByStage = await this.prisma.donor.groupBy({
      by: ["lifecycleStage"],
      _sum: {
        totalDonations: true,
      },
    });

    // 构建响应数据
    const statsMap = new Map(stats.map((s) => [s.lifecycleStage, s._count.id]));
    const donationsMap = new Map(
      donationsByStage.map((d) => [
        d.lifecycleStage,
        d._sum.totalDonations || 0,
      ])
    );

    return {
      total: totalDonors,
      stats: {
        NEW: {
          count: statsMap.get("NEW") || 0,
          totalDonations: donationsMap.get("NEW") || 0,
          percentage: totalDonors
            ? (((statsMap.get("NEW") || 0) / totalDonors) * 100).toFixed(1)
            : 0,
        },
        ACTIVE: {
          count: statsMap.get("ACTIVE") || 0,
          totalDonations: donationsMap.get("ACTIVE") || 0,
          percentage: totalDonors
            ? (((statsMap.get("ACTIVE") || 0) / totalDonors) * 100).toFixed(1)
            : 0,
        },
        AT_RISK: {
          count: statsMap.get("AT_RISK") || 0,
          totalDonations: donationsMap.get("AT_RISK") || 0,
          percentage: totalDonors
            ? (((statsMap.get("AT_RISK") || 0) / totalDonors) * 100).toFixed(1)
            : 0,
        },
        LAPSED: {
          count: statsMap.get("LAPSED") || 0,
          totalDonations: donationsMap.get("LAPSED") || 0,
          percentage: totalDonors
            ? (((statsMap.get("LAPSED") || 0) / totalDonors) * 100).toFixed(1)
            : 0,
        },
      },
    };
  }
}
