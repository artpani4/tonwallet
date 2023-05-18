import {
  addWallet,
  axiod,
  bufToStr,
  getHttpEndpoint,
  getWalletContractByAddressVersion,
  mnemonicNew,
  mnemonicToWalletKey,
  supabase,
  TonClient,
  WalletByAddress,
  WalletContractV1R2,
  WalletContractV1R3,
  WalletContractV2R1,
  WalletContractV2R2,
  WalletContractV3R1,
  WalletContractV3R2,
  WalletContractV4,
} from './mod.ts';

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
  console.log(wallet);
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
