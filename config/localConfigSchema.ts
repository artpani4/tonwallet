import { z } from 'https://deno.land/x/zod/mod.ts';

export const testnetConfigSchema = z.object({
  name: z.string(),
  secrets: z.array(z.object({
  name: z.string(),
  value: z.string()
})),
  testAddresses: z.array(z.array(z.string()))
})

export type TestnetConfig = z.infer<typeof testnetConfigSchema>;