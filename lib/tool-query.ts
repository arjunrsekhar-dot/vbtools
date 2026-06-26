import { z } from "zod";

export const toolQuerySchema = z.object({
  q: z.string().trim().max(120).optional().default(""),
  category: z.string().trim().max(80).optional(),
  page: z.coerce.number().int().min(1).max(1000).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(50),
  sort: z.enum(["relevance", "rating", "views", "newest"]).optional().default("relevance")
}).strict();
