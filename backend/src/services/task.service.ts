// src/services/task.service.ts

import {
  PrismaClient,
  Task,
  TaskStatus,
  LifecycleStage,
  TaskType,
  TaskPriority,
} from "@prisma/client";

export class TaskService {
  constructor(private prisma: PrismaClient) {}

  async getTasks(params: {
    status?: TaskStatus;
    targetGroup?: LifecycleStage;
    page?: number;
    limit?: number;
  }) {
    // Convert params to numbers and set defaults
    const limit = Number(params.limit) || 10;
    const page = Number(params.page) || 1;
    const skip = (page - 1) * limit;

    // Build where clause
    const where = {
      ...(params.status && { status: params.status }),
      ...(params.targetGroup && { targetGroup: params.targetGroup }),
    };

    try {
      // Execute queries
      const [tasks, total] = await Promise.all([
        this.prisma.task.findMany({
          take: limit, // Explicit limit
          skip, // Calculated skip
          where,
          orderBy: {
            createdAt: "desc",
          },
        }),
        this.prisma.task.count({ where }),
      ]);

      return {
        data: tasks,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Error fetching tasks:", error);
      throw error;
    }
  }

  async createTask(data: {
    title: string;
    type: TaskType;
    description: string;
    priority: TaskPriority;
    targetGroup: LifecycleStage;
    dueDate?: Date;
    assignedTo?: string;
  }) {
    try {
      const affectedDonors = await this.prisma.donor.count({
        where: {
          lifecycleStage: data.targetGroup,
        },
      });

      return await this.prisma.task.create({
        data: {
          ...data,
          affectedDonors,
        },
      });
    } catch (error) {
      console.error("Error creating task:", error);
      throw error;
    }
  }

  async updateTaskStatus(id: string, status: TaskStatus) {
    try {
      return await this.prisma.task.update({
        where: { id },
        data: { status },
      });
    } catch (error) {
      console.error("Error updating task status:", error);
      throw error;
    }
  }

  async deleteTask(id: string) {
    try {
      return await this.prisma.task.delete({
        where: { id },
      });
    } catch (error) {
      console.error("Error deleting task:", error);
      throw error;
    }
  }
}
