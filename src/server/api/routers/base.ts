import { bases } from "~/server/db/schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import { and, desc, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const baseRouter = createTRPCRouter({
  getAllBasesByUser: protectedProcedure
    .query(async ({ ctx }) => {
      return await ctx.db
        .select()
        .from(bases)
        .where(eq(bases.createdById, ctx.session.user.id))
        .orderBy(desc(bases.updatedAt));
    }),
  getBaseById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const { id } = input;
      const base = await ctx.db.query.bases.findFirst({
        where: eq(bases.id, id),
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
      await ctx.db
        .insert(bases)
        .values({ name, createdById: ctx.session.user.id });
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
