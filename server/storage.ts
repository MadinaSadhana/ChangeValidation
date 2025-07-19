import {
  users,
  applications,
  changeRequests,
  changeRequestApplications,
  type User,
  type UpsertUser,
  type Application,
  type InsertApplication,
  type ChangeRequest,
  type InsertChangeRequest,
  type ChangeRequestApplication,
  type InsertChangeRequestApplication
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, ilike, count, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Application operations
  getApplications(): Promise<Application[]>;
  getApplicationsBySpoc(spocId: string): Promise<Application[]>;
  createApplication(application: InsertApplication): Promise<Application>;

  // Change request operations
  getChangeRequests(filters?: any): Promise<ChangeRequest[]>;
  getChangeRequestById(id: number): Promise<ChangeRequest | undefined>;
  createChangeRequest(changeRequest: InsertChangeRequest): Promise<ChangeRequest>;
  getChangeRequestApplications(changeRequestId: number): Promise<ChangeRequestApplication[]>;
  createChangeRequestApplication(cra: InsertChangeRequestApplication): Promise<ChangeRequestApplication>;
  updateChangeRequestApplicationStatus(
    changeRequestId: number,
    applicationId: number,
    statusType: 'pre' | 'post',
    status: string,
    comment?: string
  ): Promise<void>;

  // Stats operations
  getChangeManagerStats(): Promise<{
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
  }>;
  getApplicationOwnerStats(spocId: string): Promise<{
    pending: number;
    completed: number;
    total: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Application operations
  async getApplications(): Promise<Application[]> {
    return await db.select().from(applications);
  }

  async getApplicationsBySpoc(spocId: string): Promise<Application[]> {
    return await db.select().from(applications).where(eq(applications.spocId, spocId));
  }

  async createApplication(application: InsertApplication): Promise<Application> {
    const [newApplication] = await db
      .insert(applications)
      .values(application)
      .returning();
    return newApplication;
  }

  // Change request operations
  async getChangeRequests(filters: any = {}): Promise<ChangeRequest[]> {
    let query = db
      .select({
        id: changeRequests.id,
        changeId: changeRequests.changeId,
        title: changeRequests.title,
        description: changeRequests.description,
        changeType: changeRequests.changeType,
        scheduledStartTime: changeRequests.scheduledStartTime,
        scheduledEndTime: changeRequests.scheduledEndTime,
        status: changeRequests.status,
        createdAt: changeRequests.createdAt,
        updatedAt: changeRequests.updatedAt,
        applications: sql<ChangeRequestApplication[]>`
          json_agg(
            json_build_object(
              'applicationId', ${changeRequestApplications.applicationId},
              'changeRequestId', ${changeRequestApplications.changeRequestId},
              'preChangeStatus', ${changeRequestApplications.preChangeStatus},
              'postChangeStatus', ${changeRequestApplications.postChangeStatus},
              'preChangeComment', ${changeRequestApplications.preChangeComment},
              'postChangeComment', ${changeRequestApplications.postChangeComment},
              'preChangeUpdatedAt', ${changeRequestApplications.preChangeUpdatedAt},
              'postChangeUpdatedAt', ${changeRequestApplications.postChangeUpdatedAt},
              'application', json_build_object(
                'id', ${applications.id},
                'name', ${applications.name},
                'spocId', ${applications.spocId}
              )
            )
          )
        `
      })
      .from(changeRequests)
      .leftJoin(changeRequestApplications, eq(changeRequests.id, changeRequestApplications.changeRequestId))
      .leftJoin(applications, eq(changeRequestApplications.applicationId, applications.id))
      .groupBy(changeRequests.id);

    // Apply filters
    const conditions = [];

    if (filters.spocId) {
      conditions.push(eq(applications.spocId, filters.spocId));
    }

    if (filters.search) {
      conditions.push(
        or(
          ilike(changeRequests.changeId, `%${filters.search}%`),
          ilike(changeRequests.title, `%${filters.search}%`),
          ilike(changeRequests.description, `%${filters.search}%`)
        )
      );
    }

    if (filters.type) {
      conditions.push(eq(changeRequests.changeType, filters.type));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    query = query.orderBy(desc(changeRequests.createdAt));

    const results = await query;
    
    return results.map(result => ({
      ...result,
      applications: result.applications?.filter(app => app.applicationId !== null) || []
    }));
  }

  async getChangeRequestById(id: number): Promise<ChangeRequest | undefined> {
    const [changeRequest] = await db
      .select()
      .from(changeRequests)
      .where(eq(changeRequests.id, id));
    return changeRequest;
  }

  async createChangeRequest(changeRequest: InsertChangeRequest): Promise<ChangeRequest> {
    const [newChangeRequest] = await db
      .insert(changeRequests)
      .values(changeRequest)
      .returning();
    return newChangeRequest;
  }

  async getChangeRequestApplications(changeRequestId: number): Promise<ChangeRequestApplication[]> {
    return await db
      .select({
        applicationId: changeRequestApplications.applicationId,
        changeRequestId: changeRequestApplications.changeRequestId,
        preChangeStatus: changeRequestApplications.preChangeStatus,
        postChangeStatus: changeRequestApplications.postChangeStatus,
        preChangeComment: changeRequestApplications.preChangeComment,
        postChangeComment: changeRequestApplications.postChangeComment,
        preChangeUpdatedAt: changeRequestApplications.preChangeUpdatedAt,
        postChangeUpdatedAt: changeRequestApplications.postChangeUpdatedAt,
        application: {
          id: applications.id,
          name: applications.name,
          spocId: applications.spocId,
          createdAt: applications.createdAt,
          updatedAt: applications.updatedAt
        }
      })
      .from(changeRequestApplications)
      .innerJoin(applications, eq(changeRequestApplications.applicationId, applications.id))
      .where(eq(changeRequestApplications.changeRequestId, changeRequestId));
  }

  async createChangeRequestApplication(cra: InsertChangeRequestApplication): Promise<ChangeRequestApplication> {
    const [newCRA] = await db
      .insert(changeRequestApplications)
      .values(cra)
      .returning();
    
    // Get the full application details
    const [application] = await db
      .select()
      .from(applications)
      .where(eq(applications.id, newCRA.applicationId));

    return {
      ...newCRA,
      application: application
    };
  }

  async updateChangeRequestApplicationStatus(
    changeRequestId: number,
    applicationId: number,
    statusType: 'pre' | 'post',
    status: string,
    comment?: string
  ): Promise<void> {
    const updateData: any = {};
    
    if (statusType === 'pre') {
      updateData.preChangeStatus = status;
      updateData.preChangeUpdatedAt = new Date();
      if (comment !== undefined) {
        updateData.preChangeComment = comment;
      }
    } else {
      updateData.postChangeStatus = status;
      updateData.postChangeUpdatedAt = new Date();
      if (comment !== undefined) {
        updateData.postChangeComment = comment;
      }
    }

    await db
      .update(changeRequestApplications)
      .set(updateData)
      .where(
        and(
          eq(changeRequestApplications.changeRequestId, changeRequestId),
          eq(changeRequestApplications.applicationId, applicationId)
        )
      );
  }

  // Stats operations
  async getChangeManagerStats(): Promise<{
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
  }> {
    const [total] = await db
      .select({ count: count() })
      .from(changeRequests)
      .where(eq(changeRequests.status, "active"));

    // Get all change requests with their applications for status calculation
    const allRequests = await this.getChangeRequests();
    
    let completed = 0;
    let inProgress = 0;
    let pending = 0;

    allRequests.forEach(request => {
      const hasApplications = request.applications && request.applications.length > 0;
      
      if (!hasApplications) {
        pending++;
        return;
      }

      let allCompleted = true;
      let hasInProgressStatus = false;

      request.applications!.forEach(app => {
        const preStatus = app.preChangeStatus;
        const postStatus = app.postChangeStatus;

        if (preStatus === 'in_progress' || postStatus === 'in_progress') {
          hasInProgressStatus = true;
        }

        if (preStatus !== 'completed' || postStatus !== 'completed') {
          allCompleted = false;
        }
      });

      if (allCompleted) {
        completed++;
      } else if (hasInProgressStatus) {
        inProgress++;
      } else {
        pending++;
      }
    });

    return {
      total: total.count,
      completed,
      inProgress,
      pending,
    };
  }

  async getApplicationOwnerStats(spocId: string): Promise<{
    pending: number;
    completed: number;
    total: number;
  }> {
    const today = new Date().toISOString().split('T')[0];

    const [pending] = await db
      .select({ count: count() })
      .from(changeRequestApplications)
      .innerJoin(applications, eq(changeRequestApplications.applicationId, applications.id))
      .innerJoin(changeRequests, eq(changeRequestApplications.changeRequestId, changeRequests.id))
      .where(
        and(
          eq(applications.spocId, spocId),
          eq(changeRequests.status, "active"),
          or(
            eq(changeRequestApplications.preChangeStatus, "pending"),
            eq(changeRequestApplications.postChangeStatus, "pending"),
            eq(changeRequestApplications.preChangeStatus, "in_progress"),
            eq(changeRequestApplications.postChangeStatus, "in_progress")
          )
        )
      );

    const [completed] = await db
      .select({ count: count() })
      .from(changeRequestApplications)
      .innerJoin(applications, eq(changeRequestApplications.applicationId, applications.id))
      .where(
        and(
          eq(applications.spocId, spocId),
          or(
            and(
              eq(changeRequestApplications.preChangeStatus, "completed"),
              eq(changeRequestApplications.preChangeUpdatedAt, today)
            ),
            and(
              eq(changeRequestApplications.postChangeStatus, "completed"),
              eq(changeRequestApplications.postChangeUpdatedAt, today)
            )
          )
        )
      );

    const [total] = await db
      .select({ count: count() })
      .from(changeRequestApplications)
      .innerJoin(applications, eq(changeRequestApplications.applicationId, applications.id))
      .innerJoin(changeRequests, eq(changeRequestApplications.changeRequestId, changeRequests.id))
      .where(
        and(
          eq(applications.spocId, spocId),
          eq(changeRequests.status, "active")
        )
      );

    return {
      pending: pending.count,
      completed: completed.count,
      total: total.count,
    };
  }
}

export const storage = new DatabaseStorage();