import { TestnetConfig } from '../config/localConfigSchema.ts';
import manager from '../config/manager.ts';
import { sleep } from '../helpers/timer.ts';
import {
  getKeyPairByMnemonic,
  maybeNewClient,
  sumTotalFee,
} from '../helpers/walletUtils.ts';
import {
  Address,
  beginCell,
  fromNano,
  sign,
  strToBuf,
  supabase,
  toNano,
} from '../src/mod.ts';

import { getWalletContractByAddress } from '../src/wallet.ts';

import * as tw from 'https://raw.githubusercontent.com/toncenter/tonweb/52bef80dde9fef39c7573c3eca25bfeb62950e7b/dist/tonweb.js';

console.log(tw.default);
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

// const fee = await estimateFee(
//   sevAddress,
//   myAddress,
//   'Возвращаю',
//   1,
// );

const myKeys = await getKeyPairByMnemonic(
  manager.getSecret('mnemonic')!.split('_').join(' '),
);

export async function extBoc(
  fromAddress: string,
  toAddress: string,
  amount: string,
  message: string,
  fromSecretKey: string,
) {
  const client = await maybeNewClient();
  const wallet = await getWalletContractByAddress(myAddress);
  const openedWallet = client.open(wallet);
  const seqno = await openedWallet.getSeqno();

  let internalMessageBody = beginCell()
    .storeUint(0, 32)
    // write 32 zero bits to indicate that a text comment will follow
    .storeStringTail(message)
    // write our text comment
    .endCell();

  let internalMessage = beginCell()
    .storeUint(0, 1)
    // indicate that it is an internal message -> int_msg_info$0
    .storeBit(1)
    // IHR Disabled
    .storeBit(1)
    // bounce
    .storeBit(0)
    // bounced
    .storeUint(0, 2)
    // src -> addr_none
    .storeAddress(Address.parse(fromAddress))
    .storeCoins(toNano(amount))
    // amount
    .storeBit(0)
    // Extra currency
    .storeCoins(0)
    // IHR Fee
    .storeCoins(0)
    // Forwarding Fee
    .storeUint(0, 64)
    // Logical time of creation
    .storeUint(0, 32)
    // UNIX time of creation
    .storeBit(0)
    // No State Init
    .storeBit(1)
    // We store Message Body as a reference
    .storeRef(internalMessageBody)
    // Store Message Body as a reference
    .endCell();
  console.log(internalMessage.toBoc().toString('base64'));

  let toSign = beginCell()
    .storeUint(698983191, 32)
    // subwallet_id | We consider this further
    .storeUint(Math.floor(Date.now() / 1e3) + 60, 32)
    // Transaction expiration time, +60 = 1 minute
    .storeUint(seqno, 32)
    // store seqno
    .storeUint(3, 8)
    // store mode of our internal transaction
    .storeRef(internalMessage); // store our internalMessage as a reference

  let signature = sign(
    toSign.endCell().hash(),
    strToBuf(fromSecretKey),
  ); // get the hash of our message to wallet smart contract and sign it to get signature

  let body = beginCell()
    .storeBuffer(signature)
    // store signature
    .storeBuilder(toSign)
    // store our message
    .endCell();

  let externalMessage = beginCell()
    .storeUint(0b10, 2)
    // 0b10 -> 10 in binary
    .storeUint(0, 2)
    // src -> addr_none
    .storeAddress(Address.parse(toAddress))
    // Destination address
    .storeCoins(0)
    // Import Fee
    .storeBit(0)
    // No State Init
    .storeBit(1)
    // We store Message Body as a reference
    .storeRef(body)
    // Store Message Body as a reference
    .endCell();
  return externalMessage.toBoc().toString('base64');
}

export async function extBoc2(
  fromAddress: string,
  toAddress: string,
  amount: string,
  message: string,
  fromSecretKey: string,
) {
  const client = await maybeNewClient();
  const tonweb = new TonWeb();
  const wallet = tonweb.wallet.create({
    address: fromAddress,
  });
  const seqno = await wallet.methods.seqno().call();
  await sleep(1000);
  const transfer = wallet.methods.transfer(
    {
      secretKey: strToBuf(fromSecretKey),
      toAddress,
      amount: TonWeb.utils.toNano(amount), // 0.01 TON
      seqno: seqno as number,
      payload: message,
      sendMode: 3,
    },
  );
  return await transfer.estimateFee();
}

// const a = await extBoc(
//   myAddress,
//   sevAddress,
//   '1',
//   'жоска',
//   myKeys.secretKey,
// );
// console.log(a);

const a = await extBoc2(
  myAddress,
  sevAddress,
  '0.05',
  'комиссия должна быть 0.005943483',
  myKeys.secretKey,
);

console.log(fromNano(sumTotalFee(a.source_fees)));
