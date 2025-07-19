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
  type InsertChangeRequestApplication,
  type UpdateValidation,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, or, like, count, lt } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Application operations
  getApplications(): Promise<Application[]>;
  getApplicationsBySpoc(spocId: string): Promise<Application[]>;
  createApplication(application: InsertApplication): Promise<Application>;
  
  // Change request operations
  getChangeRequests(filters?: {
    search?: string;
    type?: string;
    status?: string;
    managerId?: string;
    spocId?: string;
  }): Promise<(ChangeRequest & { 
    applicationCount: number;
    applications: (ChangeRequestApplication & {
      application: Application & { spoc: User | null };
    })[];
  })[]>;
  getChangeRequestById(id: number): Promise<ChangeRequest | undefined>;
  getChangeRequestByChangeId(changeId: string): Promise<ChangeRequest | undefined>;
  createChangeRequest(changeRequest: InsertChangeRequest): Promise<ChangeRequest>;
  
  // Change request application operations
  getChangeRequestApplications(changeRequestId: number): Promise<(ChangeRequestApplication & {
    application: Application & { spoc: User | null };
  })[]>;
  getChangeRequestApplicationsBySpoc(spocId: string): Promise<(ChangeRequestApplication & {
    changeRequest: ChangeRequest;
    application: Application;
  })[]>;
  addApplicationsToChangeRequest(changeRequestId: number, applicationIds: number[]): Promise<void>;
  updateValidationStatus(changeRequestId: number, applicationId: number, spocId: string, validation: UpdateValidation): Promise<void>;
  
  // Stats operations
  getChangeManagerStats(managerId: string): Promise<{
    activeRequests: number;
    pendingValidations: number;
    completedToday: number;
    overdue: number;
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
    return await db.select().from(applications).orderBy(asc(applications.name));
  }

  async getApplicationsBySpoc(spocId: string): Promise<Application[]> {
    return await db
      .select()
      .from(applications)
      .where(eq(applications.spocId, spocId))
      .orderBy(asc(applications.name));
  }

  async createApplication(application: InsertApplication): Promise<Application> {
    const [newApp] = await db.insert(applications).values(application).returning();
    return newApp;
  }

  // Change request operations
  async getChangeRequests(filters?: {
    search?: string;
    type?: string;
    status?: string;
    managerId?: string;
    spocId?: string;
  }): Promise<(ChangeRequest & { 
    applicationCount: number;
    applications: (ChangeRequestApplication & {
      application: Application & { spoc: User | null };
    })[];
  })[]> {
    // First get basic change requests with filters
    let baseQuery = db.select().from(changeRequests);
    const conditions = [];
    
    if (filters?.search) {
      conditions.push(
        or(
          like(changeRequests.changeId, `%${filters.search}%`),
          like(changeRequests.title, `%${filters.search}%`)
        )
      );
    }
    
    if (filters?.type) {
      conditions.push(eq(changeRequests.changeType, filters.type));
    }
    
    if (filters?.status) {
      conditions.push(eq(changeRequests.status, filters.status));
    }
    
    if (filters?.managerId) {
      conditions.push(eq(changeRequests.changeManagerId, filters.managerId));
    }

    if (conditions.length > 0) {
      baseQuery = baseQuery.where(and(...conditions)) as any;
    }

    let requests = await baseQuery.orderBy(desc(changeRequests.createdAt));

    // Filter by SPOC after getting basic results
    if (filters?.spocId) {
      // Get change request IDs that have applications assigned to this SPOC
      const spocChangeRequestIds = await db
        .select({ changeRequestId: changeRequestApplications.changeRequestId })
        .from(changeRequestApplications)
        .innerJoin(applications, eq(changeRequestApplications.applicationId, applications.id))
        .where(eq(applications.spocId, filters.spocId));
      
      const changeRequestIds = new Set(spocChangeRequestIds.map(cr => cr.changeRequestId));
      requests = requests.filter(req => changeRequestIds.has(req.id));
    }

    // Now get applications for each request
    const requestsWithApps = await Promise.all(
      requests.map(async (request) => {
        const applications = await this.getChangeRequestApplications(request.id);
        return {
          ...request,
          applicationCount: applications.length,
          applications
        };
      })
    );

    return requestsWithApps;
  }

  async getChangeRequestById(id: number): Promise<ChangeRequest | undefined> {
    const [request] = await db.select().from(changeRequests).where(eq(changeRequests.id, id));
    return request;
  }

  async getChangeRequestByChangeId(changeId: string): Promise<ChangeRequest | undefined> {
    const [request] = await db.select().from(changeRequests).where(eq(changeRequests.changeId, changeId));
    return request;
  }

  async createChangeRequest(changeRequest: InsertChangeRequest): Promise<ChangeRequest> {
    const [newRequest] = await db.insert(changeRequests).values(changeRequest).returning();
    return newRequest;
  }

  // Change request application operations
  async getChangeRequestApplications(changeRequestId: number): Promise<(ChangeRequestApplication & {
    application: Application & { spoc: User | null };
  })[]> {
    const result = await db
      .select({
        id: changeRequestApplications.id,
        changeRequestId: changeRequestApplications.changeRequestId,
        applicationId: changeRequestApplications.applicationId,
        preChangeStatus: changeRequestApplications.preChangeStatus,
        postChangeStatus: changeRequestApplications.postChangeStatus,
        preChangeComments: changeRequestApplications.preChangeComments,
        postChangeComments: changeRequestApplications.postChangeComments,
        preChangeAttachments: changeRequestApplications.preChangeAttachments,
        postChangeAttachments: changeRequestApplications.postChangeAttachments,
        preChangeUpdatedAt: changeRequestApplications.preChangeUpdatedAt,
        postChangeUpdatedAt: changeRequestApplications.postChangeUpdatedAt,
        createdAt: changeRequestApplications.createdAt,
        appId: applications.id,
        applicationName: applications.name,
        applicationDescription: applications.description,
        applicationSpocId: applications.spocId,
        applicationCreatedAt: applications.createdAt,
        spocId: users.id,
        spocEmail: users.email,
        spocFirstName: users.firstName,
        spocLastName: users.lastName,
        spocProfileImageUrl: users.profileImageUrl,
        spocRole: users.role,
        spocCreatedAt: users.createdAt,
        spocUpdatedAt: users.updatedAt,
      })
      .from(changeRequestApplications)
      .innerJoin(applications, eq(changeRequestApplications.applicationId, applications.id))
      .leftJoin(users, eq(applications.spocId, users.id))
      .where(eq(changeRequestApplications.changeRequestId, changeRequestId))
      .orderBy(asc(applications.name));

    return result.map(row => ({
      id: row.id,
      changeRequestId: row.changeRequestId,
      applicationId: row.applicationId,
      preChangeStatus: row.preChangeStatus,
      postChangeStatus: row.postChangeStatus,
      preChangeComments: row.preChangeComments,
      postChangeComments: row.postChangeComments,
      preChangeAttachments: row.preChangeAttachments,
      postChangeAttachments: row.postChangeAttachments,
      postChangeUpdatedAt: row.postChangeUpdatedAt,
      preChangeUpdatedAt: row.preChangeUpdatedAt,
      createdAt: row.createdAt,
      application: {
        id: row.appId,
        name: row.applicationName,
        description: row.applicationDescription,
        spocId: row.applicationSpocId,
        createdAt: row.applicationCreatedAt,
        spoc: row.spocId ? {
          id: row.spocId,
          email: row.spocEmail,
          firstName: row.spocFirstName,
          lastName: row.spocLastName,
          profileImageUrl: row.spocProfileImageUrl,
          role: row.spocRole || 'application_owner',
          createdAt: row.spocCreatedAt,
          updatedAt: row.spocUpdatedAt,
        } : null,
      },
    }));
  }

  async getChangeRequestApplicationsBySpoc(spocId: string): Promise<(ChangeRequestApplication & {
    changeRequest: ChangeRequest;
    application: Application;
  })[]> {
    return await db
      .select({
        id: changeRequestApplications.id,
        changeRequestId: changeRequestApplications.changeRequestId,
        applicationId: changeRequestApplications.applicationId,
        preChangeStatus: changeRequestApplications.preChangeStatus,
        postChangeStatus: changeRequestApplications.postChangeStatus,
        preChangeComments: changeRequestApplications.preChangeComments,
        postChangeComments: changeRequestApplications.postChangeComments,
        preChangeAttachments: changeRequestApplications.preChangeAttachments,
        postChangeAttachments: changeRequestApplications.postChangeAttachments,
        preChangeUpdatedAt: changeRequestApplications.preChangeUpdatedAt,
        postChangeUpdatedAt: changeRequestApplications.postChangeUpdatedAt,
        createdAt: changeRequestApplications.createdAt,
        changeRequest: {
          id: changeRequests.id,
          changeId: changeRequests.changeId,
          title: changeRequests.title,
          description: changeRequests.description,
          changeType: changeRequests.changeType,
          status: changeRequests.status,
          startDateTime: changeRequests.startDateTime,
          endDateTime: changeRequests.endDateTime,
          changeManagerId: changeRequests.changeManagerId,
          createdAt: changeRequests.createdAt,
          updatedAt: changeRequests.updatedAt,
        },
        application: {
          id: applications.id,
          name: applications.name,
          description: applications.description,
          spocId: applications.spocId,
          createdAt: applications.createdAt,
        },
      })
      .from(changeRequestApplications)
      .innerJoin(changeRequests, eq(changeRequestApplications.changeRequestId, changeRequests.id))
      .innerJoin(applications, eq(changeRequestApplications.applicationId, applications.id))
      .where(eq(applications.spocId, spocId))
      .orderBy(desc(changeRequests.startDateTime));
  }

  async addApplicationsToChangeRequest(changeRequestId: number, applicationIds: number[]): Promise<void> {
    const values = applicationIds.map(applicationId => ({
      changeRequestId,
      applicationId,
    }));
    
    await db.insert(changeRequestApplications).values(values);
  }

  async updateValidationStatus(
    changeRequestId: number,
    applicationId: number,
    spocId: string,
    validation: UpdateValidation
  ): Promise<void> {
    // Verify the user is the SPOC for this application
    const [app] = await db
      .select()
      .from(applications)
      .where(and(eq(applications.id, applicationId), eq(applications.spocId, spocId)));

    if (!app) {
      throw new Error("Unauthorized to update this application");
    }

    const updateData: any = { ...validation };
    
    if (validation.preChangeStatus) {
      updateData.preChangeUpdatedAt = new Date();
    }
    
    if (validation.postChangeStatus) {
      updateData.postChangeUpdatedAt = new Date();
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
  async getChangeManagerStats(managerId: string): Promise<{
    activeRequests: number;
    pendingValidations: number;
    completedToday: number;
    overdue: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [activeRequests] = await db
      .select({ count: count() })
      .from(changeRequests)
      .where(
        and(
          eq(changeRequests.changeManagerId, managerId),
          eq(changeRequests.status, "active")
        )
      );

    const [pendingValidations] = await db
      .select({ count: count() })
      .from(changeRequestApplications)
      .innerJoin(changeRequests, eq(changeRequestApplications.changeRequestId, changeRequests.id))
      .where(
        and(
          eq(changeRequests.changeManagerId, managerId),
          eq(changeRequests.status, "active"),
          or(
            eq(changeRequestApplications.preChangeStatus, "pending"),
            eq(changeRequestApplications.postChangeStatus, "pending")
          )
        )
      );

    const [completedToday] = await db
      .select({ count: count() })
      .from(changeRequestApplications)
      .innerJoin(changeRequests, eq(changeRequestApplications.changeRequestId, changeRequests.id))
      .where(
        and(
          eq(changeRequests.changeManagerId, managerId),
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

    const [overdue] = await db
      .select({ count: count() })
      .from(changeRequestApplications)
      .innerJoin(changeRequests, eq(changeRequestApplications.changeRequestId, changeRequests.id))
      .where(
        and(
          eq(changeRequests.changeManagerId, managerId),
          eq(changeRequests.status, "active"),
          or(
            eq(changeRequestApplications.preChangeStatus, "pending"),
            eq(changeRequestApplications.postChangeStatus, "pending")
          ),
          // Consider overdue if change window has passed
          lt(changeRequests.endDateTime, new Date())
        )
      );

    return {
      activeRequests: activeRequests.count,
      pendingValidations: pendingValidations.count,
      completedToday: completedToday.count,
      overdue: overdue.count,
    };
  }

  async getApplicationOwnerStats(spocId: string): Promise<{
    pending: number;
    completed: number;
    total: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

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
            eq(changeRequestApplications.postChangeStatus, "pending")
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
