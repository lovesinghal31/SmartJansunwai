import { type User, type InsertUser, type Complaint, type InsertComplaint, type ComplaintUpdate, type InsertComplaintUpdate, type Feedback, type InsertFeedback, type Department, type InsertDepartment, type SlaSettings, type InsertSlaSettings, type Notification, type InsertNotification, type AuditLog, type InsertAuditLog } from "@shared/schema";
import { randomUUID } from "crypto";
import session from "express-session";
import createMemoryStore from "memorystore";
import UserModel from "./models/user.model.js";
import { MongoClient, Db, Collection } from "mongodb";
import { connectToDatabase } from "./db";

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

export class MongoStorage implements IStorage {
  private db: Db | null = null;
  public sessionStore: any;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
    this.initializeDatabase();
  }

  private async initializeDatabase() {
    try {
      this.db = await connectToDatabase();
      await this.initializeDefaultData();
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
    }
  }

  private async ensureConnection(): Promise<Db> {
    if (!this.db) {
      this.db = await connectToDatabase();
    }
    return this.db;
  }

  private async initializeDefaultData() {
    try {
      const db = await this.ensureConnection();
      
      // Initialize default departments
      const departments = await db.collection('departments').countDocuments();
      if (departments === 0) {
        const defaultDepartments = [
          { name: "Water Supply & Sewerage", description: "Water supply, sewerage, and drainage issues", slaHours: 48, isActive: true },
          { name: "Roads & Transportation", description: "Road repairs, traffic signals, and transportation", slaHours: 72, isActive: true },
          { name: "Electricity", description: "Power supply and electrical infrastructure", slaHours: 24, isActive: true },
          { name: "Sanitation", description: "Waste management and cleanliness", slaHours: 48, isActive: true },
          { name: "Street Lighting", description: "Street lights and public lighting", slaHours: 24, isActive: true },
          { name: "Parks & Recreation", description: "Parks, gardens, and recreational facilities", slaHours: 96, isActive: true },
        ];

        for (const dept of defaultDepartments) {
          await this.createDepartment(dept);
        }
      }

      // Initialize default admin user using Mongoose
      const adminExists = await UserModel.findOne({ username: 'admin' }).lean();
      if (!adminExists) {
        try {
          await this.createUser({
            username: "admin",
            password: "b22f5d18277c8ab8f4a4099bb30a0e87c170fa0823753727313e513be259799f01a023fe561a8a59596909924a0fbdf03944ec3616d59aa13a77945763281695.24324cf84a7c4d1927efb9608ee561fd", // password: admin123
            role: "admin",
            email: "admin@indore.gov.in",
            phone: "+91 9876543210",
          });
          console.log("Admin user created: admin");
        } catch (err) {
          if (err && typeof err === 'object' && 'code' in err && (err as any).code === 11000) {
            // Duplicate key error, admin already exists
            console.log("Admin user already exists (duplicate key)");
          } else {
            console.error("Error creating admin user:", err);
          }
        }
      } else {
        console.log("Admin user already exists");
      }
    } catch (error) {
      console.error('Error initializing default data:', error);
    }
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ id }).lean();
    return user as unknown as User || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ username }).lean();
    return user as unknown as User || undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    console.log('Attempting to create user:', user);
    try {
      const newUser = await UserModel.create({
        id: randomUUID(),
        ...user,
        createdAt: new Date(),
      });
      console.log('User created successfully:', newUser);
      return newUser.toObject() as User;
    } catch (err) {
      console.error('Error creating user:', err);
      throw err;
    }
  }

  // Complaint methods
  async getComplaint(id: string): Promise<Complaint | undefined> {
    const db = await this.ensureConnection();
    const complaint = await db.collection('complaints').findOne({ id });
    return complaint as Complaint || undefined;
  }

  async getComplaintsByUser(citizenId: string): Promise<Complaint[]> {
    const db = await this.ensureConnection();
    const complaints = await db.collection('complaints').find({ citizenId }).sort({ createdAt: -1 }).toArray();
    return complaints as Complaint[];
  }

  async getComplaintsByStatus(status: string): Promise<Complaint[]> {
    const db = await this.ensureConnection();
    const complaints = await db.collection('complaints').find({ status }).sort({ createdAt: -1 }).toArray();
    return complaints as Complaint[];
  }

  async getAllComplaints(): Promise<Complaint[]> {
    const db = await this.ensureConnection();
    console.log("Storage: Getting all complaints from database...");
    const complaints = await db.collection('complaints').find({}).sort({ createdAt: -1 }).toArray();
    console.log("Storage: Found", complaints.length, "complaints");
    return complaints as Complaint[];
  }

  async createComplaint(complaint: InsertComplaint & { citizenId: string }): Promise<Complaint> {
    const db = await this.ensureConnection();
    const now = new Date();
    const newComplaint: Complaint = {
      id: randomUUID(),
      ...complaint,
      status: complaint.status || 'submitted',
      createdAt: now,
      updatedAt: now,
    };
    await db.collection('complaints').insertOne(newComplaint);
    return newComplaint;
  }

  async updateComplaint(id: string, updates: Partial<Complaint>): Promise<Complaint | undefined> {
    const db = await this.ensureConnection();
    const updatedComplaint = { ...updates, updatedAt: new Date() };
    const result = await db.collection('complaints').findOneAndUpdate(
      { id },
      { $set: updatedComplaint },
      { returnDocument: 'after' }
    );
    return result as Complaint || undefined;
  }

  // Complaint update methods
  async getComplaintUpdates(complaintId: string): Promise<ComplaintUpdate[]> {
    const db = await this.ensureConnection();
    const updates = await db.collection('complaint_updates').find({ complaintId }).sort({ createdAt: -1 }).toArray();
    return updates as ComplaintUpdate[];
  }

  async createComplaintUpdate(update: InsertComplaintUpdate & { officialId?: string }): Promise<ComplaintUpdate> {
    const db = await this.ensureConnection();
    const newUpdate: ComplaintUpdate = {
      id: randomUUID(),
      ...update,
      createdAt: new Date(),
    };
    await db.collection('complaint_updates').insertOne(newUpdate);
    return newUpdate;
  }

  // Feedback methods
  async getFeedbackByComplaint(complaintId: string): Promise<Feedback | undefined> {
    const db = await this.ensureConnection();
    const feedback = await db.collection('feedback').findOne({ complaintId });
    return feedback as Feedback || undefined;
  }

  async getAllFeedback(): Promise<Feedback[]> {
    const db = await this.ensureConnection();
    const feedback = await db.collection('feedback').find({}).sort({ createdAt: -1 }).toArray();
    return feedback as Feedback[];
  }

  async createFeedback(feedback: InsertFeedback & { citizenId: string }): Promise<Feedback> {
    const db = await this.ensureConnection();
    console.log("Storage: Creating feedback with data:", feedback);
    
    const newFeedback: Feedback = {
      id: randomUUID(),
      ...feedback,
      createdAt: new Date(),
    };
    
    console.log("Storage: New feedback object:", newFeedback);
    await db.collection('feedback').insertOne(newFeedback);
    console.log("Storage: Feedback created successfully");
    return newFeedback;
  }

  // Analytics methods
  async getComplaintStats(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byCategory: Record<string, number>;
    byPriority: Record<string, number>;
  }> {
    const db = await this.ensureConnection();
    console.log("Storage: Getting complaint stats from database...");
    const complaints = await db.collection('complaints').find({}).toArray();
    console.log("Storage: Found", complaints.length, "complaints for stats");
    
    const stats = {
      total: complaints.length,
      byStatus: {} as Record<string, number>,
      byCategory: {} as Record<string, number>,
      byPriority: {} as Record<string, number>,
    };

    complaints.forEach(complaint => {
      // Status stats
      stats.byStatus[complaint.status] = (stats.byStatus[complaint.status] || 0) + 1;
      // Category stats
      stats.byCategory[complaint.category] = (stats.byCategory[complaint.category] || 0) + 1;
      // Priority stats
      stats.byPriority[complaint.priority] = (stats.byPriority[complaint.priority] || 0) + 1;
    });

    console.log("Storage: Calculated stats:", stats);
    return stats;
  }

  // Department methods
  async getAllDepartments(): Promise<Department[]> {
    const db = await this.ensureConnection();
    const departments = await db.collection('departments').find({ isActive: true }).toArray();
    return departments as Department[];
  }

  async getDepartment(id: string): Promise<Department | undefined> {
    const db = await this.ensureConnection();
    const department = await db.collection('departments').findOne({ id });
    return department as Department || undefined;
  }

  async createDepartment(department: InsertDepartment): Promise<Department> {
    const db = await this.ensureConnection();
    const now = new Date();
    const newDepartment: Department = {
      id: randomUUID(),
      ...department,
      slaHours: department.slaHours || 72,
      isActive: department.isActive !== false,
      createdAt: now,
      updatedAt: now,
    };
    await db.collection('departments').insertOne(newDepartment);
    return newDepartment;
  }

  async updateDepartment(id: string, updates: Partial<Department>): Promise<Department | undefined> {
    const db = await this.ensureConnection();
    const updatedDepartment = { ...updates, updatedAt: new Date() };
    const result = await db.collection('departments').findOneAndUpdate(
      { id },
      { $set: updatedDepartment },
      { returnDocument: 'after' }
    );
    return result as Department || undefined;
  }

  async deleteDepartment(id: string): Promise<boolean> {
    const db = await this.ensureConnection();
    const result = await db.collection('departments').updateOne(
      { id },
      { $set: { isActive: false, updatedAt: new Date() } }
    );
    return result.modifiedCount > 0;
  }

  // SLA Settings methods
  async getSlaSettings(departmentId?: string): Promise<SlaSettings[]> {
    const db = await this.ensureConnection();
    const filter = departmentId ? { departmentId, isActive: true } : { isActive: true };
    const slaSettings = await db.collection('sla_settings').find(filter).toArray();
    return slaSettings as SlaSettings[];
  }

  async createSlaSettings(sla: InsertSlaSettings): Promise<SlaSettings> {
    const db = await this.ensureConnection();
    const now = new Date();
    const newSlaSettings: SlaSettings = {
      id: randomUUID(),
      ...sla,
      escalationLevels: sla.escalationLevels || 3,
      isActive: sla.isActive !== false,
      createdAt: now,
      updatedAt: now,
    };
    await db.collection('sla_settings').insertOne(newSlaSettings);
    return newSlaSettings;
  }

  async updateSlaSettings(id: string, updates: Partial<SlaSettings>): Promise<SlaSettings | undefined> {
    const db = await this.ensureConnection();
    const updatedSlaSettings = { ...updates, updatedAt: new Date() };
    const result = await db.collection('sla_settings').findOneAndUpdate(
      { id },
      { $set: updatedSlaSettings },
      { returnDocument: 'after' }
    );
    return result as SlaSettings || undefined;
  }

  async deleteSlaSettings(id: string): Promise<boolean> {
    const db = await this.ensureConnection();
    const result = await db.collection('sla_settings').updateOne(
      { id },
      { $set: { isActive: false, updatedAt: new Date() } }
    );
    return result.modifiedCount > 0;
  }

  // Notification methods
  async getNotifications(userId: string): Promise<Notification[]> {
    const db = await this.ensureConnection();
    console.log("Storage: Getting notifications for user ID:", userId);
    const notifications = await db.collection('notifications').find({ userId }).sort({ createdAt: -1 }).toArray();
    console.log("Storage: Found notifications:", notifications.length);
    return notifications as Notification[];
  }

  async getUnreadNotifications(userId: string): Promise<Notification[]> {
    const db = await this.ensureConnection();
    const notifications = await db.collection('notifications').find({ userId, isRead: false }).sort({ createdAt: -1 }).toArray();
    return notifications as Notification[];
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const db = await this.ensureConnection();
    const newNotification: Notification = {
      id: randomUUID(),
      ...notification,
      isRead: false,
      createdAt: new Date(),
    };
    await db.collection('notifications').insertOne(newNotification);
    return newNotification;
  }

  async markNotificationRead(id: string): Promise<boolean> {
    const db = await this.ensureConnection();
    const result = await db.collection('notifications').updateOne(
      { id },
      { $set: { isRead: true } }
    );
    return result.modifiedCount > 0;
  }

  async deleteNotification(id: string): Promise<boolean> {
    const db = await this.ensureConnection();
    const result = await db.collection('notifications').deleteOne({ id });
    return result.deletedCount > 0;
  }

  // User management methods
  async getAllUsers(): Promise<User[]> {
    const db = await this.ensureConnection();
    const users = await UserModel.find({}).sort({ createdAt: -1 }).lean();
    return users as unknown as User[];
  }

  async getUsersByRole(role: string): Promise<User[]> {
    const users = await UserModel.find({ role }).sort({ createdAt: -1 }).lean();
    return users as unknown as User[];
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const updatedUser = await UserModel.findOneAndUpdate(
      { id },
      { $set: updates },
      { new: true }
    ).lean();
    return updatedUser as unknown as User || undefined;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await UserModel.deleteOne({ id });
    return result.deletedCount > 0;
  }

  // Audit log methods
  async getAuditLogs(userId?: string): Promise<AuditLog[]> {
    const db = await this.ensureConnection();
    const filter = userId ? { userId } : {};
    const auditLogs = await db.collection('audit_logs').find(filter).sort({ createdAt: -1 }).toArray();
    return auditLogs as AuditLog[];
  }

  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const db = await this.ensureConnection();
    const newAuditLog: AuditLog = {
      id: randomUUID(),
      ...log,
      createdAt: new Date(),
    };
    await db.collection('audit_logs').insertOne(newAuditLog);
    return newAuditLog;
  }
}

// Export the MongoDB storage as default
export const storage = new MongoStorage();