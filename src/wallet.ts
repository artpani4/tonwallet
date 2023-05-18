import { boolean } from 'https://deno.land/x/zod@v3.21.4/types.ts';
import {
  addWallet,
  axiod,
  bufToStr,
  getHttpEndpoint,
  getWalletContractByAddressVersion,
  mnemonicNew,
  mnemonicToWalletKey,
  strToBuf,
  supabase,
  TonClient,
  WalletByAddress,
  WalletContractV4,
} from './mod.ts';
import {
  makePayment,
  makePaymentFromInactive,
  makePaymentToInactive,
} from './transfer.ts';
import { sleep } from '../helpers/timer.ts';

export interface IWallet {
  privateKey: string;
  publicKey: string;
  mnemonic: string[];
  address: string;
}

export async function createWallet(
  db: supabase.SupabaseClient<any, 'public', any>,
) {
  const mnemonic = await mnemonicNew();
  const wallet = await initializeWallet(mnemonic);
  const [data, error] = await addWallet(db, wallet);
  if (error) {
    throw new Error(error.message);
  }
  console.log(`Wallet created: ${wallet.address}`);
}

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
    privateKey: bufToStr(key.secretKey),
    publicKey: bufToStr(key.publicKey),
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

export async function getWalletContractByAddress(
  address: string,
) {
  const walletInterfaces = (await getWalletLowInfoByAddress(address))
    ?.interfaces;
  if (walletInterfaces === undefined) {
    throw new Error('No interfaces found');
  }
  return await getWalletContractByAddressVersion(
    address,
    walletInterfaces,
  );
}

export async function activateWallet(
  targetAddress: string,
  targetSecretKey: string,
  targetPublicKey: string,
  fundingAddress: string,
  fundingSecretKey: string,
  clientTon?: TonClient,
) {
  const client = await maybeNewClient(clientTon);
  const createArg = {
    publicKey: strToBuf(targetPublicKey),
    workchain: 0,
  };

  const fundingWallet = await getWalletContractByAddress(
    fundingAddress,
  );
  if (await client.isContractDeployed(fundingWallet.address)) {
    await makePaymentToInactive(
      fundingWallet,
      fundingSecretKey,
      targetAddress,
      '0.09',
      'Activating',
      client,
    );
    // await sleep(2000);
    await makePaymentFromInactive(
      targetPublicKey,
      targetSecretKey,
      fundingAddress,
      '0.075',
    );
  } else {
    console.log(
      'Lose',
    );
  }
}
