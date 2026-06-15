import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';

export const userRouter = router({
  // Fetch user profile
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.user.id },
      include: {
        subscription: true,
        _count: {
          select: {
            topics: true,
            bookmarks: true,
            digests: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }),

  // Update profile name & email
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, 'Name is required'),
        email: z.string().email('Please enter a valid email address'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updatedUser = await ctx.db.user.update({
        where: { id: ctx.user.id },
        data: {
          name: input.name,
          email: input.email,
        },
      });

      // Write an audit log entry for this action
      await ctx.db.auditLog.create({
        data: {
          userId: ctx.user.id,
          action: 'PROFILE_UPDATE',
          details: `User updated profile name to "${input.name}" and email to "${input.email}"`,
        },
      });

      return updatedUser;
    }),

  // Fetch activity logs for the user
  getAuditLogs: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        filter: z.string().optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(5),
      })
    )
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.limit;
      const where: any = { userId: ctx.user.id };

      if (input.filter && input.filter !== 'ALL') {
        where.action = input.filter;
      }

      if (input.search) {
        where.details = { contains: input.search, mode: 'insensitive' };
      }

      const [logs, total] = await Promise.all([
        ctx.db.auditLog.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: input.limit,
        }),
        ctx.db.auditLog.count({ where }),
      ]);

      return {
        logs,
        pagination: {
          total,
          pages: Math.ceil(total / input.limit),
          currentPage: input.page,
        },
      };
    }),

  // Delete account cascade
  deleteAccount: protectedProcedure.mutation(async ({ ctx }) => {
    // Delete target user (Cascade refers on cascade rules in schema or handles manually)
    // In schema.prisma, subscription, topics, bookmarks, digests are all marked with onDelete: Cascade
    // AuditLogs, Analytics are onDelete: SetNull, so we can delete the user record cleanly.
    const deleted = await ctx.db.user.delete({
      where: { id: ctx.user.id },
    });

    return { success: true, userId: deleted.id };
  }),
});
