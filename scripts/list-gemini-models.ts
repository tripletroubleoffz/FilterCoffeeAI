import axios from 'axios';

async function main() {
  const apiKey = process.env.GEMINI_API_KEY || '';
  console.log(`Using GEMINI_API_KEY starting with: ${apiKey.substring(0, 10)}...`);

  const urls = [
    `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
    `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`
  ];

  for (const url of urls) {
    try {
      console.log(`\nFetching from: ${url.replace(apiKey, 'API_KEY')}`);
      const response = await axios.get(url);
      console.log('Status:', response.status);
      const models = response.data.models || [];
      console.log(`Found ${models.length} models.`);
      console.log('Sample models:', models.slice(0, 10).map((m: any) => m.name));
    } catch (e: any) {
      console.error(`Error:`, e.response?.data || e.message);
    }
  }
}

main();
