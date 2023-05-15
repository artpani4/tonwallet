import { supabase } from '../src/mod.ts';
import { IWallet } from '../src/wallet.ts';

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
      } as IWalletSchema,
    ]);

  return [data, error];
}
