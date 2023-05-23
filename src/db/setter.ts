import { getShortAddress } from '../../helpers/walletUtils.ts';
import { WalletFromDb } from '../../schema/walletFromDb.ts';
import { supabase } from '../mod.ts';
import {
  getLastTransactionByAddress,
  getTransactionBody,
} from '../transaction.ts';
import { getWalletLowInfoByAddress, IWallet } from '../wallet.ts';
import { getAllWalletsDb } from './getter.ts';

interface IWalletSchema {
  created_at: Date;
  address: string;
  reserved: boolean;
  invoice_id: bigint | null;

  public_key: string;
  private_key: string;
  active: boolean;
  last_transaction_hash: string | null;

  last_transaction_lt: string;
  mnemonic: string;
  balance: number;
  last_message: string | null;
}
export async function addWallet(
  db: supabase.SupabaseClient<any, 'public', any>,
  wallet: IWallet,
) {
  const { data, error } = await db
    .from('Wallets')
    .insert([
      {
        address: wallet.address,
        public_key: wallet.publicKey,
        private_key: wallet.privateKey,
        mnemonic: wallet.mnemonic.join(' '),
        active: false,
        created_at: new Date(),
        reserved: false,
        invoice_id: null,
        last_transaction_hash: null,
        last_transaction_lt: '0',
        balance: 0,
        last_message: null,
      } as IWalletSchema,
    ]);

  return [data, error];
}

const activity = {
  'active': true,
  'nonexist': false,
};
export async function updateActivityWallet(
  db: supabase.SupabaseClient<any, 'public', any>,
) {
  const wallets = await getAllWalletsDb(db);
  for (const wallet of wallets) {
    const walletRealInfo = await getWalletLowInfoByAddress(
      wallet.address,
    );
    if (walletRealInfo === null) {
      throw new Error(`Wallet ${wallet.address} not found`);
    }
    if (
      wallet.active !==
        activity[walletRealInfo.status as keyof typeof activity]
    ) {
      await db.from('Wallets').update({
        active:
          activity[walletRealInfo.status as keyof typeof activity],
      }).eq('address', wallet.address);
    }
  }
}

export async function updateWalletDb(
  db: supabase.SupabaseClient<any, 'public', any>,
  address: string,
  walletData: Partial<WalletFromDb>,
) {
  const { data, error } = await db
    .from('Wallets')
    .update(walletData)
    .eq('address', address);
  if (error) {
    throw new Error(`Failed to update wallet: ${error.message}`);
  }
  return data;
}

export async function updateActualInfoDb(
  db: supabase.SupabaseClient<any, 'public', any>,
) {
  const wallets = await getAllWalletsDb(db);
  for (const wallet of wallets) {
    const walletRealInfo = await getWalletLowInfoByAddress(
      wallet.address,
    );
    if (walletRealInfo === null) {
      throw new Error(`Wallet ${wallet.address} not found`);
    }
    const lastTA = await getLastTransactionByAddress(wallet.address);
    await updateWalletDb(db, wallet.address, {
      balance: walletRealInfo.balance,
      last_transaction_hash: lastTA === null ? null : lastTA?.hash,
      last_transaction_lt: lastTA === null ? null : lastTA?.lt,
      last_message: lastTA === null ? '' : getTransactionBody(lastTA),
      active: walletRealInfo.status,
    });
    console.log(
      `Wallet   ${getShortAddress(wallet.address)} updated`,
    );
  }
}
