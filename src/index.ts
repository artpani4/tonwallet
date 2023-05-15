import manager from '../config/manager.ts';
import { TestnetConfig } from '../config/localConfigSchema.ts';
import { createWallet, getBalanceByMnemonic } from './wallet.ts';
import { mnemonicNew, supabase } from './mod.ts';

async function main() {
  const config = await manager.localLoadConfig(
    (config: TestnetConfig) => config.name === Deno.env.get('name'),
  );
  if (config === null) throw Error('No config');
  const database = supabase.createClient(
    manager.getSecret('dbURL')!,
    manager.getSecret('dbAPIKey')!,
  );
  await createWallet(database);
}

try {
  await main();
} catch (e) {
  console.log(e);
}
