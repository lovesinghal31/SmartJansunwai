import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("citizen"), // citizen, official, admin
  department: text("department"), // only for officials
  email: text("email"),
  phone: text("phone"),
  fullName: text("full_name"),
  address: text("address"),
  preferredLanguage: text("preferred_language").notNull().default("en"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const complaints = pgTable("complaints", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  citizenId: varchar("citizen_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  location: text("location").notNull(),
  priority: text("priority").notNull().default("medium"), // low, medium, high
  status: text("status").notNull().default("submitted"), // submitted, in-progress, under-review, resolved
  assignedTo: varchar("assigned_to").references(() => users.id),
  attachments: text("attachments").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const complaintUpdates = pgTable("complaint_updates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  complaintId: varchar("complaint_id").notNull().references(() => complaints.id),
  officialId: varchar("official_id").references(() => users.id),
  message: text("message").notNull(),
  status: text("status"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const feedback = pgTable("feedback", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  complaintId: varchar("complaint_id").references(() => complaints.id),
  citizenId: varchar("citizen_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const serviceFeedback = pgTable("service_feedback", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  citizenId: varchar("citizen_id").notNull().references(() => users.id),
  serviceCategory: text("service_category").notNull(), // Overall, Water, Roads, Electricity, etc.
  overallRating: integer("overall_rating").notNull(), // 1-5
  serviceQualityRating: integer("service_quality_rating").notNull(), // 1-5
  responseTimeRating: integer("response_time_rating").notNull(), // 1-5
  staffBehaviorRating: integer("staff_behavior_rating").notNull(), // 1-5
  accessibilityRating: integer("accessibility_rating").notNull(), // 1-5
  suggestions: text("suggestions"),
  wouldRecommend: boolean("would_recommend").notNull(),
  specificDepartment: text("specific_department"),
  serviceUsageFrequency: text("service_usage_frequency"), // Daily, Weekly, Monthly, Rarely
  contactMethod: text("contact_method"), // Online, Phone, In-person
  issues: text("issues").array(),
  improvements: text("improvements").array(),
  isAnonymous: boolean("is_anonymous").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const departments = pgTable("departments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  headOfficialId: varchar("head_official_id").references(() => users.id),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  slaHours: integer("sla_hours").notNull().default(72), // Default 3 days
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const slaSettings = pgTable("sla_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  departmentId: varchar("department_id").notNull().references(() => departments.id),
  category: text("category").notNull(),
  priority: text("priority").notNull(), // low, medium, high, critical
  responseTimeHours: integer("response_time_hours").notNull(),
  resolutionTimeHours: integer("resolution_time_hours").notNull(),
  escalationLevels: integer("escalation_levels").notNull().default(3),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // info, success, warning, error
  category: text("category").notNull(), // complaint, system, reminder, alert
  isRead: boolean("is_read").notNull().default(false),
  actionUrl: text("action_url"),
  metadata: text("metadata"), // JSON string for additional data
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  action: text("action").notNull(),
  resource: text("resource").notNull(),
  resourceId: varchar("resource_id"),
  oldValues: text("old_values"), // JSON string
  newValues: text("new_values"), // JSON string
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
  department: true,
  email: true,
  phone: true,
  fullName: true,
  address: true,
  preferredLanguage: true,
});

export const insertComplaintSchema = createInsertSchema(complaints).pick({
  title: true,
  description: true,
  category: true,
  location: true,
  priority: true,
});

export const insertComplaintUpdateSchema = createInsertSchema(complaintUpdates).pick({
  complaintId: true,
  message: true,
  status: true,
});

export const insertFeedbackSchema = createInsertSchema(feedback).pick({
  complaintId: true,
  rating: true,
  comment: true,
});

export const insertServiceFeedbackSchema = createInsertSchema(serviceFeedback).pick({
  serviceCategory: true,
  overallRating: true,
  serviceQualityRating: true,
  responseTimeRating: true,
  staffBehaviorRating: true,
  accessibilityRating: true,
  suggestions: true,
  wouldRecommend: true,
  specificDepartment: true,
  serviceUsageFrequency: true,
  contactMethod: true,
  issues: true,
  improvements: true,
  isAnonymous: true,
});

export const insertDepartmentSchema = createInsertSchema(departments).pick({
  name: true,
  description: true,
  headOfficialId: true,
  contactEmail: true,
  contactPhone: true,
  slaHours: true,
  isActive: true,
});

export const insertSlaSettingsSchema = createInsertSchema(slaSettings).pick({
  departmentId: true,
  category: true,
  priority: true,
  responseTimeHours: true,
  resolutionTimeHours: true,
  escalationLevels: true,
  isActive: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).pick({
  userId: true,
  title: true,
  message: true,
  type: true,
  category: true,
  actionUrl: true,
  metadata: true,
  expiresAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).pick({
  userId: true,
  action: true,
  resource: true,
  resourceId: true,
  oldValues: true,
  newValues: true,
  ipAddress: true,
  userAgent: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertComplaint = z.infer<typeof insertComplaintSchema>;
export type Complaint = typeof complaints.$inferSelect;
export type InsertComplaintUpdate = z.infer<typeof insertComplaintUpdateSchema>;
export type ComplaintUpdate = typeof complaintUpdates.$inferSelect;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type Feedback = typeof feedback.$inferSelect;
export type InsertServiceFeedback = z.infer<typeof insertServiceFeedbackSchema>;
export type ServiceFeedback = typeof serviceFeedback.$inferSelect;
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;
export type Department = typeof departments.$inferSelect;
export type InsertSlaSettings = z.infer<typeof insertSlaSettingsSchema>;
export type SlaSettings = typeof slaSettings.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
