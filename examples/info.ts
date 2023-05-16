import axiod from 'https://deno.land/x/axiod/mod.ts';
import { TestnetConfig } from '../config/localConfigSchema.ts';
import manager from '../config/manager.ts';
import { getKeyPairByMnemonic } from '../helpers/walletUtils.ts';
import { fromNano } from '../src/mod.ts';

const config = await manager.localLoadConfig(
  (config: TestnetConfig) => config.name === Deno.env.get('name'),
);
if (config === null) throw Error('No config');

const a = await getKeyPairByMnemonic(manager.getSecret('mnemonic')!);
console.log(a.publicKey.toString('hex'));
// const [balance, error] = await getBalanceByAddressMainnet(
//   config.testAddresses[0][1],
// );
// if (error) console.log('Error');
// console.log(fromNano(balance));

export async function getBalanceByAddressMainnet(
  address: string,
) {
  try {
    const res = await axiod.get(
      `https://toncenter.com/api/v2/getAddressBalance?address=${address}`,
    );
    const balance = res.data.result as string;
    return [balance, null];
  } catch (e: any) {
    if (e.response && e.response.data && e.response.data.error) {
      const error = e.response.data.error;
      return [null, error];
    } else {
      return [null, 'Unknown error'];
    }
  }
}
