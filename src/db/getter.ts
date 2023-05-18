import { WalletFromDb } from '../../schema/walletFromDb.ts';
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

export async function getAllWalletsDb(
  db: supabase.SupabaseClient<any, 'public', any>,
) {
  const { data, error } = await db
    .from('Wallets')
    .select('*');
  if (data === null) {
    throw new Error('No wallet found');
  }
  return data;
}

export async function getWalletByAddressDb(
  db: supabase.SupabaseClient<any, 'public', any>,
  address: string,
) {
  const { data, error } = await db
    .from('Wallets')
    .select('*').eq('address', address);
  if (data === null) {
    throw new Error('No wallet found');
  }
  return data[0] as WalletFromDb;
}

export async function getWalletsByActiveDb(
  db: supabase.SupabaseClient<any, 'public', any>,
  active: boolean,
) {
  const { data, error } = await db
    .from('Wallets')
    .select('*').eq('active', active);
  if (data === null) {
    throw new Error('No wallet found');
  }
  return data as WalletFromDb[];
}

export async function getWalletsByResevedDb(
  db: supabase.SupabaseClient<any, 'public', any>,
  reserved: boolean,
) {
  const { data, error } = await db
    .from('Wallets')
    .select('*').eq('reserved', reserved);
  if (data === null) {
    throw new Error('No wallet found');
  }
  return data as WalletFromDb[];
}
