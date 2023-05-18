import { TestnetConfig } from '../config/localConfigSchema.ts';
import manager from '../config/manager.ts';
import {
  getKeyPairByMnemonic,
  getSecretBufferByMnemonic,
} from '../helpers/walletUtils.ts';
import { getWalletByAddressDb } from '../src/db/getter.ts';
import { strToBuf, supabase } from '../src/mod.ts';
import {
  activateWallet,
  createWallet,
  getWalletContractByAddress,
} from '../src/wallet.ts';

const config = await manager.localLoadConfig(
  (config: TestnetConfig) => config.name === Deno.env.get('name'),
);
if (config === null) throw Error('No config');
const database = supabase.createClient(
  manager.getSecret('dbURL')!,
  manager.getSecret('dbAPIKey')!,
);

const myKeys = await getKeyPairByMnemonic(
  manager.getSecret('mnemonic')!,
  '_',
);
const myWallet = await getWalletContractByAddress(
  config.testAddresses[0][1],
);
const myAddress = myWallet.address.toString();

const testwallet = await getWalletByAddressDb(
  database,
  'EQD1cM_4bMhmWlrRrkS8P71QEACDVmpu6Ng0kMOjnmCqqKJx',
);

await activateWallet(
  testwallet.address,
  testwallet.private_key,
  testwallet.public_key,
  myAddress,
  myKeys.secretKey,
);
