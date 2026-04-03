// import axios from "axios";

// // Free model on OpenRouter - no billing needed
// const MODEL = "mistralai/mistral-7b-instruct:free";

// export async function callAI(prompt, systemPrompt = "") {
//   const key = process.env.OPENROUTER_API_KEY;
//   if (!key) throw new Error("OPENROUTER_API_KEY not set in server/.env");

//   const messages = [];
//   if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
//   messages.push({ role: "user", content: prompt });

//   const response = await axios.post(
//     "https://openrouter.ai/api/v1/chat/completions",
//     {
//       model: MODEL,
//       messages,
//       temperature: 0.3,
//       max_tokens: 2500,
//     },
//     {
//       headers: {
//         Authorization: `Bearer ${key}`,
//         "Content-Type": "application/json",
//         "HTTP-Referer": "http://localhost:5173",
//         "X-Title": "Sentinel Assembly",
//       },
//       timeout: 60000,
//     }
//   );

//   const text = response.data?.choices?.[0]?.message?.content;
//   if (!text) throw new Error("Empty response from AI model");
//   return text;
// }

import axios from "axios";

/**
 * SENTINEL AI CORE
 * Model Selection: Gemini 1.5 Flash (via OpenRouter)
 * This is currently the most powerful FREE model for JSON & Logic.
 */
// server/utils/ai.js
const MODEL = "openrouter/auto"; // This automatically finds the best FREE model available to you.

export async function callAI(prompt, systemPrompt = "", retryCount = 0) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("CRITICAL: OPENROUTER_API_KEY not detected in environment.");

  const messages = [];
  if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
  messages.push({ role: "user", content: prompt });

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: MODEL,
        messages,
        temperature: 0.3, // Low temperature for high factual accuracy
        max_tokens: 3000,
      },
    //   {
    //     headers: {
    //       "Authorization": `Bearer ${key}`,
    //       "Content-Type": "application/json",
    //       "HTTP-Referer": "http://localhost:5173", // Required for OpenRouter Free Tier
    //       "X-Title": "Sentinel Assembly",         // Required for OpenRouter Free Tier
    //     },
    //     timeout: 45000, // 45s timeout to prevent hanging
    //   }
    {
  headers: {
    "Authorization": `Bearer ${key}`,
    "Content-Type": "application/json",
    "HTTP-Referer": "http://localhost:5173", // Must match your Vite port
    "X-Title": "Sentinel Assembly",
  }
}
    );

    const text = response.data?.choices?.[0]?.message?.content;
    if (!text) throw new Error("AI provider returned an empty payload.");
    
    return text;

  } catch (err) {
    // --- AUTOMATED RETRY LOGIC (The Professional Guard) ---
    // If we hit a Rate Limit (429) or Server Error (500/503), we wait and retry once.
    const isRetryable = err.response?.status === 429 || err.response?.status >= 500;
    
    if (isRetryable && retryCount < 1) {
      console.warn(`⚠️  AI Congestion detected. Initiating 3-second cooldown...`);
      await new Promise(resolve => setTimeout(resolve, 3000));
      return callAI(prompt, systemPrompt, retryCount + 1);
    }

    // --- ENHANCED ERROR LOGGING ---
    const errorMsg = err.response?.data?.error?.message || err.message;
    console.error(`✗ AI CORE ERROR: ${errorMsg}`);
    
    if (err.response?.status === 404) {
      throw new Error("Model endpoint retired (404). Please verify MODEL_ID in ai.js");
    }
    
    throw new Error(errorMsg);
  }
}