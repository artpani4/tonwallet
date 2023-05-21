import { generateSchema } from 'https://deno.land/x/tuner@v0.0.3/schema/generator.ts';
import { TestnetConfig } from './localConfigSchema.ts';

const testnetLocalConfig: TestnetConfig = {
  name: 'test',
  secrets: [
    {
      name: 'mnemonic',
      value: '',
    },
    {
      name: 'dbURL',
      value: '',
    },
    {
      name: 'dbAPIKey',
      value: '',
    },
  ],
  testAddresses: [
    ['artpani', 'EQBh_jk8-HKU8IHpS5L918vSsw3H2wq2zgRrJ6xVGvf9lwy5'],
    [
      'artpanitest',
      'kQCnrUsj-l_9ajt1QRZLutpFknkKG4AULHzsUl8mzz00wueH',
    ],
    ['sevapp', 'EQBiaSPuG33CuKXHClwsVvA-SazmLmtiTfXV7dQnqJdIlGgI'],
  ],
};

export default testnetLocalConfig;

// await generateSchema(
//   testnetLocalConfig,
//   'testnetConfig',
//   'config/localConfigSchema.ts',
// );
