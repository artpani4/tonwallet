import { getSecret } from 'https://deno.land/x/tuner@v0.0.6/src/manager.ts';
import config from '../examples/config.ts';
import { supabase } from './mod.ts';

import { getKeyPairByMnemonic } from '../helpers/walletUtils.ts';
import { getWalletForInvoice } from './process.ts';
import { LocalWallet } from '../config/localWalletSchema.ts';

const database = supabase.createClient(
  getSecret('dbURL')!,
  getSecret('dbAPIKey')!,
);

const pair = await getKeyPairByMnemonic(getSecret('MNEMO'));
// console.log(
//   await getWalletForInvoice<LocalWallet>(database, config!),
// );

const Invoices = database.channel('custom-all-channel')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'Invoices' },
    (payload) => {
      console.log('Change received!', payload);
    },
  )
  .subscribe();

await Invoices.unsubscribe();
