import { LocalWallet } from './localWalletSchema.ts';
const localConfig: LocalWallet = {
  name: 'local',
  secrets: [
    {
      name: 'MNEMO',
    },
    {
      name: 'dbURL',
    },
    {
      name: 'dbAPIKey',
    },
  ],
  artpaniAddress: 'EQBh_jk8-HKU8IHpS5L918vSsw3H2wq2zgRrJ6xVGvf9lwy5',
  sevappAddress: 'EQBiaSPuG33CuKXHClwsVvA-SazmLmtiTfXV7dQnqJdIlGgI',
};

export default localConfig;
