import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("application_owner"), // change_manager, application_owner, admin
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Applications table
export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  spocId: varchar("spoc_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Change requests table
export const changeRequests = pgTable("change_requests", {
  id: serial("id").primaryKey(),
  changeId: varchar("change_id").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  changeType: varchar("change_type").notNull(), // P1, P2, Emergency, Standard
  status: varchar("status").notNull().default("active"), // active, completed, cancelled
  startDateTime: timestamp("start_date_time").notNull(),
  endDateTime: timestamp("end_date_time").notNull(),
  changeManagerId: varchar("change_manager_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Change request applications (many-to-many relationship)
export const changeRequestApplications = pgTable("change_request_applications", {
  id: serial("id").primaryKey(),
  changeRequestId: integer("change_request_id").notNull().references(() => changeRequests.id),
  applicationId: integer("application_id").notNull().references(() => applications.id),
  preChangeStatus: varchar("pre_change_status").notNull().default("pending"), // pending, completed, not_applicable
  postChangeStatus: varchar("post_change_status").notNull().default("pending"),
  preChangeComments: text("pre_change_comments"),
  postChangeComments: text("post_change_comments"),
  preChangeAttachments: jsonb("pre_change_attachments").$type<string[]>().default([]),
  postChangeAttachments: jsonb("post_change_attachments").$type<string[]>().default([]),
  preChangeUpdatedAt: timestamp("pre_change_updated_at"),
  postChangeUpdatedAt: timestamp("post_change_updated_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  managedChangeRequests: many(changeRequests),
  applications: many(applications),
}));

export const applicationsRelations = relations(applications, ({ one, many }) => ({
  spoc: one(users, {
    fields: [applications.spocId],
    references: [users.id],
  }),
  changeRequestApplications: many(changeRequestApplications),
}));

export const changeRequestsRelations = relations(changeRequests, ({ one, many }) => ({
  changeManager: one(users, {
    fields: [changeRequests.changeManagerId],
    references: [users.id],
  }),
  applications: many(changeRequestApplications),
}));

export const changeRequestApplicationsRelations = relations(changeRequestApplications, ({ one }) => ({
  changeRequest: one(changeRequests, {
    fields: [changeRequestApplications.changeRequestId],
    references: [changeRequests.id],
  }),
  application: one(applications, {
    fields: [changeRequestApplications.applicationId],
    references: [applications.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  createdAt: true,
});

export const insertChangeRequestSchema = createInsertSchema(changeRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChangeRequestApplicationSchema = createInsertSchema(changeRequestApplications).omit({
  id: true,
  createdAt: true,
});

export const updateValidationSchema = createInsertSchema(changeRequestApplications).pick({
  preChangeStatus: true,
  postChangeStatus: true,
  preChangeComments: true,
  postChangeComments: true,
  preChangeAttachments: true,
  postChangeAttachments: true,
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type ChangeRequest = typeof changeRequests.$inferSelect;
export type InsertChangeRequest = z.infer<typeof insertChangeRequestSchema>;
export type ChangeRequestApplication = typeof changeRequestApplications.$inferSelect;
export type InsertChangeRequestApplication = z.infer<typeof insertChangeRequestApplicationSchema>;
export type UpdateValidation = z.infer<typeof updateValidationSchema>;
