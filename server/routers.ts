import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { z } from "zod";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Router pour gérer les soumissions de formulaire de contact
  contact: router({
    // Procédure publique pour soumettre le formulaire
    submit: publicProcedure
      .input(
        z.object({
          fullName: z
            .string()
            .min(2, "Le nom doit contenir au moins 2 caractères")
            .max(255, "Le nom est trop long")
            .trim(),
          email: z
            .string()
            .email("Email invalide")
            .max(320, "L'email est trop long")
            .toLowerCase()
            .trim(),
          phone: z
            .string()
            .min(10, "Numéro de téléphone invalide")
            .max(50, "Le numéro de téléphone est trop long")
            .trim(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { createContactSubmission } = await import("./db");
        const { notifyOwner } = await import("./_core/notification");
        const { logger } = await import("./_core/logger");

        try {
          // Enregistrer la soumission dans la base de données
          await createContactSubmission({
            fullName: input.fullName,
            email: input.email,
            phone: input.phone,
          });

          // Notifier le propriétaire (non bloquant)
          notifyOwner({
            title: "Nouvelle demande de contact HTA",
            content: `Nom: ${input.fullName}\nEmail: ${input.email}\nTéléphone: ${input.phone}`,
          }).catch((error) => {
            logger.error("Failed to notify owner", error);
            // Don't fail the request if notification fails
          });

          return { success: true };
        } catch (error) {
          logger.error("Failed to submit contact form", error, {
            email: input.email,
            ip: ctx.req.ip,
          });
          throw error;
        }
      }),

    // Procédure protégée pour lister toutes les soumissions (admin uniquement)
    list: adminProcedure
      .input(
        z.object({
          limit: z.number().min(1).max(100).default(50).optional(),
          offset: z.number().min(0).default(0).optional(),
        }).optional()
      )
      .query(async ({ input }) => {
        const { getAllContactSubmissions } = await import("./db");
        // Use nullish coalescing to ensure default values are used when input is undefined
        // or when limit/offset are undefined, preventing undefined from being passed to the function
        return await getAllContactSubmissions(
          input?.limit ?? 50,
          input?.offset ?? 0
        );
      }),
  }),
});

export type AppRouter = typeof appRouter;
