const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { FieldValue } = require("firebase-admin/firestore");
const cors = require("cors")({ origin: true });
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
      clicks: 0
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

    // Increment click counter asynchronously
    docRef.update({
      clicks: FieldValue.increment(1)
    }).catch(console.error);

    return res.json({ url: doc.data().originalUrl });
  });
});
