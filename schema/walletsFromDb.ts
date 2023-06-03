import { z } from 'https://deno.land/x/zod/mod.ts';

export const walletsFromDbSchema = z.array(
  z.object({
    created_at: z.string(),
    address: z.string(),
    reserved: z.boolean(),
    invoice_id: z.literal(null),
    public_key: z.string(),
    private_key: z.string(),
    active: z.string(),
    last_transaction_hash: z.string().nullable(),
    last_transaction_lt: z.number().nullable(),
    mnemonic: z.string(),
    balance: z.number(),
    last_message: z.string(),
  }),
);

export type WalletsFromDb = z.infer<typeof walletsFromDbSchema>;
