import { supabase } from '../src/mod.ts';
import { IWallet } from '../src/wallet.ts';

export async function getKeyPairByAddressDb(
  db: supabase.SupabaseClient<any, 'public', any>,
  address: string,
) {
  const { data, error } = await db
    .from('Wallets')
    .select('private_key, public_key')
    .eq('address', address);
  if (data === null) {
    throw new Error('No wallet found');
  }
  return {
    private_key: data[0].private_key as string,
    public_key: data[0].public_key as string,
  };
}
