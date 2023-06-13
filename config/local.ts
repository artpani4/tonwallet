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
    { name: 'MNEMO_TEST' },
  ],
  mainFundingAddress:
    'EQD1cM_4bMhmWlrRrkS8P71QEACDVmpu6Ng0kMOjnmCqqKJx',
  artpaniAddress: 'EQBh_jk8-HKU8IHpS5L918vSsw3H2wq2zgRrJ6xVGvf9lwy5',
  sevappAddress: 'EQBiaSPuG33CuKXHClwsVvA-SazmLmtiTfXV7dQnqJdIlGgI',
  testAddress: 'EQBlxo8nTuEw8dPHMnd7d8RCzqWOIK9yGMS3XaSLayaj7_7x',
};

export default localConfig;
