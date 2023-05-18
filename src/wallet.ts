import {
  getWalletPublicKeyByAddress,
} from '../helpers/walletUtils.ts';
import {
  Buffer,
  fromNano,
  getHttpEndpoint,
  internal,
  mnemonicNew,
  mnemonicToWalletKey,
  supabase,
  TonClient,
  WalletContractV4,
} from './mod.ts';
import { waitForTransaction } from '../helpers/walletUtils.ts';

import { addWallet } from './db/setter.ts';
import axiod from 'https://deno.land/x/axiod/mod.ts';
import { generateSchema } from 'https://deno.land/x/tuner@v0.0.3/schema/generator.ts';
import { WalletByAddress } from '../schema/wallet.ts';

export interface IWallet {
  privateKey: string;
  publicKey: string;
  mnemonic: string[];
  address: string;
}

// export async function getBalanceByMnemonic(
//   mnemonic: string,
//   divider = ' ',
//   network: 'testnet' | 'mainnet' = 'testnet',
// ) {
//   const key = await mnemonicToWalletKey(mnemonic.split(divider));
//   //   console.log(`Public key: ${key.publicKey.toString('hex')}`);
//   //   const buffer = Buffer.from(str, "hex"); -обратное преобразование
//   return await getBalanceByPublicKey(key.publicKey, network);
// }
// export async function getBalanceByPublicKey(
//   publicKey: Buffer,
//   network: 'testnet' | 'mainnet' = 'testnet',
// ) {
//   const wallet = WalletContractV4.create({
//     publicKey,
//     workchain: 0,
//   });
//   const endpoint = await getHttpEndpoint({ network });
//   const client = new TonClient({ endpoint });
//   return fromNano(await client.getBalance(wallet.address));
// }
// export async function getWalletByAddress(address: string) {
//   const [maybeKey, error] = await getWalletPublicKeyByAddress(
//     address,
//   );
//   if (error) {
//     throw new Error(error);
//   }
//   if (!maybeKey) {
//     throw new Error('Wallet not found');
//   }
//   const publicKey = maybeKey;
//   const wallet = WalletContractV4.create({
//     publicKey: Buffer.from(publicKey, 'hex'),
//     workchain: 0,
//   });
//   return wallet;
// }

// export async function getBalanceByAddress(
//   address: string,
//   clientTon?: TonClient,
// ) {
//   const client = await maybeNewClient(clientTon);
//   const wallet = await getWalletByAddress(address);
//   return fromNano(await client.getBalance(wallet.address));
// }

// export async function getBalanceByAddressMainnet(
//   address: string,
// ) {
//   try {
//     const res = await axiod.get(
//       `https://toncenter.com/api/v2/getAddressBalance?address=${address}`,
//     );
//     const balance = res.data.result as string;
//     return [balance, null];
//   } catch (e: any) {
//     if (e.response && e.response.data && e.response.data.error) {
//       const error = e.response.data.error;
//       return [null, error];
//     } else {
//       return [null, 'Unknown error'];
//     }
//   }
// }

export async function createWallet(
  db: supabase.SupabaseClient<any, 'public', any>,
) {
  const mnemonic = await mnemonicNew();
  const wallet = await initializeWallet(mnemonic);
  const [data, error] = await addWallet(db, wallet);
  if (error) {
    throw new Error(error.message);
  }
  console.log(wallet);
}

// export async function activateWallet(
//   publicKeyTarget: string,
//   secretKeyTarget: string,
//   publicKeyFunding: string,
//   secretKeyFunding: string,
//   clientTon?: TonClient,
// ) {
//   const client = await maybeNewClient(clientTon);
//   const targetWallet = await getWalletContractByPublic(
//     publicKeyTarget,
//   );
//   // console.log(targetWallet.address.toString());

//   // Фактически адрес не активирован
//   if (!(await client.isContractDeployed(targetWallet.address))) {
//     const fundingWallet = await getWalletContractByPublic(
//       publicKeyFunding,
//     );
//     // console.log(fundingWallet.address.toString());

//     let fundingWalletContract = client.open(fundingWallet);
//     let seqno = await fundingWalletContract.getSeqno();
//     await fundingWalletContract.sendTransfer({
//       // secretKey: Buffer.from(secretKeyFunding, 'hex'),
//       secretKey: Buffer.from(secretKeyFunding, 'hex'),
//       seqno: seqno,
//       messages: [
//         internal({
//           to: targetWallet.address,
//           value: '0.09', // 0.001 TON
//           bounce: false,
//         }),
//       ],
//     });
//     console.log('EHF');

//     const targetWalletContract = client.open(targetWallet);
//     seqno = await targetWalletContract.getSeqno();
//     await targetWalletContract.sendTransfer({
//       secretKey: Buffer.from(secretKeyTarget, 'hex'),
//       seqno: seqno,
//       messages: [
//         internal({
//           to: fundingWallet.address,
//           value: '0.09',
//           bounce: false,
//         }),
//       ],
//     });
//     await waitForTransaction(seqno, targetWalletContract, 1500);
//   }
// }

export async function maybeNewClient(client?: TonClient) {
  if (!client) {
    const endpoint = await getHttpEndpoint();
    client = new TonClient({ endpoint });
  }
  return client;
}

export async function initializeWallet(
  mnemonic: string[],
  clientTon?: TonClient,
): Promise<IWallet> {
  const key = await mnemonicToWalletKey(mnemonic);
  const generatedWallet = WalletContractV4.create({
    publicKey: key.publicKey,
    workchain: 0,
  });

  const client = await maybeNewClient(clientTon);

  return {
    privateKey: key.secretKey.toString('hex'),
    publicKey: key.publicKey.toString('hex'),
    mnemonic,
    address: generatedWallet.address.toString(),
  };
}

export async function getWalletLowInfoByAddress(
  address: string,
): Promise<WalletByAddress | null> {
  try {
    const res = await axiod.get(
      `https://tonapi.io/v2/accounts/${address}`,
    );
    if (res.status !== 200) {
      return null;
    }
    return res.data as WalletByAddress;
  } catch (e: any) {
    return null;
  }
}

// generateSchema(a, 'walletByAddress', 'schema/wallet.ts');
