import { getWalletLowInfoByAddress } from '../src/wallet.ts';

const a = await getWalletLowInfoByAddress(
  'EQBh_jk8-HKU8IHpS5L918vSsw3H2wq2zgRrJ6xVGvf9lwy5',
);
console.log(a);
