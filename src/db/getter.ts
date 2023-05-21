import { WalletFromDb } from '../../schema/walletFromDb.ts';
import { WalletsFromDb } from '../../schema/walletsFromDb.ts';
import { supabase } from '../mod.ts';
import { IWallet } from '../wallet.ts';

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
  return data as WalletsFromDb;
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

export async function getActivatedWalletsDb(
  db: supabase.SupabaseClient<any, 'public', any>,
) {
  const { data, error } = await db
    .from('Wallets')
    .select('*').eq('active', true);
  if (data === null) {
    throw new Error('No wallet found');
  }
  return data as WalletFromDb[];
}

export async function getNonActivatedWalletsDb(
  db: supabase.SupabaseClient<any, 'public', any>,
) {
  const { data, error } = await db
    .from('Wallets')
    .select('*').eq('active', false);
  if (data === null) {
    throw new Error('No wallet found');
  }
  return data as WalletFromDb[];
}

export async function getReservedWalletsDb(
  db: supabase.SupabaseClient<any, 'public', any>,
) {
  const { data, error } = await db
    .from('Wallets')
    .select('*').eq('reserved', true);
  if (data === null) {
    throw new Error('No wallet found');
  }
  return data as WalletFromDb[];
}

export async function getNonReservedWalletsDb(
  db: supabase.SupabaseClient<any, 'public', any>,
) {
  const { data, error } = await db
    .from('Wallets')
    .select('*').eq('reserved', false);
  if (data === null) {
    throw new Error('No wallet found');
  }
  return data as WalletFromDb[];
}
