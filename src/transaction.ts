import { generateSchema } from 'https://deno.land/x/tuner@v0.0.3/schema/generator.ts';
import { axiod, fromNano } from './mod.ts';
import { getShortAddress } from '../helpers/walletUtils.ts';
import { getWalletLowInfoByAddress } from './wallet.ts';

interface IAccountAddress {
  address: string;
  is_scam: boolean;
  name?: string;
  icon?: string;
}

type TAccountStatus = 'nonexist' | 'uninit' | 'active' | 'frozen';
type TTransactionType =
  | 'TransOrd'
  | 'TransTickTock'
  | 'TransSplitPrepare'
  | 'TransSplitInstall'
  | 'TransMergePrepare'
  | 'TransMergeInstall'
  | 'TransStorage';

interface IMessage {
  created_lt: number;
  ihr_disabled: boolean;
  bounce: boolean;
  bounced: boolean;

  value: number;
  fwd_fee: number;
  ihr_fee: number;
  destination: IAccountAddress;
  source: IAccountAddress;
  import_fee: number;
  created_at: number;
  op_code?: string;
  decoded_body: {
    text: string;
  };
}

interface ITransaction {
  hash: string;
  lt: number;
  account: IAccountAddress;
  success: boolean;
  utime: number;
  orig_status: TAccountStatus;
  end_status: TAccountStatus;
  total_fees: number;
  transaction_type: TTransactionType;
  in_msg?: IMessage;
  out_msgs: IMessage[];
  block: string;
  prev_trans_hash: string;
  prev_trans_lt: number;
  aborted: boolean;
  destroyed: boolean;
}

export async function getTransactionsByAddress(
  address: string,
  before_lt = 0,
  after_lt = 0,
  limit = 5,
) {
  try {
    const res = await axiod.get(
      `https://tonapi.io/v2/blockchain/accounts/${address}/transactions?after_lt=${after_lt}&before_lt=${before_lt}&limit=${limit}`,
    );
    if (res.status !== 200) {
      return null;
    }
    return res.data.transactions as ITransaction[];
  } catch (e: any) {
    return null;
  }
}

export async function getLastTransactionByAddress(
  address: string,
) {
  const maybeTransaction = await getTransactionsByAddress(
    address,
    0,
    0,
    1,
  );
  if (maybeTransaction && maybeTransaction.length > 0) {
    return maybeTransaction[0];
  }
  return null;
}

export function getTransactionHash(transaction: ITransaction) {
  return transaction.hash;
}

export function getTransactionType(transaction: ITransaction) {
  return transaction.transaction_type;
}

export function getTransactionStatus(transaction: ITransaction) {
  return transaction.end_status;
}

export function getTransactionValue(transaction: ITransaction) {
  if (transaction.in_msg && transaction.in_msg.value > 0) {
    return fromNano(transaction.in_msg.value);
  } else if (transaction.out_msgs[0].value > 0) {
    return fromNano(transaction.out_msgs[0].value);
  }
  throw new Error('no value');
}

export function getTransactionFee(transaction: ITransaction) {
  return fromNano(transaction.total_fees);
}

export function getTransactionBody(transaction: ITransaction) {
  if (transaction.in_msg && transaction.in_msg.decoded_body.text) {
    return transaction.in_msg.decoded_body.text;
  } else if (transaction.out_msgs.length === 0) {
    return '';
  } else if (transaction.out_msgs[0].decoded_body.text) {
    return transaction.out_msgs[0].decoded_body.text;
  }
  return '';
}

//TODO Подумать, хули время такое неправильное получается из таймстампа
export function getTransactionTime(transaction: ITransaction) {
  return new Date(transaction.utime * 1000);
}

// const a = await getLastTransactionByAddress(
//   'EQBh_jk8-HKU8IHpS5L918vSsw3H2wq2zgRrJ6xVGvf9lwy5',
// );
// if (a) {
//   console.log(`Transaction hash: ${getTransactionHash(a)}
//     Transaction type: ${getTransactionType(a)}
//     Transaction status: ${getTransactionStatus(a)}
//     Transaction value: ${getTransactionValue(a)}
//     Transaction fee: ${getTransactionFee(a)}
//     Transaction body: ${getTransactionBody(a)}
//     Transaction time: ${getTransactionTime(a)}
//     `);
// }
