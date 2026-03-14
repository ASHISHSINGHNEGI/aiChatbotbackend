import { GoogleGenAI } from "@google/genai";

/**
 * Helper function for Exponential Backoff
 */
export const fetchWithRetry = async (
  url: string,
  options: any,
  retries = 5,
  backoff = 1000,
): Promise<any> => {
  try {
    console.log("Fetching with retry...");
    console.log("URL:", url);
    console.log("Options:", options);
    console.log("Retries:", retries);
    console.log("Backoff:", backoff);

    const ai = new GoogleGenAI({});
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: options.body || "",
    });
    console.log(response.text);

    return response.text;
  } catch (error) {
    console.error("Error in fetchWithRetry:", error);
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
    throw error;
  }
};
