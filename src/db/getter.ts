import { WalletFromDb } from '../../schema/walletFromDb.ts';
import { WalletsFromDb } from '../../schema/walletsFromDb.ts';
import { supabase } from '../mod.ts';
import { createWallet } from '../wallet.ts';

/**
 * Получает пару ключей (приватный и публичный) из базы данных по адресу кошелька.
 *
 * @param db - Клиент Supabase для работы с базой данных.
 * @param address - Адрес кошелька.
 * @returns Пара ключей (приватный и публичный).
 * @throws Ошибка, если не удалось получить пару ключей из базы данных или кошелек не найден.
 */
export async function getKeyPairByAddressDb(
  db: supabase.SupabaseClient<any, 'public', any>,
  address: string,
): Promise<{
  private_key: string;
  public_key: string;
}> {
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

/**
 * Получает приватный ключ из базы данных по адресу кошелька.
 *
 * @param db - Клиент Supabase для работы с базой данных.
 * @param address - Адрес кошелька.
 * @returns Приватный ключ кошелька.
 * @throws Ошибка, если не удалось получить приватный ключ из базы данных или кошелек не найден.
 */
export async function getSecretByAddressDb(
  db: supabase.SupabaseClient<any, 'public', any>,
  address: string,
): Promise<string> {
  const pair = await getKeyPairByAddressDb(db, address);
  return pair.private_key;
}

/**
 * Получает публичный ключ из базы данных по адресу кошелька.
 *
 * @param db - Клиент Supabase для работы с базой данных.
 * @param address - Адрес кошелька.
 * @returns Публичный ключ кошелька.
 * @throws Ошибка, если не удалось получить публичный ключ из базы данных или кошелек не найден.
 */
export async function getPublicKeyByAddressDb(
  db: supabase.SupabaseClient<any, 'public', any>,
  address: string,
): Promise<string> {
  const pair = await getKeyPairByAddressDb(db, address);
  return pair.public_key;
}

/**
 * Получает все кошельки из базы данных.
 *
 * @param db - Клиент Supabase для работы с базой данных.
 * @returns  Массив кошельков из базы данных.
 * @throws Ошибка, если не удалось получить кошельки из базы данных или кошельки не найдены.
 */
export async function getAllWalletsDb(
  db: supabase.SupabaseClient<any, 'public', any>,
): Promise<WalletsFromDb> {
  const { data, error } = await db
    .from('Wallets')
    .select('*');
  if (data === null) {
    throw new Error('No wallet found');
  }
  return data as WalletsFromDb;
}

/**
 * Получает кошелек из базы данных по его адресу.
 *
 * @param db - Клиент Supabase для работы с базой данных.
 * @param address - Адрес кошелька.
 * @returns Кошелек из базы данных.
 * @throws Ошибка, если не удалось получить кошелек из базы данных или кошелек не найден.
 */
export async function getWalletByAddressDb(
  db: supabase.SupabaseClient<any, 'public', any>,
  address: string,
): Promise<WalletFromDb> {
  const { data, error } = await db
    .from('Wallets')
    .select('*').eq('address', address);
  if (data === null) {
    throw new Error('No wallet found');
  }
  return data[0] as WalletFromDb;
}

/**
 * Получает кошельки из базы данных по статусу активации.
 *
 * @param db - Клиент Supabase для работы с базой данных.
 * @param active - Статус активации (true - активированные, false - неактивированные).
 * @returns Массив кошельков из базы данных.
 * @throws Ошибка, если не удалось получить кошельки из базы данных или кошельки не найдены.
 */
export async function getWalletsByActiveDb(
  db: supabase.SupabaseClient<any, 'public', any>,
  active: boolean,
): Promise<WalletFromDb[]> {
  const { data, error } = await db
    .from('Wallets')
    .select('*').eq('active', active);
  if (data === null) {
    throw new Error('No wallet found');
  }
  return data as WalletFromDb[];
}

/**
 * Получает активированные кошельки из базы данных.
 *
 * @param db - Клиент Supabase для работы с базой данных.
 * @returns Массив активированных кошельков из базы данных.
 * @throws Ошибка, если не удалось получить кошельки из базы данных или кошельки не найдены.
 */
export async function getActivatedWalletsDb(
  db: supabase.SupabaseClient<any, 'public', any>,
): Promise<WalletFromDb[]> {
  const { data, error } = await db
    .from('Wallets')
    .select('*').eq('active', true);
  if (data === null) {
    throw new Error('No wallet found');
  }
  return data as WalletFromDb[];
}

/**
 * Получает неактивированные кошельки из базы данных.
 *
 * @param db - Клиент Supabase для работы с базой данных.
 * @returns Массив неактивированных кошельков из базы данных.
 * @throws Ошибка, если не удалось получить кошельки из базы данных или кошельки не найдены.
 */
export async function getNonActivatedWalletsDb(
  db: supabase.SupabaseClient<any, 'public', any>,
): Promise<WalletFromDb[]> {
  const { data, error } = await db
    .from('Wallets')
    .select('*').eq('active', false);
  if (data === null) {
    throw new Error('No wallet found');
  }
  return data as WalletFromDb[];
}

/**
 * Получает зарезервированные кошельки из базы данных.
 *
 * @param db - Клиент Supabase для работы с базой данных.
 * @returns Массив зарезервированных кошельков из базы данных.
 * @throws Ошибка, если не удалось получить кошельки из базы данных или кошельки не найдены.
 */
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

/**
 * Получает незарезервированные кошельки из базы данных.
 *
 * @param db - Клиент Supabase для работы с базой данных.
 * @returns Массив незарезервированных кошельков из базы данных.
 * @throws Ошибка, если не удалось получить кошельки из базы данных или кошельки не найдены.
 */
export async function getNonReservedWalletsDb(
  db: supabase.SupabaseClient<any, 'public', any>,
): Promise<WalletFromDb[]> {
  const { data, error } = await db
    .from('Wallets')
    .select('*').eq('reserved', false);
  if (error) {
    throw new Error(error.message);
  }
  return data as WalletFromDb[];
}

export async function getReadyWalletsDb(
  db: supabase.SupabaseClient<any, 'public', any>,
): Promise<WalletFromDb[]> {
  const { data, error } = await db
    .from('Wallets')
    .select('*')
    .eq('reserved', false)
    .eq('active', 'active')
    .order('balance', { ascending: false })
    .limit(1);
  if (error) {
    throw new Error(error.message);
  }
  if (data.length === 0) {
    const wallet = await createWallet(db);
  }
  return data as WalletFromDb[];
}
