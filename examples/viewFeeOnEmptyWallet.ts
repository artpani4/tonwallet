import { createDeferredPromise } from 'https://deno.land/std@0.177.0/node/internal/util.mjs';
import { TestnetConfig } from '../config/localConfigSchema.ts';
import manager from '../config/manager.ts';
import { supabase } from '../src/mod.ts';
import {
  createWallet,
  estimateFee,
  getBalanceByAddress,
  getNanoBalanceByAddress,
  getWalletContractByAddress,
} from '../src/wallet.ts';
import { getKeyPairByMnemonic } from '../helpers/walletUtils.ts';
import { makePaymentToInactive } from '../src/transfer.ts';

const config = await manager.localLoadConfig(
  (config: TestnetConfig) => config.name === Deno.env.get('name'),
);
if (config === null) throw Error('No config');
const database = supabase.createClient(
  manager.getSecret('dbURL')!,
  manager.getSecret('dbAPIKey')!,
);

const myAddress = 'EQBh_jk8-HKU8IHpS5L918vSsw3H2wq2zgRrJ6xVGvf9lwy5';
const newWallet = await createWallet(database);
console.log(newWallet.address);
console.log(
  `Мой баланс в нанотонах до отправки: ${await getNanoBalanceByAddress(
    myAddress,
  )}`,
);

const myKeys = await getKeyPairByMnemonic(
  manager.getSecret('mnemonic')!.split('_').join(' '),
);

const myWallet = await getWalletContractByAddress(myAddress);

const fee = await estimateFee(
  myAddress,
  newWallet.address,
  'ololo',
  0.1,
);

console.log(fee);

await makePaymentToInactive(
  myWallet,
  myKeys.secretKey,
  newWallet.address,
  '0.1',
  'ololo',
);
console.log(
  `Мой баланс в нанотонах после отправки: ${await getNanoBalanceByAddress(
    myAddress,
  )}`,
);
console.log(await getNanoBalanceByAddress(newWallet.address));
