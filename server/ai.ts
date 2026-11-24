/**
 * JH Innovation Hub - AI Provider Abstraction
 * Supports: GEMINI_COMPATIBLE | OPENAI_COMPATIBLE | MOCK
 * Uses @google/genai with JH_AI_ENGINE and JSON schema when GEMINI_API_KEY is present.
 * Falls back deterministically to realistic domain mock analysis if key is absent or in mock mode.
 */

import { GoogleGenAI, Type } from '@google/genai';
import { ProblemAIAnalysis, ProblemCategory, SupportRouting } from '../src/types';

export const JH_AI_ENGINE = 'gemini-3.8-flash';
export type AIProviderMode = 'MOCK' | 'GEMINI_COMPATIBLE' | 'OPENAI_COMPATIBLE';

// Initialize Gemini Client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    const apiKey = process.env.GEMINI_API_KEY;
    const isOAuth = apiKey.startsWith('ya29.');

    if (isOAuth) {
      const originalGeminiKey = process.env.GEMINI_API_KEY;
      const originalGoogleKey = process.env.GOOGLE_API_KEY;
      try {
        delete process.env.GEMINI_API_KEY;
        delete process.env.GOOGLE_API_KEY;
        geminiClient = new GoogleGenAI({
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
              Authorization: `Bearer ${apiKey}`,
            },
          },
        });
      } finally {
        process.env.GEMINI_API_KEY = originalGeminiKey;
        if (originalGoogleKey) {
          process.env.GOOGLE_API_KEY = originalGoogleKey;
        }
      }
    } else {
      geminiClient = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
  }
  return geminiClient;
}

export interface AnalyzeProblemInput {
  title: string;
  description: string;
  district: string;
  block?: string;
  category?: string;
  affectedPeopleCount?: number;
  urgency?: string;
  frequency?: string;
  evidenceDescriptions?: string[];
  providerMode?: AIProviderMode;
}

/**
 * Deterministic Fallback Mock for Offline Resilience
 */
