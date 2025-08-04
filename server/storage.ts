import { type User, type InsertUser, type Complaint, type InsertComplaint, type ComplaintUpdate, type InsertComplaintUpdate, type Feedback, type InsertFeedback, type ServiceFeedback, type InsertServiceFeedback, type Department, type InsertDepartment, type SlaSettings, type InsertSlaSettings, type Notification, type InsertNotification, type AuditLog, type InsertAuditLog } from "@shared/schema";
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
  getAllFeedback(): Promise<Feedback[]>;
  createFeedback(feedback: InsertFeedback & { citizenId: string }): Promise<Feedback>;
  
  // Service Feedback methods
  getAllServiceFeedback(): Promise<ServiceFeedback[]>;
  getServiceFeedbackByCategory(category: string): Promise<ServiceFeedback[]>;
  getServiceFeedbackByUser(citizenId: string): Promise<ServiceFeedback[]>;
  createServiceFeedback(feedback: InsertServiceFeedback & { citizenId: string }): Promise<ServiceFeedback>;
  getServiceFeedbackStats(): Promise<{
    totalResponses: number;
    averageRatings: {
      overall: number;
      serviceQuality: number;
      responseTime: number;
      staffBehavior: number;
      accessibility: number;
    };
    byCategory: Record<string, number>;
    recommendationRate: number;
  }>;
  
  // Analytics methods
  getComplaintStats(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byCategory: Record<string, number>;
    byPriority: Record<string, number>;
  }>;

  // Department methods
  getAllDepartments(): Promise<Department[]>;
  getDepartment(id: string): Promise<Department | undefined>;
  createDepartment(department: InsertDepartment): Promise<Department>;
  updateDepartment(id: string, updates: Partial<Department>): Promise<Department | undefined>;
  deleteDepartment(id: string): Promise<boolean>;

  // SLA Settings methods
  getSlaSettings(departmentId?: string): Promise<SlaSettings[]>;
  createSlaSettings(sla: InsertSlaSettings): Promise<SlaSettings>;
  updateSlaSettings(id: string, updates: Partial<SlaSettings>): Promise<SlaSettings | undefined>;
  deleteSlaSettings(id: string): Promise<boolean>;

  // Notification methods
  getNotifications(userId: string): Promise<Notification[]>;
  getUnreadNotifications(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationRead(id: string): Promise<boolean>;
  deleteNotification(id: string): Promise<boolean>;

  // User management methods
  getAllUsers(): Promise<User[]>;
  getUsersByRole(role: string): Promise<User[]>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;

  // Audit log methods
  getAuditLogs(userId?: string): Promise<AuditLog[]>;
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  
  sessionStore: any;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private complaints: Map<string, Complaint>;
  private complaintUpdates: Map<string, ComplaintUpdate[]>;
  private feedbacks: Map<string, Feedback>;
  private serviceFeedbacks: Map<string, ServiceFeedback>;
  private departments: Map<string, Department>;
  private slaSettings: Map<string, SlaSettings>;
  private notifications: Map<string, Notification>;
  private auditLogs: Map<string, AuditLog>;
  public sessionStore: any;

  constructor() {
    this.users = new Map();
    this.complaints = new Map();
    this.complaintUpdates = new Map();
    this.feedbacks = new Map();
    this.serviceFeedbacks = new Map();
    this.departments = new Map();
    this.slaSettings = new Map();
    this.notifications = new Map();
    this.auditLogs = new Map();
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });

    // Initialize with default data
    this.initializeDefaultData();
  }

  private async initializeDefaultData() {
    // Initialize default departments
    const defaultDepartments = [
      { name: "Water Supply & Sewerage", description: "Water supply, sewerage, and drainage issues", slaHours: 48 },
      { name: "Roads & Transportation", description: "Road repairs, traffic signals, and transportation", slaHours: 72 },
      { name: "Electricity", description: "Power supply and electrical infrastructure", slaHours: 24 },
      { name: "Sanitation", description: "Waste management and cleanliness", slaHours: 48 },
      { name: "Street Lighting", description: "Street lights and public lighting", slaHours: 24 },
      { name: "Parks & Recreation", description: "Parks, gardens, and recreational facilities", slaHours: 96 },
    ];

    for (const dept of defaultDepartments) {
      await this.createDepartment(dept);
    }

    // Initialize default admin user
    try {
      const adminUser = await this.createUser({
        username: "admin",
        password: "$2a$10$8K9hYRkBe.8uf4g5eFjPJ.v7wGLKqZKrz4Ucp4YLjQ2eVqz9sFOFK", // password: admin123
        role: "admin",
        email: "admin@indore.gov.in",
        phone: "+91 9876543210",
        fullName: "System Administrator",
        address: "Indore Municipal Corporation",
        preferredLanguage: "en",
        department: null,
      });
      console.log("Admin user created:", adminUser.username);
    } catch (error) {
      console.log("Admin user may already exist");
    }
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

  async getAllFeedback(): Promise<Feedback[]> {
    return Array.from(this.feedbacks.values());
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

  // Department methods
  async getAllDepartments(): Promise<Department[]> {
    return Array.from(this.departments.values());
  }

  async getDepartment(id: string): Promise<Department | undefined> {
    return this.departments.get(id);
  }

  async createDepartment(departmentData: InsertDepartment): Promise<Department> {
    const id = randomUUID();
    const department: Department = {
      ...departmentData,
      id,
      headOfficialId: departmentData.headOfficialId || null,
      contactEmail: departmentData.contactEmail || null,
      contactPhone: departmentData.contactPhone || null,
      slaHours: departmentData.slaHours || 72,
      isActive: departmentData.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.departments.set(id, department);
    return department;
  }

  async updateDepartment(id: string, updates: Partial<Department>): Promise<Department | undefined> {
    const department = this.departments.get(id);
    if (!department) return undefined;
    
    const updated = { ...department, ...updates, updatedAt: new Date() };
    this.departments.set(id, updated);
    return updated;
  }

  async deleteDepartment(id: string): Promise<boolean> {
    return this.departments.delete(id);
  }

  // SLA Settings methods
  async getSlaSettings(departmentId?: string): Promise<SlaSettings[]> {
    const settings = Array.from(this.slaSettings.values());
    return departmentId ? settings.filter(s => s.departmentId === departmentId) : settings;
  }

  async createSlaSettings(slaData: InsertSlaSettings): Promise<SlaSettings> {
    const id = randomUUID();
    const sla: SlaSettings = {
      ...slaData,
      id,
      escalationLevels: slaData.escalationLevels || 3,
      isActive: slaData.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.slaSettings.set(id, sla);
    return sla;
  }

  async updateSlaSettings(id: string, updates: Partial<SlaSettings>): Promise<SlaSettings | undefined> {
    const sla = this.slaSettings.get(id);
    if (!sla) return undefined;
    
    const updated = { ...sla, ...updates, updatedAt: new Date() };
    this.slaSettings.set(id, updated);
    return updated;
  }

  async deleteSlaSettings(id: string): Promise<boolean> {
    return this.slaSettings.delete(id);
  }

  // Notification methods
  async getNotifications(userId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values()).filter(n => n.userId === userId);
  }

  async getUnreadNotifications(userId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values()).filter(n => n.userId === userId && !n.isRead);
  }

  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const id = randomUUID();
    const notification: Notification = {
      ...notificationData,
      id,
      isRead: false,
      actionUrl: notificationData.actionUrl || null,
      metadata: notificationData.metadata || null,
      expiresAt: notificationData.expiresAt || null,
      createdAt: new Date(),
    };
    this.notifications.set(id, notification);
    return notification;
  }

  async markNotificationRead(id: string): Promise<boolean> {
    const notification = this.notifications.get(id);
    if (!notification) return false;
    
    notification.isRead = true;
    this.notifications.set(id, notification);
    return true;
  }

  async deleteNotification(id: string): Promise<boolean> {
    return this.notifications.delete(id);
  }

  // User management methods
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(u => u.role === role);
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updated = { ...user, ...updates };
    this.users.set(id, updated);
    return updated;
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  // Audit log methods
  async getAuditLogs(userId?: string): Promise<AuditLog[]> {
    const logs = Array.from(this.auditLogs.values());
    return userId ? logs.filter(l => l.userId === userId) : logs;
  }

  async createAuditLog(logData: InsertAuditLog): Promise<AuditLog> {
    const id = randomUUID();
    const log: AuditLog = {
      ...logData,
      id,
      resourceId: logData.resourceId || null,
      oldValues: logData.oldValues || null,
      newValues: logData.newValues || null,
      ipAddress: logData.ipAddress || null,
      userAgent: logData.userAgent || null,
      createdAt: new Date(),
    };
    this.auditLogs.set(id, log);
    return log;
  }

  // Service Feedback methods
  async getAllServiceFeedback(): Promise<ServiceFeedback[]> {
    return Array.from(this.serviceFeedbacks.values());
  }

  async getServiceFeedbackByCategory(category: string): Promise<ServiceFeedback[]> {
    return Array.from(this.serviceFeedbacks.values()).filter(
      (feedback) => feedback.serviceCategory === category
    );
  }

  async getServiceFeedbackByUser(citizenId: string): Promise<ServiceFeedback[]> {
    return Array.from(this.serviceFeedbacks.values()).filter(
      (feedback) => feedback.citizenId === citizenId
    );
  }

  async createServiceFeedback(feedbackData: InsertServiceFeedback & { citizenId: string }): Promise<ServiceFeedback> {
    const id = randomUUID();
    const feedback: ServiceFeedback = {
      ...feedbackData,
      id,
      createdAt: new Date(),
    };
    this.serviceFeedbacks.set(id, feedback);
    return feedback;
  }

  async getServiceFeedbackStats(): Promise<{
    totalResponses: number;
    averageRatings: {
      overall: number;
      serviceQuality: number;
      responseTime: number;
      staffBehavior: number;
      accessibility: number;
    };
    byCategory: Record<string, number>;
    recommendationRate: number;
  }> {
    const feedbacks = Array.from(this.serviceFeedbacks.values());
    
    if (feedbacks.length === 0) {
      return {
        totalResponses: 0,
        averageRatings: {
          overall: 0,
          serviceQuality: 0,
          responseTime: 0,
          staffBehavior: 0,
          accessibility: 0,
        },
        byCategory: {},
        recommendationRate: 0,
      };
    }

    const totalResponses = feedbacks.length;
    
    // Calculate average ratings
    const sumRatings = feedbacks.reduce((acc, feedback) => ({
      overall: acc.overall + feedback.overallRating,
      serviceQuality: acc.serviceQuality + feedback.serviceQualityRating,
      responseTime: acc.responseTime + feedback.responseTimeRating,
      staffBehavior: acc.staffBehavior + feedback.staffBehaviorRating,
      accessibility: acc.accessibility + feedback.accessibilityRating,
    }), {
      overall: 0,
      serviceQuality: 0,
      responseTime: 0,
      staffBehavior: 0,
      accessibility: 0,
    });

    const averageRatings = {
      overall: sumRatings.overall / totalResponses,
      serviceQuality: sumRatings.serviceQuality / totalResponses,
      responseTime: sumRatings.responseTime / totalResponses,
      staffBehavior: sumRatings.staffBehavior / totalResponses,
      accessibility: sumRatings.accessibility / totalResponses,
    };

    // Count by category
    const byCategory: Record<string, number> = {};
    feedbacks.forEach(feedback => {
      byCategory[feedback.serviceCategory] = (byCategory[feedback.serviceCategory] || 0) + 1;
    });

    // Calculate recommendation rate
    const recommendCount = feedbacks.filter(f => f.wouldRecommend).length;
    const recommendationRate = (recommendCount / totalResponses) * 100;

    return {
      totalResponses,
      averageRatings,
      byCategory,
      recommendationRate,
    };
  }
}

// Keep the MemStorage as the current storage implementation
// If you want to switch to database storage, uncomment the lines below
// import { DatabaseStorage } from "./database-storage";
// export const storage = new DatabaseStorage();

export const storage = new MemStorage();
