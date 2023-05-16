import { mnemonicToWalletKey } from '../src/mod.ts';
import {
  getHttpEndpoint,
  OpenedContract,
  TonClient,
  WalletContractV4,
} from './mod.ts';
import { sleep } from './timer.ts';
import { Buffer } from 'https://deno.land/std@0.139.0/node/buffer.ts';
import axiod from 'https://deno.land/x/axiod/mod.ts';
export async function getWalletContractByPublic(public_key: string) {
  const wallet = WalletContractV4.create({
    publicKey: Buffer.from(public_key, 'hex'),
    workchain: 0,
  });
  return wallet;
}

export async function getKeyPairByMnemonic(
  mnemonic: string,
  divider = ' ',
) {
  const key = await mnemonicToWalletKey(mnemonic.split(divider));
  return key;
}

export async function getSecretBufferByMnemonic(
  mnemonic: string,
  divider = ' ',
) {
  const key = await getKeyPairByMnemonic(mnemonic, divider);
  return key.secretKey;
}

export async function getSecretStringByMnemonic(
  mnemonic: string,
  divider = ' ',
) {
  const key = await getKeyPairByMnemonic(mnemonic, divider);
  return key.secretKey.toString('hex');
}

export async function getWalletPublicKeyByAddress(
  address: string,
): Promise<[string | null, string | null]> {
  try {
    const response = await axiod.get(
      `https://tonapi.io/v1/wallet/getWalletPublicKey?account=${address}`,
    );
    const publicKey = response.data.publicKey as string;
    return [publicKey, null];
  } catch (e: any) {
    if (e.response && e.response.data && e.response.data.error) {
      const error = e.response.data.error;
      return [null, error];
    } else {
      return [null, 'Unknown error'];
    }
  }
}

export async function maybeNewClient(clientTon?: TonClient) {
  if (!clientTon) {
    const endpoint = await getHttpEndpoint();
    return new TonClient({ endpoint });
  }
  return clientTon;
}

export async function waitForTransaction(
  seqno: number,
  OpenedWalletContract: OpenedContract<WalletContractV4>,
  delayms: number,
) {
  const smallAddress = OpenedWalletContract.address.toString().slice(
    -5,
  );
  let currentSeqno = seqno;
  while (currentSeqno == seqno) {
    console.log(
      `waiting for transaction ${smallAddress} to confirm...`,
    );
    await sleep(delayms);
    currentSeqno = await OpenedWalletContract.getSeqno();
  }
  console.log(`transaction for ${smallAddress} confirmed!`);
}

// interface ITransferParamsKeys {
//   fromPublicKey: string;
//   toPublicKey: string;
//   fromSecretKey: string;

//   amount: string;
//   body?: string;
// }

// export async function sendTransferByKeys(
//   options: ITransferParamsKeys,
//   clientTon?: TonClient,
// ) {
//   const client = await maybeNewClient(clientTon);
//   const {
//     fromPublicKey,
//     fromSecretKey,
//     toPublicKey,
//     amount,
//     body,
//   } = options;
//   const fromWallet = await getWalletContractByPublic(
//     fromPublicKey,
//   );
//   const toWallet = await getWalletContractByPublic(
//     toPublicKey,
//   );
//   if (!await client.isContractDeployed(fromWallet.address)) {
//     console.log('Sender wallet is not deployed');
//     return;
//   }

//   const fromWalletOpenContract = client.open(fromWallet);
//   // const toWalletOpenContract = client.open(toWallet);
//   const seqno = await fromWalletOpenContract.getSeqno();
//   // console.log(toWallet.address.toString());
//   console.log(`secretKey : ${Buffer.from(fromSecretKey, 'hex')}\n
//   seqno : ${seqno}\n
//    toAddress : ${toWallet.address.toString()}\n
//    amount : ${amount}\n
//    body : ${body}\n`);
//   await fromWalletOpenContract.sendTransfer({
//     secretKey: Buffer.from(fromSecretKey, 'hex'),
//     seqno: seqno,
//     messages: [
//       internal({
//         to: toWallet.address.toString(),
//         value: amount,
//         bounce: false,
//         body: body,
//       }),
//     ],
//   });
//   console.log('Payment sent successfully');
//   // await waitForTransaction(seqno, toWallet.address.toString(), 1500);
// }

// // interface ITransferParamsAddress {
// //   fromAddress: string;
// //   toAddress: string;
// //   amount: string;
// //   body?: string;
// //   fromSecretKey: string;
// // }