export function generateDeterministicMockAnalysis(input: AnalyzeProblemInput): ProblemAIAnalysis {
  const text = `${input.title} ${input.description} ${input.category || ''}`.toLowerCase();

  // Water & Flooding / Drainage
  if (text.includes('flood') || text.includes('water') || text.includes('drain') || text.includes('pond') || text.includes('river')) {
    const isSchool = text.includes('school') || text.includes('student') || text.includes('education');
    return {
      category: isSchool ? 'Education' : 'Water',
      subcategory: isSchool ? 'School Water Inundation & Drainage' : 'Rural Surface Water & Flood Mitigation',
      summary: `Critical monsoon inundation observed at ${input.district} location. Seasonal runoff breaches perimeter, causing stagnant ponding and disruption to daily community activities.`,
      severity: isSchool ? 9 : 7,
      urgency: 8,
      estimatedAffectedPeople: input.affectedPeopleCount || (isSchool ? 500 : 1200),
      keywords: ['Monsoon Runoff', 'Stormwater Drainage', 'Hydrological Telemetry', 'Ultrasonic Sensors', 'Inundation Warning'],
      requiredSkills: ['Hydrology', 'IoT Sensor Interfacing', 'Civil Drainage Design', 'GIS Topography', 'Edge Firmware'],
      requiredTechnologies: ['Ultrasonic Level Sensors', 'LoRaWAN Telemetry', 'Solar Power Battery Node', 'Cloud Alerting API'],
      possibleGovernmentDepartment: 'Department of School Education & Literacy / Water Resources Department Jharkhand',
      problemType: 'INNOVATION',
      confidence: 0.94,
      rootCause: 'Lack of graded stormwater egress channels combined with low-lying perimeter topography and seasonal watershed runoff surges during peak monsoon months.',
      affectedPopulation: isSchool ? '500+ primary/middle school tribal students, faculty, and surrounding village access routes' : 'Local agricultural and residential community',
      locationExpertise: `District hydrological topography analysis required for ${input.district} catchment basin.`,
      solutionDomain: 'Smart IoT hydrological telemetry, automated solar ultrasonic early-warning water level node, and civil retention-bypass drainage channels.',
      expectedOutcome: 'Zero lost school days due to monsoon waterlogging, 75% reduction in stagnant water accumulation duration, and real-time SMS/siren alerts to local administration before flash inundation.',
      analyzedAt: new Date().toISOString(),
      provider: 'mock',
    };
  }

  // Agriculture / Crop disease / Irrigation
  if (text.includes('crop') || text.includes('paddy') || text.includes('pest') || text.includes('farmer') || text.includes('drought') || text.includes('soil')) {
    return {
      category: 'Agriculture',
      subcategory: 'Indigenous Crop Protection & Smart Irrigation',
      summary: `Agricultural vulnerability identified in ${input.district}. Erratic seasonal precipitation and localized pest incidence threaten smallholder cereal and pulse yields.`,
      severity: 8,
      urgency: 7,
      estimatedAffectedPeople: input.affectedPeopleCount || 850,
      keywords: ['Plant Pathology', 'Soil Moisture', 'Micro-Drip Solar Controller', 'Pest Computer Vision', 'Mobile Agro-Advisory'],
      requiredSkills: ['Agronomy', 'Computer Vision ML', 'Embedded IoT', 'Field Extension Outreach'],
      requiredTechnologies: ['Capacitive Soil Sensors', 'Mobile Leaf Disease Classifier', 'Solar Powered Drip Valve'],
      possibleGovernmentDepartment: 'Department of Agriculture, Animal Husbandry & Co-operative Jharkhand',
      problemType: 'INNOVATION',
      confidence: 0.91,
      rootCause: 'Delayed detection of localized fungal spore infestations and lack of precision soil moisture telemetry during critical germination windows.',
      affectedPopulation: 'Smallholder tribal farming families and village Self-Help Groups (SHGs)',
      locationExpertise: 'Agronomic soil and microclimate profiling for Chota Nagpur plateau red-laterite soil.',
      solutionDomain: 'Smartphone-based offline AI crop disease leaf diagnostics combined with low-cost solar soil moisture probes.',
      expectedOutcome: '35% reduction in crop yield loss, 40% reduction in unnecessary chemical pesticide expenditure, and timely localized Hindi agro-advisories.',
      analyzedAt: new Date().toISOString(),
      provider: 'mock',
    };
  }

  // Healthcare / Malnutrition / Telemedicine
  if (text.includes('health') || text.includes('clinic') || text.includes('doctor') || text.includes('medicine') || text.includes('hospital') || text.includes('sick')) {
    return {
      category: 'Healthcare',
      subcategory: 'Remote Primary Healthcare Triage & Diagnostic Access',
      summary: `Primary healthcare access bottleneck in remote rural sector of ${input.district}. Residents face 20+ km transit to access basic diagnostic facilities.`,
      severity: 8,
      urgency: 8,
      estimatedAffectedPeople: input.affectedPeopleCount || 3200,
      keywords: ['Point-of-Care Diagnostics', 'Telemedicine Triage', 'Maternal Health Screening', 'Offline Health Records'],
      requiredSkills: ['Biomedical Device Testing', 'Mobile App Development', 'Clinical Workflow Design'],
      requiredTechnologies: ['Digital Stethoscope', 'Portable Multiparameter Monitor', 'Encrypted Tele-consultation WebRTC'],
      possibleGovernmentDepartment: 'Department of Health, Medical Education & Family Welfare Jharkhand',
      problemType: 'MULTI_DISCIPLINARY',
      confidence: 0.89,
      rootCause: 'Geographical isolation, lack of regular specialist doctors at Community Health Centres, and absence of digital point-of-care vital telemetry.',
      affectedPopulation: 'Maternal mothers, pediatric infants, and geriatric tribal villagers',
      locationExpertise: 'Rural primary healthcare logistics and telemedicine network coverage mapping.',
      solutionDomain: 'Solar-powered portable point-of-care diagnostic kit operated by trained ASHA/ANM health workers connected to district hospital specialists.',
      expectedOutcome: 'Reduction in preventable secondary complications by 60%, 70% decrease in unnecessary patient transit expenditure.',
      analyzedAt: new Date().toISOString(),
      provider: 'mock',
    };
  }

  // Generic Societal Problem Default
  return {
    category: (input.category as ProblemCategory) || 'Urban Infrastructure',
    subcategory: 'Civic Utility & Infrastructure Enhancement',
    summary: `Community infrastructure deficit reported in ${input.district}. Civic amenity disruption impacts local accessibility and daily public functioning.`,
    severity: 6,
    urgency: 6,
    estimatedAffectedPeople: input.affectedPeopleCount || 600,
    keywords: ['Civic Infrastructure', 'Public Amenity', 'Workflow Tracking', 'GIS Asset Mapping'],
    requiredSkills: ['Civil Infrastructure Engineering', 'Public Administration Systems', 'Field Survey Verification'],
    requiredTechnologies: ['Mobile GPS Field App', 'GIS Ward Spatial Dashboard', 'Automated SLA Escalation'],
    possibleGovernmentDepartment: 'Department of Urban Development & Housing / Rural Development Jharkhand',
    problemType: 'GOVERNMENT_SERVICE',
    confidence: 0.86,
    rootCause: 'Infrastructure degradation exacerbated by deferred periodic maintenance and lack of automated citizen-to-department feedback loops.',
    affectedPopulation: 'Local residents and daily commuters',
    locationExpertise: `Ward and block administrative zone survey for ${input.district}.`,
    solutionDomain: 'Rapid engineering maintenance intervention integrated with continuous mobile citizen feedback verification.',
    expectedOutcome: 'Restoration of dependable civic service delivery within 14 working days with verified community sign-off.',
    analyzedAt: new Date().toISOString(),
    provider: 'mock',
  };
}

