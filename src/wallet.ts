import { addWallet } from '../helpers/db.ts';
import {
  fromNano,
  getHttpEndpoint,
  mnemonicNew,
  mnemonicToWalletKey,
  supabase,
  TonClient,
  WalletContractV4,
} from './mod.ts';
import { Buffer } from './mod.ts';

export interface IWallet {
  privateKey: string;
  publicKey: string;
  mnemonic: string[];
  address: string;
}

export async function getBalanceByMnemonic(
  mnemonic: string,
  divider = ' ',
  network: 'testnet' | 'mainnet' = 'testnet',
) {
  const key = await mnemonicToWalletKey(mnemonic.split(divider));
  //   console.log(`Public key: ${key.publicKey.toString('hex')}`);
  //   const buffer = Buffer.from(str, "hex"); -обратное преобразование
  return await getBalanceByPublicKey(key.publicKey, network);
}
export async function getBalanceByPublicKey(
  publicKey: Buffer,
  network: 'testnet' | 'mainnet' = 'testnet',
) {
  const wallet = WalletContractV4.create({
    publicKey,
    workchain: 0,
  });
  const endpoint = await getHttpEndpoint({ network });
  const client = new TonClient({ endpoint });
  return fromNano(await client.getBalance(wallet.address));
}
export async function getBalanceByAddress() {}

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

export async function initializeWallet(
  mnemonic: string[],
  network: 'testnet' | 'mainnet' = 'mainnet',
  client?: TonClient,
): Promise<IWallet> {
  const key = await mnemonicToWalletKey(mnemonic);
  const generatedWallet = WalletContractV4.create({
    publicKey: key.publicKey,
    workchain: 0,
  });
  if (!client) {
    const endpoint = await getHttpEndpoint({ network });
    const client = new TonClient({ endpoint });
  }
  console.log(generatedWallet.address.toString());
  // let walletContract = client.open(generatedWallet);
  // let seqno = await walletContract.getSeqno();
  // await walletContract.sendTransfer({
  //   secretKey: key.secretKey,
  //   seqno: seqno,
  //   messages: [
  //     internal({
  //       to: generatedWallet.address,
  //       value: '0.09', // 0.001 TON
  //       bounce: false,
  //     }),
  //   ],
  // });

  // walletContract = client.open(generatedWallet);
  // seqno = await walletContract.getSeqno();
  // await walletContract.sendTransfer({
  //   secretKey: key.secretKey,
  //   seqno: seqno,
  //   messages: [
  //     internal({
  //       to: fundingWallet.address,
  //       value: '0.09', // 0.001 TON
  //       bounce: false,
  //     }),
  //   ],
  // });

  // await waitForTransaction(seqno, walletContract);
  return {
    privateKey: key.secretKey.toString('hex'),
    publicKey: key.publicKey.toString('hex'),
    mnemonic,
    address: generatedWallet.address.toString(),
  };
}
