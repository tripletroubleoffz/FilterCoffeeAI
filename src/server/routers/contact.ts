import { router, publicProcedure, adminProcedure } from '../trpc';
import { z } from 'zod';
import { emailService } from '@/lib/services/email';

export const contactRouter = router({
  // Submit contact message (public)
  submitMessage: publicProcedure
    .input(
      z.object({
        name: z.string().min(1, 'Name is required'),
        email: z.string().email('Please enter a valid email address'),
        subject: z.string().optional(),
        message: z.string().min(1, 'Message is required'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // 1. Save to database
      const contactMessage = await ctx.db.contactMessage.create({
        data: {
          name: input.name,
          email: input.email,
          subject: input.subject || null,
          message: input.message,
          status: 'OPEN',
        },
      });

      // 2. Send email notification to admin
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@filtercoffee.ai';
      const adminHtml = `
        <div style="font-family: sans-serif; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e5e5; border-radius: 8px;">
          <h2 style="color: #8b5a2b; border-bottom: 2px solid #e5e5e5; padding-bottom: 8px;">New Contact Request</h2>
          <p><strong>Name:</strong> ${input.name}</p>
          <p><strong>Email:</strong> ${input.email}</p>
          <p><strong>Subject:</strong> ${input.subject || 'No Subject'}</p>
          <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; border-left: 4px solid #8b5a2b; margin-top: 15px;">
            <p style="margin: 0; font-weight: bold;">Message:</p>
            <p style="margin: 5px 0 0 0; white-space: pre-wrap;">${input.message}</p>
          </div>
        </div>
      `;

      try {
        await emailService.sendEmail(
          adminEmail,
          'New Contact Request',
          adminHtml
        );
      } catch (err) {
        console.error('Failed to send admin notification email:', err);
      }

      // 3. Send acknowledgement email to user
      // NOTE: In Resend test mode (no domain verified), emails can only be sent
      // to the account's verified address. We attempt delivery and silently fail
      // if the recipient is not the verified address (this is fine in development).
      const userHtml = `
        <div style="font-family: sans-serif; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e5e5; border-radius: 8px;">
          <h2 style="color: #8b5a2b; border-bottom: 2px solid #e5e5e5; padding-bottom: 8px;">We Received Your Message</h2>
          <p>Hi <strong>${input.name}</strong>, thank you for contacting FilterCoffee.ai.</p>
          <p>Our team has received your request and will respond within 2 business hours.</p>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; border-left: 4px solid #8b5a2b; margin-top: 15px;">
            <p style="margin: 0; font-weight: bold;">Your Message:</p>
            <p style="margin: 5px 0 0 0; white-space: pre-wrap; color: #444444;">${input.message}</p>
          </div>
          <hr style="border: 0; border-top: 1px solid #e5e5e5; margin: 20px 0;" />
          <p style="font-size: 11px; color: #666666;">This is an automated confirmation of receipt. Please do not reply directly to this email.</p>
        </div>
      `;

      try {
        await emailService.sendEmail(
          input.email,
          'We received your message — FilterCoffee.ai',
          userHtml
        );
      } catch (err: any) {
        // Silently absorb in dev mode — the admin notification is more critical
        console.warn(`[Contact] User acknowledgement email not delivered to ${input.email}:`, err?.message || err);
      }

      return { success: true, messageId: contactMessage.id };
    }),

  // Fetch all contact messages (Admin only)
  getMessages: adminProcedure
    .input(
      z.object({
        search: z.string().optional(),
        status: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = {};

      if (input.status && input.status !== 'ALL') {
        where.status = input.status;
      }

      if (input.search) {
        where.OR = [
          { name: { contains: input.search, mode: 'insensitive' } },
          { email: { contains: input.search, mode: 'insensitive' } },
          { subject: { contains: input.search, mode: 'insensitive' } },
          { message: { contains: input.search, mode: 'insensitive' } },
        ];
      }

      return ctx.db.contactMessage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });
    }),

  // Update status of a message (Admin only)
  updateStatus: adminProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updated = await ctx.db.contactMessage.update({
        where: { id: input.id },
        data: { status: input.status },
      });

      // Write an audit log entry for this action
      await ctx.db.auditLog.create({
        data: {
          userId: ctx.user.id,
          action: 'CONTACT_STATUS_UPDATE',
          details: `Admin changed status of contact message ${input.id} to ${input.status}`,
        },
      });

      return updated;
    }),
});
