import { getSecret } from 'https://deno.land/x/tuner@v0.0.6/src/manager.ts';
import { LocalWallet } from '../config/localWalletSchema.ts';
import manager from '../config/manager.ts';
import { getKeyPairByMnemonic } from '../helpers/walletUtils.ts';
import { makePayment } from '../src/transfer.ts';

const config = await manager.loadConfig(
  (config: LocalWallet) => config.name === Deno.env.get('name'),
);
if (config === null) throw Error('No config');

const myKeys = await getKeyPairByMnemonic(
  getSecret('MNEMO')!,
  '_',
);
// const key = await mnemonicToWalletKey(
//   manager.getSecret('mnemonic')!.split('_'),
// );

await makePayment(
  config.artpaniAddress,
  config.sevappAddress,
  myKeys.secretKey,
  '0.05',
  'Отправил, заюзав конфиг в ноушене',
);
