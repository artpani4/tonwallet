import {
  internal,
  strToBuf,
  TonClient,
  waitForTransaction,
} from './mod.ts';
import {
  getWalletContractByAddress,
  maybeNewClient,
} from './wallet.ts';

export async function makePayment(
  senderAddress: string,
  recipientAddress: string,
  senderSecretKey: string,
  amount: string,
  body?: string,
  clientTon?: TonClient,
) {
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

  await waitForTransaction(seqno, walletContract, 1500);
}
