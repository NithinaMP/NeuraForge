import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY.trim());

async function test() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Say hello in one word.");
    console.log("✅ Success! Response:", result.response.text());
  } catch (err) {
    console.error("❌ Failed:", err.message);
    if (err.errorDetails) console.error(err.errorDetails);
  }
}

test();