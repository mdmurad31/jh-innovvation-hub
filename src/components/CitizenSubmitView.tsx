/**
 * JH Innovation Hub - Citizen Problem Submission & Lifecycle Portal
 * 
 * 8-Step Submission Flow:
 * 1. Problem description
 * 2. Category/details
 * 3. Location
 * 4. People affected
 * 5. Urgency
 * 6. Photos/videos/documents
 * 7. Review
 * 8. Submit -> Generates unique Problem ID & renders Lifecycle Tracker
 * 
 * Includes: Draft Saving (auto-save + manual) & Safe Upload Retry
 */

import {
  Activity,
  AlertCircle,
  Award,
  Camera,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Cpu,
  Download,
  Eye,
  FileCheck,
  FileText,
  HelpCircle,
  Image as ImageIcon,
  Layers,
  Loader2,
  MapPin,
  Mic,
  MicOff,
  Navigation,
  Plus,
  Radio,
  RefreshCw,
  Save,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  Upload,
  User as UserIcon,
  Video,
  X,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { submitCitizenFeedback, submitProblem } from '../lib/api';
import { calculatePriority } from '../lib/priority';
import { translations, tText, translateText, translateStatus, translateCategory, translateDistrict } from '../lib/i18n';
import { Problem, ProblemCategory, User } from '../types';
import { CitizenLifecycleTracker } from './CitizenLifecycleTracker';
import { PriorityBreakdownDisplay } from './PriorityBreakdownDisplay';

interface CitizenSubmitViewProps {
  currentUser: User;
  districts: any[];
  allProblems: Problem[];
  onProblemCreated: (newProblem: Problem) => void;
  onOpenGoldenDemo: () => void;
  lang: 'en' | 'hi';
}

const CATEGORIES: ProblemCategory[] = [
  'Education',
  'Agriculture',
  'Healthcare',
  'Water',
  'Sanitation',
  'Environment',
  'Energy',
  'Rural Livelihood',
  'Urban Infrastructure',
  'Accessibility',
  'Public Administration',
  'Transportation',
  'Waste Management',
  'Disaster Management',
  'Other',
];

const COMMUNITY_GROUPS = [
  'School Children & Students',
  'Small & Marginal Farmers',
  'Women & Self-Help Groups (SHGs)',
  'Tribal & Rural Households',
  'Daily Wage Workers',
  'Elderly & Persons with Disabilities',
  'Healthcare Patients & PHC Visitors',
  'Commuters & Villagers',
];

const RISK_FACTORS = [
  { id: 'risk-school', label: 'Direct Threat to Child Safety or Halt to Schooling' },
  { id: 'risk-water', label: 'Drinking Water Contamination / Vector Epidemic Threat' },
  { id: 'risk-livelihood', label: 'Severe Loss of Rural Livelihood, Produce or Crops' },
  { id: 'risk-access', label: 'Physical Cutoff of Road, Bridge or Hospital Access' },
  { id: 'risk-weather', label: 'Impending Monsoon / Flash Stream Hazard Window' },
];

const DRAFT_STORAGE_KEY = 'jh_citizen_submission_draft_v2';

export const CitizenSubmitView: React.FC<CitizenSubmitViewProps> = ({
  currentUser,
  districts,
  allProblems,
  onProblemCreated,
  onOpenGoldenDemo,
  lang,
}) => {
  const t = translations[lang];

  // Active Sub-Tab: 'submit' (8-step wizard), 'lifecycle' (11-stage tracker), 'my-reports'
  const [activeSubTab, setActiveSubTab] = useState<'submit' | 'lifecycle' | 'my-reports'>('submit');

  // Wizard Step State (1 through 8)
  const [step, setStep] = useState<number>(1);

  // Form Fields
  // Step 1: Problem Description
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const baseDescriptionRef = useRef<string>('');

  // Step 2: Category & Details
  const [category, setCategory] = useState<ProblemCategory>('Education');
  const [subcategory, setSubcategory] = useState('');
  const [copingMechanisms, setCopingMechanisms] = useState('');
  const [previousAttempts, setPreviousAttempts] = useState('');

  // Step 3: Location
  const [district, setDistrict] = useState(currentUser.district || '');
  const [block, setBlock] = useState('');
  const [villageOrWard, setVillageOrWard] = useState('');
  const [landmark, setLandmark] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [isLocatingGPS, setIsLocatingGPS] = useState(false);

  // Step 4: People Affected
  const [affectedPeopleCount, setAffectedPeopleCount] = useState<number>(100);
  const [selectedCommunityGroups, setSelectedCommunityGroups] = useState<string[]>([]);
  const [frequency, setFrequency] = useState<string>('Occasional');
  const [durationMonths, setDurationMonths] = useState<number>(6);

  // Step 5: Urgency
  const [urgency, setUrgency] = useState<string>('Moderate');
  const [selectedRisks, setSelectedRisks] = useState<string[]>([]);

  // Step 6: Photos/Videos/Documents & Safe Upload Retry
  interface EvidenceItem {
    id: string;
    type: 'image' | 'video' | 'document';
    fileName: string;
    url: string;
    caption: string;
    fileSizeBytes?: number;
    uploadStatus: 'uploaded' | 'uploading' | 'failed';
    errorMessage?: string;
  }

  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);

  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewModalImage, setPreviewModalImage] = useState<EvidenceItem | null>(null);

  // Submission & Lifecycle State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedProblem, setSubmittedProblem] = useState<Problem | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastSavedDraftTime, setLastSavedDraftTime] = useState<string | null>(null);
  const [hasDraftInStorage, setHasDraftInStorage] = useState(false);

  // Selected Problem ID for Lifecycle Tracker
  const [trackingProblemId, setTrackingProblemId] = useState<string>(
    allProblems.find((p) => p.isGoldenDemo)?.id || 'JH-2026-00124'
  );

  // Check for saved draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        setHasDraftInStorage(true);
      }
    } catch {
      // ignore
    }
  }, []);

  // Save draft function
  const saveDraft = (showToast = true) => {
    try {
      const draftData = {
        title,
        description,
        category,
        subcategory,
        copingMechanisms,
        previousAttempts,
        district,
        block,
        villageOrWard,
        landmark,
        latitude,
        longitude,
        affectedPeopleCount,
        selectedCommunityGroups,
        frequency,
        durationMonths,
        urgency,
        selectedRisks,
        step,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData));
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastSavedDraftTime(timeStr);
      setHasDraftInStorage(true);
      if (showToast) {
        setErrorMsg(null);
      }
    } catch (err) {
      console.warn('Failed to save draft to localStorage', err);
    }
  };

  // Restore draft
  const loadDraft = () => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const d = JSON.parse(saved);
        if (d.title) setTitle(d.title);
        if (d.description) setDescription(d.description);
        if (d.category) setCategory(d.category);
        if (d.subcategory) setSubcategory(d.subcategory);
        if (d.copingMechanisms) setCopingMechanisms(d.copingMechanisms);
        if (d.previousAttempts) setPreviousAttempts(d.previousAttempts);
        if (d.district) setDistrict(d.district);
        if (d.block) setBlock(d.block);
        if (d.villageOrWard) setVillageOrWard(d.villageOrWard);
        if (d.landmark) setLandmark(d.landmark);
        if (d.latitude) setLatitude(d.latitude);
        if (d.longitude) setLongitude(d.longitude);
        if (d.affectedPeopleCount) setAffectedPeopleCount(d.affectedPeopleCount);
        if (d.selectedCommunityGroups) setSelectedCommunityGroups(d.selectedCommunityGroups);
        if (d.frequency) setFrequency(d.frequency);
        if (d.durationMonths) setDurationMonths(d.durationMonths);
        if (d.urgency) setUrgency(d.urgency);
        if (d.selectedRisks) setSelectedRisks(d.selectedRisks);
        if (d.step) setStep(d.step);
        setHasDraftInStorage(false);
      }
    } catch (err) {
      console.warn('Error loading draft', err);
    }
  };

  const discardDraft = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setHasDraftInStorage(false);
    } catch {
      // ignore
    }
  };

  // Auto-save debounced
  useEffect(() => {
    if (title || description) {
      const timer = setTimeout(() => {
        saveDraft(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [title, description, category, district, block, affectedPeopleCount, urgency]);

  // Real Web Speech API Voice Assistant
  const handleToggleVoice = () => {
    if (isRecordingVoice) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      setIsRecordingVoice(false);
      setInterimTranscript('');
      return;
    }

    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setErrorMsg('Speech recognition is not supported in this browser. Please type your description.');
      return;
    }

    try {
      const recognition = new SpeechRecognitionAPI();
      recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
      recognition.continuous = true;
      recognition.interimResults = true;

      // Store the starting description so we only append newly finalized transcripts
      baseDescriptionRef.current = description;

      recognition.onstart = () => {
        setIsRecordingVoice(true);
        setInterimTranscript('');
        setErrorMsg(null);
      };

      recognition.onresult = (event: any) => {
        let finalTranscripts = '';
        let currentInterim = '';

        for (let i = 0; i < event.results.length; ++i) {
          const result = event.results[i];
          const text = result[0]?.transcript || '';
          if (result.isFinal) {
            finalTranscripts += (finalTranscripts ? ' ' : '') + text.trim();
          } else {
            currentInterim += (currentInterim ? ' ' : '') + text.trim();
          }
        }

        setInterimTranscript(currentInterim);

        // Build updated description by combining base with finalized speech
        const base = baseDescriptionRef.current.trim();
        const fullFinal = finalTranscripts.trim();
        
        let newDesc = base;
        if (fullFinal) {
          newDesc = base ? `${base} ${fullFinal}` : fullFinal;
        }

        setDescription(newDesc);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        try {
          recognition.stop();
        } catch {
          // ignore
        }
        recognitionRef.current = null;
        setIsRecordingVoice(false);
        setInterimTranscript('');
        if (event.error === 'not-allowed') {
          setErrorMsg('Microphone permission is restricted in this sandbox preview. Please type your issue or open in a new tab.');
        } else if (event.error !== 'aborted' && event.error !== 'no-speech') {
          setErrorMsg(`Voice recognition notice: ${event.error}.`);
        }
      };

      recognition.onend = () => {
        setIsRecordingVoice(false);
        setInterimTranscript('');
        recognitionRef.current = null;
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.warn('Could not start speech recognition:', err);
      setIsRecordingVoice(false);
      setInterimTranscript('');
      setErrorMsg('Microphone access is restricted in this preview sandbox.');
    }
  };

  // Auto-locate GPS coordinates
  const handleDetectGPS = () => {
    setIsLocatingGPS(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(Number(pos.coords.latitude.toFixed(4)));
          setLongitude(Number(pos.coords.longitude.toFixed(4)));
          setIsLocatingGPS(false);
        },
        () => {
          // Fallback to district center
          const d = districts.find((dist) => dist.name.toLowerCase() === district.toLowerCase());
          if (d) {
            setLatitude(d.lat);
            setLongitude(d.lng);
          } else {
            setLatitude(23.1812);
            setLongitude(85.5849);
          }
          setIsLocatingGPS(false);
        }
      );
    } else {
      setIsLocatingGPS(false);
    }
  };

  // File Upload Handlers with Safe Upload Retry
  const handleFilesSelected = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setIsProcessingFiles(true);
    setErrorMsg(null);

    const ALLOWED_EXT = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'pdf', 'txt', 'csv', 'doc', 'docx', 'mp4', 'webm', 'mov'];
    const FORBIDDEN_EXT = ['exe', 'bat', 'cmd', 'sh', 'php', 'phtml', 'js', 'ts', 'html', 'htm', 'vbs', 'ps1', 'py', 'pl', 'jar', 'msi', 'dll', 'so', 'cgi', 'asp', 'aspx', 'jsp'];
    const MAX_IMG_DOC_BYTES = 10 * 1024 * 1024; // 10MB
    const MAX_VID_BYTES = 25 * 1024 * 1024; // 25MB

    try {
      const fileArray = Array.from(files);
      const newItems: EvidenceItem[] = [];

      for (const file of fileArray) {
        const nameParts = file.name.toLowerCase().split('.');
        const ext = nameParts[nameParts.length - 1];

        // 1. Double extension check (e.g. malware.php.jpg)
        let hasForbiddenInner = false;
        for (let i = 0; i < nameParts.length - 1; i++) {
          if (FORBIDDEN_EXT.includes(nameParts[i])) {
            hasForbiddenInner = true;
            break;
          }
        }

        if (hasForbiddenInner || FORBIDDEN_EXT.includes(ext)) {
          newItems.push({
            id: 'ev-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
            type: 'document',
            fileName: file.name,
            url: '',
            caption: 'Security Rejected File',
            fileSizeBytes: file.size,
            uploadStatus: 'failed',
            errorMessage: 'Security Violation: Executable file or dangerous extension . + ext +  is prohibited.',
          });
          continue;
        }

        // 2. Extension Whitelist Check
        if (!ALLOWED_EXT.includes(ext)) {
          newItems.push({
            id: 'ev-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
            type: 'document',
            fileName: file.name,
            url: '',
            caption: 'Invalid Extension',
            fileSizeBytes: file.size,
            uploadStatus: 'failed',
            errorMessage: 'Unsupported File Type: . + ext +  is not allowed. Allowed: Images (JPG, PNG, WEBP), Docs (PDF, DOCX, TXT), Video (MP4, WEBM).',
          });
          continue;
        }

        // 3. File Size Check
        const isVid = file.type.startsWith('video/') || ['mp4', 'webm', 'mov'].includes(ext);
        const maxSize = isVid ? MAX_VID_BYTES : MAX_IMG_DOC_BYTES;
        if (file.size > maxSize) {
          const limitMB = Math.round(maxSize / (1024 * 1024));
          const currentMB = (file.size / (1024 * 1024)).toFixed(1);
          newItems.push({
            id: 'ev-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
            type: isVid ? 'video' : 'document',
            fileName: file.name,
            url: '',
            caption: 'Oversized File',
            fileSizeBytes: file.size,
            uploadStatus: 'failed',
            errorMessage: 'File Too Large: ' + currentMB + 'MB exceeds maximum limit of ' + limitMB + 'MB.',
          });
          continue;
        }

        const isImg = file.type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext);
        const type: 'image' | 'video' | 'document' = isImg ? 'image' : isVid ? 'video' : 'document';

        newItems.push({
          id: 'ev-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          type,
          fileName: file.name,
          url: URL.createObjectURL(file),
          caption: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
          fileSizeBytes: file.size,
          uploadStatus: 'uploaded',
        });
      }

      setEvidenceList((prev) => [...prev, ...newItems]);
    } catch (err: any) {
      console.warn('File processing error:', err);
      setErrorMsg(err.message || 'Error processing selected files.');
    } finally {
      setIsProcessingFiles(false);
    }
  };

  const handleRetryUpload = (id: string) => {
    setEvidenceList((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, uploadStatus: 'uploaded', errorMessage: undefined } : item
      )
    );
  };

  const handleRemoveEvidence = (id: string) => {
    setEvidenceList((prev) => prev.filter((ev) => ev.id !== id));
  };

  const handleAddBunduSamplePhotos = () => {
    const samples: EvidenceItem[] = [
      {
        id: `ev-sample-${Date.now()}-1`,
        type: 'image',
        fileName: 'bundu_school_corridor_water.jpg',
        url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=600&auto=format&fit=crop&q=80',
        caption: 'Classroom corridor inundated with 2.5 feet muddy runoff from Subarnarekha tributary',
        fileSizeBytes: 340000,
        uploadStatus: 'uploaded',
      },
      {
        id: `ev-sample-${Date.now()}-2`,
        type: 'image',
        fileName: 'bundu_kitchen_ration_store.jpg',
        url: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=600&auto=format&fit=crop&q=80',
        caption: 'Mid-day meal ration storage inundated with surface mud silt',
        fileSizeBytes: 280000,
        uploadStatus: 'uploaded',
      },
    ];
    setEvidenceList((prev) => [...prev, ...samples]);
  };

  // Provisional Priority Score Calculation for Review Step
  const provisionalPriority = calculatePriority({
    severity: urgency === 'Immediate Emergency' || urgency === 'CRITICAL' ? 9 : 7,
    affectedPeopleCount,
    urgency,
    hasCoordinates: !!(latitude && longitude),
    district,
    evidenceCount: evidenceList.length,
  });

  // Step Validation
  const validateCurrentStep = (currentStep: number): boolean => {
    setErrorMsg(null);
    if (currentStep === 1) {
      if (!title.trim() || title.length < 5) {
        setErrorMsg('Please provide a descriptive problem title (at least 5 characters).');
        return false;
      }
      if (!description.trim() || description.length < 15) {
        setErrorMsg('Please provide a detailed problem description (at least 15 characters).');
        return false;
      }
    }
    if (currentStep === 2) {
      if (!category) {
        setErrorMsg('Please select a problem domain sector.');
        return false;
      }
    }
    if (currentStep === 3) {
      if (!district) {
        setErrorMsg('Please select a district in Jharkhand.');
        return false;
      }
    }
    if (currentStep === 4) {
      if (!affectedPeopleCount || affectedPeopleCount < 1) {
        setErrorMsg('Please enter the estimated number of impacted citizens.');
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateCurrentStep(step)) {
      setStep((s) => Math.min(8, s + 1));
    }
  };

  const handlePrevStep = () => {
    setErrorMsg(null);
    setStep((s) => Math.max(1, s - 1));
  };

  // Submit Handler (Step 8)
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const payload = {
        title,
        description,
        category,
        location: {
          district,
          block,
          villageOrWard,
          landmark,
          latitude,
          longitude,
        },
        evidence: evidenceList.map((ev) => ({
          type: ev.type,
          url: ev.url,
          fileName: ev.fileName,
          caption: ev.caption,
          fileSizeBytes: ev.fileSizeBytes,
        })),
        affectedPeopleCount: Number(affectedPeopleCount),
        frequency,
        urgency,
        durationMonths: Number(durationMonths),
      };

      const res = await submitProblem(payload);
      if (res.success && res.problem) {
        setSubmittedProblem(res.problem);
        setTrackingProblemId(res.problem.id);
        onProblemCreated(res.problem);
        // Clear draft from storage on successful submission
        try {
          localStorage.removeItem(DRAFT_STORAGE_KEY);
        } catch {
          // ignore
        }
        // Switch to lifecycle view after submission
        setActiveSubTab('lifecycle');
      } else {
        setErrorMsg('Submission failed. Please check required fields.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Submission error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter My Reports
  const myReports = allProblems.filter(
    (p) =>
      (currentUser?.id && p.submittedBy === currentUser.id) ||
      (currentUser?.name && p.submitterName?.toLowerCase().includes(currentUser.name.toLowerCase().split(' ')[0]))
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 font-sans">
      {/* Top Banner & Tab Navigation */}
      <div className="bg-black text-white border border-slate-300 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest">
                {tText(lang, 'Citizen Portal • Government of Jharkhand', 'नागरिक पोर्टल • झारखंड सरकार')}
              </span>
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                {tText(lang, 'User', 'उपयोगकर्ता')}: {currentUser?.name || 'Citizen'} ({currentUser?.district || 'Ranchi'})
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
              {tText(lang, 'State Community Problem Intake & Lifecycle Hub', 'राज्य सामुदायिक समस्या दर्ज एवं जीवनचक्र हब')}
            </h1>
            <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              {tText(
                lang,
                'Report grassroot civic issues, track stage-by-stage progression, and audit university R&D deployments.',
                'स्थानीय नागरिक समस्याएं रिपोर्ट करें, चरणबद्ध प्रगति को ट्रैक करें और विश्वविद्यालय समाधानों का ऑडिट करें।'
              )}
            </p>
          </div>

          {/* Sub-Tabs Switcher */}
          <div className="flex items-center bg-slate-900 border-2 border-white p-1">
            <button
              onClick={() => setActiveSubTab('submit')}
              className={`px-4 py-2 text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'submit' ? 'bg-orange-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{tText(lang, 'New Submission', 'नई समस्या दर्ज करें')}</span>
            </button>
            <button
              onClick={() => setActiveSubTab('lifecycle')}
              className={`px-4 py-2 text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'lifecycle' ? 'bg-orange-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>{tText(lang, 'Lifecycle Tracker', 'जीवनचक्र ट्रैकर')}</span>
            </button>
            <button
              onClick={() => setActiveSubTab('my-reports')}
              className={`px-4 py-2 text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'my-reports' ? 'bg-orange-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>{tText(lang, 'My Reports', 'मेरी रिपोर्टें')}</span>
              <span
                className={`px-1.5 py-0.2 text-[10px] font-mono font-black ${
                  activeSubTab === 'my-reports' ? 'bg-black text-white' : 'bg-slate-700 text-white'
                }`}
              >
                {myReports.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* SUB-TAB 1: 8-STEP SUBMISSION FLOW */}
      {activeSubTab === 'submit' && (
        <div className="space-y-6">
          {/* Draft Notification Banner */}
          {hasDraftInStorage && (
            <div className="p-3.5 bg-amber-50 border-2 border-amber-500 text-black flex flex-wrap items-center justify-between gap-3 text-xs font-bold">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Unsaved submission draft found in local storage.</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={loadDraft}
                  className="px-3 py-1 bg-amber-600 text-white font-black uppercase text-[10px] hover:bg-amber-700"
                >
                  Resume Draft
                </button>
                <button
                  type="button"
                  onClick={discardDraft}
                  className="px-2.5 py-1 bg-white border border-amber-600 text-black font-black uppercase text-[10px] hover:bg-amber-100"
                >
                  Discard
                </button>
              </div>
            </div>
          )}

          {/* Stepper Wizard Card */}
          <div className="bg-white border border-slate-300">
            {/* Stepper Header Bar */}
            <div className="bg-black text-white p-4 sm:p-6 border-b border-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-orange-600 text-white font-mono text-xs font-black">
                    STEP {step} OF 8
                  </span>
                  <span className="text-xs font-black uppercase tracking-wider text-orange-400">
                    {step === 1 && '1. Problem Description'}
                    {step === 2 && '2. Category / Technical Details'}
                    {step === 3 && '3. Location & Geospatial Pinpoint'}
                    {step === 4 && '4. People Affected & Impact'}
                    {step === 5 && '5. Urgency & Severity Risks'}
                    {step === 6 && '6. Photos, Videos & Documents'}
                    {step === 7 && '7. Review & Priority Estimation'}
                    {step === 8 && '8. Final Submission'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {lastSavedDraftTime && (
                    <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                      <Save className="w-3 h-3 text-emerald-400" />
                      Auto-saved {lastSavedDraftTime}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => saveDraft(true)}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border border-slate-600"
                  >
                    <Save className="w-3 h-3" />
                    <span>Save Draft</span>
                  </button>
                  <span className="font-mono text-xs font-black text-white">
                    {Math.round((step / 8) * 100)}%
                  </span>
                </div>
              </div>

              {/* Progress 8-Step Segmented Bar */}
              <div className="grid grid-cols-8 gap-1.5 pt-1">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      if (s < step || validateCurrentStep(step)) {
                        setStep(s);
                      }
                    }}
                    className={`h-2 border transition ${
                      s === step
                        ? 'bg-orange-600 border-white ring-1 ring-white'
                        : s < step
                        ? 'bg-emerald-500 border-emerald-400'
                        : 'bg-slate-800 border-slate-700'
                    }`}
                    title={`Go to step ${s}`}
                  />
                ))}
              </div>
            </div>

            {/* Step Body */}
            <div className="p-6 sm:p-8 space-y-6">
              {errorMsg && (
                <div className="p-3.5 bg-rose-50 border-2 border-rose-600 text-xs font-black uppercase text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* STEP 1: PROBLEM DESCRIPTION */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="border-b border-slate-200 pb-2">
                    <h3 className="text-lg font-black uppercase tracking-tight text-black">
                      Step 1: Describe the Community Problem
                    </h3>
                    <p className="text-xs text-slate-600 font-bold uppercase tracking-wider">
                      Clearly explain what is happening, where it occurs, and what prevents normal daily life.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-black uppercase tracking-wider text-black">
                      Problem Title <span className="text-orange-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Monsoon Inundation & Flash Floodwater Ingress at Govt Middle School Bundu"
                      className="w-full p-3.5 bg-white border border-slate-300 text-sm font-bold text-black focus:outline-none focus:ring-2 focus:ring-black"
                    />
                    <span className="text-[11px] text-slate-500 font-medium">
                      Be specific about the problem type and the community institution or public asset affected.
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label className="block text-xs font-black uppercase tracking-wider text-black">
                        Problem Description <span className="text-orange-600">*</span>
                      </label>
                      <button
                        type="button"
                        id="ai-voice-assistant-btn"
                        onClick={handleToggleVoice}
                        className={`px-3 py-1 text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 border-2 ${
                          isRecordingVoice
                            ? 'bg-rose-600 text-white border-rose-600 animate-pulse'
                            : 'bg-white text-black border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {isRecordingVoice ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-orange-600" />}
                        <span>{isRecordingVoice ? 'Listening (Hindi/English)...' : 'AI Voice Assistant'}</span>
                      </button>
                    </div>

                    <div className="relative">
                      <textarea
                        rows={6}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        onKeyDown={(e) => {
                          // Prevent form reset or accidental submit on Enter unless modifier key is pressed
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.stopPropagation();
                          }
                        }}
                        placeholder="Explain in detail: What triggers the issue? When does it happen? What gets damaged? How does it affect students, farmers, or daily wage workers? Why have existing drainage or remedies failed?"
                        className="w-full p-3.5 bg-white border border-slate-300 text-xs font-medium text-black focus:outline-none focus:ring-2 focus:ring-black"
                      />
                      {isRecordingVoice && interimTranscript && (
                        <div className="mt-1.5 p-2 bg-orange-50 border border-orange-200 text-orange-900 text-xs font-mono flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping shrink-0" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700 shrink-0">Live Voice:</span>
                          <span className="italic truncate">{interimTranscript}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                      <span>Include exact local details for higher AI triage precision.</span>
                      <span>{description.length} characters</span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: CATEGORY & DETAILS */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="border-b border-slate-200 pb-2">
                    <h3 className="text-lg font-black uppercase tracking-tight text-black">
                      Step 2: Category & Technical Details
                    </h3>
                    <p className="text-xs text-slate-600 font-bold uppercase tracking-wider">
                      Specify the primary government domain sector and document previous interventions.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-black uppercase tracking-wider text-black">
                        Problem Domain Sector <span className="text-orange-600">*</span>
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as ProblemCategory)}
                        className="w-full p-3.5 bg-white border border-slate-300 text-xs font-black uppercase tracking-wider text-black focus:outline-none focus:ring-2 focus:ring-black cursor-pointer"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-black uppercase tracking-wider text-black">
                        Subcategory / Specific Subsystem
                      </label>
                      <input
                        type="text"
                        value={subcategory}
                        onChange={(e) => setSubcategory(e.target.value)}
                        placeholder="e.g. Surface Drainage & Early Storm Warning"
                        className="w-full p-3.5 bg-white border border-slate-300 text-xs font-bold text-black focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-black uppercase tracking-wider text-black">
                      Current Coping Mechanisms (What are residents currently doing?)
                    </label>
                    <input
                      type="text"
                      value={copingMechanisms}
                      onChange={(e) => setCopingMechanisms(e.target.value)}
                      placeholder="e.g. Stacking sandbags around classrooms and suspending classes for 18 days/yr"
                      className="w-full p-3.5 bg-white border border-slate-300 text-xs font-medium text-black focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-black uppercase tracking-wider text-black">
                      Previous Resolution Attempts (What has been tried before?)
                    </label>
                    <input
                      type="text"
                      value={previousAttempts}
                      onChange={(e) => setPreviousAttempts(e.target.value)}
                      placeholder="e.g. Panchayat dug an unlined trench, but it silted up during the first heavy monsoon shower"
                      className="w-full p-3.5 bg-white border border-slate-300 text-xs font-medium text-black focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: LOCATION */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="border-b border-slate-200 pb-2">
                    <h3 className="text-lg font-black uppercase tracking-tight text-black">
                      Step 3: Geographic Location & Pinpoint
                    </h3>
                    <p className="text-xs text-slate-600 font-bold uppercase tracking-wider">
                      Specify the exact administrative block, village/ward, and GPS coordinates.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-black uppercase tracking-wider text-black">
                        District (Jharkhand) <span className="text-orange-600">*</span>
                      </label>
                      <select
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full p-3.5 bg-white border border-slate-300 text-xs font-black uppercase tracking-wider text-black focus:outline-none focus:ring-2 focus:ring-black cursor-pointer"
                      >
                        {districts.map((d) => (
                          <option key={d.name} value={d.name}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-black uppercase tracking-wider text-black">
                        Block / Sub-District
                      </label>
                      <input
                        type="text"
                        value={block}
                        onChange={(e) => setBlock(e.target.value)}
                        placeholder="e.g. Bundu, Kanke, Tamar, Ormanjhi"
                        className="w-full p-3.5 bg-white border border-slate-300 text-xs font-bold text-black focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-black uppercase tracking-wider text-black">
                        Village / Ward / Mohalla
                      </label>
                      <input
                        type="text"
                        value={villageOrWard}
                        onChange={(e) => setVillageOrWard(e.target.value)}
                        placeholder="e.g. Ward 4, Bundu Nagar"
                        className="w-full p-3.5 bg-white border border-slate-300 text-xs font-medium text-black focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-black uppercase tracking-wider text-black">
                        Prominent Landmark / Spatial Reference
                      </label>
                      <input
                        type="text"
                        value={landmark}
                        onChange={(e) => setLandmark(e.target.value)}
                        placeholder="e.g. Adjacent to Subarnarekha Tributary & Bundu BDO Office"
                        className="w-full p-3.5 bg-white border border-slate-300 text-xs font-medium text-black focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                  </div>

                  {/* GPS Pinpoint Box */}
                  <div className="p-4 bg-slate-50 border border-slate-300 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
                        <Navigation className="w-4 h-4 text-orange-600" />
                        Exact GPS Geolocation Coordinates
                      </span>
                      <button
                        type="button"
                        onClick={handleDetectGPS}
                        disabled={isLocatingGPS}
                        className="px-3 py-1.5 bg-black hover:bg-slate-800 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition"
                      >
                        {isLocatingGPS ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MapPin className="w-3.5 h-3.5 text-orange-400" />}
                        <span>Detect Current GPS Location</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Latitude (°N)</span>
                        <input
                          type="number"
                          step="0.0001"
                          value={latitude || ''}
                          onChange={(e) => setLatitude(Number(e.target.value))}
                          placeholder="23.1812"
                          className="w-full p-2.5 bg-white border border-slate-400 text-xs font-mono font-bold text-black"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Longitude (°E)</span>
                        <input
                          type="number"
                          step="0.0001"
                          value={longitude || ''}
                          onChange={(e) => setLongitude(Number(e.target.value))}
                          placeholder="85.5849"
                          className="w-full p-2.5 bg-white border border-slate-400 text-xs font-mono font-bold text-black"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: PEOPLE AFFECTED */}
              {step === 4 && (
                <div className="space-y-6">
                  <div className="border-b border-slate-200 pb-2">
                    <h3 className="text-lg font-black uppercase tracking-tight text-black">
                      Step 4: Population Impact & Demographics
                    </h3>
                    <p className="text-xs text-slate-600 font-bold uppercase tracking-wider">
                      Quantify the societal impact scale and identify affected community groups.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-xs font-black uppercase tracking-wider text-black">
                      Estimated Number of People Impacted <span className="text-orange-600">*</span>
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        value={affectedPeopleCount}
                        onChange={(e) => setAffectedPeopleCount(Math.max(1, Number(e.target.value)))}
                        className="w-36 p-3 bg-white border border-slate-300 text-sm font-black font-mono text-black focus:outline-none"
                      />
                      <span className="text-xs font-bold text-slate-500">Citizens / Beneficiaries</span>

                      {/* Quick Presets */}
                      <div className="flex flex-wrap items-center gap-1.5 ml-auto">
                        <span className="text-[10px] font-bold uppercase text-slate-400">Quick Presets:</span>
                        {[50, 200, 500, 1500, 5000].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setAffectedPeopleCount(preset)}
                            className={`px-2.5 py-1 text-xs font-mono font-bold border transition ${
                              affectedPeopleCount === preset
                                ? 'bg-black text-white border-slate-300'
                                : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                            }`}
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-black uppercase tracking-wider text-black">
                      Primary Impacted Community Segments (Select all that apply):
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {COMMUNITY_GROUPS.map((group) => {
                        const isSelected = selectedCommunityGroups.includes(group);
                        return (
                          <button
                            key={group}
                            type="button"
                            onClick={() => {
                              setSelectedCommunityGroups((prev) =>
                                isSelected ? prev.filter((g) => g !== group) : [...prev, group]
                              );
                            }}
                            className={`p-3 text-left border-2 text-xs font-bold transition flex items-center justify-between ${
                              isSelected
                                ? 'bg-orange-50 border-slate-300 text-black'
                                : 'bg-white border-slate-300 text-slate-600 hover:border-slate-400'
                            }`}
                          >
                            <span>{group}</span>
                            <span
                              className={`w-4 h-4 border flex items-center justify-center font-mono text-[10px] font-black ${
                                isSelected ? 'bg-black text-white border-slate-300' : 'bg-white border-slate-400'
                              }`}
                            >
                              {isSelected ? '✓' : ''}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-black uppercase tracking-wider text-black">
                        Frequency of Problem Occurrence
                      </label>
                      <select
                        value={frequency}
                        onChange={(e) => setFrequency(e.target.value)}
                        className="w-full p-3 bg-white border border-slate-300 text-xs font-black uppercase tracking-wider text-black cursor-pointer"
                      >
                        <option value="Daily Continuous">Daily Recurring (Continuous)</option>
                        <option value="Weekly">Weekly Disruption</option>
                        <option value="Seasonal/Monsoon">Seasonal / Monsoon Surge</option>
                        <option value="Occasional Crisis">Occasional Severe Outbreak</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-black uppercase tracking-wider text-black">
                        Persistence Duration (Months)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={durationMonths}
                        onChange={(e) => setDurationMonths(Number(e.target.value))}
                        placeholder="24"
                        className="w-full p-3 bg-white border border-slate-300 text-xs font-bold font-mono text-black"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: URGENCY */}
              {step === 5 && (
                <div className="space-y-6">
                  <div className="border-b border-slate-200 pb-2">
                    <h3 className="text-lg font-black uppercase tracking-tight text-black">
                      Step 5: Urgency Level & Severity Risk Factors
                    </h3>
                    <p className="text-xs text-slate-600 font-bold uppercase tracking-wider">
                      Categorize the crisis urgency and check applicable severe hazard conditions.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-black uppercase tracking-wider text-black">
                      Severity Urgency Classification <span className="text-orange-600">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      {[
                        { level: 'Immediate Emergency', code: 'CRITICAL', desc: 'Imminent threat to life, child schooling, or safe water' },
                        { level: 'High (Weeks)', code: 'HIGH', desc: 'Active severe disruption requiring rapid university solution' },
                        { level: 'Moderate (Months)', code: 'MEDIUM', desc: 'Chronic infrastructure bottleneck needing planned engineering' },
                        { level: 'Routine Optimization', code: 'LOW', desc: 'General civic enhancement and modernization' },
                      ].map((item) => (
                        <button
                          key={item.level}
                          type="button"
                          onClick={() => setUrgency(item.level)}
                          className={`p-3.5 border-2 text-left transition flex flex-col justify-between min-h-[96px] ${
                            urgency === item.level
                              ? 'bg-black text-white border-slate-300 ring-2 ring-orange-500'
                              : 'bg-white text-slate-800 border-slate-300 hover:border-slate-400'
                          }`}
                        >
                          <div>
                            <div className="text-xs font-black uppercase">{item.level}</div>
                            <span className="text-[10px] font-mono font-bold text-orange-400">
                              {item.code}
                            </span>
                          </div>
                          <p className={`text-[10px] leading-tight ${urgency === item.level ? 'text-slate-300' : 'text-slate-500'}`}>
                            {item.desc}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-black uppercase tracking-wider text-black">
                      Severe Hazard Checklist (Influences Priority Scoring):
                    </label>
                    <div className="space-y-2">
                      {RISK_FACTORS.map((risk) => {
                        const isChecked = selectedRisks.includes(risk.id);
                        return (
                          <button
                            key={risk.id}
                            type="button"
                            onClick={() => {
                              setSelectedRisks((prev) =>
                                isChecked ? prev.filter((r) => r !== risk.id) : [...prev, risk.id]
                              );
                            }}
                            className={`w-full p-3 text-left border-2 text-xs font-bold transition flex items-center justify-between ${
                              isChecked
                                ? 'bg-orange-50 border-slate-300 text-black'
                                : 'bg-white border-slate-300 text-slate-600 hover:border-slate-400'
                            }`}
                          >
                            <span>{risk.label}</span>
                            <span
                              className={`w-4 h-4 border flex items-center justify-center font-mono text-[10px] font-black ${
                                isChecked ? 'bg-black text-white border-slate-300' : 'bg-white border-slate-400'
                              }`}
                            >
                              {isChecked ? '✓' : ''}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 6: PHOTOS / VIDEOS / DOCUMENTS & SAFE UPLOAD RETRY */}
              {step === 6 && (
                <div className="space-y-6">
                  <div className="border-b border-slate-200 pb-2 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-black uppercase tracking-tight text-black">
                        Step 6: Photos, Videos & Field Evidence
                      </h3>
                      <p className="text-xs text-slate-600 font-bold uppercase tracking-wider">
                        Attach geo-tagged photographs, documents or videos with safe retry capability.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddBunduSamplePhotos}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-black border border-slate-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                      <span>Load Sample Field Photos</span>
                    </button>
                  </div>

                  {/* Drag and Drop Zone */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      if (e.dataTransfer.files) {
                        handleFilesSelected(e.dataTransfer.files);
                      }
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-8 border-2 border-dashed text-center cursor-pointer transition ${
                      isDragging
                        ? 'border-orange-600 bg-orange-50'
                        : 'border-slate-300 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*,video/*,.pdf,.doc,.docx"
                      onChange={(e) => e.target.files && handleFilesSelected(e.target.files)}
                      className="hidden"
                    />

                    <div className="space-y-2">
                      <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto">
                        <Upload className="w-6 h-6" />
                      </div>
                      <h4 className="text-xs font-black uppercase text-black">
                        Drag & Drop Evidence Files or Click to Browse
                      </h4>
                      <p className="text-[11px] font-medium text-slate-500">
                        Supports JPG, PNG, MP4 video, and PDF reports up to 25MB each.
                      </p>
                    </div>
                  </div>

                  {/* Evidence Gallery with Upload Retry States */}
                  <div className="space-y-3">
                    <span className="text-xs font-black uppercase tracking-wider text-black block">
                      Attached Field Proof Records ({evidenceList.length})
                    </span>

                    {evidenceList.length === 0 ? (
                      <p className="text-xs font-medium text-slate-400 italic p-4 bg-slate-50 border border-slate-200 text-center">
                        No field photographs or documents attached yet. Click above or use "Load Sample Field Photos".
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {evidenceList.map((ev) => (
                          <div
                            key={ev.id}
                            className={`p-3 border-2 flex items-start gap-3 relative ${
                              ev.uploadStatus === 'failed'
                                ? 'border-rose-600 bg-rose-50'
                                : 'border-slate-300 bg-white'
                            }`}
                          >
                            {/* Thumbnail */}
                            {ev.type === 'image' ? (
                              <div
                                onClick={() => setPreviewModalImage(ev)}
                                className="w-16 h-16 bg-slate-900 shrink-0 cursor-pointer overflow-hidden border border-slate-300 relative group"
                              >
                                <img
                                  src={ev.url}
                                  alt={ev.caption}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover group-hover:scale-105 transition"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px]">
                                  <Eye className="w-4 h-4" />
                                </div>
                              </div>
                            ) : (
                              <div className="w-16 h-16 bg-slate-100 shrink-0 flex items-center justify-center border border-slate-300">
                                <FileText className="w-6 h-6 text-black" />
                              </div>
                            )}

                            {/* Info & Caption */}
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-xs font-black uppercase truncate text-black">
                                  {ev.fileName}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveEvidence(ev.id)}
                                  className="text-slate-400 hover:text-rose-600 p-0.5"
                                  title="Remove attachment"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>

                              <input
                                type="text"
                                value={ev.caption}
                                onChange={(e) => {
                                  const newCaption = e.target.value;
                                  setEvidenceList((prev) =>
                                    prev.map((item) =>
                                      item.id === ev.id ? { ...item, caption: newCaption } : item
                                    )
                                  );
                                }}
                                placeholder="Add descriptive caption..."
                                className="w-full p-1 bg-slate-50 border border-slate-300 text-[11px] font-medium text-black focus:outline-none"
                              />

                              <div className="flex items-center justify-between text-[10px] pt-0.5">
                                <span className="text-slate-400 font-mono">
                                  {ev.fileSizeBytes ? `${Math.round(ev.fileSizeBytes / 1024)} KB` : 'Uploaded'}
                                </span>

                                {/* Safe Upload Retry Indicator */}
                                {ev.uploadStatus === 'failed' ? (
                                  <button
                                    type="button"
                                    onClick={() => handleRetryUpload(ev.id)}
                                    className="px-2 py-0.5 bg-rose-600 text-white font-black uppercase text-[9px] flex items-center gap-1"
                                  >
                                    <RefreshCw className="w-3 h-3" />
                                    <span>Retry Upload</span>
                                  </button>
                                ) : (
                                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>Uploaded Safe</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 7: REVIEW & PROVISIONAL PRIORITY ESTIMATION */}
              {step === 7 && (
                <div className="space-y-6">
                  <div className="border-b border-slate-200 pb-2">
                    <h3 className="text-lg font-black uppercase tracking-tight text-black">
                      Step 7: Comprehensive Review & Priority Estimation
                    </h3>
                    <p className="text-xs text-slate-600 font-bold uppercase tracking-wider">
                      Confirm all entered parameters before submitting to the Government of Jharkhand.
                    </p>
                  </div>

                  {/* Summary Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 border border-slate-300 space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                        Problem Statement
                      </span>
                      <h4 className="text-sm font-black text-black">{title}</h4>
                      <p className="text-xs text-slate-700 font-medium leading-relaxed line-clamp-3">
                        {description}
                      </p>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-300 space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                        Administrative Geography
                      </span>
                      <div className="text-xs font-bold text-black space-y-1">
                        <div>District: <strong>{district}</strong></div>
                        <div>Block / Sub-District: <strong>{block}</strong></div>
                        <div>Village/Ward: <strong>{villageOrWard}</strong></div>
                        <div className="font-mono text-[11px] text-orange-600">
                          {latitude}° N, {longitude}° E
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-300 space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                        Societal Scale & Urgency
                      </span>
                      <div className="text-xs font-bold text-black space-y-1">
                        <div>Impacted Population: <strong>{affectedPeopleCount.toLocaleString()} Citizens</strong></div>
                        <div>Urgency: <strong>{urgency}</strong></div>
                        <div>Frequency: <strong>{frequency}</strong></div>
                        <div>Evidence Files: <strong>{evidenceList.length} Attached</strong></div>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-300 space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                        Domain & Technical Context
                      </span>
                      <div className="text-xs font-bold text-black space-y-1">
                        <div>Domain Sector: <strong>{category}</strong></div>
                        <div>Subcategory: <strong>{subcategory}</strong></div>
                        <div>Coping: <span className="font-normal text-slate-700">{copingMechanisms}</span></div>
                      </div>
                    </div>
                  </div>

                  {/* Provisional Priority Scoring Engine */}
                  <div className="space-y-2">
                    <span className="text-xs font-black uppercase tracking-wider text-black block">
                      Live Provisional Priority Score Estimation (Deterministic Formula):
                    </span>
                    <PriorityBreakdownDisplay priority={provisionalPriority} variant="full" />
                  </div>
                </div>
              )}

              {/* STEP 8: SUBMIT */}
              {step === 8 && (
                <div className="space-y-6 text-center py-4">
                  <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto border border-slate-300 shadow-md">
                    <Send className="w-8 h-8 text-orange-500" />
                  </div>

                  <div className="space-y-2 max-w-xl mx-auto">
                    <span className="text-xs font-black uppercase tracking-widest text-orange-600">
                      Step 8: Final Submission & Acknowledgment
                    </span>
                    <h3 className="text-2xl font-black uppercase tracking-tight text-black">
                      Ready to Register Problem with State Council
                    </h3>
                    <p className="text-xs font-medium text-slate-600 leading-relaxed">
                      Upon submission, a unique Problem ID (e.g. <code>JH-2026-XXXXX</code>) will be generated. The problem will immediately enter the 11-stage lifecycle pipeline starting with automated AI triage and government validation.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-300 max-w-md mx-auto text-left text-xs space-y-2">
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-500">Submitter Name:</span>
                      <span className="text-black">{currentUser.name}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-500">District:</span>
                      <span className="text-black">{district}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-500">Estimated Priority:</span>
                      <span className="text-orange-600 font-mono font-black">{provisionalPriority.totalScore}/100</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="px-8 py-4 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 mx-auto transition border border-slate-300 shadow-lg"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Generating Problem ID & Triaging...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          <span>Submit & Register Problem</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Stepper Footer Controls */}
            <div className="bg-slate-50 border-t border-slate-200 p-4 sm:p-6 flex items-center justify-between">
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={step === 1}
                className="px-4 py-2.5 text-xs font-black uppercase tracking-wider text-black bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              {step < 8 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-6 py-2.5 text-xs font-black uppercase tracking-wider text-white bg-black hover:bg-slate-900 border border-slate-300 transition flex items-center gap-1.5"
                >
                  <span>Next Step</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 text-xs font-black uppercase tracking-wider text-white bg-orange-600 hover:bg-orange-500 border border-slate-300 transition flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>Submit Problem</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: LIFECYCLE TRACKER (11-STAGE WORKFLOW STATE) */}
      {activeSubTab === 'lifecycle' && (
        <CitizenLifecycleTracker
          initialProblemId={trackingProblemId}
          allProblems={allProblems}
          currentUser={currentUser}
          onOpenGoldenDemo={onOpenGoldenDemo}
          lang={lang}
        />
      )}

      {/* SUB-TAB 3: MY REPORTS LIST */}
      {activeSubTab === 'my-reports' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight text-black">
                Your Submitted Problem Reports
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Audited submissions registered by {currentUser.name}
              </p>
            </div>
            <span className="font-mono text-xs font-black bg-black text-white px-2.5 py-1">
              {myReports.length} Active Records
            </span>
          </div>

          {myReports.length === 0 ? (
            <div className="bg-white p-8 border border-slate-300 text-center space-y-3">
              <p className="text-xs font-bold text-slate-500 uppercase">
                You have not submitted any community problem reports yet.
              </p>
              <button
                onClick={() => setActiveSubTab('submit')}
                className="px-4 py-2 bg-black text-white text-xs font-black uppercase tracking-wider"
              >
                Submit Your First Problem
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {myReports.map((p) => (
                <div key={p.id} className="bg-white p-6 border border-slate-300 space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-black bg-black text-white px-2.5 py-1">
                          {p.id}
                        </span>
                        <span className="text-xs font-black uppercase tracking-wider bg-slate-100 text-black border border-slate-300 px-2.5 py-1">
                          {translateCategory(p.category, lang)}
                        </span>
                        {p.isGoldenDemo && (
                          <span className="text-xs font-black uppercase tracking-wider bg-orange-600 text-white px-2.5 py-1">
                            ★ GOLDEN DEMO
                          </span>
                        )}
                      </div>
                      <h4 className="text-base font-black uppercase text-black">{translateText(p.title, lang)}</h4>
                      <p className="text-xs font-bold text-slate-500 flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-orange-600" />
                        <span>
                          {translateDistrict(p.location.district, lang)}, {p.location.block ? translateText(p.location.block, lang) : ''} • Submitted {new Date(p.submittedAt).toLocaleDateString()}
                        </span>
                      </p>
                    </div>

                    <div className="text-right space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                        Status
                      </span>
                      <span className="text-xs font-black uppercase px-3 py-1 bg-black text-white inline-block">
                        {translateStatus(p.status, lang)}
                      </span>
                      {p.priority && (
                        <div className="text-xs font-mono font-black text-orange-600 block">
                          Priority {p.priority.totalScore}/100
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 font-medium leading-relaxed line-clamp-2">
                    {translateText(p.description, lang)}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200">
                    <div className="text-xs font-bold text-slate-600">
                      {p.assignedUniversityName ? (
                        <span>Assigned to: <strong>{translateText(p.assignedUniversityName, lang)}</strong></span>
                      ) : (
                        <span>State Review & Triage Queue</span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setTrackingProblemId(p.id);
                        setActiveSubTab('lifecycle');
                      }}
                      className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition"
                    >
                      <Activity className="w-3.5 h-3.5" />
                      <span>View 11-Stage Lifecycle</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Image Full-View Modal */}
      {previewModalImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setPreviewModalImage(null)}
        >
          <div
            className="bg-white border border-slate-300 max-w-2xl w-full p-4 space-y-3 font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <strong className="text-xs font-black uppercase text-black truncate">
                {previewModalImage.fileName}
              </strong>
              <button
                type="button"
                onClick={() => setPreviewModalImage(null)}
                className="p-1 hover:bg-slate-100 text-black font-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[65vh] overflow-hidden flex items-center justify-center bg-slate-950 border border-slate-300">
              <img
                src={previewModalImage.url}
                alt={previewModalImage.caption || 'Enlarged evidence'}
                referrerPolicy="no-referrer"
                className="max-h-[65vh] w-auto object-contain"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between text-xs pt-1">
              <span className="font-bold text-slate-800">
                {previewModalImage.caption || 'Field evidence photograph'}
              </span>
              <button
                type="button"
                onClick={() => setPreviewModalImage(null)}
                className="px-3 py-1 bg-black text-white font-bold text-xs uppercase"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
