import { LocalWallet } from '../config/localWalletSchema.ts';
import manager from '../config/manager.ts';
import { getWalletLowInfoByAddress } from '../src/wallet.ts';

try {
  const config = await manager.loadConfig(
    (config: LocalWallet) => config.name === Deno.env.get('name'),
  );
  if (config === null) throw new Error('Config not found');

  const myWalletInfo = await getWalletLowInfoByAddress(
    config?.artpaniAddress,
  );
  console.log(myWalletInfo);
  Deno.exit();
} catch (e) {
  console.log(e);
}
