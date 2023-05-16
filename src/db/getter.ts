import { supabase } from '../mod.ts';

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

export async function getSecretByAddressDb(
  db: supabase.SupabaseClient<any, 'public', any>,
  address: string,
) {
  const pair = await getKeyPairByAddressDb(db, address);
  return pair.private_key;
}

export async function getPublicKeyByAddressDb(
  db: supabase.SupabaseClient<any, 'public', any>,
  address: string,
) {
  const pair = await getKeyPairByAddressDb(db, address);
  return pair.public_key;
}
