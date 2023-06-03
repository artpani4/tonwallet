import { ConfigManager } from 'https://deno.land/x/tuner/mod.ts';
import {
  LocalWallet,
  localWalletSchema,
} from './localWalletSchema.ts';

const manager = new ConfigManager<
  LocalWallet,
  typeof localWalletSchema
>(
  localWalletSchema,
);

// Добавление одного локального конфига
manager.addLocalConfigPath('config/local.ts');

export default manager;
