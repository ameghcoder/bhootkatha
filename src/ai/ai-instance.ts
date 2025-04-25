import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/googleai";
import { getUserApiKey } from "@/lib/api-key-manager";

export const ai = genkit({
  promptDir: "./prompts",
  plugins: [
    googleAI({
      apiKey: getUserApiKey() || process.env.GOOGLE_GENAI_API_KEY,
    }),
  ],
  model: "googleai/gemini-2.0-flash",
});
