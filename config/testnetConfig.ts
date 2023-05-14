// import { generateSchema } from 'https://deno.land/x/tuner@v0.0.3/schema/generator.ts';

import { TestnetConfig } from './localConfigSchema.ts';

const testnetLocalConfig: TestnetConfig = {
  name: 'local',
  secrets: [
    {
      name: 'mnemonic',
      value: '',
    },
  ],
  artpaniWalletAddress:
    'EQBh_jk8-HKU8IHpS5L918vSsw3H2wq2zgRrJ6xVGvf9lwy5',
};

export default testnetLocalConfig;

// await generateSchema(
//   testnetLocalConfig,
//   'testnetConfig',
//   'config/localConfigSchema.ts',
// );
