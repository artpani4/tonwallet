export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type Callback<T> = () => Promise<T>;

export async function retryWithDelay<T>(
  callback: Callback<T>,
  attempts: number,
  delay: number,
  dieIfFailed = false,
): Promise<T | null> {
  for (let i = 0; i < attempts; i++) {
    try {
      const result = await callback();
      return result;
    } catch (error) {
      const errorMessage = (error as { message: string }).message;
      const attemptMessage = `Attempt ${
        i + 1
      } failed: ${errorMessage}`;
      console.log(attemptMessage);
      await sleep(delay);
    }
  }
  if (dieIfFailed) throw new Error('All attempts failed');
  console.log(`All ${attempts} attempts failed. Moving on.`);
  return null; // Вернуть значение по умолчанию или выбрать другое
}
