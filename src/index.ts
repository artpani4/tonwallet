import manager from '../config/manager.ts';
import { TestnetConfig } from '../config/localConfigSchema.ts';
import { supabase } from './mod.ts';

const config = await manager.localLoadConfig(
  (config: TestnetConfig) => config.name === Deno.env.get('name'),
);
if (config === null) throw Error('No config');
const database = supabase.createClient(
  manager.getSecret('dbURL')!,
  manager.getSecret('dbAPIKey')!,
);
