import { getSecret } from 'https://deno.land/x/tuner@v0.0.6/src/manager.ts';
import { getKeyPairByMnemonic } from '../helpers/walletUtils.ts';
import { supabase } from '../src/mod.ts';
import { activateWallet } from '../src/wallet.ts';
import config from './config.ts';

if (!config) {
  throw new Error('config not found');
}
const database = supabase.createClient(
  getSecret('dbURL')!,
  getSecret('dbAPIKey')!,
);

const fundingKeys = await getKeyPairByMnemonic(
  getSecret('MNEMO')!,
);

const targetKeys = await getKeyPairByMnemonic(
  getSecret('MNEMO_TEST'),
);

await activateWallet(
  config.testAddress,
  targetKeys.secretKey,
  targetKeys.publicKey,
  config.mainFundingAddress,
  fundingKeys.secretKey,
  database,
);
// await makePaymentFromInactive(
//   targetKeys.publicKey,
//   targetKeys.secretKey,
//   config.mainFundingAddress,
//   '0.01',
//   'ОПА!',
// );

// const testwallet = await getWalletByAddressDb(
//   database,
//   'EQD1cM_4bMhmWlrRrkS8P71QEACDVmpu6Ng0kMOjnmCqqKJx',
// );

// await activateWallet(
//   testwallet.address,
//   testwallet.private_key,
//   testwallet.public_key,
//   myAddress,
//   myKeys.secretKey,
// );
