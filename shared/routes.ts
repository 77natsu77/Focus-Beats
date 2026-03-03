import { z } from 'zod';
import { insertFocusSessionSchema, focusSessions } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  sessions: {
    list: {
      method: 'GET' as const,
      path: '/api/sessions' as const,
      responses: {
        200: z.array(z.custom<typeof focusSessions.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/sessions' as const,
      input: insertFocusSessionSchema,
      responses: {
        201: z.custom<typeof focusSessions.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type FocusSessionInput = z.infer<typeof api.sessions.create.input>;
export type FocusSessionResponse = z.infer<typeof api.sessions.create.responses[201]>;
export type FocusSessionsListResponse = z.infer<typeof api.sessions.list.responses[200]>;
