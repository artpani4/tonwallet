import {
  ConfigManager,
  getNotionConfig,
} from 'https://deno.land/x/tuner/mod.ts';
import {
  LocalWallet,
  localWalletSchema,
} from './localWalletSchema.ts';
import { getSecret } from 'https://deno.land/x/tuner@v0.0.6/src/manager.ts';

const manager = new ConfigManager<
  LocalWallet,
  typeof localWalletSchema
>(
  localWalletSchema,
);
// Добавление одного локального конфига
manager.addLocalConfigPath('config/local.ts');
manager.addRemoteProSource(async () => {
  return await getNotionConfig(
    getSecret('NOTION_KEY'),
    '3c26cd8c107d4f66b51fe252e7181489',
  );
});

export default manager;
