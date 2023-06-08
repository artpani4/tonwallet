import {
  WalletContractV1R2,
  WalletContractV1R3,
  WalletContractV2R1,
  WalletContractV2R2,
  WalletContractV3R1,
  WalletContractV3R2,
  WalletContractV4,
} from './mod.ts';

/**
 * Интерфейс описывающий адрес аккаунта.
 */
export interface IAccountAddress {
  address: string;
  is_scam: boolean;
  name?: string;
  icon?: string;
}

/**
 * Возможные значения статуса аккаунта.
 */
export type TAccountStatus =
  | 'nonexist'
  | 'uninit'
  | 'active'
  | 'frozen';

/**
 * Возможные типы транзакций.
 */
export type TTransactionType =
  | 'TransOrd'
  | 'TransTickTock'
  | 'TransSplitPrepare'
  | 'TransSplitInstall'
  | 'TransMergePrepare'
  | 'TransMergeInstall'
  | 'TransStorage';

/**
 * Интерфейс описывающий сообщение.
 */
export interface IMessage {
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

/**
 * Интерфейс описывающий транзакцию.
 */
export interface ITransaction {
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

/**
 * Интерфейс кошелька.
 */
export interface IWallet {
  privateKey: string;
  publicKey: string;
  mnemonic: string[];
  address: string;
}

/**
 * Интерфейс комиссии источника.
 */
export interface ISourceFee {
  '@type': 'fees';
  in_fwd_fee: number;
  storage_fee: number;
  gas_fee: number;
  fwd_fee: number;
}

export type TWalletContract =
  | WalletContractV4
  | WalletContractV3R2
  | WalletContractV3R1
  | WalletContractV2R2
  | WalletContractV2R1
  | WalletContractV1R3
  | WalletContractV1R2;
