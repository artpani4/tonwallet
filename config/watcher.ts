import { watchConfigFiles } from 'https://deno.land/x/tuner/mod.ts';
import { ConfigFilePaths } from 'https://deno.land/x/tuner@v0.0.5/src/localWatch.ts';

const configFilePaths: ConfigFilePaths = {
  // Пути до файлов конфига типа supabaseConfig
  filePaths: [
    'config/local.ts',
  ],
  configType: 'localWallet',
};

await watchConfigFiles(configFilePaths);
