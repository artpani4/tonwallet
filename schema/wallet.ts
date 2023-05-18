import { z } from 'https://deno.land/x/zod/mod.ts';

export const walletByAddressSchema = z.object({
  address: z.string(),
  balance: z.number(),
  last_activity: z.number(),
  status: z.string(),
  interfaces: z.array(z.string()),
  get_methods: z.array(z.any()),
});

export type WalletByAddress = z.infer<typeof walletByAddressSchema>;
