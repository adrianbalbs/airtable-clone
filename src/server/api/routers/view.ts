import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { views } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

const viewConfigSchema = z.object({
  sort: z
    .array(
      z.object({
        columnId: z.number(),
        direction: z.enum(["asc", "desc"]),
      }),
    )
    .optional(),
  filters: z
    .array(
      z.object({
        columnId: z.number(),
        operator: z.string(),
        value: z.union([z.string(), z.number()]),
      }),
    )
    .optional(),
  hiddenColumns: z.array(z.number()).optional(),
});

export const viewRouter = createTRPCRouter({
  getConfig: protectedProcedure
    .input(z.object({ tableId: z.number() }))
    .query(async ({ ctx, input }) => {
      const { tableId } = input;

      const view = await ctx.db.query.views.findFirst({
        where: eq(views.table, tableId),
      });

      if (!view) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return view;
    }),
  updateConfig: protectedProcedure
    .input(
      z.object({
        viewId: z.number(),
        config: viewConfigSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { viewId, config } = input;

      const view = await ctx.db.query.views.findFirst({
        where: eq(views.id, viewId),
        with: {
          table: {
            with: {
              base: true,
            },
          },
        },
      });

      if (!view) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const updatedView = await ctx.db
        .update(views)
        .set({
          config: {
            ...view.config,
            ...config,
          },
        })
        .where(eq(views.id, viewId))
        .returning();

      return updatedView[0];
    }),

  deleteSortConfig: protectedProcedure
    .input(
      z.object({
        viewId: z.number(),
        columnId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { viewId, columnId } = input;

      const view = await ctx.db.query.views.findFirst({
        where: eq(views.id, viewId),
        with: {
          table: {
            with: {
              base: true,
            },
          },
        },
      });

      if (!view) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const currentSorts = view.config.sort ?? [];
      const updatedSorts = currentSorts.filter(
        (sort) => sort.columnId !== columnId,
      );

      const updatedView = await ctx.db
        .update(views)
        .set({
          config: {
            ...view.config,
            sort: updatedSorts,
          },
        })
        .where(eq(views.id, viewId))
        .returning();

      return updatedView[0];
    }),

  deleteFilter: protectedProcedure
    .input(
      z.object({
        viewId: z.number(),
        columnId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { viewId, columnId } = input;

      const view = await ctx.db.query.views.findFirst({
        where: eq(views.id, viewId),
        with: {
          table: {
            with: {
              base: true,
            },
          },
        },
      });

      if (!view) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const currentFilters = view.config.filters ?? [];
      const updatedFilters = currentFilters.filter(
        (filter) => filter.columnId !== columnId,
      );

      const updatedView = await ctx.db
        .update(views)
        .set({
          config: {
            ...view.config,
            filters: updatedFilters,
          },
        })
        .where(eq(views.id, viewId))
        .returning();

      return updatedView[0];
    }),

  deleteHiddenColumn: protectedProcedure
    .input(
      z.object({
        viewId: z.number(),
        columnId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { viewId, columnId } = input;

      const view = await ctx.db.query.views.findFirst({
        where: eq(views.id, viewId),
        with: {
          table: {
            with: {
              base: true,
            },
          },
        },
      });

      if (!view) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const currentHiddenColumns = view.config.hiddenColumns ?? [];
      const updatedHiddenColumns = currentHiddenColumns.filter(
        (id) => id !== columnId,
      );

      const updatedView = await ctx.db
        .update(views)
        .set({
          config: {
            ...view.config,
            hiddenColumns: updatedHiddenColumns,
          },
        })
        .where(eq(views.id, viewId))
        .returning();

      return updatedView[0];
    }),
});
