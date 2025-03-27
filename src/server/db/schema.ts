import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTableCreator,
  primaryKey,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `airtable-clone_${name}`);

export const views = createTable("view", {
  id: serial("id").primaryKey(),
  table: serial("table")
    .references(() => tables.id, { onDelete: "cascade" })
    .notNull(),
  config: jsonb("config")
    .$type<{
      sort?: Array<{
        columnId: number;
        direction: "asc" | "desc";
      }>;
      filters?: Array<{
        columnId: number;
        operator: string;
        value: string | number;
      }>;
      hiddenColumns?: number[];
    }>()
    .default({})
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .$onUpdate(() => new Date())
    .defaultNow()
    .notNull(),
});

export const viewsRelations = relations(views, ({ one }) => ({
  table: one(tables, {
    fields: [views.table],
    references: [tables.id],
  }),
}));

export const rows = createTable(
  "rows",
  {
    id: serial("id").primaryKey(),
    table: serial("table")
      .references(() => tables.id, { onDelete: "cascade" })
      .notNull(),
    data: jsonb("data")
      .$type<Record<string, number | string | null>>()
      .default({})
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .$onUpdate(() => new Date())
      .defaultNow()
      .notNull(),
  },
  (row) => ({
    createdByIdIdx: index("row_data_idx").using("gin", row.data),
  }),
);

export const rowsRelations = relations(rows, ({ one }) => ({
  table: one(tables, {
    fields: [rows.table],
    references: [tables.id],
  }),
}));

export const columnTypeEnum = pgEnum("column_type", ["text", "number"]);

export const columns = createTable("column", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  table: serial("table")
    .references(() => tables.id, { onDelete: "cascade" })
    .notNull(),
  type: columnTypeEnum("type").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .$onUpdate(() => new Date())
    .defaultNow()
    .notNull(),
});

export const columnsRelations = relations(columns, ({ one }) => ({
  table: one(tables, {
    fields: [columns.table],
    references: [tables.id],
  }),
}));

export const tables = createTable("table", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  base: integer("base")
    .references(() => bases.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .$onUpdate(() => new Date())
    .defaultNow()
    .notNull(),
});

export const tablesRelations = relations(tables, ({ many, one }) => ({
  columns: many(columns),
  rows: many(rows),
  view: one(views),
  base: one(bases, {
    fields: [tables.base],
    references: [bases.id],
  }),
}));

export const bases = createTable(
  "base",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    name: varchar("name", { length: 256 }).notNull(),
    createdById: varchar("created_by", { length: 255 })
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .$onUpdate(() => new Date())
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (example) => ({
    createdByIdIdx: index("base_created_by_idx").on(example.createdById),
    nameIndex: index("base_name_idx").on(example.name),
  }),
);

export const basesRelations = relations(bases, ({ one, many }) => ({
  user: one(users, { fields: [bases.createdById], references: [users.id] }),
  tables: many(tables),
}));

export const users = createTable("user", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: timestamp("email_verified", {
    mode: "date",
    withTimezone: true,
  }).default(sql`CURRENT_TIMESTAMP`),
  image: varchar("image", { length: 255 }),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  bases: many(bases),
}));

export const accounts = createTable(
  "account",
  {
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    type: varchar("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("provider_account_id", {
      length: 255,
    }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
    userIdIdx: index("account_user_id_idx").on(account.userId),
  }),
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  {
    sessionToken: varchar("session_token", { length: 255 })
      .notNull()
      .primaryKey(),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (session) => ({
    userIdIdx: index("session_user_id_idx").on(session.userId),
  }),
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verification_token",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  }),
);
