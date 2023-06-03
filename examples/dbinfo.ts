import { LocalWallet } from '../config/localWalletSchema.ts';
import manager from '../config/manager.ts';

try {
  const config = await manager.loadConfig(
    (config: LocalWallet) => config.name === Deno.env.get('name'),
  );
  console.log(config);
  // const dbApiKey = manager.getSecret('dbAPIKey');
  // const dbUrl = manager.getSecret('dbURL');
} catch (e) {
  console.log(e);
}
