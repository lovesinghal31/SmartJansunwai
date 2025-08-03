import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertComplaintSchema, insertComplaintUpdateSchema, insertFeedbackSchema, insertDepartmentSchema, insertSlaSettingsSchema, insertNotificationSchema } from "@shared/schema";
import { z } from "zod";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Complaint routes
  app.get("/api/complaints", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      let complaints;
      if (req.user!.role === "citizen") {
        complaints = await storage.getComplaintsByUser(req.user!.id);
      } else {
        complaints = await storage.getAllComplaints();
      }
      res.json(complaints);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch complaints" });
    }
  });

  app.get("/api/complaints/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const complaint = await storage.getComplaint(req.params.id);
      if (!complaint) return res.status(404).json({ message: "Complaint not found" });
      
      // Citizens can only view their own complaints
      if (req.user!.role === "citizen" && complaint.citizenId !== req.user!.id) {
        return res.sendStatus(403);
      }
      
      res.json(complaint);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch complaint" });
    }
  });

  app.post("/api/complaints", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user!.role !== "citizen") return res.sendStatus(403);
    
    try {
      const validatedData = insertComplaintSchema.parse(req.body);
      const complaint = await storage.createComplaint({
        ...validatedData,
        citizenId: req.user!.id,
      });
      res.status(201).json(complaint);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid complaint data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create complaint" });
      }
    }
  });

  app.patch("/api/complaints/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user!.role !== "official") return res.sendStatus(403);
    
    try {
      const complaint = await storage.updateComplaint(req.params.id, req.body);
      if (!complaint) return res.status(404).json({ message: "Complaint not found" });
      
      res.json(complaint);
    } catch (error) {
      res.status(500).json({ message: "Failed to update complaint" });
    }
  });

  // Complaint updates routes
  app.get("/api/complaints/:id/updates", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const updates = await storage.getComplaintUpdates(req.params.id);
      res.json(updates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch complaint updates" });
    }
  });

  app.post("/api/complaints/:id/updates", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user!.role !== "official") return res.sendStatus(403);
    
    try {
      const validatedData = insertComplaintUpdateSchema.parse({
        ...req.body,
        complaintId: req.params.id,
      });
      
      const update = await storage.createComplaintUpdate({
        ...validatedData,
        officialId: req.user!.id,
      });
      
      res.status(201).json(update);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid update data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create update" });
      }
    }
  });

  // Feedback routes
  app.get("/api/complaints/:id/feedback", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const feedback = await storage.getFeedbackByComplaint(req.params.id);
      res.json(feedback);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch feedback" });
    }
  });

  app.post("/api/complaints/:id/feedback", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user!.role !== "citizen") return res.sendStatus(403);
    
    try {
      const validatedData = insertFeedbackSchema.parse({
        ...req.body,
        complaintId: req.params.id,
      });
      
      const feedback = await storage.createFeedback({
        ...validatedData,
        citizenId: req.user!.id,
      });
      
      res.status(201).json(feedback);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid feedback data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create feedback" });
      }
    }
  });

  // Get all feedback (for officials)
  app.get("/api/feedback/all", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user!.role !== "official" && req.user!.role !== "admin") return res.sendStatus(403);
    
    try {
      const allFeedback = await storage.getAllFeedback();
      res.json(allFeedback);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch all feedback" });
    }
  });

  // Analytics routes
  app.get("/api/analytics/stats", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user!.role !== "official") return res.sendStatus(403);
    
    try {
      const stats = await storage.getComplaintStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Department management routes (Admin only)
  app.get("/api/admin/departments", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") {
      return res.sendStatus(401);
    }

    try {
      const departments = await storage.getAllDepartments();
      res.json(departments);
    } catch (error) {
      res.status(500).json({ error: "Failed to get departments" });
    }
  });

  app.post("/api/admin/departments", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") {
      return res.sendStatus(401);
    }

    try {
      const result = insertDepartmentSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.issues });
      }

      const department = await storage.createDepartment(result.data);
      await storage.createAuditLog({
        userId: req.user.id,
        action: "CREATE_DEPARTMENT",
        resource: "department",
        resourceId: department.id,
        newValues: JSON.stringify(department),
      });
      res.status(201).json(department);
    } catch (error) {
      res.status(500).json({ error: "Failed to create department" });
    }
  });

  app.put("/api/admin/departments/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") {
      return res.sendStatus(401);
    }

    try {
      const oldDepartment = await storage.getDepartment(req.params.id);
      const updated = await storage.updateDepartment(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Department not found" });
      }

      await storage.createAuditLog({
        userId: req.user.id,
        action: "UPDATE_DEPARTMENT",
        resource: "department",
        resourceId: updated.id,
        oldValues: JSON.stringify(oldDepartment),
        newValues: JSON.stringify(updated),
      });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update department" });
    }
  });

  app.delete("/api/admin/departments/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") {
      return res.sendStatus(401);
    }

    try {
      const department = await storage.getDepartment(req.params.id);
      const success = await storage.deleteDepartment(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Department not found" });
      }

      await storage.createAuditLog({
        userId: req.user.id,
        action: "DELETE_DEPARTMENT",
        resource: "department",
        resourceId: req.params.id,
        oldValues: JSON.stringify(department),
      });
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ error: "Failed to delete department" });
    }
  });

  // SLA Settings routes (Admin only)
  app.get("/api/admin/sla-settings", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") {
      return res.sendStatus(401);
    }

    try {
      const departmentId = req.query.departmentId as string;
      const settings = await storage.getSlaSettings(departmentId);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to get SLA settings" });
    }
  });

  app.post("/api/admin/sla-settings", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") {
      return res.sendStatus(401);
    }

    try {
      const result = insertSlaSettingsSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.issues });
      }

      const sla = await storage.createSlaSettings(result.data);
      await storage.createAuditLog({
        userId: req.user.id,
        action: "CREATE_SLA_SETTINGS",
        resource: "sla_settings",
        resourceId: sla.id,
        newValues: JSON.stringify(sla),
      });
      res.status(201).json(sla);
    } catch (error) {
      res.status(500).json({ error: "Failed to create SLA settings" });
    }
  });

  // User management routes (Admin only)
  app.get("/api/admin/users", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") {
      return res.sendStatus(401);
    }

    try {
      const role = req.query.role as string;
      const users = role ? await storage.getUsersByRole(role) : await storage.getAllUsers();
      // Remove password from response
      const safeUsers = users.map(({ password, ...user }) => user);
      res.json(safeUsers);
    } catch (error) {
      res.status(500).json({ error: "Failed to get users" });
    }
  });

  app.put("/api/admin/users/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") {
      return res.sendStatus(401);
    }

    try {
      const { password, ...updates } = req.body;
      const oldUser = await storage.getUser(req.params.id);
      const updated = await storage.updateUser(req.params.id, updates);
      if (!updated) {
        return res.status(404).json({ error: "User not found" });
      }

      await storage.createAuditLog({
        userId: req.user.id,
        action: "UPDATE_USER",
        resource: "user",
        resourceId: updated.id,
        oldValues: JSON.stringify({ ...oldUser, password: "[REDACTED]" }),
        newValues: JSON.stringify({ ...updated, password: "[REDACTED]" }),
      });
      
      const { password: _, ...safeUser } = updated;
      res.json(safeUser);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  // Notification routes
  app.get("/api/notifications", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const notifications = await storage.getNotifications(req.user.id);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ error: "Failed to get notifications" });
    }
  });

  app.post("/api/admin/notifications", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") {
      return res.sendStatus(401);
    }

    try {
      const result = insertNotificationSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.issues });
      }

      const notification = await storage.createNotification(result.data);
      res.status(201).json(notification);
    } catch (error) {
      res.status(500).json({ error: "Failed to create notification" });
    }
  });

  app.put("/api/notifications/:id/read", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const success = await storage.markNotificationRead(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Notification not found" });
      }
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ error: "Failed to mark notification as read" });
    }
  });

  // Audit logs (Admin only)
  app.get("/api/admin/audit-logs", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") {
      return res.sendStatus(401);
    }

    try {
      const userId = req.query.userId as string;
      const logs = await storage.getAuditLogs(userId);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to get audit logs" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
