import { getReadyWalletsDb } from './db/getter.ts';
import { supabase } from './mod.ts';
import { superCreateWallet } from './wallet.ts';
import { getKeyPairByMnemonic } from '../helpers/walletUtils.ts';
import { getSecret } from 'https://deno.land/x/tuner@v0.0.6/src/manager.ts';

export async function getWalletForInvoice<
  T extends { mainFundingAddress: string },
>(
  db: supabase.SupabaseClient<any, 'public', any>,
  config: T,
) {
  const fundingKeys = await getKeyPairByMnemonic(
    getSecret('MNEMO'),
  );
  const nonreservedWallets = await getReadyWalletsDb(db);
  if (nonreservedWallets.length === 0) {
    return await superCreateWallet(
      db,
      config!.mainFundingAddress,
      fundingKeys.secretKey,
    );
  }
  return nonreservedWallets;
}
