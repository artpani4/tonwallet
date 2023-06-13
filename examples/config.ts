import { getSecret } from 'https://deno.land/x/tuner@v0.0.6/src/manager.ts';
import { LocalWallet } from '../config/localWalletSchema.ts';
import manager from '../config/manager.ts';

const config = await manager.loadConfig(
  (config: LocalWallet) => config.name === Deno.env.get('name'),
);
if (config === null) throw new Error('Config not found');

console.log(getSecret('MNEMO'));
export default config;
