import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertChangeRequestSchema, 
  insertApplicationSchema,
  updateValidationSchema,
} from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Application routes
  app.get('/api/applications', isAuthenticated, async (req, res) => {
    try {
      const applications = await storage.getApplications();
      res.json(applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.post('/api/applications', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Only admins can create applications" });
      }

      const validatedData = insertApplicationSchema.parse(req.body);
      const application = await storage.createApplication(validatedData);
      res.json(application);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating application:", error);
      res.status(500).json({ message: "Failed to create application" });
    }
  });

  // Change request routes
  app.get('/api/change-requests', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      const filters: any = {};

      // Apply role-based filtering
      if (user?.role === 'change_manager') {
        filters.managerId = req.user.claims.sub;
      }

      // Apply query filters
      if (req.query.search) filters.search = req.query.search as string;
      if (req.query.type) filters.type = req.query.type as string;
      if (req.query.status) filters.status = req.query.status as string;

      const changeRequests = await storage.getChangeRequests(filters);
      res.json(changeRequests);
    } catch (error) {
      console.error("Error fetching change requests:", error);
      res.status(500).json({ message: "Failed to fetch change requests" });
    }
  });

  app.get('/api/change-requests/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const changeRequest = await storage.getChangeRequestById(id);
      
      if (!changeRequest) {
        return res.status(404).json({ message: "Change request not found" });
      }

      // Check permissions
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role === 'change_manager' && changeRequest.changeManagerId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Access denied" });
      }

      const applications = await storage.getChangeRequestApplications(id);
      res.json({ ...changeRequest, applications });
    } catch (error) {
      console.error("Error fetching change request:", error);
      res.status(500).json({ message: "Failed to fetch change request" });
    }
  });

  app.post('/api/change-requests', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'change_manager') {
        return res.status(403).json({ message: "Only change managers can create change requests" });
      }

      const { applicationIds, ...changeRequestData } = req.body;
      
      // Generate change ID
      const now = new Date();
      const year = now.getFullYear();
      const changeId = `CR-${year}-${String(Date.now()).slice(-6)}`;

      const validatedData = insertChangeRequestSchema.parse({
        ...changeRequestData,
        changeId,
        changeManagerId: req.user.claims.sub,
      });

      const changeRequest = await storage.createChangeRequest(validatedData);

      if (applicationIds && applicationIds.length > 0) {
        await storage.addApplicationsToChangeRequest(changeRequest.id, applicationIds);
      }

      res.json(changeRequest);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating change request:", error);
      res.status(500).json({ message: "Failed to create change request" });
    }
  });

  // Application owner routes
  app.get('/api/my-applications', isAuthenticated, async (req: any, res) => {
    try {
      const spocId = req.user.claims.sub;
      const assignments = await storage.getChangeRequestApplicationsBySpoc(spocId);
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching application assignments:", error);
      res.status(500).json({ message: "Failed to fetch application assignments" });
    }
  });

  app.patch('/api/change-requests/:changeRequestId/applications/:applicationId/validation', 
    isAuthenticated, async (req: any, res) => {
    try {
      const changeRequestId = parseInt(req.params.changeRequestId);
      const applicationId = parseInt(req.params.applicationId);
      const spocId = req.user.claims.sub;

      const validatedData = updateValidationSchema.parse(req.body);
      
      await storage.updateValidationStatus(changeRequestId, applicationId, spocId, validatedData);
      
      res.json({ message: "Validation status updated successfully" });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      if (error instanceof Error && error.message === "Unauthorized to update this application") {
        return res.status(403).json({ message: error.message });
      }
      console.error("Error updating validation status:", error);
      res.status(500).json({ message: "Failed to update validation status" });
    }
  });

  // Stats routes
  app.get('/api/stats/change-manager', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'change_manager') {
        return res.status(403).json({ message: "Access denied" });
      }

      const stats = await storage.getChangeManagerStats(req.user.claims.sub);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching change manager stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get('/api/stats/application-owner', isAuthenticated, async (req: any, res) => {
    try {
      const stats = await storage.getApplicationOwnerStats(req.user.claims.sub);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching application owner stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
