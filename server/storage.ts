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
  addApplicationsToChangeRequest(changeRequestId: number, applicationIds: number[]): Promise<void>;
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

  // Additional operations for application owners
  getChangeRequestApplicationsBySpoc(spocId: string): Promise<ChangeRequestApplication[]>;
  updateValidationStatus(
    changeRequestId: number, 
    applicationId: number, 
    spocId: string, 
    validationData: any
  ): Promise<void>;
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
    // First get all change requests
    let query = db
      .select()
      .from(changeRequests);

    // Apply basic filters
    const conditions = [];

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
      query = query.where(and(...conditions)) as any;
    }

    query = query.orderBy(desc(changeRequests.createdAt)) as any;

    const results = await query;
    
    // Get applications for each change request
    const changeRequestsWithApps = await Promise.all(
      results.map(async (cr) => {
        const apps = await this.getChangeRequestApplications(cr.id);
        
        // Apply SPOC filter if needed
        let filteredApps = apps;
        if (filters.spocId) {
          filteredApps = apps.filter(app => app.application.spocId === filters.spocId);
        }
        
        return {
          ...cr,
          applications: filteredApps
        };
      })
    );

    // If SPOC filter is applied, only return change requests that have applications for that SPOC
    if (filters.spocId) {
      return changeRequestsWithApps.filter(cr => cr.applications && cr.applications.length > 0);
    }

    return changeRequestsWithApps;
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

  async addApplicationsToChangeRequest(changeRequestId: number, applicationIds: number[]): Promise<void> {
    const changeRequestApplicationData = applicationIds.map(applicationId => ({
      changeRequestId,
      applicationId,
      preChangeStatus: 'pending' as const,
      postChangeStatus: 'pending' as const,
    }));

    await db
      .insert(changeRequestApplications)
      .values(changeRequestApplicationData);
  }

  async getChangeRequestApplications(changeRequestId: number): Promise<ChangeRequestApplication[]> {
    const results = await db
      .select({
        // Change Request Application fields
        cra_id: changeRequestApplications.id,
        cra_applicationId: changeRequestApplications.applicationId,
        cra_changeRequestId: changeRequestApplications.changeRequestId,
        cra_preChangeStatus: changeRequestApplications.preChangeStatus,
        cra_postChangeStatus: changeRequestApplications.postChangeStatus,
        cra_preChangeComments: changeRequestApplications.preChangeComments,
        cra_postChangeComments: changeRequestApplications.postChangeComments,
        cra_preChangeAttachments: changeRequestApplications.preChangeAttachments,
        cra_postChangeAttachments: changeRequestApplications.postChangeAttachments,
        cra_preChangeUpdatedAt: changeRequestApplications.preChangeUpdatedAt,
        cra_postChangeUpdatedAt: changeRequestApplications.postChangeUpdatedAt,
        cra_createdAt: changeRequestApplications.createdAt,
        // Application fields
        app_id: applications.id,
        app_name: applications.name,
        app_description: applications.description,
        app_spocId: applications.spocId,
        app_createdAt: applications.createdAt,
        // SPOC user fields
        spoc_id: users.id,
        spoc_firstName: users.firstName,
        spoc_lastName: users.lastName,
        spoc_email: users.email,
      })
      .from(changeRequestApplications)
      .innerJoin(applications, eq(changeRequestApplications.applicationId, applications.id))
      .leftJoin(users, eq(applications.spocId, users.id))
      .where(eq(changeRequestApplications.changeRequestId, changeRequestId));

    return results.map((result: any) => ({
      id: result.cra_id,
      applicationId: result.cra_applicationId,
      changeRequestId: result.cra_changeRequestId,
      preChangeStatus: result.cra_preChangeStatus,
      postChangeStatus: result.cra_postChangeStatus,
      preChangeComments: result.cra_preChangeComments,
      postChangeComments: result.cra_postChangeComments,
      preChangeAttachments: result.cra_preChangeAttachments,
      postChangeAttachments: result.cra_postChangeAttachments,
      preChangeUpdatedAt: result.cra_preChangeUpdatedAt,
      postChangeUpdatedAt: result.cra_postChangeUpdatedAt,
      createdAt: result.cra_createdAt,
      application: {
        id: result.app_id,
        name: result.app_name,
        description: result.app_description,
        spocId: result.app_spocId,
        createdAt: result.app_createdAt,
        spoc: result.spoc_id ? {
          id: result.spoc_id,
          firstName: result.spoc_firstName,
          lastName: result.spoc_lastName,
          email: result.spoc_email
        } : null
      }
    }));
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
              sql`DATE(${changeRequestApplications.preChangeUpdatedAt}) = ${today}`
            ),
            and(
              eq(changeRequestApplications.postChangeStatus, "completed"),
              sql`DATE(${changeRequestApplications.postChangeUpdatedAt}) = ${today}`
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

  // Additional operations for application owners
  async getChangeRequestApplicationsBySpoc(spocId: string): Promise<ChangeRequestApplication[]> {
    const results = await db
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
        // Application fields
        app_id: applications.id,
        app_name: applications.name,
        app_description: applications.description,
        app_spocId: applications.spocId,
        app_createdAt: applications.createdAt,
        // Change Request fields
        cr_id: changeRequests.id,
        cr_changeId: changeRequests.changeId,
        cr_title: changeRequests.title,
        cr_description: changeRequests.description,
        cr_changeType: changeRequests.changeType,
        cr_startDateTime: changeRequests.startDateTime,
        cr_endDateTime: changeRequests.endDateTime,
        cr_changeManagerId: changeRequests.changeManagerId,
        // Change Manager fields
        cm_firstName: users.firstName,
        cm_lastName: users.lastName,
        cm_email: users.email,
      })
      .from(changeRequestApplications)
      .innerJoin(applications, eq(changeRequestApplications.applicationId, applications.id))
      .innerJoin(changeRequests, eq(changeRequestApplications.changeRequestId, changeRequests.id))
      .leftJoin(users, eq(changeRequests.changeManagerId, users.id))
      .where(
        and(
          eq(applications.spocId, spocId),
          eq(changeRequests.status, "active")
        )
      );

    return results.map((result: any) => ({
      id: result.id,
      changeRequestId: result.changeRequestId,
      applicationId: result.applicationId,
      preChangeStatus: result.preChangeStatus,
      postChangeStatus: result.postChangeStatus,
      preChangeComments: result.preChangeComments,
      postChangeComments: result.postChangeComments,
      preChangeAttachments: result.preChangeAttachments,
      postChangeAttachments: result.postChangeAttachments,
      preChangeUpdatedAt: result.preChangeUpdatedAt,
      postChangeUpdatedAt: result.postChangeUpdatedAt,
      createdAt: result.createdAt,
      application: {
        id: result.app_id,
        name: result.app_name,
        description: result.app_description,
        spocId: result.app_spocId,
        createdAt: result.app_createdAt,
      },
      changeRequest: {
        id: result.cr_id,
        changeId: result.cr_changeId,
        title: result.cr_title,
        description: result.cr_description,
        changeType: result.cr_changeType,
        startDateTime: result.cr_startDateTime,
        endDateTime: result.cr_endDateTime,
        changeManagerId: result.cr_changeManagerId,
        changeManager: result.cm_firstName ? {
          firstName: result.cm_firstName,
          lastName: result.cm_lastName,
          email: result.cm_email,
        } : null,
      }
    }));
  }

  async updateValidationStatus(
    changeRequestId: number, 
    applicationId: number, 
    spocId: string, 
    validationData: any
  ): Promise<void> {
    // First verify that the user is the SPOC for this application
    const [app] = await db
      .select()
      .from(applications)
      .where(
        and(
          eq(applications.id, applicationId),
          eq(applications.spocId, spocId)
        )
      );

    if (!app) {
      throw new Error("Unauthorized to update this application");
    }

    // Update the validation status
    const updateData: any = {};
    
    if (validationData.type === 'pre') {
      if (validationData.status) updateData.preChangeStatus = validationData.status;
      if (validationData.comments !== undefined) updateData.preChangeComments = validationData.comments;
      updateData.preChangeUpdatedAt = new Date();
    } else if (validationData.type === 'post') {
      if (validationData.status) updateData.postChangeStatus = validationData.status;
      if (validationData.comments !== undefined) updateData.postChangeComments = validationData.comments;
      updateData.postChangeUpdatedAt = new Date();
    }

    // Only update if we have data to set
    if (Object.keys(updateData).length > 0) {
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
  }
}

export const storage = new DatabaseStorage();