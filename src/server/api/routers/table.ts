import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { and, asc, count, eq, gt, sql } from "drizzle-orm";
import { bases, columns, rows, tables } from "~/server/db/schema";
import { TRPCError } from "@trpc/server";

export const tableRouter = createTRPCRouter({
  createTable: protectedProcedure
    .input(z.object({ baseId: z.number(), name: z.string().min(6).optional() }))
    .mutation(async ({ ctx, input }) => {
      const { baseId, name } = input;
      const base = await ctx.db.query.bases.findFirst({
        where: and(
          eq(bases.createdById, ctx.session.user.id),
          eq(bases.id, baseId),
        ),
      });
      if (!base) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }
      const table = await ctx.db.transaction(async (tx) => {
        let tableName: string;
        if (!name) {
          const [cnt] = await tx
            .select({ count: count() })
            .from(tables)
            .where(eq(tables.base, baseId));
          tableName = `Table ${(cnt ? cnt.count : 0) + 1}`;
        } else {
          tableName = name;
        }

        const [table] = await tx
          .insert(tables)
          .values({ name: tableName, base: base.id })
          .returning();

        if (!table) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }

        const _cols = await tx
          .insert(columns)
          .values([
            { name: "Name", type: "text", table: table.id },
            { name: "Notes", type: "text", table: table.id },
            { name: "Assignee", type: "text", table: table.id },
            { name: "Status", type: "text", table: table.id },
          ])
          .returning();

        const _rows = await tx
          .insert(rows)
          .values([
            { table: table.id },
            { table: table.id },
            { table: table.id },
            { table: table.id },
          ])
          .returning();
        return { ...table, columns: _cols, rows: _rows };
      });
      return table;
    }),

  getTableById: protectedProcedure
    .input(z.object({ baseId: z.number(), tableId: z.number() }))
    .query(async ({ ctx, input }) => {
      const { baseId, tableId } = input;

      const table = await ctx.db.query.tables.findFirst({
        where: and(eq(tables.base, baseId), eq(tables.id, tableId)),
      });

      const cols = await ctx.db.query.columns.findMany({
        where: eq(columns.table, tableId),
      });
      if (!table) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      return { table, columns: cols };
    }),

  addRow: protectedProcedure
    .input(z.object({ tableId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const { tableId } = input;

      const table = await ctx.db.query.tables.findFirst({
        where: eq(tables.id, tableId),
      });

      if (!table) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const [newRow] = await ctx.db
        .insert(rows)
        .values({
          table: tableId,
        })
        .returning();

      if (!newRow) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
      return newRow;
    }),

  addColumn: protectedProcedure
    .input(
      z.object({
        tableId: z.number(),
        type: z.enum(["text", "number"]),
        name: z.string().min(6),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { tableId, type, name } = input;

      const table = await ctx.db.query.tables.findFirst({
        where: eq(tables.id, tableId),
      });

      if (!table) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      const existingCol = await ctx.db.query.columns.findFirst({
        where: and(eq(columns.table, tableId), eq(columns.name, name)),
      });
      if (existingCol) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Please create a new unique column",
        });
      }

      const [newCol] = await ctx.db
        .insert(columns)
        .values({
          table: tableId,
          type,
          name,
        })
        .returning();

      if (!newCol) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
      return newCol;
    }),

  fetchRows: protectedProcedure
    .input(
      z.object({
        tableId: z.number(),
        cursor: z.number().optional(),
        pageSize: z.number().min(1).max(100).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { tableId, cursor, pageSize } = input;
      const table = await ctx.db.query.tables.findFirst({
        where: eq(tables.id, tableId),
      });
      if (!table) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const allRows = await ctx.db
        .select()
        .from(rows)
        .where(
          cursor
            ? and(gt(rows.id, cursor), eq(rows.table, tableId))
            : eq(rows.table, tableId),
        )
        .limit(pageSize + 1)
        .orderBy(asc(rows.id));
      let nextCursor: number | null = null;
      if (allRows.length > pageSize) {
        const lastRow = allRows.pop();
        nextCursor = lastRow?.id ?? null;
      }
      return {
        rows: allRows,
        nextCursor,
        hasMore: nextCursor !== null,
      };
    }),

  updateCell: protectedProcedure
    .input(
      z.object({
        tableId: z.number(),
        rowId: z.number(),
        columnId: z.number(),
        value: z.union([z.string(), z.number(), z.null()]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { tableId, rowId, columnId, value } = input;

      const table = await ctx.db.query.tables.findFirst({
        where: eq(tables.id, tableId),
      });
      const row = await ctx.db.query.rows.findFirst({
        where: and(eq(rows.id, rowId), eq(rows.table, tableId)),
      });
      const column = await ctx.db.query.columns.findFirst({
        where: and(eq(columns.table, tableId), eq(columns.id, columnId)),
      });
      if (!table || !row || !column) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      if (
        column.type === "number" &&
        (typeof value !== "number" || value === null)
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Expected a number for column "${column.name}", but got ${typeof value}`,
        });
      }
      if (
        column.type === "text" &&
        typeof value !== "string" &&
        value !== null
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Expected a string for column "${column.name}", but got ${typeof value}`,
        });
      }
      const [updatedRow] = await ctx.db
        .update(rows)
        .set({
          data: sql`COALESCE(${rows.data}, '{}')::jsonb || ${JSON.stringify({ [column.name]: value })}::jsonb`,
        })
        .where(eq(rows.id, rowId))
        .returning();

      if (!updatedRow) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update cell",
        });
      }
      return updatedRow;
    }),
});