/**
 * Perform AI Problem Analysis with Gemini fallback to deterministic Mock
 */
export async function analyzeProblemWithAI(input: AnalyzeProblemInput): Promise<ProblemAIAnalysis> {
  const provider = input.providerMode || (process.env.GEMINI_API_KEY ? 'GEMINI_COMPATIBLE' : 'MOCK');

  if (provider === 'GEMINI_COMPATIBLE' && process.env.GEMINI_API_KEY) {
    try {
      const ai = getGeminiClient();
      if (ai) {
        const prompt = `You are the JH Innovation Hub Civic Intelligence Engine. Analyze the Jharkhand community problem:
Title: "${input.title}"
Description: "${input.description}"
Location: District: ${input.district}, Block: ${input.block || 'Not specified'}
Citizen estimated affected population: ${input.affectedPeopleCount || 'Unspecified'}
Citizen urgency: ${input.urgency || 'Unspecified'}
Citizen frequency: ${input.frequency || 'Unspecified'}

Generate a structured JSON assessment. Categories MUST be one of: Education, Agriculture, Healthcare, Water, Sanitation, Environment, Energy, Rural Livelihood, Urban Infrastructure, Accessibility, Public Administration, Transportation, Waste Management, Disaster Management, Other.
problemType MUST be one of: GOVERNMENT_SERVICE, RESEARCH, INNOVATION, ENTREPRENEURSHIP, MULTI_DISCIPLINARY, EMERGENCY.
Focus on accuracy, severity, urgency, and actionable steps.`;

        const response = await ai.models.generateContent({
          model: JH_AI_ENGINE,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                subcategory: { type: Type.STRING },
                summary: { type: Type.STRING },
                severity: { type: Type.INTEGER, description: '1 to 10 severity score' },
                urgency: { type: Type.INTEGER, description: '1 to 10 urgency score' },
                estimatedAffectedPeople: { type: Type.INTEGER },
                keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                requiredSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                requiredTechnologies: { type: Type.ARRAY, items: { type: Type.STRING } },
                possibleGovernmentDepartment: { type: Type.STRING },
                problemType: { type: Type.STRING },
                confidence: { type: Type.NUMBER },
                rootCause: { type: Type.STRING },
                affectedPopulation: { type: Type.STRING },
                locationExpertise: { type: Type.STRING },
                solutionDomain: { type: Type.STRING },
                expectedOutcome: { type: Type.STRING },
              },
              required: [
                'category',
                'subcategory',
                'summary',
                'severity',
                'urgency',
                'estimatedAffectedPeople',
                'keywords',
                'requiredSkills',
                'requiredTechnologies',
                'possibleGovernmentDepartment',
                'problemType',
                'confidence',
                'rootCause',
                'affectedPopulation',
                'solutionDomain',
                'expectedOutcome',
              ],
            },
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          return {
            category: parsed.category as ProblemCategory,
            subcategory: parsed.subcategory || 'Community Infrastructure',
            summary: parsed.summary,
            severity: Math.min(10, Math.max(1, parsed.severity || 7)),
            urgency: Math.min(10, Math.max(1, parsed.urgency || 7)),
            estimatedAffectedPeople: parsed.estimatedAffectedPeople || input.affectedPeopleCount || 500,
            keywords: parsed.keywords || [],
            requiredSkills: parsed.requiredSkills || [],
            requiredTechnologies: parsed.requiredTechnologies || [],
            possibleGovernmentDepartment: parsed.possibleGovernmentDepartment || 'Government of Jharkhand',
            problemType: (parsed.problemType as SupportRouting) || 'INNOVATION',
            confidence: parsed.confidence || 0.92,
            rootCause: parsed.rootCause || 'Root cause under investigation.',
            affectedPopulation: parsed.affectedPopulation || `${input.affectedPeopleCount || 500} community members`,
            locationExpertise: parsed.locationExpertise || `${input.district} district field assessment`,
            solutionDomain: parsed.solutionDomain || 'Technical innovation and engineering intervention',
            expectedOutcome: parsed.expectedOutcome || 'Measurable societal benefit and resolution',
            analyzedAt: new Date().toISOString(),
            provider: 'gemini',
          };
        }
      }
    } catch (err) {
      console.warn('Gemini API call failed or rate-limited; gracefully falling back to deterministic mock:', err);
    }
  }

  // Deterministic mock fallback
  return generateDeterministicMockAnalysis(input);
}
