import {
  maybeNewClient,
  waitForTransaction,
} from '../helpers/walletUtils.ts';
import {
  internal,
  strToBuf,
  TonClient,
  WalletContractV1R2,
  WalletContractV1R3,
  WalletContractV2R1,
  WalletContractV2R2,
  WalletContractV3R1,
  WalletContractV3R2,
  WalletContractV4,
} from './mod.ts';
import { getWalletContractByAddress } from './wallet.ts';

/**
 * Осуществляет платеж между отправителем и получателем.
 *
 * @param senderAddress - Адрес отправителя.
 * @param recipientAddress - Адрес получателя.
 * @param senderSecretKey - Секретный ключ отправителя.
 * @param amount - Сумма платежа в виде строки в тонах
 * @param body - Опциональный параметр. Текстовое сообщение платежа.
 * @param clientTon - Опциональный параметр. Клиент TonClient для выполнения операций.
 */
export async function makePayment(
  senderAddress: string,
  recipientAddress: string,
  senderSecretKey: string,
  amount: string,
  body?: string,
  allAmount?: boolean,
  clientTon?: TonClient,
): Promise<void> {
  const client = await maybeNewClient(clientTon);

  const senderWallet = await getWalletContractByAddress(
    senderAddress,
  );
  const recipientWallet = await getWalletContractByAddress(
    recipientAddress,
  );
  if (!await client.isContractDeployed(senderWallet.address)) {
    console.log('Sender wallet is not deployed');
    return;
  }
  const walletContract = client.open(senderWallet);
  const seqno = await walletContract.getSeqno();
  await walletContract.sendTransfer({
    secretKey: strToBuf(senderSecretKey),
    seqno: seqno,
    messages: [
      internal({
        to: recipientWallet.address,
        value: amount,
        body: body,
        bounce: false,
      }),
    ],
    sendMode: allAmount ? 128 : 0,
  });
  // await waitForTransaction(seqno, walletContract, 1500);
}

/**
 * Осуществляет платеж на  неактивный кошелек
 *
 * @param senderWallet - Активный кошелек отправителя.
 * @param fundingSecretKey - Секретный ключ для финансирования неактивного кошелька в виде base64
 * @param recipientAddress - Адрес получателя.
 * @param body - Опциональный параметр. Текстовое сообщение платежа.
 * @param clientTon - Опциональный параметр. Клиент TonClient для выполнения операций.
 */
export async function makePaymentToInactive(
  senderWallet:
    | WalletContractV4
    | WalletContractV3R2
    | WalletContractV3R1
    | WalletContractV2R2
    | WalletContractV2R1
    | WalletContractV1R3
    | WalletContractV1R2,
  fundingSecretKey: string,
  recipientAddress: string,
  body?: string,
  clientTon?: TonClient,
): Promise<void> {
  const client = await maybeNewClient(clientTon);

  if (!await client.isContractDeployed(senderWallet.address)) {
    console.log('Sender wallet is not deployed');
    return;
  }
  const walletContract = client.open(senderWallet);
  const seqno = await walletContract.getSeqno();
  await walletContract.sendTransfer({
    secretKey: strToBuf(fundingSecretKey),
    seqno: seqno,
    messages: [
      internal({
        to: recipientAddress,
        value: '0.5',
        body: body,
        bounce: false,
      }),
    ],
  });
  await waitForTransaction(seqno, walletContract, 2000);
}
/**
 * Осуществляет платеж из неактивного кошелька.
 *
 * @param inactivePublic - Публичный ключ неактивного кошелька в виде base64
 * @param inactiveSecret - Секретный ключ неактивного кошелька в виде base64
 * @param backAddress - Адрес получателя.
 * @param body - Опциональный параметр. Текстовое сообщение платежа.
 * @param clientTon - Опциональный параметр. Клиент TonClient для выполнения операций.
 */
export async function makePaymentFromInactive(
  inactivePublic: string,
  inactiveSecret: string,
  backAddress: string,
  body?: string,
  clientTon?: TonClient,
): Promise<void> {
  const client = await maybeNewClient(clientTon);
  const inactiveWallet = await WalletContractV4.create({
    publicKey: strToBuf(inactivePublic),
    workchain: 0,
  });
  const inactiveContract = client.open(inactiveWallet);
  const seqno = await inactiveContract.getSeqno();
  await inactiveContract.sendTransfer({
    secretKey: strToBuf(inactiveSecret),
    seqno: seqno,
    messages: [
      internal({
        to: backAddress,
        value: '1',
        body,
        bounce: false,
      }),
    ],
    sendMode: 128,
  });
  await waitForTransaction(seqno, inactiveContract, 2000);
}
