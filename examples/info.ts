import axiod from 'https://deno.land/x/axiod/mod.ts';
import { TestnetConfig } from '../config/localConfigSchema.ts';
import manager from '../config/manager.ts';
import {
  getKeyPairByMnemonic,
  getWalletPublicKeyByAddress,
} from '../helpers/walletUtils.ts';
import { WalletByAddress } from '../schema/wallet.ts';
import { fromNano } from '../src/mod.ts';
import { getWalletLowInfoByAddress } from '../src/wallet.ts';

const config = await manager.localLoadConfig(
  (config: TestnetConfig) => config.name === Deno.env.get('name'),
);
if (config === null) throw Error('No config');

const testAddress =
  config.testAddresses.filter((add) => add[0] == 'sevapp')[0][1];

// const myPub =
//   (await getKeyPairByMnemonic(manager.getSecret('mnemonic')!))
//     .publicKey.toString('hex');
// console.log(myPub);

// const a = await getKeyPairByMnemonic(manager.getSecret('mnemonic')!);
// console.log(a.publicKey.toString('hex'));
// const [balance, error] = await getBalanceByAddressMainnet(
//   config.testAddresses[0][1],
// );
// if (error) console.log('Error');
// console.log(fromNano(balance));
