import { z } from 'https://deno.land/x/zod/mod.ts';

export const walletsFromDbSchema = z.array(
  z.object({
    created_at: z.string(),
    address: z.string(),
    reserved: z.boolean(),
    invoice_id: z.literal(null),
    public_key: z.string(),
    private_key: z.string(),
    active: z.boolean(),
    last_transaction_hash: z.literal(null),
    last_transaction_lt: z.number(),
    mnemonic: z.string(),
  }),
);

export type WalletsFromDb = z.infer<typeof walletsFromDbSchema>;
