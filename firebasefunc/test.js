const admin = require("firebase-admin");

process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";

const appDemo = admin.initializeApp({ projectId: "demo-no-project" }, "demo");
const appQrlink = admin.initializeApp({ projectId: "qrlink-b845b" }, "qrlink");

async function run() {
  const demoLinks = await appDemo.firestore().collection("links").get();
  console.log("demo-no-project links:", demoLinks.size);

  const qrlinkLinks = await appQrlink.firestore().collection("links").get();
  console.log("qrlink-b845b links:", qrlinkLinks.size);
}
run().catch(console.error);
