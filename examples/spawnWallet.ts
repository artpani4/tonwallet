//

import { TestnetConfig } from '../config/localConfigSchema.ts';
import manager from '../config/manager.ts';
import { supabase } from '../src/mod.ts';
import { createWallet } from '../src/wallet.ts';

const config = await manager.localLoadConfig(
  (config: TestnetConfig) => config.name === Deno.env.get('name'),
);
if (config === null) throw Error('No config');
const database = supabase.createClient(
  manager.getSecret('dbURL')!,
  manager.getSecret('dbAPIKey')!,
);

for (let i = 0; i < 5; i++) {
  await createWallet(database);
}
