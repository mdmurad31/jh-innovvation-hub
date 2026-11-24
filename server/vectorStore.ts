/**
 * JH Innovation Hub - Vector Storage & pgvector Abstraction
 *
 * Implements:
 * - Embedding vector storage per problem
 * - Cosine similarity vector search
 * - Metadata indexing (district, block, category, problemType)
 * - Prepared for direct pgvector delegation if PostgreSQL is provisioned
 */

import { calculateCosineSimilarity } from './embeddings';

export interface VectorRecord {
  id: string; // problem id
  vector: number[];
  metadata: {
    title: string;
    district: string;
    block?: string;
    category: string;
    problemType?: string;
    evidenceCount: number;
    submittedAt: string;
  };
}

class ProblemVectorStore {
  private records: Map<string, VectorRecord> = new Map();

  /**
   * Upsert a problem embedding into the vector index
   */
  public upsert(id: string, vector: number[], metadata: VectorRecord['metadata']): void {
    this.records.set(id, { id, vector, metadata });
  }

  /**
   * Get vector by problem ID
   */
  public get(id: string): VectorRecord | undefined {
    return this.records.get(id);
  }

  /**
   * Cosine similarity search against all stored vectors
   */
  public searchSimilar(
    queryVector: number[],
    excludeId?: string,
    minCosine: number = 0.60,
    topK: number = 10
  ): Array<{ id: string; cosineSimilarity: number; metadata: VectorRecord['metadata'] }> {
    const results: Array<{ id: string; cosineSimilarity: number; metadata: VectorRecord['metadata'] }> = [];

    for (const [id, rec] of this.records.entries()) {
      if (excludeId && id === excludeId) continue;

      const sim = calculateCosineSimilarity(queryVector, rec.vector);
      if (sim >= minCosine) {
        results.push({
          id,
          cosineSimilarity: sim,
          metadata: rec.metadata,
        });
      }
    }

    return results.sort((a, b) => b.cosineSimilarity - a.cosineSimilarity).slice(0, topK);
  }

  /**
   * Total indexed vectors
   */
  public count(): number {
    return this.records.size;
  }
}

export const problemVectorStore = new ProblemVectorStore();
