const { GoogleGenAI } = require('@google/genai');
async function test() {
  const ai = new GoogleGenAI({
    vertexai: true,
    project: process.env.GCLOUD_PROJECT || "qrlink-b845b",
    location: "us-central1"
  });
  
  try {
    const res = await ai.models.generateContent({
      model: 'gemini-1.5-flash-001',
      contents: 'hello'
    });
    console.log("Success 001!", res.text);
  } catch(e) {
    console.error("001 failed:", e.message);
  }

  try {
    const res = await ai.models.generateContent({
      model: 'gemini-1.5-pro',
      contents: 'hello'
    });
    console.log("Success pro!", res.text);
  } catch(e) {
    console.error("pro failed:", e.message);
  }
}
test();
