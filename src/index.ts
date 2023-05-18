import manager from '../config/manager.ts';
import { TestnetConfig } from '../config/localConfigSchema.ts';
import { supabase } from './mod.ts';
import { getKeyPairByAddressDb } from '../helpers/db.ts';
import { getKeyPairByMnemonic } from '../helpers/walletUtils.ts';
import { Buffer } from 'https://deno.land/std@0.139.0/node/buffer.ts';

const config = await manager.localLoadConfig(
  (config: TestnetConfig) => config.name === Deno.env.get('name'),
);
if (config === null) throw Error('No config');
const database = supabase.createClient(
  manager.getSecret('dbURL')!,
  manager.getSecret('dbAPIKey')!,
);
console.log(Deno.env.get('to')!);
// const keys = await getKeyPairByAddressDb(
//   database,
//   Deno.env.get('to')!,
// );
const myKeys = await getKeyPairByMnemonic(
  manager.getSecret('mnemonic')!,
);
// activateWallet(
//   keys.public_key,
//   keys.private_key,
//   myKeys.publicKey.toString('hex'),
//   myKeys.secretKey.toString('hex'),
// );

// await sendTransferByKeys({
//   toPublicKey: keys.public_key,
//   fromPublicKey: myKeys.publicKey.toString('hex'),
//   fromSecretKey: myKeys.secretKey.toString('hex'),
//   amount: '0.05',
//   body: 'Отправка через sendTransferByKeys',
// });

// await sendTransferByKeys({
//   toPublicKey: keys.public_key,
//   fromPublicKey: Deno.env.get('public')!,
//   fromSecretKey: Deno.env.get('secret')!,
//   amount: '0.05',
//   body: 'Отправка c БД через sendTransferByKeys на artpani',
// });

//   for (let i = 0; i < 10; i++) {
//     await createWallet(database);
//   }
