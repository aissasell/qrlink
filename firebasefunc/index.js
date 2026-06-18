const { onRequest } = require("firebase-functions/v2/https");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
const { FieldValue } = require("firebase-admin/firestore");
const cors = require("cors")({ origin: true });
const cheerio = require("cheerio");
const UAParser = require("ua-parser-js");
const { GoogleGenAI } = require("@google/genai");

admin.initializeApp();

const db = admin.firestore();



// Generate a simple base62 ID
const generateId = () => {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

exports.shorten = onRequest({ cors: true }, (req, res) => {
  return cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: "Method not allowed" });
    }

    // Verify Auth token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const token = authHeader.split("Bearer ")[1];
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(token);
    } catch (err) {
      return res.status(401).json({ error: "Unauthorized or expired token" });
    }
    const userId = decodedToken.uid;

    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    try {
      new URL(url); // basic validation
    } catch (_) {
      return res.status(400).json({ error: "Invalid URL" });
    }

    let shortId = generateId();
    let docRef = db.collection('links').doc(shortId);
    
    // Ensure uniqueness (simple retry logic)
    let doc = await docRef.get();
    while (doc.exists) {
      shortId = generateId();
      docRef = db.collection('links').doc(shortId);
      doc = await docRef.get();
    }

    await docRef.set({
      originalUrl: url,
      createdAt: FieldValue.serverTimestamp(),
      clicks: 0,
      userId: userId,
      isSafe: true
    });

    return res.status(200).json({ id: shortId, originalUrl: url });
  });
});

exports.redirect = onRequest({ cors: true }, (req, res) => {
  return cors(req, res, async () => {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const shortId = req.query.id;
    if (!shortId) {
      return res.status(400).json({ error: "ID is required" });
    }

    const docRef = db.collection('links').doc(shortId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Link not found" });
    }
    
    const data = doc.data();

    // Check if the link has been flagged by moderation
    if (data.isSafe === false) {
      return res.status(403).json({ error: "This link has been disabled due to a policy violation." });
    }

    // Extract individual click data
    const ua = req.headers['user-agent'] || '';
    const parser = new UAParser(ua);
    const result = parser.getResult();
    
    // Default to desktop if device type is undefined but OS is desktop-like
    const deviceType = result.device.type || (['iOS', 'Android'].includes(result.os.name) ? 'mobile' : 'desktop');
    const browserName = result.browser.name || 'Unknown';
    const countryCode = req.headers['x-appengine-country'] || req.headers['x-country-code'] || 'Unknown';

    // Log the click asynchronously
    docRef.collection('clicks').add({
      timestamp: FieldValue.serverTimestamp(),
      userAgent: ua,
      device: deviceType,
      browser: browserName,
      country: countryCode
    }).catch(console.error);

    // Increment click counter asynchronously
    docRef.update({
      clicks: FieldValue.increment(1)
    }).catch(console.error);

    return res.json({ url: data.originalUrl });
  });
});

exports.moderateLinkOnCreate = onDocumentCreated("links/{linkId}", async (event) => {
  // Skip moderation in emulator
  if (process.env.FUNCTIONS_EMULATOR === 'true') {
    console.log("Skipping moderation in emulator.");
    return; // Exit early
  }
  
  const snapshot = event.data;
  if (!snapshot) return;

  // Initialize Vertex AI Client lazily to prevent emulator from crashing on boot if auth is missing
  let ai;
  try {
    ai = new GoogleGenAI({
      vertexai: true,
      project: process.env.GCLOUD_PROJECT || "qrlink-b845b",
      location: "us-central1"
    });
  } catch (initErr) {
    console.error("Failed to initialize GoogleGenAI. Error details:", initErr.message || initErr);
    console.error("If this is an auth error, ensure you ran 'gcloud auth application-default login' and that the Vertex AI API is enabled on your project.");
    return;
  }

  const data = snapshot.data();
  const url = data.originalUrl;
  
  if (!url) return;

  try {
    // 1. Fetch the content
    const response = await fetch(url, {
      headers: { 'User-Agent': 'QRLinkBot/1.0 (Moderation)' },
      signal: AbortSignal.timeout(10000)
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch ${url}: ${response.status}`);
      return;
    }

    const html = await response.text();
    
    // 2. Extract text using cheerio
    const $ = cheerio.load(html);
    $('script, style, noscript, iframe').remove();
    const textContent = $('body').text().replace(/\s+/g, ' ').trim().substring(0, 5000);
    
    if (!textContent) {
      console.log(`No readable text found for ${url}`);
      return;
    }

    // 3. Call Vertex AI Gemini 2.5 Flash
    const prompt = `You are a strict automated content moderator.
Review the following text extracted from a website. 
Does it explicitly promote extreme violence, illegal acts, severe hate speech, SCAM?
Respond strictly with ONLY the word "SAFE" or "VIOLATION".

Text to review:
"${textContent}"`;

    const modelResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const resultText = modelResponse.text.trim();
    console.log(`Moderation result for ${url}: ${resultText}`);

    // 4. Enforce
    if (resultText.includes("VIOLATION")) {
      console.log(`Flagging link ${event.params.linkId} as unsafe.`);
      return snapshot.ref.update({
        isSafe: false
      });
    }

  } catch (err) {
    console.error(`Error during moderation of ${url}:`, err);
  }
});
