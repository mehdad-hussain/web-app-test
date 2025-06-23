import { int, mysqlTable, primaryKey, timestamp, varchar } from "drizzle-orm/mysql-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./auth.schema";

export const murmurs = mysqlTable("murmurs", {
  id: varchar("id", { length: 255 }).notNull().primaryKey(),
  content: varchar("content", { length: 280 }).notNull(), // Twitter-like character limit
  authorId: varchar("authorId", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
  likeCount: int("likeCount").notNull().default(0),
});

export const likes = mysqlTable(
  "likes",
  {
    murmurId: varchar("murmurId", { length: 255 })
      .notNull()
      .references(() => murmurs.id, { onDelete: "cascade" }),
    userId: varchar("userId", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  },
  (like) => ({
    compositePK: primaryKey({
      columns: [like.murmurId, like.userId],
    }),
  })
);

export const follows = mysqlTable(
  "follows",
  {
    followerId: varchar("followerId", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    followingId: varchar("followingId", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  },
  (follow) => ({
    compositePK: primaryKey({
      columns: [follow.followerId, follow.followingId],
    }),
  })
);

// Validation schemas for murmur operations
export const createMurmurSchema = z.object({
  content: z
    .string()
    .min(1, { message: "Content is required." })
    .max(280, { message: "Content must be at most 280 characters." }),
});

export const selectMurmurSchema = createSelectSchema(murmurs);

// Types for pagination
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type PaginationParams = z.infer<typeof paginationSchema>;

// Types for responses
export type MurmurWithAuthor = {
  id: string;
  content: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  likeCount: number;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
  isLiked: boolean;
}; 