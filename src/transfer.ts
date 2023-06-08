import { maybeNewClient } from '../helpers/walletUtils.ts';
import {
  internal,
  strToBuf,
  TonClient,
  waitForTransaction,
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
  });

  // await waitForTransaction(seqno, walletContract, 1500);
}

/**
 * Осуществляет платеж от неактивного кошелька.
 *
 * @param senderWallet - Неактивный кошелек отправителя.
 * @param fundingSecretKey - Секретный ключ для финансирования неактивного кошелька в виде base64
 * @param recipientAddress - Адрес получателя.
 * @param amount - Сумма платежа в виде строки(в тонах)
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
  amount: string,
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
        value: amount,
        body: body,
        bounce: false,
      }),
    ],
  });

  // await waitForTransaction(seqno, walletContract, 1500);
}

/**
 * Осуществляет платеж из неактивного кошелька.
 *
 * @param inactivePublic - Публичный ключ неактивного кошелька в виде base64
 * @param inactiveSecret - Секретный ключ неактивного кошелька в виде base64
 * @param backAddress - Адрес получателя.
 * @param amount - Сумма платежа в виде строки(в тонах)
 * @param body - Опциональный параметр. Текстовое сообщение платежа.
 * @param clientTon - Опциональный параметр. Клиент TonClient для выполнения операций.
 */
export async function makePaymentFromInactive(
  inactivePublic: string,
  inactiveSecret: string,
  backAddress: string,
  amount: string,
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
        value: amount,
        body,
        bounce: false,
      }),
    ],
  });
  // await waitForTransaction(seqno, inactiveContract, 4000);
}
