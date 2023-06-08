import { z } from 'https://deno.land/x/zod/mod.ts';

export const localWalletSchema = z.object({
  name: z.string(),
  secrets: z.array(z.object({
  name: z.string()
})),
  artpaniAddress: z.string(),
  sevappAddress: z.string()
})

export type LocalWallet = z.infer<typeof localWalletSchema>;

//├─ name
//├─ secrets
//│  ├─ 0
//│  │  └─ name
//│  ├─ 1
//│  │  └─ name
//│  └─ 2
//│     └─ name
//├─ artpaniAddress
//└─ sevappAddress
//