// import { TonClient, WalletContractV4, internal } from "npm:ton";
// import { mnemonicNew, mnemonicToPrivateKey } from "npm:ton-crypto";

// // Create Client
// const client = new TonClient({
//   endpoint: 'https://toncenter.com/api/v2/jsonRPC',
// });

// // Generate new key
// let mnemonics = await mnemonicNew();
// let keyPair = await mnemonicToPrivateKey(mnemonics);

// // Create wallet contract
// let workchain = 0; // Usually you need a workchain 0
// let wallet = WalletContractV4.create({ workchain, publicKey: keyPair.publicKey });
// let contract = client.open(wallet);

// // Get balance
// let balance: bigint = await contract.getBalance();

import { mnemonicToWalletKey } from 'npm:ton-crypto';
import { fromNano, TonClient, WalletContractV4 } from 'npm:ton';
import { getHttpEndpoint } from 'npm:@orbs-network/ton-access';

async function main() {
  // open wallet v4 (notice the correct wallet version here)
  const mnemonic =
    'choice ceiling barrel orbit require uncle breeze debate eagle occur neglect food rubber prevent certain only guard habit spread embark shallow faith rubber include'; // your 24 secret words (replace ... with the rest of the words)
  const key = await mnemonicToWalletKey(mnemonic.split(' '));
  const wallet = WalletContractV4.create({
    publicKey: key.publicKey,
    workchain: 0,
  });

  // print wallet address
  console.log(wallet.address.toString({ testOnly: true }));

  // print wallet workchain
  console.log('workchain:', wallet.address.workChain);
  const endpoint = await getHttpEndpoint({ network: 'testnet' });
  const client = new TonClient({ endpoint });
  const balance = await client.getBalance(wallet.address);

  console.log('balance:', fromNano(balance));
  const WalletContract = client.open(wallet);
  const seqno = await WalletContract.getSeqno();
  console.log('seqno:', seqno);
}
main();
