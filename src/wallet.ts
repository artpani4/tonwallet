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
  toNano,
  TonClient,
  WalletByAddress,
  WalletContractV4,
} from './mod.ts';
import {
  makePaymentFromInactive,
  makePaymentToInactive,
} from './transfer.ts';
import {
  updateWalletActualInfoDb,
  updateWalletDb,
} from './db/setter.ts';
import {
  getShortAddress,
  maybeNewClient,
} from '../helpers/walletUtils.ts';
import { IWallet, TWalletContract } from './types.ts';
import { retryWithDelay, sleep } from '../helpers/timer.ts';
import { getAllWalletsDb } from './db/getter.ts';
import { IAxiodResponse } from 'https://deno.land/x/axiod@0.26.2/interfaces.ts';

/**
 * Создает новый кошелек и заносит его в базу данных
 *
 * @param db - Клиент Supabase для работы с базой данных.
 * @returns Созданный кошелек.
 * @throws Ошибка, если возникли проблемы при создании кошелька или добавлении его в базу данных.
 */
export async function createWallet(
  db: supabase.SupabaseClient<any, 'public', any>,
): Promise<IWallet> {
  const mnemonic = await mnemonicNew();
  const wallet = await initializeWallet(mnemonic);
  const [data, error] = await addWallet(db, wallet);
  if (error) {
    throw new Error(error.message);
  }
  console.log(`Wallet created: ${wallet.address}`);
  return wallet;
}

/**
 * Инициализирует кошелек на основе мнемонической фразы.
 *
 * @param mnemonic - Мнемоническая фраза для инициализации кошелька.
 * @returns Инициализированный кошелек.
 */
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
    const res = await retryWithDelay<IAxiodResponse>(
      async () =>
        await axiod.get(`https://tonapi.io/v2/accounts/${address}`),
      3,
      1000,
    );

    if (res === null || res.status !== 200) {
      return null;
    }

    return res.data as WalletByAddress;
  } catch (e: any) {
    return null;
  }
}

/**
 * Получает контракт кошелька по его адресу.
 *
 * @param address - Адрес кошелька.
 * @returns Контракт кошелька.
 * @throws Ошибка, если не удалось получить контракт кошелька.
 */
export async function getWalletContractByAddress(
  address: string,
): Promise<TWalletContract> {
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

/**
 * Получает баланс кошелька по его адресу в тонах
 *
 * @param address - Адрес кошелька.
 * @returns Баланс кошелька в тонах.
 */
export async function getBalanceByAddress(
  address: string,
): Promise<string> {
  const client = await maybeNewClient();
  const balance = await client.getBalance(Address.parse(address));
  return fromNano(balance);
}

/**
 * Получает баланс кошелька по его адресу в нанотонах.
 *
 * @param address - Адрес кошелька.
 * @returns Баланс кошелька в нанотонах.
 */
export async function getNanoBalanceByAddress(
  address: string,
): Promise<bigint> {
  const client = await maybeNewClient();
  const balance = await client.getBalance(Address.parse(address));
  return balance;
}

/**
 * Активирует кошелек.
 *
 * @param targetAddress - Адрес целевого кошелька для активации.
 * @param targetSecretKey - Секретный ключ целевого кошелька.
 * @param targetPublicKey - Публичный ключ целевого кошелька.
 * @param fundingAddress - Адрес кошелька для финансирования активации.
 * @param fundingSecretKey - Секретный ключ кошелька для финансирования активации.
 * @param database - Клиент Supabase для работы с базой данных (опционально).
 * @param clientTon - Клиент TonClient для выполнения операций (опционально).
 */
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
    console.log('Готовлюсь отправить с фундинга');
    await makePaymentToInactive(
      fundingWallet,
      fundingSecretKey,
      targetAddress,
      'Activating',
      client,
    );
    // await sleep(1000);
    console.log('С фундинга ушло!');
    await makePaymentFromInactive(
      targetPublicKey,
      targetSecretKey,
      fundingAddress,
      'Activated!',
    );
    console.log('Ушло и с таргета!');

    if (database !== null) {
      const res = await updateWalletDb(database, targetAddress, {
        active: 'active',
      });
      return res;
    }
  }
  return null;
}

export async function superCreateWallet(
  db: supabase.SupabaseClient<any, 'public', any>,
  fundingAddress: string,
  fundingSecretKey: string,
) {
  const wallet = await createWallet(db);
  const res = await activateWallet(
    wallet.address,
    wallet.privateKey,
    wallet.publicKey,
    fundingAddress,
    fundingSecretKey,
    db,
  );
  return res;
}

export async function withdrawToMain(
  database: supabase.SupabaseClient<any, 'public', any>,
  targetAddress: string,
  minimalAmount: number | string,
) {
  const wallets = (await getAllWalletsDb(database)).filter((w) =>
    w.balance > toNano(minimalAmount) && w.address !== targetAddress
  );

  for (const wallet of wallets) {
    await retryWithDelay(
      async () => {
        await makePaymentFromInactive(
          wallet.public_key,
          wallet.private_key,
          targetAddress,
          `From ${
            getShortAddress(wallet.address)
          } | Bal: ${await getBalanceByAddress(wallet.address)}`,
        );
      },
      3,
      1000,
    );

    await updateWalletActualInfoDb(database, wallet.address);
  }
}

// export async function getEstimateFee(
//   address: string,
//   body: string,
// ) {
//   try {
//     const res = await axiod.post(
//       `https://sandbox.tonhubapi.com/estimateFeeSimple`,
//       {
//         address: Address.parse(address),
//         body: {
//           'data': { 'b64': base64.encode(body), 'len': body.length },
//           'refs': [],
//         },
//       },
//     );
//     console.log(res);
//   } catch (e: any) {
//     return e.message;
//   }
// }

// export async function estimateFee(
//   fundingAddress: string,
//   targetAddress: string,
//   body: string,
//   amount: number,
// ) {
//   const cl = await maybeNewClient();
//   const res = await cl.estimateExternalMessageFee(
//     Address.parse(fundingAddress),
//     {
//       body: internal({
//         to: Address.parse(targetAddress),
//         value: amount.toString(),
//         bounce: false,
//         body,
//       }).body,
//       initCode: null,
//       initData: null,
//       ignoreSignature: false,
//     },
//   );
//   return res.source_fees;
// }

// export async function estimateTotalFee(
//   secretKey: string,
//   fundingAddress: string,
//   targetAddress: string,
//   body: string,
//   amount: string,
// ) {
//   const cl = await maybeNewClient();
//   const wallet = await getWalletContractByAddress(fundingAddress);
//   const openedWallet = cl.open(wallet);
//   const seqno = await openedWallet.getSeqno();
//   const boc = wallet.sendTransfer({
//     secretKey: strToBuf(secretKey),
//     seqno: seqno,
//     messages: [
//       internal({
//         to: targetAddress,
//         value: amount,
//         body,
//         bounce: false,
//       }),
//     ],
//   });
// const res = await cl.estimateExternalMessageFee(
//   Address.parse(fundingAddress),
//   {
//     body: internal({
//       to: Address.parse(targetAddress),
//       value: amount.toString(),
//       bounce: false,
//       body,
//     }).body,
//     initCode: null,
//     initData: null,
//     ignoreSignature: false,
//   },
// );
// return fromNano(
//   sumTotalFee(
//     await estimateFee(fundingAddress, targetAddress, body, amount),
//   ),
// );
//   return boc;
// }
