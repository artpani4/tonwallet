import { TestnetConfig } from '../config/localConfigSchema.ts';
import manager from '../config/manager.ts';
import { supabase } from '../src/mod.ts';

const config = await manager.localLoadConfig(
  (config: TestnetConfig) => config.name === Deno.env.get('name'),
);
if (config === null) throw Error('No config');
const database = supabase.createClient(
  manager.getSecret('dbURL')!,
  manager.getSecret('dbAPIKey')!,
);

const Wallets = database.channel('custom-all-channel')
  .on(
    'postgres_changes',
    { event: 'UPDATE', schema: 'public', table: 'Wallets' },
    (payload) => {
      console.log('Change received!', payload.new.active);
    },
  )
  .subscribe();

// await updateActivityWallet(database);
// const a = await getAllWalletsDb(database);
// console.log(a);
// const data = (await getAllWalletsDb(database)) as WalletsFromDb;

// const wallet = await getWalletByAddressDb(
//   database,
//   'EQCBhNE0xw_mya6cTyFX7fwgPxG_c0bTaE-xU_s0aRLgSFYP',
// );
// console.log(wallet);

// const inactiveWallets = await getWalletsByActiveDb(database, true);
// console.log(inactiveWallets);
// Добавить проверку активности кошельков и соотнесение с БД
