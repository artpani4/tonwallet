import { getSecret } from 'https://deno.land/x/tuner@v0.0.6/src/manager.ts';
import { LocalWallet } from '../config/localWalletSchema.ts';
import manager from '../config/manager.ts';
import { getKeyPairByMnemonic } from '../helpers/walletUtils.ts';
import {
  makePayment,
  makePaymentFromInactive,
} from '../src/transfer.ts';

const config = await manager.loadConfig(
  (config: LocalWallet) => config.name === Deno.env.get('name'),
);
if (config === null) throw Error('No config');

const fundingKeys = await getKeyPairByMnemonic(
  getSecret('MNEMO')!,
);

// console.log(getSecret('MNEMO_TEST')!);
const targetKeys = await getKeyPairByMnemonic(
  getSecret('MNEMO_TEST')!,
);
// const key = await mnemonicToWalletKey(
//   manager.getSecret('mnemonic')!.split('_'),
// );

await makePaymentFromInactive(
  targetKeys.publicKey,
  targetKeys.secretKey,
  config.mainFundingAddress,
  'Вернул с помощью sendFromInactive',
);
