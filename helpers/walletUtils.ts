import {
  mnemonicToWalletKey,
  WalletContractV1R1,
  WalletContractV1R2,
  WalletContractV1R3,
  WalletContractV2R1,
  WalletContractV2R2,
  WalletContractV3R1,
  WalletContractV3R2,
} from '../src/mod.ts';
import { OpenedContract, WalletContractV4 } from './mod.ts';
import { sleep } from './timer.ts';
import { Buffer } from 'https://deno.land/std@0.139.0/node/buffer.ts';
import axiod from 'https://deno.land/x/axiod/mod.ts';
import { PublicByAddress } from '../schema/public.ts';
import { bufToStr } from './buffer.ts';

export async function getKeyPairByMnemonic(
  mnemonic: string,
  divider = ' ',
) {
  const key = await mnemonicToWalletKey(mnemonic.split(divider));
  const [secretKey, publicKey] = [
    bufToStr(key.secretKey),
    bufToStr(key.publicKey),
  ];
  return { secretKey, publicKey };
}

export async function getSecretBufferByMnemonic(
  mnemonic: string,
  divider = ' ',
) {
  const key = await mnemonicToWalletKey(mnemonic.split(divider));
  return key.secretKey;
}

export async function getWalletPublicKeyByAddress(
  address: string,
) {
  try {
    const response = await axiod.get(
      `https://tonapi.io/v2/blockchain/accounts/${address}/methods/get_public_key?args=${address}`,
    );
    const stack = (response.data as PublicByAddress).stack[1];
    if ('num' in stack) {
      return stack.num.slice(2);
    }
    return null;
  } catch (e: any) {
    return null;
  }
}

const versionList = [
  'wallet_v4R2',
  'wallet_v4',
  'wallet_v3R2',
  'wallet_v3R1',
  'wallet_v2R2',
  'wallet_v2R1',
  'wallet_v1R3',
  'wallet_v1R2',
  'wallet_v1',
];
export async function getWalletContractByAddressVersion(
  address: string,
  versions: string[],
) {
  const public_key = await getWalletPublicKeyByAddress(address);
  if (public_key === null) throw new Error('No public key found');
  const key = versions.find((version) =>
    versionList.includes(version)
  );
  // console.log(public_key);
  // console.log(key);
  if (key === undefined) throw new Error('No version found');
  const createArg = {
    publicKey: Buffer.from(public_key, 'hex'),
    workchain: 0,
  };

  switch (key) {
    case 'wallet_v4R2':
    case 'wallet_v4':
      return await WalletContractV4.create(createArg);
    case 'wallet_v3R2':
      return await WalletContractV3R2.create(createArg);
    case 'wallet_v3R1':
      return await WalletContractV3R1.create(createArg);
    case 'wallet_v2R2':
      return await WalletContractV2R2.create(createArg);
    case 'wallet_v2R1':
      return await WalletContractV2R1.create(createArg);
    case 'wallet_v1R3':
      return await WalletContractV1R3.create(createArg);
    case 'wallet_v1R2':
      return await WalletContractV1R2.create(createArg);
    case 'wallet_v1R1':
      return await WalletContractV1R2.create(createArg);
    default:
      throw new Error('No version found');
  }
}

export async function waitForTransaction(
  seqno: number,
  OpenedWalletContract: OpenedContract<
    | WalletContractV4
    | WalletContractV3R2
    | WalletContractV3R1
    | WalletContractV2R2
    | WalletContractV2R1
    | WalletContractV1R3
    | WalletContractV1R2
    | WalletContractV1R1
  >,
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
