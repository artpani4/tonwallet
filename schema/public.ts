import { z } from 'https://deno.land/x/zod/mod.ts';

export const publicByAddressSchema = z.object({
  success: z.boolean(),
  exit_code: z.number(),
  stack: z.array(z.union([z.object({
  type: z.string(),
  cell: z.string()
}),z.object({
  type: z.string(),
  num: z.string()
})]))
})

export type PublicByAddress = z.infer<typeof publicByAddressSchema>;