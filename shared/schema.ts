import { z } from "zod";
import { ObjectId } from "mongodb";

// MongoDB Schema Types
export interface User {
  _id?: ObjectId;
  id: string;
  username: string;
  password: string;
  role: string; // citizen, official, admin
  department?: string; // only for officials
  email?: string;
  phone?: string;
  createdAt: Date;
}

export interface Complaint {
  name: string;
  contact: string;
  _id?: ObjectId;
  id: string;
  citizenId: string;
  title: string;
  description: string;
  category: string; // canonical slug, e.g. "water-supply"
  location: string;
  priority: string; // low, medium, high
  status: string; // submitted, in-progress, under-review, resolved
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ComplaintUpdate {
  _id?: ObjectId;
  id: string;
  complaintId: string;
  officialId?: string;
  message: string;
  status?: string;
  createdAt: Date;
}

export interface Feedback {
  _id?: ObjectId;
  id: string;
  complaintId: string;
  citizenId: string;
  rating: number; // 1-5
  comment?: string;
  createdAt: Date;
}

export interface Department {
  _id?: ObjectId;
  id: string;
  name: string;
  description?: string;
  headOfficialId?: string;
  contactEmail?: string;
  contactPhone?: string;
  slaHours: number; // Default 3 days
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SlaSettings {
  _id?: ObjectId;
  id: string;
  departmentId: string;
  category: string;
  priority: string; // low, medium, high, critical
  responseTimeHours: number;
  resolutionTimeHours: number;
  escalationLevels: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  _id?: ObjectId;
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string; // info, success, warning, error
  category: string; // complaint, system, reminder, alert
  isRead: boolean;
  actionUrl?: string;
  metadata?: string; // JSON string for additional data
  expiresAt?: Date;
  createdAt: Date;
}

export interface AuditLog {
  _id?: ObjectId;
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  oldValues?: string; // JSON string
  newValues?: string; // JSON string
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

// --- FIX: Define and export the status types ---
export const COMPLAINT_STATUSES = [
  "submitted",
  "in-progress",
  "under-review",
  "resolved",
  "rejected", // Added rejected for completeness
] as const;

export const complaintStatusSchema = z.enum(COMPLAINT_STATUSES);

// Zod Insert Schemas
// Canonical complaint category slugs used ACROSS the system (UI, API, DB)
export const CATEGORIES = [
  "road-transportation",
  "water-supply",
  "electricity",
  "sanitation",
  "street-lighting",
  "parks-recreation",
] as const;

export type Category = typeof CATEGORIES[number];
export const insertUserSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(6),
  role: z.string().default("citizen"),
  department: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
});

// --- FIX: Update the insertComplaintSchema to use the new status schema ---
export const insertComplaintSchema = z.object({
  name: z.string().min(3, "Name is required"),
  contact: z.string().min(10, "A valid contact number is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.string().min(1, "Category is required"), // Changed from enum to string
  location: z.string().min(1),
  priority: z.string().default("medium"),
  status: complaintStatusSchema.default("submitted"), // Use the new schema here
  attachments: z.array(z.string()).optional(),
  aiAnalysis: z.object({
    priority: z.string().optional(),
    isComplaintValid: z.boolean().optional(),
    suggestedCategory: z.string().optional(),
    estimatedResolutionDays: z.number().optional(),
  }).optional(),
});

export const insertComplaintUpdateSchema = z.object({
  complaintId: z.string().min(1),
  message: z.string().min(1),
  status: z.string().optional(),
});

export const insertFeedbackSchema = z.object({
  complaintId: z.string().min(1),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

export const insertDepartmentSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  headOfficialId: z.string().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  slaHours: z.number().default(72),
  isActive: z.boolean().default(true),
});

export const insertSlaSettingsSchema = z.object({
  departmentId: z.string().min(1),
  category: z.string().min(1),
  priority: z.string().min(1),
  responseTimeHours: z.number().min(1),
  resolutionTimeHours: z.number().min(1),
  escalationLevels: z.number().default(3),
  isActive: z.boolean().default(true),
});

export const insertNotificationSchema = z.object({
  userId: z.string().min(1),
  title: z.string().min(1),
  message: z.string().min(1),
  type: z.string().min(1),
  category: z.string().min(1),
  actionUrl: z.string().optional(),
  metadata: z.string().optional(),
  expiresAt: z.date().optional(),
});

export const insertAuditLogSchema = z.object({
  userId: z.string().min(1),
  action: z.string().min(1),
  resource: z.string().min(1),
  resourceId: z.string().optional(),
  oldValues: z.string().optional(),
  newValues: z.string().optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertComplaint = z.infer<typeof insertComplaintSchema>;
export type InsertComplaintUpdate = z.infer<typeof insertComplaintUpdateSchema>;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;
export type InsertSlaSettings = z.infer<typeof insertSlaSettingsSchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type ComplaintStatus = z.infer<typeof complaintStatusSchema>;