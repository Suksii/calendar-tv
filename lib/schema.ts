import { pgTable, text, timestamp, pgEnum, integer } from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['admin', 'viewer']);
export const showTypeEnum = pgEnum('show_type', ['uzivo', 'snimanje']);
export const channelEnum = pgEnum('channel', ['RTCG1', 'RTCG2', 'SAT', 'PAR']);

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: roleEnum('role').notNull().default('viewer'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Katalog emisija — samo naziv, reusable
export const shows = pgTable('shows', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Konkretni termini u rasporedu
export const entries = pgTable('entries', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  showId: text('show_id').notNull().references(() => shows.id),
  date: text('date').notNull(),        // YYYY-MM-DD
  time: text('time').notNull(),        // HH:MM
  duration: integer('duration'),       // trajanje u minutama, opciono
  channel: channelEnum('channel').notNull().default('RTCG1'),
  type: showTypeEnum('type').notNull().default('uzivo'),
  host: text('host'),
  topic: text('topic'),
  createdBy: text('created_by').references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const guests = pgTable('guests', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  entryId: text('entry_id').notNull().references(() => entries.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  order: integer('order').notNull().default(0),
});

export type User = typeof users.$inferSelect;
export type Show = typeof shows.$inferSelect;
export type Entry = typeof entries.$inferSelect;
export type Guest = typeof guests.$inferSelect;
