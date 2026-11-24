/**
 * JH Innovation Hub - Semantic Embedding & Vector Computation
 *
 * Implements:
 * - Description -> Embedding vector pipeline
 * - Uses Gemini 'text-embedding-004' when GEMINI_API_KEY is available
 * - High-dimensional L2-normalized semantic vector fallback for offline/test reliability
 * - Cosine similarity calculation
 */

import { GoogleGenAI } from '@google/genai';

let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

// In-memory cache for computed embeddings
const embeddingCache = new Map<string, number[]>();

/**
 * Domain semantic ontology anchors for dense vector projection (128 dimensions)
 */
const DOMAIN_ANCHORS: string[] = [
  // Water & Flooding
  'water', 'flood', 'inundation', 'drainage', 'rain', 'monsoon', 'runoff', 'stormwater', 'catchment', 'overflow', 'subarnarekha', 'river', 'nallah', 'canal', 'pond',
  // Education & Schooling
  'school', 'education', 'classroom', 'students', 'children', 'attendance', 'midday', 'hostel', 'campus', 'teachers', 'primary', 'vidyalaya',
  // Agriculture & Irrigation
  'agriculture', 'crop', 'irrigation', 'farming', 'paddy', 'soil', 'harvest', 'farmer', 'borewell', 'drought', 'fertilizer', 'kisan',
  // Healthcare & Sanitation
  'health', 'hospital', 'clinic', 'sanitation', 'hygiene', 'waste', 'disease', 'dengue', 'malaria', 'contamination', 'medical', 'phc',
  // Infrastructure & Roads
  'road', 'bridge', 'culvert', 'connectivity', 'highway', 'transport', 'pothole', 'electricity', 'power', 'solar', 'grid', 'transformer',
  // Technology & IoT
  'sensor', 'iot', 'telemetry', 'ultrasonic', 'lorawan', 'alert', 'siren', 'automation', 'hardware', 'prototype', 'cloud', 'data',
  // Urgency & Impact
  'emergency', 'hazard', 'severe', 'critical', 'damage', 'submerged', 'disruption', 'danger', 'safety', 'stagnant', 'muddy',
  // Geography & Administration
  'ranchi', 'bundu', 'tamar', 'sonahatu', 'dhanbad', 'bokaro', 'hazaribagh', 'jamshedpur', 'deoghar', 'dumka', 'palamu', 'chaibasa', 'district', 'block', 'village', 'panchayat'
];

/**
 * Generate a deterministic, dense 128-dimensional L2-normalized semantic vector
 */
export function generateLocalSemanticVector(text: string): number[] {
  const normalizedText = text.toLowerCase();
  const words = normalizedText.match(/\b[a-z]{3,}\b/g) || [];
  const wordFreq = new Map<string, number>();
  for (const w of words) {
    wordFreq.set(w, (wordFreq.get(w) || 0) + 1);
  }

  const dim = 128;
  const vector = new Float64Array(dim);

  // 1. Project against domain semantic anchors
  for (let i = 0; i < DOMAIN_ANCHORS.length; i++) {
    const anchor = DOMAIN_ANCHORS[i];
    const index = i % dim;
    if (normalizedText.includes(anchor)) {
      const count = wordFreq.get(anchor) || 1;
      vector[index] += 1.8 * Math.sqrt(count);

      // Distribute semantic energy to adjacent dimensions for smooth semantic manifold
      vector[(index + 1) % dim] += 0.6;
      vector[(index + dim - 1) % dim] += 0.6;
    }
  }

  // 2. Hash non-anchor vocabulary into semantic buckets
  for (const [w, count] of wordFreq.entries()) {
    let hash = 0;
    for (let j = 0; j < w.length; j++) {
      hash = (hash * 31 + w.charCodeAt(j)) & 0xffffffff;
    }
    const idx = Math.abs(hash) % dim;
    vector[idx] += 0.7 * Math.log(1 + count);
  }

  // 3. Compute L2 norm
  let sumSq = 0;
  for (let i = 0; i < dim; i++) {
    sumSq += vector[i] * vector[i];
  }

  const norm = Math.sqrt(sumSq) || 1.0;
  const result: number[] = new Array(dim);
  for (let i = 0; i < dim; i++) {
    result[i] = Number((vector[i] / norm).toFixed(6));
  }

  return result;
}

/**
 * Compute embedding for problem description and title
 */
export async function getProblemEmbedding(text: string): Promise<number[]> {
  const cacheKey = text.trim();
  if (embeddingCache.has(cacheKey)) {
    return embeddingCache.get(cacheKey)!;
  }

  const client = getGeminiClient();
  if (client) {
    try {
      const response = await client.models.embedContent({
        model: 'text-embedding-004',
        contents: text,
      });

      const resAny = response as any;
      const raw = resAny.embedding?.values || resAny.embeddings?.[0]?.values || (Array.isArray(resAny.embeddings) ? resAny.embeddings : null);
      if (raw && Array.isArray(raw) && raw.length > 0) {
        // Normalize L2
        let normSq = 0;
        for (const v of raw) normSq += v * v;
        const norm = Math.sqrt(normSq) || 1.0;
        const normalized = raw.map((v: number) => Number((v / norm).toFixed(6)));
        embeddingCache.set(cacheKey, normalized);
        return normalized;
      }
    } catch (err) {
      console.warn('[Embedding] Gemini embedContent failed, falling back to local semantic vector:', err);
    }
  }

  // Fallback to local deterministic semantic vector
  const localVec = generateLocalSemanticVector(text);
  embeddingCache.set(cacheKey, localVec);
  return localVec;
}

/**
 * Calculate Cosine Similarity between two vectors:
 * dotProduct(A, B) / (norm(A) * norm(B))
 * Since vectors are L2-normalized, this simplifies to dotProduct(A, B).
 */
export function calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;

  // Handle vectors of different lengths safely (if mixing providers)
  const len = Math.min(vecA.length, vecB.length);
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < len; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  return Math.max(0, Math.min(1, Number(similarity.toFixed(4))));
}
