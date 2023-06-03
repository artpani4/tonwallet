import manager from '../config/manager.ts';
import { getKeyPairByMnemonic } from '../helpers/walletUtils.ts';
import { updateActualInfoDb } from '../src/db/setter.ts';
import { supabase } from '../src/mod.ts';
import { estimateFee, withdrawToMain } from '../src/wallet.ts';

const config = await manager.localLoadConfig(
  (config: TestnetConfig) => config.name === Deno.env.get('name'),
);
if (config === null) throw Error('No config');
const database = supabase.createClient(
  manager.getSecret('dbURL')!,
  manager.getSecret('dbAPIKey')!,
);

const myAddress = 'EQBh_jk8-HKU8IHpS5L918vSsw3H2wq2zgRrJ6xVGvf9lwy5';

await withdrawToMain(database, myAddress, '0.08', '0.01');
