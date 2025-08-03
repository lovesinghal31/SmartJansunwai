import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("citizen"), // citizen or official
  department: text("department"), // only for officials
  createdAt: timestamp("created_at").defaultNow(),
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
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const complaintUpdates = pgTable("complaint_updates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  complaintId: varchar("complaint_id").notNull().references(() => complaints.id),
  officialId: varchar("official_id").references(() => users.id),
  message: text("message").notNull(),
  status: text("status"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const feedback = pgTable("feedback", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  complaintId: varchar("complaint_id").notNull().references(() => complaints.id),
  citizenId: varchar("citizen_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
  department: true,
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

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertComplaint = z.infer<typeof insertComplaintSchema>;
export type Complaint = typeof complaints.$inferSelect;
export type InsertComplaintUpdate = z.infer<typeof insertComplaintUpdateSchema>;
export type ComplaintUpdate = typeof complaintUpdates.$inferSelect;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type Feedback = typeof feedback.$inferSelect;
