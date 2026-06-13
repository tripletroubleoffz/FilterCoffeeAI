export async function getEmbedding(text: string): Promise<number[]> {
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'mock-openai-key') {
    try {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          input: text,
          model: 'text-embedding-3-small',
        }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data?.data?.[0]?.embedding) {
          return data.data[0].embedding;
        }
      }
      console.warn('OpenAI embeddings API responded with error, falling back to offline semantic matching.');
    } catch (error) {
      console.error('Error generating embedding via OpenAI, falling back to offline semantic matching:', error);
    }
  }

  // Offline Semantic Matcher: 1536-dimensional normalized word hash vector
  const vector = new Array(1536).fill(0);
  const cleanText = text.toLowerCase().replace(/[^a-z0-9\s]/g, '');
  const words = cleanText.split(/\s+/).filter(w => w.length > 2); // Filter out tiny helper words

  if (words.length === 0) {
    // Return a dummy unit vector if empty
    vector[0] = 1.0;
    return vector;
  }

  for (const word of words) {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = (hash << 5) - hash + word.charCodeAt(i);
      hash |= 0;
    }
    const index = Math.abs(hash) % 1536;
    vector[index] += 1;
  }

  // Normalize the vector (Euclidean L2 norm) so that dot product equals cosine similarity
  const sumOfSquares = vector.reduce((sum, val) => sum + val * val, 0);
  const magnitude = Math.sqrt(sumOfSquares);
  if (magnitude > 0) {
    for (let i = 0; i < 1536; i++) {
      vector[i] /= magnitude;
    }
  } else {
    vector[0] = 1.0;
  }

  return vector;
}

export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
  }
  return dotProduct;
}
