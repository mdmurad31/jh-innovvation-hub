/**
 * JH Innovation Hub - Client Deterministic Priority Scoring Engine
 * 
 * Formula (100% Deterministic & Explainable):
 * - Severity:           30% (max 30 points)
 * - Affected Population: 25% (max 25 points)
 * - Urgency:             20% (max 20 points)
 * - Geographic Impact:   15% (max 15 points)
 * - Evidence Quality:    10% (max 10 points)
 */

import { PriorityBreakdown, PriorityLevel } from '../types';

export function calculatePriority(params: {
  severity?: number;
  affectedPeopleCount?: number;
  urgency?: string;
  hasCoordinates?: boolean;
  district?: string;
  evidenceCount?: number;
}): PriorityBreakdown {
  const reasons: string[] = [];

  // 1. Severity: 30% (max 30 points)
  const normalizedSeverity = Math.min(Math.max(params.severity || 5, 1), 10);
  const severityComponent = Math.min(30, Math.max(3, Math.round((normalizedSeverity / 10) * 30)));
  if (normalizedSeverity >= 8) {
    reasons.push(`High acute severity assessment score (${normalizedSeverity}/10)`);
  } else if (normalizedSeverity >= 5) {
    reasons.push(`Moderate community severity level (${normalizedSeverity}/10)`);
  } else {
    reasons.push(`Standard operational severity level (${normalizedSeverity}/10)`);
  }

  // 2. Affected Population: 25% (max 25 points)
  const pop = Math.max(0, params.affectedPeopleCount || 10);
  let populationComponent = 5;
  if (pop >= 5000) {
    populationComponent = 25;
    reasons.push(`Mass community impact affecting over 5,000 residents (${pop.toLocaleString()})`);
  } else if (pop >= 2500) {
    populationComponent = Math.min(24, 23 + Math.round(((pop - 2500) / 2500) * 1));
    reasons.push(`Large-scale regional community impact (${pop.toLocaleString()} people)`);
  } else if (pop >= 1000) {
    populationComponent = Math.min(22, 20 + Math.round(((pop - 1000) / 1500) * 2));
    reasons.push(`Significant regional impact affecting ${pop.toLocaleString()} people`);
  } else if (pop >= 500) {
    populationComponent = Math.min(19, 17 + Math.round(((pop - 500) / 500) * 2));
    reasons.push(`Substantial institutional/village cohort (${pop.toLocaleString()} individuals)`);
  } else if (pop >= 250) {
    populationComponent = Math.min(16, 14 + Math.round(((pop - 250) / 250) * 2));
    reasons.push(`Village/neighborhood scale impact (${pop.toLocaleString()} residents)`);
  } else if (pop >= 100) {
    populationComponent = Math.min(13, 10 + Math.round(((pop - 100) / 150) * 3));
    reasons.push(`Local cluster impact (${pop.toLocaleString()} people)`);
  } else if (pop >= 25) {
    populationComponent = Math.min(9, 6 + Math.round(((pop - 25) / 75) * 3));
    reasons.push(`Hamlet/neighborhood pocket impact (${pop.toLocaleString()} people)`);
  } else {
    populationComponent = Math.min(5, Math.max(3, Math.round((pop / 25) * 5)));
    reasons.push(`Localized household impact (${pop} individuals)`);
  }

  // 3. Urgency: 20% (max 20 points)
  let urgencyComponent = 8;
  const lowerUrgency = (params.urgency || '').toLowerCase();
  if (lowerUrgency.includes('emergency') || lowerUrgency.includes('immediate') || lowerUrgency.includes('critical')) {
    urgencyComponent = 20;
    reasons.push('Immediate emergency urgency: active hazard risking health, education, or critical infrastructure');
  } else if (lowerUrgency.includes('high') || lowerUrgency.includes('week')) {
    urgencyComponent = 16;
    reasons.push('High urgency: condition degrading rapidly within weeks');
  } else if (lowerUrgency.includes('medium') || lowerUrgency.includes('moderate') || lowerUrgency.includes('month')) {
    urgencyComponent = 11;
    reasons.push('Medium urgency: recurring or cyclical bottleneck requiring planned intervention');
  } else {
    urgencyComponent = 6;
    reasons.push('Low/routine urgency: regular seasonal or scheduled maintenance');
  }

  // 4. Geographic Impact: 15% (max 15 points)
  let geographicComponent = 9;
  if (params.hasCoordinates) {
    geographicComponent = 13;
    reasons.push('Verified GPS geo-coordinates attached for precise field location');
  }
  if (params.district) {
    geographicComponent = Math.min(15, geographicComponent + 2);
  }

  // 5. Evidence Quality: 10% (max 10 points)
  const evCount = Math.max(0, params.evidenceCount || 0);
  let evidenceComponent = 3;
  if (evCount >= 3) {
    evidenceComponent = 10;
    reasons.push(`Rich multi-modal photographic/documentary evidence attached (${evCount} files)`);
  } else if (evCount >= 1) {
    evidenceComponent = 6;
    reasons.push(`Photographic/documentary proof attached (${evCount} file(s))`);
  } else {
    evidenceComponent = 2;
    reasons.push('Basic text report without photographic evidence attachments');
  }

  const totalScore = Math.min(
    100,
    Math.max(1, severityComponent + populationComponent + urgencyComponent + geographicComponent + evidenceComponent)
  );

  let level: PriorityLevel = 'LOW';
  if (totalScore >= 75) {
    level = 'CRITICAL';
  } else if (totalScore >= 55) {
    level = 'HIGH';
  } else if (totalScore >= 35) {
    level = 'MEDIUM';
  }

  return {
    severityComponent,
    populationComponent,
    urgencyComponent,
    geographicComponent,
    evidenceComponent,
    totalScore,
    level,
    reasons,
  };
}
