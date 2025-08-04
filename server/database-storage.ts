import { 
  users, complaints, complaintUpdates, feedback, serviceFeedback, departments, 
  slaSettings, notifications, auditLogs,
  type User, type InsertUser, type Complaint, type InsertComplaint, 
  type ComplaintUpdate, type InsertComplaintUpdate, type Feedback, type InsertFeedback,
  type ServiceFeedback, type InsertServiceFeedback, type Department, type InsertDepartment,
  type SlaSettings, type InsertSlaSettings, type Notification, type InsertNotification,
  type AuditLog, type InsertAuditLog
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import { type IStorage } from "./storage";
import session from "express-session";
import ConnectPgSimple from "connect-pg-simple";
import { pool } from "./db";

const PgSession = ConnectPgSimple(session);

export class DatabaseStorage implements IStorage {
  public sessionStore: any;

  constructor() {
    this.sessionStore = new PgSession({
      pool: pool,
      tableName: 'session',
      createTableIfMissing: true
    });

    // Initialize default data
    this.initializeDefaultData();
  }

  private async initializeDefaultData() {
    try {
      // Check if admin user exists
      const existingAdmin = await db.select().from(users).where(eq(users.username, "admin")).limit(1);
      
      if (existingAdmin.length === 0) {
        // Create admin user
        await db.insert(users).values({
          username: "admin",
          password: "$2a$10$8K9hYRkBe.8uf4g5eFjPJ.v7wGLKqZKrz4Ucp4YLjQ2eVqz9sFOFK", // password: admin123
          role: "admin",
          email: "admin@indore.gov.in",
          phone: "+91 9876543210",
          fullName: "System Administrator",
          address: "Indore Municipal Corporation",
          preferredLanguage: "en",
        });
        console.log("Admin user created: admin");
      }

      // Initialize default departments if none exist
      const existingDepartments = await db.select().from(departments).limit(1);
      
      if (existingDepartments.length === 0) {
        const defaultDepartments = [
          { name: "Water Supply & Sewerage", description: "Water supply, sewerage, and drainage issues", slaHours: 48 },
          { name: "Roads & Transportation", description: "Road repairs, traffic signals, and transportation", slaHours: 72 },
          { name: "Electricity", description: "Power supply and electrical infrastructure", slaHours: 24 },
          { name: "Sanitation", description: "Waste management and cleanliness", slaHours: 48 },
          { name: "Street Lighting", description: "Street lights and public lighting", slaHours: 24 },
          { name: "Parks & Recreation", description: "Parks, gardens, and recreational facilities", slaHours: 96 },
        ];

        for (const dept of defaultDepartments) {
          await db.insert(departments).values(dept);
        }
        console.log("Default departments created");
      }
    } catch (error) {
      console.error("Error initializing default data:", error);
    }
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [created] = await db.insert(users).values(user).returning();
    return created;
  }

  // Complaint methods
  async getComplaint(id: string): Promise<Complaint | undefined> {
    const [complaint] = await db.select().from(complaints).where(eq(complaints.id, id));
    return complaint;
  }

  async getComplaintsByUser(citizenId: string): Promise<Complaint[]> {
    return db.select().from(complaints).where(eq(complaints.citizenId, citizenId)).orderBy(desc(complaints.createdAt));
  }

  async getComplaintsByStatus(status: string): Promise<Complaint[]> {
    return db.select().from(complaints).where(eq(complaints.status, status)).orderBy(desc(complaints.createdAt));
  }

  async getAllComplaints(): Promise<Complaint[]> {
    return db.select().from(complaints).orderBy(desc(complaints.createdAt));
  }

  async createComplaint(complaintData: InsertComplaint & { citizenId: string }): Promise<Complaint> {
    const [complaint] = await db.insert(complaints).values(complaintData).returning();
    return complaint;
  }

  async updateComplaint(id: string, updates: Partial<Complaint>): Promise<Complaint | undefined> {
    const [updated] = await db.update(complaints)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(complaints.id, id))
      .returning();
    return updated;
  }

  // Complaint update methods
  async getComplaintUpdates(complaintId: string): Promise<ComplaintUpdate[]> {
    return db.select().from(complaintUpdates)
      .where(eq(complaintUpdates.complaintId, complaintId))
      .orderBy(desc(complaintUpdates.createdAt));
  }

  async createComplaintUpdate(updateData: InsertComplaintUpdate & { officialId?: string }): Promise<ComplaintUpdate> {
    const [update] = await db.insert(complaintUpdates).values(updateData).returning();
    return update;
  }

  // Feedback methods
  async getFeedbackByComplaint(complaintId: string): Promise<Feedback | undefined> {
    const [feedbackItem] = await db.select().from(feedback).where(eq(feedback.complaintId, complaintId));
    return feedbackItem;
  }

  async getAllFeedback(): Promise<Feedback[]> {
    return db.select().from(feedback).orderBy(desc(feedback.createdAt));
  }

  async createFeedback(feedbackData: InsertFeedback & { citizenId: string }): Promise<Feedback> {
    const [created] = await db.insert(feedback).values(feedbackData).returning();
    return created;
  }

  // Service Feedback methods
  async getAllServiceFeedback(): Promise<ServiceFeedback[]> {
    return db.select().from(serviceFeedback).orderBy(desc(serviceFeedback.createdAt));
  }

  async getServiceFeedbackByCategory(category: string): Promise<ServiceFeedback[]> {
    return db.select().from(serviceFeedback)
      .where(eq(serviceFeedback.serviceCategory, category))
      .orderBy(desc(serviceFeedback.createdAt));
  }

  async getServiceFeedbackByUser(citizenId: string): Promise<ServiceFeedback[]> {
    return db.select().from(serviceFeedback)
      .where(eq(serviceFeedback.citizenId, citizenId))
      .orderBy(desc(serviceFeedback.createdAt));
  }

  async createServiceFeedback(feedbackData: InsertServiceFeedback & { citizenId: string }): Promise<ServiceFeedback> {
    const [created] = await db.insert(serviceFeedback).values(feedbackData).returning();
    return created;
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
    const feedbacks = await db.select().from(serviceFeedback);
    
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

  // Analytics methods
  async getComplaintStats(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byCategory: Record<string, number>;
    byPriority: Record<string, number>;
  }> {
    const allComplaints = await db.select().from(complaints);
    
    const byStatus: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    const byPriority: Record<string, number> = {};
    
    allComplaints.forEach(complaint => {
      byStatus[complaint.status] = (byStatus[complaint.status] || 0) + 1;
      byCategory[complaint.category] = (byCategory[complaint.category] || 0) + 1;
      byPriority[complaint.priority] = (byPriority[complaint.priority] || 0) + 1;
    });
    
    return {
      total: allComplaints.length,
      byStatus,
      byCategory,
      byPriority,
    };
  }

  // Department methods
  async getAllDepartments(): Promise<Department[]> {
    return db.select().from(departments).orderBy(departments.name);
  }

  async getDepartment(id: string): Promise<Department | undefined> {
    const [department] = await db.select().from(departments).where(eq(departments.id, id));
    return department;
  }

  async createDepartment(departmentData: InsertDepartment): Promise<Department> {
    const [created] = await db.insert(departments).values(departmentData).returning();
    return created;
  }

  async updateDepartment(id: string, updates: Partial<Department>): Promise<Department | undefined> {
    const [updated] = await db.update(departments)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(departments.id, id))
      .returning();
    return updated;
  }

  async deleteDepartment(id: string): Promise<boolean> {
    const result = await db.delete(departments).where(eq(departments.id, id));
    return (result.rowCount || 0) > 0;
  }

  // SLA Settings methods
  async getSlaSettings(departmentId?: string): Promise<SlaSettings[]> {
    if (departmentId) {
      return db.select().from(slaSettings).where(eq(slaSettings.departmentId, departmentId));
    }
    return db.select().from(slaSettings);
  }

  async createSlaSettings(slaData: InsertSlaSettings): Promise<SlaSettings> {
    const [created] = await db.insert(slaSettings).values(slaData).returning();
    return created;
  }

  async updateSlaSettings(id: string, updates: Partial<SlaSettings>): Promise<SlaSettings | undefined> {
    const [updated] = await db.update(slaSettings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(slaSettings.id, id))
      .returning();
    return updated;
  }

  async deleteSlaSettings(id: string): Promise<boolean> {
    const result = await db.delete(slaSettings).where(eq(slaSettings.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Notification methods
  async getNotifications(userId: string): Promise<Notification[]> {
    return db.select().from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async getUnreadNotifications(userId: string): Promise<Notification[]> {
    return db.select().from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const [created] = await db.insert(notifications).values(notificationData).returning();
    return created;
  }

  async markNotificationRead(id: string): Promise<boolean> {
    const result = await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id));
    return (result.rowCount || 0) > 0;
  }

  async deleteNotification(id: string): Promise<boolean> {
    const result = await db.delete(notifications).where(eq(notifications.id, id));
    return (result.rowCount || 0) > 0;
  }

  // User management methods
  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(users.createdAt);
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return db.select().from(users).where(eq(users.role, role));
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const [updated] = await db.update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return updated;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Audit log methods
  async getAuditLogs(userId?: string): Promise<AuditLog[]> {
    if (userId) {
      return db.select().from(auditLogs)
        .where(eq(auditLogs.userId, userId))
        .orderBy(desc(auditLogs.createdAt));
    }
    return db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt));
  }

  async createAuditLog(logData: InsertAuditLog): Promise<AuditLog> {
    const [created] = await db.insert(auditLogs).values(logData).returning();
    return created;
  }
}