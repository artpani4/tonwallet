import { getSecret } from 'https://deno.land/x/tuner@v0.0.6/src/manager.ts';
import { LocalWallet } from '../config/localWalletSchema.ts';
import manager from '../config/manager.ts';

import { supabase } from '../src/mod.ts';

const config = await manager.loadConfig(
  (config: LocalWallet) => config.name === Deno.env.get('name'),
);
if (config === null) throw Error('No config');
const database = supabase.createClient(
  getSecret('dbURL')!,
  getSecret('dbAPIKey')!,
);

const myAddress = 'EQBh_jk8-HKU8IHpS5L918vSsw3H2wq2zgRrJ6xVGvf9lwy5';

// await withdrawToMain(database, myAddress, '0.08', '0.01');
