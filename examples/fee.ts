import { TestnetConfig } from '../config/localConfigSchema.ts';
import manager from '../config/manager.ts';
import { getKeyPairByMnemonic } from '../helpers/walletUtils.ts';
import { bufToStr, strToBuf, supabase } from '../src/mod.ts';
import { makePayment } from '../src/transfer.ts';
import { estimateFee } from '../src/wallet.ts';

const config = await manager.localLoadConfig(
  (config: TestnetConfig) => config.name === Deno.env.get('name'),
);
if (config === null) throw Error('No config');
const database = supabase.createClient(
  manager.getSecret('dbURL')!,
  manager.getSecret('dbAPIKey')!,
);
const myAddress = 'EQBh_jk8-HKU8IHpS5L918vSsw3H2wq2zgRrJ6xVGvf9lwy5';
const sevAddress = 'EQBiaSPuG33CuKXHClwsVvA-SazmLmtiTfXV7dQnqJdIlGgI';

const fee = await estimateFee(
  sevAddress,
  myAddress,
  'Возвращаю',
  1,
);

console.log(fee);

const myKeys = await getKeyPairByMnemonic(
  manager.getSecret('mnemonic')!.split('_').join(' '),
);
// console.log(strToBuf(myKeys.secretKey));
// console.log(
//   `Тут разбивка всех фии в нанотонах: ${JSON.stringify(fee)}`,
// );
// await makePayment(
//   myAddress,
//   sevAddress,
//   myKeys.secretKey,
//   '1',
//   `Тут разбивка всех фии в нанотонах: ${JSON.stringify(fee)}`,
// );
