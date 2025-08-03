import { type User, type InsertUser, type Complaint, type InsertComplaint, type ComplaintUpdate, type InsertComplaintUpdate, type Feedback, type InsertFeedback } from "@shared/schema";
import { randomUUID } from "crypto";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Complaint methods
  getComplaint(id: string): Promise<Complaint | undefined>;
  getComplaintsByUser(citizenId: string): Promise<Complaint[]>;
  getComplaintsByStatus(status: string): Promise<Complaint[]>;
  getAllComplaints(): Promise<Complaint[]>;
  createComplaint(complaint: InsertComplaint & { citizenId: string }): Promise<Complaint>;
  updateComplaint(id: string, updates: Partial<Complaint>): Promise<Complaint | undefined>;
  
  // Complaint update methods
  getComplaintUpdates(complaintId: string): Promise<ComplaintUpdate[]>;
  createComplaintUpdate(update: InsertComplaintUpdate & { officialId?: string }): Promise<ComplaintUpdate>;
  
  // Feedback methods
  getFeedbackByComplaint(complaintId: string): Promise<Feedback | undefined>;
  createFeedback(feedback: InsertFeedback & { citizenId: string }): Promise<Feedback>;
  
  // Analytics methods
  getComplaintStats(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byCategory: Record<string, number>;
    byPriority: Record<string, number>;
  }>;
  
  sessionStore: any;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private complaints: Map<string, Complaint>;
  private complaintUpdates: Map<string, ComplaintUpdate[]>;
  private feedbacks: Map<string, Feedback>;
  public sessionStore: any;

  constructor() {
    this.users = new Map();
    this.complaints = new Map();
    this.complaintUpdates = new Map();
    this.feedbacks = new Map();
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser,
      role: insertUser.role || "citizen",
      department: insertUser.department || null,
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async getComplaint(id: string): Promise<Complaint | undefined> {
    return this.complaints.get(id);
  }

  async getComplaintsByUser(citizenId: string): Promise<Complaint[]> {
    return Array.from(this.complaints.values()).filter(
      (complaint) => complaint.citizenId === citizenId
    );
  }

  async getComplaintsByStatus(status: string): Promise<Complaint[]> {
    return Array.from(this.complaints.values()).filter(
      (complaint) => complaint.status === status
    );
  }

  async getAllComplaints(): Promise<Complaint[]> {
    return Array.from(this.complaints.values());
  }

  async createComplaint(complaintData: InsertComplaint & { citizenId: string }): Promise<Complaint> {
    const id = randomUUID();
    const complaint: Complaint = {
      ...complaintData,
      id,
      status: "submitted",
      priority: complaintData.priority || "medium",
      attachments: null,
      assignedTo: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.complaints.set(id, complaint);
    return complaint;
  }

  async updateComplaint(id: string, updates: Partial<Complaint>): Promise<Complaint | undefined> {
    const complaint = this.complaints.get(id);
    if (!complaint) return undefined;
    
    const updatedComplaint = {
      ...complaint,
      ...updates,
      updatedAt: new Date(),
    };
    this.complaints.set(id, updatedComplaint);
    return updatedComplaint;
  }

  async getComplaintUpdates(complaintId: string): Promise<ComplaintUpdate[]> {
    return this.complaintUpdates.get(complaintId) || [];
  }

  async createComplaintUpdate(updateData: InsertComplaintUpdate & { officialId?: string }): Promise<ComplaintUpdate> {
    const id = randomUUID();
    const update: ComplaintUpdate = {
      ...updateData,
      id,
      officialId: updateData.officialId || null,
      createdAt: new Date(),
    };
    
    const existing = this.complaintUpdates.get(updateData.complaintId) || [];
    existing.push(update);
    this.complaintUpdates.set(updateData.complaintId, existing);
    
    return update;
  }

  async getFeedbackByComplaint(complaintId: string): Promise<Feedback | undefined> {
    return Array.from(this.feedbacks.values()).find(
      (feedback) => feedback.complaintId === complaintId
    );
  }

  async createFeedback(feedbackData: InsertFeedback & { citizenId: string }): Promise<Feedback> {
    const id = randomUUID();
    const feedback: Feedback = {
      ...feedbackData,
      id,
      createdAt: new Date(),
    };
    this.feedbacks.set(id, feedback);
    return feedback;
  }

  async getComplaintStats(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byCategory: Record<string, number>;
    byPriority: Record<string, number>;
  }> {
    const complaints = Array.from(this.complaints.values());
    
    const byStatus: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    const byPriority: Record<string, number> = {};
    
    complaints.forEach(complaint => {
      byStatus[complaint.status] = (byStatus[complaint.status] || 0) + 1;
      byCategory[complaint.category] = (byCategory[complaint.category] || 0) + 1;
      byPriority[complaint.priority] = (byPriority[complaint.priority] || 0) + 1;
    });
    
    return {
      total: complaints.length,
      byStatus,
      byCategory,
      byPriority,
    };
  }
}

export const storage = new MemStorage();
