const admin = require("firebase-admin");
const { FieldValue } = require("firebase-admin/firestore");

process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';

admin.initializeApp({ projectId: "qrlink-b845b" });

const db = admin.firestore();

const generateId = () => {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

const domains = ["google.com", "github.com", "twitter.com", "youtube.com", "ycombinator.com", "vercel.com"];
const devices = ["mobile", "desktop", "tablet"];
const browsers = ["Chrome", "Safari", "Firefox", "Edge", "Samsung Browser"];
const countries = ["US", "UK", "CA", "FR", "DE", "IN", "JP", "BR", "AU", "Unknown"];

async function seed() {
  const listUsersResult = await admin.auth().listUsers(1);
  if (listUsersResult.users.length === 0) {
    console.error("No users found. Please log in or create a user in the UI first.");
    return;
  }
  const userId = listUsersResult.users[0].uid;
  console.log("Seeding for user:", userId);

  const batch = db.batch();
  for (let i = 0; i < 50; i++) {
    const shortId = generateId();
    const docRef = db.collection('links').doc(shortId);
    
    // Add some random variation to dates and clicks
    const randomDaysAgo = Math.floor(Math.random() * 30);
    const date = new Date();
    date.setDate(date.getDate() - randomDaysAgo);
    const domain = domains[Math.floor(Math.random() * domains.length)];
    
    const numClicks = Math.floor(Math.random() * 1000);
    
    batch.set(docRef, {
      originalUrl: `https://${domain}/page/${Math.floor(Math.random() * 1000)}`,
      createdAt: admin.firestore.Timestamp.fromDate(date),
      clicks: numClicks,
      userId: userId,
      isSafe: true
    });

    for (let j = 0; j < numClicks; j++) {
      const clickDocRef = docRef.collection('clicks').doc();
      const clickDate = new Date(date.getTime() + Math.random() * (new Date().getTime() - date.getTime()));
      
      batch.set(clickDocRef, {
        timestamp: admin.firestore.Timestamp.fromDate(clickDate),
        userAgent: "Mock User Agent",
        device: devices[Math.floor(Math.random() * devices.length)],
        browser: browsers[Math.floor(Math.random() * browsers.length)],
        country: countries[Math.floor(Math.random() * countries.length)]
      });
    }
  }

  await batch.commit();
  console.log("Successfully seeded 50 mock links!");
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
