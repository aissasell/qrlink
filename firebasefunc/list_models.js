const { GoogleAuth } = require('google-auth-library');
async function list() {
  try {
    const auth = new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
    const client = await auth.getClient();
    // Fetch the list of publishers/google/models directly
    const res = await client.request({
      url: 'https://us-central1-aiplatform.googleapis.com/v1/projects/qrlink-b845b/locations/us-central1/publishers/google/models',
      method: 'GET'
    });
    console.log("Models:", res.data.models.map(m => m.name).filter(name => name.includes('gemini')));
  } catch(e) {
    console.error("Error calling AI Platform:", e.message);
  }
}
list();
