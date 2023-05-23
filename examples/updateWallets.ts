import { TestnetConfig } from '../config/localConfigSchema.ts';
import manager from '../config/manager.ts';
import { getKeyPairByMnemonic } from '../helpers/walletUtils.ts';
import { updateActualInfoDb } from '../src/db/setter.ts';
import { supabase } from '../src/mod.ts';
import { estimateFee } from '../src/wallet.ts';

const config = await manager.localLoadConfig(
  (config: TestnetConfig) => config.name === Deno.env.get('name'),
);
if (config === null) throw Error('No config');
const database = supabase.createClient(
  manager.getSecret('dbURL')!,
  manager.getSecret('dbAPIKey')!,
);

await updateActualInfoDb(database);
