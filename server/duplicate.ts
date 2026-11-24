/**
 * JH Innovation Hub - Semantic Duplicate & Cluster Detection
 *
 * Implements:
 * Description -> Embedding -> Vector Storage -> Cosine Similarity -> Candidate Duplicate / Cluster
 *
 * Combined with:
 * - Category
 * - District
 * - Block
 * - Location (Coordinates / Haversine Distance)
 * - Keywords
 * - Evidence
 * - Problem Type
 *
 * Exposes explicit "WHY" reasons for human-in-the-loop review:
 * e.g.:
 * 92% Similar
 * ✓ Same district
 * ✓ Same category
 * ✓ Similar description
 * ✓ Nearby location
 *
 * Human options:
 * - REVIEW
 * - MERGE
 * - KEEP SEPARATE
 */

import { DuplicateCandidate, DuplicateWhyBreakdown, Problem } from '../src/types';
import { calculateCosineSimilarity, generateLocalSemanticVector, getProblemEmbedding } from './embeddings';
import { problemVectorStore } from './vectorStore';

/**
 * Compute Haversine distance in kilometers between two GPS coordinates
 */
function calculateHaversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

/**
 * Extract shared domain keywords from titles and descriptions
 */
function extractSharedKeywords(textA: string, textB: string): string[] {
  const stopwords = new Set([
    'this', 'that', 'with', 'from', 'have', 'been', 'were', 'what', 'when', 'where', 'which', 'there', 'their', 'about',
    'after', 'before', 'under', 'every', 'other', 'water', 'issue', 'problem', 'jharkhand', 'school', 'nearby', 'during'
  ]);
  const wordsA = (textA.toLowerCase().match(/\b[a-z]{4,}\b/g) || []).filter((w) => !stopwords.has(w));
  const wordsB = (textB.toLowerCase().match(/\b[a-z]{4,}\b/g) || []).filter((w) => !stopwords.has(w));
  const setA = new Set(wordsA);
  const common = Array.from(new Set(wordsB.filter((w) => setA.has(w))));
  return common.slice(0, 6);
}

/**
 * Calculate multi-dimensional similarity between two problems
 * combining vector cosine similarity with categorical, spatial, and evidence attributes
 */
