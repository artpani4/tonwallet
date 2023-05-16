import manager from '../config/manager.ts';
import { TestnetConfig } from '../config/localConfigSchema.ts';
import { getBalanceByMnemonic } from './wallet.ts';
import { mnemonicNew, supabase } from './mod.ts';
// import { sleep } from '../helpers/timer.ts';

async function main() {
  const config = await manager.localLoadConfig(
    (config: TestnetConfig) => config.name === Deno.env.get('name'),
  );
  if (config === null) throw Error('No config');
  const mnemonic = manager.getSecret('mnemonic');
  if (mnemonic === undefined) throw Error('No mnemonic!');
  const database = supabase.createClient(
    manager.getSecret('dbURL')!,
    manager.getSecret('dbAPIKey')!,
  );

  const { data: Wallets, error } = await database
    .from('Wallets').select('address');
  console.log(Wallets);
}

try {
  await main();
} catch (e) {
  console.log(e);
}
