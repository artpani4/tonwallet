import { ConfigManager } from 'https://deno.land/x/tuner@v0.0.3/src/mod.ts';
import { generateSchema } from 'https://deno.land/x/tuner@v0.0.3/schema/generator.ts';
import {
  TestnetConfig,
  testnetConfigSchema,
} from './localConfigSchema.ts';

const manager = new ConfigManager<
  TestnetConfig,
  typeof testnetConfigSchema
>(testnetConfigSchema);

manager.addLocalConfigUrl('./config/testnetConfig.ts');

export default manager;
