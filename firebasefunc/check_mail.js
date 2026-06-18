const admin = require('firebase-admin');
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
admin.initializeApp({ projectId: 'qrlink-b845b' });

async function check() {
  const db = admin.firestore();
  const snapshot = await db.collection('contact_messages').get();
  console.log(`Found ${snapshot.docs.length} messages.`);
  snapshot.forEach(doc => {
    console.log(`Doc ID: ${doc.id}`);
    console.log(`Delivery State:`, JSON.stringify(doc.data().delivery, null, 2));
  });
}
check().catch(console.error);
