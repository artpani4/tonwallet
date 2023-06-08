import { axiod, fromNano } from './mod.ts';
import {
  ITransaction,
  TAccountStatus,
  TTransactionType,
} from './types.ts';

/**
 * Получает список транзакций для указанного адреса с использованием параметров before_lt, after_lt и limit.
 *
 * @param address - Адрес для получения транзакций.
 * @param before_lt - Опциональный параметр. Возвращает транзакции, которые были выполнены до указанного логического времени.
 * @param after_lt - Опциональный параметр. Возвращает транзакции, которые были выполнены после указанного логического времени.
 * @param limit - Опциональный параметр. Ограничивает количество возвращаемых транзакций.
 * @returns Список транзакций для указанного адреса или null, если возникла ошибка.
 */
export async function getTransactionsByAddress(
  address: string,
  before_lt = 0,
  after_lt = 0,
  limit = 5,
): Promise<ITransaction[] | null> {
  try {
    const res = await axiod.get(
      `https://tonapi.io/v2/blockchain/accounts/${address}/transactions?after_lt=${after_lt}&before_lt=${before_lt}&limit=${limit}`,
    );
    if (res.status !== 200) {
      return null;
    }
    return res.data.transactions as ITransaction[];
  } catch (e: any) {
    return null;
  }
}

/**
 * Получает последнюю транзакцию для указанного адреса.
 *
 * @param address - Адрес для получения последней транзакции.
 * @returns Последняя транзакция для указанного адреса или null, если нет доступных транзакций.
 */
export async function getLastTransactionByAddress(
  address: string,
): Promise<ITransaction | null> {
  const maybeTransaction = await getTransactionsByAddress(
    address,
    0,
    0,
    1,
  );
  if (maybeTransaction && maybeTransaction.length > 0) {
    return maybeTransaction[0];
  }
  return null;
}

/**
 * Возвращает хэш транзакции.
 *
 * @param transaction - Транзакция, для которой нужно получить хэш.
 * @returns Хэш транзакции.
 */

export function getTransactionHash(
  transaction: ITransaction,
): string {
  return transaction.hash;
}

/**
 * Возвращает тип транзакции.
 *
 * @param transaction - Транзакция, для которой нужно получить хэш.
 * @returns Тип транзакции.
 */
export function getTransactionType(
  transaction: ITransaction,
): TTransactionType {
  return transaction.transaction_type;
}

/**
 * Возвращает статус транзакции.
 *
 * @param transaction - Транзакция, для которой нужно получить хэш.
 * @returns Статус транзакции.
 */
export function getTransactionStatus(
  transaction: ITransaction,
): TAccountStatus {
  return transaction.end_status;
}

/**
 * Возвращает сумму транзакции.
 *
 * @param transaction - Транзакция, для которой нужно получить сумму.
 * @returns Сумма транзакициия в тонах
 * @throws Если транзакиция не имеет сообщения.
 */
export function getTransactionValue(
  transaction: ITransaction,
): string {
  if (transaction.in_msg && transaction.in_msg.value > 0) {
    return fromNano(transaction.in_msg.value);
  } else if (transaction.out_msgs[0].value > 0) {
    return fromNano(transaction.out_msgs[0].value);
  }
  throw new Error('no value');
}

/**
 * Возвращает стоимость комиссий транзакции.
 *
 * @param transaction - Транзакция, для которой нужно получить комиссии.
 * @returns Значение комиссии в тонах.
 */
export function getTransactionFee(transaction: ITransaction): string {
  return fromNano(transaction.total_fees);
}

/**
 * Возвращает сообщение транзакции.
 *
 * @param transaction - Транзакция, для которой нужно получить сообщение.
 * @returns Сообщение транзакции.
 */
export function getTransactionBody(
  transaction: ITransaction,
): string {
  if (transaction.in_msg && transaction.in_msg.decoded_body.text) {
    return transaction.in_msg.decoded_body.text;
  } else if (transaction.out_msgs.length === 0) {
    return '';
  } else if (transaction.out_msgs[0].decoded_body.text) {
    return transaction.out_msgs[0].decoded_body.text;
  }
  return '';
}

//TODO Подумать, хули время такое неправильное получается из таймстампа
// export function getTransactionTime(transaction: ITransaction) {
//   return new Date(transaction.utime * 1000);
// }
