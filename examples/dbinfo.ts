//

import { generateSchema } from 'https://deno.land/x/tuner@v0.0.3/schema/generator.ts';
import { TestnetConfig } from '../config/localConfigSchema.ts';
import manager from '../config/manager.ts';
import {
  getAllWalletsDb,
  getWalletByAddressDb,
  getWalletsByActiveDb,
} from '../src/db/getter.ts';
import { supabase } from '../src/mod.ts';
import { createWallet } from '../src/wallet.ts';
import { WalletsFromDb } from '../schema/walletsFromDb.ts';

const config = await manager.localLoadConfig(
  (config: TestnetConfig) => config.name === Deno.env.get('name'),
);
if (config === null) throw Error('No config');
const database = supabase.createClient(
  manager.getSecret('dbURL')!,
  manager.getSecret('dbAPIKey')!,
);

// const data = (await getAllWalletsDb(database)) as WalletsFromDb;

// const wallet = await getWalletByAddressDb(
//   database,
//   'EQCBhNE0xw_mya6cTyFX7fwgPxG_c0bTaE-xU_s0aRLgSFYP',
// );
// console.log(wallet);

const inactiveWallets = await getWalletsByActiveDb(database, true);
console.log(inactiveWallets);
