//

import { getSecret } from 'https://deno.land/x/tuner@v0.0.6/src/manager.ts';
import { LocalWallet } from '../config/localWalletSchema.ts';
import manager from '../config/manager.ts';
import { supabase } from '../src/mod.ts';
import { createWallet } from '../src/wallet.ts';

const config = await manager.localLoadConfig(
  (config: LocalWallet) => config.name === Deno.env.get('name'),
);
if (config === null) throw Error('No config');
const database = supabase.createClient(
  getSecret('dbURL')!,
  getSecret('dbAPIKey')!,
);

for (let i = 0; i < 5; i++) {
  await createWallet(database);
}
