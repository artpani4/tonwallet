import { mnemonicToWalletKey } from 'npm:ton-crypto';
import { fromNano, TonClient, WalletContractV4 } from 'npm:ton';
import { getHttpEndpoint } from 'npm:@orbs-network/ton-access';

import manager from '../config/manager.ts';
import {
  TestnetConfig,
  testnetConfigSchema,
} from '../config/localConfigSchema.ts';

try {
  const config = await manager.localLoadConfig(
    (config: TestnetConfig) => config.name === Deno.env.get('name'),
  );
  const mnemonic = manager.getSecret('mnemonic');
  if (mnemonic === undefined) throw Error('No mnemonic!');
  const key = await mnemonicToWalletKey(mnemonic.split('_'));
  const wallet = WalletContractV4.create({
    publicKey: key.publicKey,
    workchain: 0,
  });
  const endpoint = await getHttpEndpoint({ network: 'testnet' });
  const client = new TonClient({ endpoint });
  console.log(fromNano(await client.getBalance(wallet.address)));
} catch (e) {
  console.log(e);
}
