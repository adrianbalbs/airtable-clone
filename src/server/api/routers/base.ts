import { bases, columns, rows, tables, views } from "~/server/db/schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import { and, desc, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const baseRouter = createTRPCRouter({
  getAllBasesByUser: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db
      .selectDistinctOn([bases.id], {
        id: bases.id,
        name: bases.name,
        table: tables.id,
        createdById: bases.createdById,
        createdAt: bases.createdAt,
        updatedAt: bases.updatedAt,
      })
      .from(bases)
      .innerJoin(tables, eq(bases.id, tables.base))
      .where(eq(bases.createdById, ctx.session.user.id))
      .orderBy(desc(bases.id), desc(bases.updatedAt));
  }),

  getBaseById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const { id } = input;
      const base = await ctx.db.query.bases.findFirst({
        where: eq(bases.id, id),
        with: {
          tables: true,
        },
      });
      if (!base) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      return base;
    }),

  createBase: protectedProcedure
    .input(z.object({ name: z.string().min(6) }))
    .mutation(async ({ ctx, input }) => {
      const { name } = input;

      const base = await ctx.db.transaction(async (tx) => {
        const [base] = await tx
          .insert(bases)
          .values({ name, createdById: ctx.session.user.id })
          .returning();
        if (!base) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }
        const [table] = await tx
          .insert(tables)
          .values({ name: "Table 1", base: base.id })
          .returning({ id: tables.id });
        if (!table) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }

        await tx
          .insert(columns)
          .values([
            { name: "Name", type: "text", table: table.id },
            { name: "Notes", type: "text", table: table.id },
            { name: "Assignee", type: "text", table: table.id },
            { name: "Status", type: "text", table: table.id },
          ])
          .returning();

        await tx
          .insert(rows)
          .values([
            { table: table.id },
            { table: table.id },
            { table: table.id },
            { table: table.id },
          ]);
        await tx.insert(views).values({ table: table.id });
        return { ...base, table: table.id };
      });

      return base;
    }),

  deleteBase: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;
      const user = ctx.session.user.id;
      const base = await ctx.db.query.bases.findFirst({
        where: and(eq(bases.id, id), eq(bases.createdById, user)),
      });
      if (!base) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      await ctx.db
        .delete(bases)
        .where(and(eq(bases.id, id), eq(bases.createdById, user)));
    }),

  updateBase: protectedProcedure
    .input(z.object({ id: z.number(), name: z.string().min(6) }))
    .mutation(async ({ ctx, input }) => {
      const { id, name } = input;
      const user = ctx.session.user.id;
      const base = await ctx.db.query.bases.findFirst({
        where: and(eq(bases.id, id), eq(bases.createdById, user)),
      });
      if (!base) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      if (base.createdById !== user) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return await ctx.db
        .update(bases)
        .set({ name })
        .where(and(eq(bases.id, id), eq(bases.createdById, user)))
        .returning();
    }),
});
