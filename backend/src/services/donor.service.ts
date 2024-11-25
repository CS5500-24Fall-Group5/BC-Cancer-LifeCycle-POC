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
    // 确保参数都是数字且有合理的默认值
    const page = Number(params?.page || 1);
    const limit = Number(params?.limit || 10);
    const skip = (page - 1) * limit;

    // 基础查询配置
    const queryArgs: Prisma.DonorFindManyArgs = {
      take: limit,
      skip: skip,
      orderBy: {
        updatedAt: "desc",
      },
    };

    // 只在需要时添加 where 条件
    if (params?.stage || params?.searchTerm) {
      queryArgs.where = {};

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
      // 执行查询
      const [donors, total] = await Promise.all([
        this.prisma.donor.findMany(queryArgs),
        this.prisma.donor.count({
          where: queryArgs.where,
        }),
      ]);

      return {
        data: donors,
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

  async createOrUpdateDonor(data: {
    firstName: string;
    lastName: string;
    city?: string;
    totalDonations: number;
    lastGiftAmount: number;
    lastGiftDate: Date;
    firstGiftDate?: Date;
    totalGiftsLastFiscal?: number;
    totalGiftsCurrentFiscal?: number;
  }) {
    const existingDonor = await this.prisma.donor.findFirst({
      where: {
        firstName: data.firstName,
        lastName: data.lastName,
        city: data.city || undefined,
      },
    });

    if (existingDonor) {
      return this.prisma.donor.update({
        where: { id: existingDonor.id },
        data,
      });
    }

    return this.prisma.donor.create({
      data,
    });
  }

  async addComment(params: {
    donorId: string;
    content: string;
    createdBy: string;
  }) {
    const { donorId, content, createdBy } = params;
    return this.prisma.comment.create({
      data: {
        donorId,
        content,
        createdBy,
      },
    });
  }

  async checkInitialData() {
    const count = await this.prisma.donor.count();
    return count > 0;
  }
}
