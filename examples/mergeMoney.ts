import { getSecret } from 'https://deno.land/x/tuner@v0.0.6/src/manager.ts';
import { LocalWallet } from '../config/localWalletSchema.ts';
import manager from '../config/manager.ts';

import { supabase } from '../src/mod.ts';
import { withdrawToMain } from '../src/wallet.ts';

const config = await manager.loadConfig(
  (config: LocalWallet) => config.name === Deno.env.get('name'),
);
if (config === null) throw Error('No config');
const database = supabase.createClient(
  getSecret('dbURL')!,
  getSecret('dbAPIKey')!,
);

const myAddress = config.mainFundingAddress;

await withdrawToMain(database, myAddress, '0.0001');
