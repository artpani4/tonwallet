import {
  Address,
  addWallet,
  axiod,
  bufToStr,
  fromNano,
  getWalletContractByAddressVersion,
  mnemonicNew,
  mnemonicToWalletKey,
  supabase,
  TonClient,
  WalletByAddress,
  WalletContractV4,
} from './mod.ts';
import {
  makePaymentFromInactive,
  makePaymentToInactive,
} from './transfer.ts';
import { updateWalletDb } from './db/setter.ts';
import { maybeNewClient } from '../helpers/walletUtils.ts';
import * as base64 from 'https://deno.land/std@0.184.0/encoding/base64.ts';

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

export async function initializeWallet(
  mnemonic: string[],
): Promise<IWallet> {
  const key = await mnemonicToWalletKey(mnemonic);
  const generatedWallet = WalletContractV4.create({
    publicKey: key.publicKey,
    workchain: 0,
  });

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

export async function getBalanceByAddress(address: string) {
  const client = await maybeNewClient();
  const balance = await client.getBalance(Address.parse(address));
  return fromNano(balance);
}

export async function activateWallet(
  targetAddress: string,
  targetSecretKey: string,
  targetPublicKey: string,
  fundingAddress: string,
  fundingSecretKey: string,
  database: supabase.SupabaseClient<any, 'public', any> | null,
  clientTon?: TonClient,
) {
  const client = await maybeNewClient(clientTon);

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
    await makePaymentFromInactive(
      targetPublicKey,
      targetSecretKey,
      fundingAddress,
      '0.075',
    );

    if (database !== null) {
      await updateWalletDb(database, targetAddress, { active: true });
    }
  } else {
    console.log(
      'Lose',
    );
  }
}

export async function getEstimateFee(
  address: string,
  body: string,
) {
  try {
    const res = await axiod.post(
      `https://sandbox.tonhubapi.com/estimateFeeSimple`,
      {
        address: Address.parse(address),
        body: {
          'data': { 'b64': base64.encode(body), 'len': body.length },
          'refs': [],
        },
      },
    );
    console.log(res);
  } catch (e: any) {
    return e.message;
  }
}

const a = await getEstimateFee(
  'EQBh_jk8-HKU8IHpS5L918vSsw3H2wq2zgRrJ6xVGvf9lwy5',
  'Activating',
);
console.log(a);
