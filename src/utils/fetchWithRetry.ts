/**
 * Helper function for Exponential Backoff
 */
export const fetchWithRetry = async (
  url: string,
  options: any,
  retries = 5,
  backoff = 1000
): Promise<any> => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
    throw error;
  }
};
