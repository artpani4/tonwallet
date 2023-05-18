import axiod from 'https://deno.land/x/axiod/mod.ts';
import { TestnetConfig } from '../config/localConfigSchema.ts';
import manager from '../config/manager.ts';
import {
  getKeyPairByMnemonic,
  getWalletContractByAddress,
  maybeNewClient,
} from '../helpers/walletUtils.ts';
import { makePayment } from '../src/transfer.ts';

import * as base64 from 'https://deno.land/std@0.184.0/encoding/base64.ts';

// import { Buffer } from 'https://deno.land/std@0.139.0/node/buffer.ts';
import {
  getHttpEndpoint,
  internal,
  mnemonicToWalletKey,
  TonClient,
} from '../src/mod.ts';

import { Buffer } from 'https://deno.land/std@0.177.0/node/buffer.ts';
import { bufToStr, strToBuf } from '../helpers/buffer.ts';

const config = await manager.localLoadConfig(
  (config: TestnetConfig) => config.name === Deno.env.get('name'),
);
if (config === null) throw Error('No config');

const myKeys = await getKeyPairByMnemonic(
  manager.getSecret('mnemonic')!,
  '_',
);
// const key = await mnemonicToWalletKey(
//   manager.getSecret('mnemonic')!.split('_'),
// );

const myAddress =
  (config.testAddresses.find((a) => a[0] === 'artpani')!)[1];
const sevAddress =
  (config.testAddresses.find((a) => a[0] === 'sevapp')!)[1];
// console.log(`My address: ${myAddress}, SEV address: ${sevAddress}`);

const myWallet = await getWalletContractByAddress(myAddress);

await makePayment(
  myAddress,
  sevAddress,
  myKeys.secretKey,
  '0.05',
  'УРА!!!!',
);
