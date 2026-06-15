require('dotenv').config({path: '.env.local'});
fetch(`http://127.0.0.1:5001/qrlink-b845b/us-central1/redirect?id=zDFpee`)
  .then(res => res.json())
  .then(console.log)
  .catch(console.error);
