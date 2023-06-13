import { getSecret } from 'https://deno.land/x/tuner@v0.0.6/src/manager.ts';
import { LocalWallet } from '../config/localWalletSchema.ts';
import manager from '../config/manager.ts';

import { updateActualInfoDb } from '../src/db/setter.ts';
import { supabase } from '../src/mod.ts';
import { getWalletLowInfoByAddress } from '../src/wallet.ts';

const config = await manager.loadConfig(
  (config: LocalWallet) => config.name === Deno.env.get('name'),
);
if (config === null) throw Error('No config');
const database = supabase.createClient(
  getSecret('dbURL')!,
  getSecret('dbAPIKey')!,
);

await updateActualInfoDb(database);
// console.log(
//   await getWalletLowInfoByAddress(
//     'EQD9x7qR5gAsXtIfR-brqDIgUc6wQy59tM5UeI_O90M2afM1',
//   ),
// );
