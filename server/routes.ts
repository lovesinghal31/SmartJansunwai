import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertComplaintSchema, insertComplaintUpdateSchema, insertFeedbackSchema } from "@shared/schema";
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

  const httpServer = createServer(app);
  return httpServer;
}
