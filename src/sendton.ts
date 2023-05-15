import manager from '../config/manager.ts';
import { TestnetConfig } from '../config/localConfigSchema.ts';
import { getBalanceByMnemonic } from './wallet.ts';
import { mnemonicNew } from './mod.ts';
// import { sleep } from '../helpers/timer.ts';
import * as supabase from 'https://esm.sh/@supabase/supabase-js@2.14.0';

async function main() {
  const config = await manager.localLoadConfig(
    (config: TestnetConfig) => config.name === Deno.env.get('name'),
  );
  if (config === null) throw Error('No config');
  const mnemonic = manager.getSecret('mnemonic');
  if (mnemonic === undefined) throw Error('No mnemonic!');
  // console.log(await getBalanceByMnemonic(mnemonic, '_'));
  // console.log(await mnemonicNew());
  // if (!client.isContractDeployed(wallet.address)) {
  //   throw Error('Contract not deployed!');
  // }
  // const WalletContract = client.open(wallet);
  // const seqno = await WalletContract.getSeqno();
  // WalletContract.sendTransfer({
  //   seqno,
  //   secretKey: key.secretKey,
  //   messages: [
  //     internal({
  //       to: config.sevappWalletAddress,
  //       value: '0.05',
  //       body: 'Bounce true!',
  //       bounce: true,
  //     }),
  //   ],
  // });
  // let currentSeqno = seqno;
  // while (currentSeqno == seqno) {
  //   console.log('waiting for transaction to confirm...');
  //   await sleep(1500);
  //   currentSeqno = await WalletContract.getSeqno();
  // }
  // console.log('transaction confirmed!');
  const database = supabase.createClient(
    manager.getSecret('dbURL')!,
    manager.getSecret('dbAPIKey')!,
  );

  const { data: Wallets, error } = await database
    .from('Wallets').select('address');
  console.log(Wallets);
}

try {
  await main();
} catch (e) {
  console.log(e);
}