export function calculateProblemSemanticSimilarity(
  target: Problem,
  candidate: Problem,
  targetEmbedding?: number[],
  candidateEmbedding?: number[]
): { score: number; reasons: string[]; why: DuplicateWhyBreakdown } {
  if (target.id === candidate.id) {
    return {
      score: 100,
      reasons: ['Exact identical record'],
      why: {
        sameDistrict: true,
        districtName: target.location.district,
        sameBlock: true,
        blockName: target.location.block,
        sameCategory: true,
        categoryName: target.category,
        similarDescription: true,
        semanticCosineSimilarity: 1.0,
        nearbyLocation: true,
        distanceKm: 0,
        sharedKeywords: [],
        evidenceSimilarity: true,
        matchingProblemType: true,
        problemType: target.aiAnalysis?.problemType || 'INNOVATION',
      },
    };
  }

  const reasons: string[] = [];
  let score = 0;

  // 1. Semantic Embedding & Cosine Similarity (Weight: 40%)
  const vecA = targetEmbedding || generateLocalSemanticVector(`${target.title} ${target.description}`);
  const vecB = candidateEmbedding || generateLocalSemanticVector(`${candidate.title} ${candidate.description}`);
  const cosine = calculateCosineSimilarity(vecA, vecB);

  // Cosine mapping: cosine usually ranges 0.65-0.98 for related issues
  const semanticPoints = Math.round(cosine * 40);
  score += semanticPoints;

  const isSimilarDescription = cosine >= 0.72;
  if (isSimilarDescription) {
    reasons.push(`✓ Similar description (${Math.round(cosine * 100)}% semantic cosine match)`);
  }

  // 2. Same District (Weight: 16%)
  const isSameDistrict =
    target.location.district.trim().toLowerCase() === candidate.location.district.trim().toLowerCase();
  if (isSameDistrict) {
    score += 16;
    reasons.push(`✓ Same district (${target.location.district})`);
  }

  // 3. Same Category (Weight: 12%)
  const isSameCategory = target.category.trim().toLowerCase() === candidate.category.trim().toLowerCase();
  if (isSameCategory) {
    score += 12;
    reasons.push(`✓ Same category (${target.category})`);
  }

  // 4. Same Administrative Block (Weight: 10%)
  let isSameBlock = false;
  if (
    target.location.block &&
    candidate.location.block &&
    target.location.block.trim().toLowerCase() === candidate.location.block.trim().toLowerCase()
  ) {
    isSameBlock = true;
    score += 10;
    reasons.push(`✓ Same administrative block (${target.location.block})`);
  }

  // 5. Geographic Proximity / Nearby Location (Weight: 12%)
  let distanceKm: number | undefined;
  let isNearbyLocation = false;
  if (
    target.location.latitude &&
    target.location.longitude &&
    candidate.location.latitude &&
    candidate.location.longitude
  ) {
    distanceKm = calculateHaversineDistanceKm(
      target.location.latitude,
      target.location.longitude,
      candidate.location.latitude,
      candidate.location.longitude
    );

    if (distanceKm <= 6.0) {
      isNearbyLocation = true;
      score += 12;
      reasons.push(`✓ Nearby location (${distanceKm.toFixed(1)} km radius)`);
    } else if (distanceKm <= 18.0) {
      isNearbyLocation = true;
      score += 8;
      reasons.push(`✓ Nearby location (${distanceKm.toFixed(1)} km distance)`);
    } else if (distanceKm <= 35.0) {
      isNearbyLocation = true;
      score += 4;
      reasons.push(`✓ Proximate catchment area (${distanceKm.toFixed(1)} km)`);
    }
  }

  // 6. Matching Problem Type (Weight: 5%)
  const targetType = target.aiAnalysis?.problemType || target.validation?.routedTo || 'INNOVATION';
  const candidateType = candidate.aiAnalysis?.problemType || candidate.validation?.routedTo || 'INNOVATION';
  const isMatchingProblemType = targetType === candidateType;
  if (isMatchingProblemType) {
    score += 5;
    reasons.push(`✓ Matching problem type (${targetType})`);
  }

  // 7. Shared Keywords & Evidence (Weight: 5%)
  const sharedKeywords = extractSharedKeywords(
    `${target.title} ${target.description}`,
    `${candidate.title} ${candidate.description}`
  );
  const hasEvidenceSimilarity = (target.evidence?.length || 0) > 0 && (candidate.evidence?.length || 0) > 0;

  if (sharedKeywords.length >= 2 || hasEvidenceSimilarity) {
    score += 5;
    if (sharedKeywords.length > 0) {
      reasons.push(`✓ Shared technical keywords (${sharedKeywords.slice(0, 3).join(', ')})`);
    }
  }

  // Calibrate final combined similarity score (cap at 95 unless identical)
  const finalScore = Math.min(95, Math.max(15, Math.round(score)));

  const why: DuplicateWhyBreakdown = {
    sameDistrict: isSameDistrict,
    districtName: target.location.district,
    sameBlock: isSameBlock,
    blockName: target.location.block,
    sameCategory: isSameCategory,
    categoryName: target.category,
    similarDescription: isSimilarDescription,
    semanticCosineSimilarity: Number(cosine.toFixed(2)),
    nearbyLocation: isNearbyLocation,
    distanceKm,
    sharedKeywords,
    evidenceSimilarity: hasEvidenceSimilarity,
    matchingProblemType: isMatchingProblemType,
    problemType: targetType,
  };

  return { score: finalScore, reasons, why };
}

/**
 * Find all semantic duplicate candidates for a target problem
 */
export function findDuplicateCandidates(
  target: Problem,
  allProblems: Problem[],
  threshold: number = 60
): DuplicateCandidate[] {
  const candidates: DuplicateCandidate[] = [];

  // Ensure target embedding exists in vector store
  let targetRec = problemVectorStore.get(target.id);
  let targetVec = targetRec?.vector;
  if (!targetVec) {
    targetVec = generateLocalSemanticVector(`${target.title} ${target.description}`);
    problemVectorStore.upsert(target.id, targetVec, {
      title: target.title,
      district: target.location.district,
      block: target.location.block,
      category: target.category,
      problemType: target.aiAnalysis?.problemType || 'INNOVATION',
      evidenceCount: target.evidence?.length || 0,
      submittedAt: target.submittedAt,
    });
  }

  for (const p of allProblems) {
    if (p.id === target.id) continue;

    let candidateRec = problemVectorStore.get(p.id);
    let candidateVec = candidateRec?.vector;
    if (!candidateVec) {
      candidateVec = generateLocalSemanticVector(`${p.title} ${p.description}`);
      problemVectorStore.upsert(p.id, candidateVec, {
        title: p.title,
        district: p.location.district,
        block: p.location.block,
        category: p.category,
        problemType: p.aiAnalysis?.problemType || 'INNOVATION',
        evidenceCount: p.evidence?.length || 0,
        submittedAt: p.submittedAt,
      });
    }

    const { score, reasons, why } = calculateProblemSemanticSimilarity(target, p, targetVec, candidateVec);

    if (score >= threshold) {
      candidates.push({
        problemId: p.id,
        title: p.title,
        description: p.description,
        district: p.location.district,
        block: p.location.block,
        category: p.category,
        problemType: p.aiAnalysis?.problemType || 'INNOVATION',
        similarityScore: score,
        reasons,
        why,
        submittedAt: p.submittedAt,
        evidenceCount: p.evidence?.length || 0,
        location: p.location,
        evidence: p.evidence,
        priorityScore: p.priority?.totalScore,
      });
    }
  }

  return candidates.sort((a, b) => b.similarityScore - a.similarityScore);
}
