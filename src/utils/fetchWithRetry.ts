import { GoogleGenAI } from "@google/genai";
import type { Content } from "@google/genai";

/**
 * Helper function for Exponential Backoff
 */
export const fetchWithRetry = async (
  content: Content[],

  systemPrompt: string,
): Promise<any> => {
  try {
    const retries = 5;
    const backoff = 1000;
    console.log("Fetching with retry...");
    console.log("Content:", content);
    console.log("Retries:", retries);
    console.log("Backoff:", backoff);

    const ai = new GoogleGenAI({});
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: content,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    console.log(response.text);

    return response.text;
  } catch (error) {
    // console.error("Error in fetchWithRetry:", error);
    // if (retries > 0) {
    //   await new Promise((resolve) => setTimeout(resolve, backoff));
    //   return fetchWithRetry(content, retries - 1, backoff * 2, systemPrompt);
    // }
    throw error;
  }
};
