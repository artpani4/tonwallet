import {
  getWalletContractByPublic,
  getWalletPublicKeyByAddress,
  maybeNewClient,
} from '../helpers/walletUtils.ts';
import {
  getHttpEndpoint,
  internal,
  mnemonicToWalletKey,
  supabase,
  TonClient,
  WalletContractV4,
} from './mod.ts';
import { Buffer } from 'https://deno.land/std@0.139.0/node/buffer.ts';
import { getKeyPairByAddressDb } from '../helpers/db.ts';
import manager from '../config/manager.ts';
import { TestnetConfig } from '../config/localConfigSchema.ts';

const config = await manager.localLoadConfig(
  (config: TestnetConfig) => config.name === Deno.env.get('name'),
);
if (config === null) throw Error('No config');

const mnemonic = manager.getSecret('mnemonic')!;
const key = await mnemonicToWalletKey(mnemonic.split('_'));

// const myWallet = await getWalletContractByPublic(
//   key.publicKey.toString('hex'),
// );
// const toWallet = await getWalletContractByPublic(
//   '34d9401c5279d2238d5d01b8687d2bfd6918ca32bb02427285f63ae65ea2d5a7',
// );
// console.log(
//   'another wallet address',
//   myWallet.address.toString(),
// );

// const endpoint = await getHttpEndpoint({ network: 'testnet' });
// const client = new TonClient({ endpoint });

// // // make sure wallet is deployed
// if (!await client.isContractDeployed(myWallet.address)) {
//   console.log('wallet is not deployed');
// }

// const walletContract = client.open(myWallet);
// const seqno = await walletContract.getSeqno();
// await walletContract.sendTransfer({
//   secretKey: Buffer.from(key.secretKey.toString('hex'), 'hex'),
//   seqno: seqno,
//   messages: [
//     internal({
//       to: toWallet.address.toString(),
//       value: '0.05',
//       body: 'Hello from pure',
//       bounce: false,
//     }),
//   ],
// });

// async function makePayment(
//   senderPublicKey: string,
//   senderSecretKey: string,
//   recipientPublicKey: string,
//   amount: string,
//   body?: string,
//   clientTon?: TonClient,
// ) {
//   const client = await maybeNewClient(clientTon);

//   const senderWallet = await getWalletContractByPublic(
//     senderPublicKey,
//   );
//   const recipientWallet = await getWalletContractByPublic(
//     recipientPublicKey,
//   );

//   // Проверка, развернут ли кошелек отправителя
//   if (!await client.isContractDeployed(senderWallet.address)) {
//     console.log('Sender wallet is not deployed');
//     return;
//   }

//   // Получение последовательного номера последней транзакции отправителя
//   const walletContract = client.open(senderWallet);
//   const seqno = await walletContract.getSeqno();

//   console.log(`secretKey: ${Buffer.from(senderSecretKey, 'hex')}\n
//   seqno: ${seqno}\n
// recipientWallet: ${recipientWallet.address.toString()}\n
// amount: ${amount}\n
// body: ${body}\n
//     `);
//   // Отправка платежа
//   await walletContract.sendTransfer({
//     secretKey: Buffer.from(senderSecretKey, 'hex'),
//     seqno: seqno,
//     messages: [
//       internal({
//         to: recipientWallet.address.toString(),
//         value: amount,
//         body: body,
//         bounce: false,
//       }),
//     ],
//   });

//   console.log('Payment sent successfully');
// }

// const database = supabase.createClient(
//   manager.getSecret('dbURL')!,
//   manager.getSecret('dbAPIKey')!,
// );
// const keys = await getKeyPairByAddressDb(
//   database,
//   'EQDDf-ApSxc5RtNzmhUySWWv_U-5ONRXyT10sTXvaI1iISRQ',
// );
// await makePayment(
//   key.publicKey.toString('hex'),
//   key.secretKey.toString('hex'),
//   keys.public_key.toString(),
//   '0.05',
//   'Hello from makepayment',
// );

export async function makePayment(
  senderAddress: string,
  recipientAddress: string,
  senderSecretKey: string,
  amount: string,
  body?: string,
  clientTon?: TonClient,
) {
  const client = await maybeNewClient(clientTon);

  const [senderPublicKey, senderError] =
    await getWalletPublicKeyByAddress(senderAddress);
  if (senderError || senderPublicKey === null) {
    console.log('Failed to retrieve sender public key:', senderError);
    return;
  }

  const [recipientPublicKey, recipientError] =
    await getWalletPublicKeyByAddress(recipientAddress);
  if (recipientError || recipientPublicKey === null) {
    console.log(
      'Failed to retrieve recipient public key:',
      recipientError,
    );
    return;
  }

  const senderWallet = await getWalletContractByPublic(
    senderPublicKey,
  );
  const recipientWallet = await getWalletContractByPublic(
    recipientPublicKey,
  );

  // Проверка, развернут ли кошелек отправителя
  if (!await client.isContractDeployed(senderWallet.address)) {
    console.log('Sender wallet is not deployed');
    return;
  }

  // Получение последовательного номера последней транзакции отправителя
  const walletContract = client.open(senderWallet);
  const seqno = await walletContract.getSeqno();

  console.log(`secretKey: ${Buffer.from(senderSecretKey, 'hex')}
  seqno: ${seqno}
  recipientWallet: ${recipientWallet.address.toString()}
  amount: ${amount}
  body: ${body}`);

  // Отправка платежа
  await walletContract.sendTransfer({
    secretKey: Buffer.from(senderSecretKey, 'hex'),
    seqno: seqno,
    messages: [
      internal({
        to: recipientWallet.address.toString(),
        value: amount,
        body: body,
        bounce: false,
      }),
    ],
  });

  console.log('Payment sent successfully');
}
