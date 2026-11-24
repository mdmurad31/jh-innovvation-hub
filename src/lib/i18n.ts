/**
 * JH Innovation Hub - Bilingual Localization Dictionary (English & हिन्दी)
 */

export type Language = 'en' | 'hi';

export const translations = {
  en: {
    // App & Header
    appTitle: 'JH Innovation Hub',
    tagline: 'Turning Community Problems into Real-World Solutions',
    stateGovt: 'Government of Jharkhand',
    subTagline: 'State Societal Innovation Ecosystem',
    innovationEcosystem: 'Innovation Ecosystem',
    stateCouncil: 'Govt of Jharkhand • State Council',
    stateBenchmark: 'STATE BENCHMARK',
    goldenTransformation: 'Golden Transformation: Monsoon Flood Telemetry Bundu',
    launchGoldenDemo: 'Launch 10-Step Golden Demo',
    tenSteps: '10 STEPS',
    resetDemo: 'RESET DEMO',
    resetting: 'RESETTING...',
    aiStatus: 'AI Status',
    engineActive: 'ENGINE ACTIVE',
    switchLanguage: 'Language',
    loadingEcosystem: 'Loading State Innovation Ecosystem...',

    // Nav Tabs
    navDashboard: 'Dashboard',
    navSearch: 'Global Search',
    navCitizen: 'Citizen',
    navGovt: 'Governance & Oversight',
    navUniversity: 'Universities',
    navIndustry: 'Industry & CSR',
    navLifecycle: 'Lifecycle',
    navImpact: 'Impact & Outcomes',
    navMap: 'District Insights',

    // Personas
    personaOfficer: 'Officer: Dr. Amitesh Sinha (IAS)',
    personaCitizen: 'Citizen: Ramesh Munda (Bundu)',
    personaFaculty: 'Faculty: Dr. Anand Mishra (BIT Mesra)',
    personaIndustry: 'Industry: Vikram Sen (Tata Steel)',

    // Common Actions & Badges
    home: 'Overview',
    citizenPortal: 'Citizen Portal',
    govtCommand: 'Govt Command Center',
    universityWorkspace: 'University Workspace',
    industryOpportunities: 'Industry & CSR',
    lifecycleTracker: 'Project Lifecycle',
    impactVerification: 'Impact & Verification',
    knowledgeReuse: 'Knowledge Reuse',
    jharkhandMap: 'Jharkhand Map',
    reportProblem: 'Report a Problem',
    exploreSolutions: 'Explore Solutions',
    goldenDemo: 'State Golden Demo',
    runDemo: 'Run Golden Demo',
    blueprintLibrary: 'Blueprint Library',
    filterProblems: 'Filter Problems',
    clearFilter: 'Clear Filter',
    viewAll: 'View All',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    submit: 'Submit',

    // Auth & Login
    signIn: 'Sign In',
    signOut: 'Sign Out',
    myAccount: 'My Account',
    loginTitle: 'Access JH Innovation Hub',
    loginSubtitle: 'Authenticate with Google, Facebook, GitHub, or State MeriPehchaan SSO',
    continueWithGoogle: 'Continue with Google',
    continueWithFacebook: 'Continue with Facebook',
    continueWithGithub: 'Continue with GitHub',
    continueWithLinkedin: 'Continue with LinkedIn',
    continueWithMeriPehchaan: 'MeriPehchaan (Gov SSO)',
    orWithEmail: 'Or continue with email / phone',
    emailOrPhone: 'Email or Mobile Number',
    password: 'Password / OTP',
    selectYourRole: 'Select Your Platform Role',
    homeDistrict: 'Home District in Jharkhand',
    instantDemoLogin: 'One-Click Persona Login',
    connectedWith: 'Connected via',

    // Roles
    roleCitizen: 'Citizen',
    roleGovt: 'Govt Officer',
    roleUniv: 'University Faculty',
    roleStudent: 'Student Innovator',
    roleIndustry: 'Industry Partner',

    // Core Metrics
    totalProblems: 'Total Problems',
    validatedProblems: 'Validated Problems',
    inDevelopment: 'In Development',
    completedProjects: 'Completed Projects',
    deployedSolutions: 'Deployed Solutions',
    peopleImpacted: 'People Impacted',
    participatingHEIs: 'Participating HEIs',
    industryPartners: 'Industry Partners',
    totalImpact: 'Total Impact',
    validatedIssues: 'Validated Issues',
    deployed: 'Deployed',

    // Attributes
    district: 'District',
    category: 'Category',
    priority: 'Priority',
    status: 'Status',
    searchPlaceholder: 'Search problems, projects, universities, districts...',
    whyExplanation: 'Why this recommendation?',
    matchScore: 'Match Score',
    nextAction: 'Next Action',
    responsibleActor: 'Responsible Actor',

    // Home Hero
    stateInnovationSystem: 'STATE INNOVATION SYSTEM',
    stateTransformationInfra: 'STATE TRANSFORMATION INFRASTRUCTURE',
    aiPipelineLive: 'AI PIPELINE LIVE',
    featuredTransformation: 'Featured Transformation',
    phasePilot: 'Phase: Pilot / Testing',
    heroTitleLine1: 'SMART FLOOD',
    heroTitleLine2: 'PREDICTION &',
    heroTitleLine3: 'EARLY WARNING',
    heroDescription: 'Turning real community problems into deployed engineering solutions across Jharkhand. From Ramesh Munda\'s monsoon inundation report at Bundu to BIT Mesra\'s IoT sluice telemetry and Tata Steel CSR deployment.',
    problemId: 'Problem ID',
    assignedHei: 'Assigned HEI',
    targetLocation: 'Target Location',
    reportAProblem: 'Report A Problem',

    // Home Sections
    aiContextAnalysis: 'AI Context Analysis',
    primaryCategory: 'Primary Category',
    explainablePriorityScore: 'Explainable Priority Score',
    requiredEngineeringSkills: 'Required Engineering Skills',
    regionalDistribution: 'Regional Distribution',
    activeHotspotDistricts: 'Active Hotspot Districts',
    viewFullMap: 'View Full 24-District Map',
    goldenDemoPipeline: '10-Step Golden Demonstration',
    goldenDemoSub: 'Step through the complete societal engineering transformation pipeline',
    clickStepToInspect: 'Click any step below to inspect verifiable artifacts, API logs, and official notifications',
    quickActionPortals: 'Role-Based Action Portals',

    // Citizen Submit View
    citizenIntakeTitle: 'Citizen Problem Intake & Verification',
    citizenIntakeSub: 'Report community infrastructure, water, agriculture, or disaster challenges directly to the state',
    step1Title: '1. Problem Details',
    step2Title: '2. Location & Department',
    step3Title: '3. Field Photographic Evidence',
    step4Title: '4. Review & AI Validation',
    problemTitleLabel: 'Problem Title (Clear & Specific)',
    problemDescLabel: 'Detailed Community Description',
    selectDistrictLabel: 'District in Jharkhand',
    blockPanchayatLabel: 'Block / Panchayat / Village',
    urgencyLabel: 'Citizen Urgency Level',
    submitButtonText: 'Submit Problem to State Hub',
    submittingText: 'AI Analyzing & Submitting...',
    myReportsTab: 'My Submitted Reports',
    newReportTab: 'File New Community Problem',

    // Cartogram & Map View
    cartogramTitle: 'State Catchment Cartogram',
    cartogramSub: 'Spatial Problem Distribution Across 24 Districts',
    filterSector: 'Filter Sector',
    allSectors: 'All Sectors',
    waterSanitation: 'Water & Sanitation',
    education: 'Education',
    agriculture: 'Agriculture & Food',
    healthcare: 'Healthcare',
    infrastructure: 'Infrastructure & Roads',
    disasterMining: 'Disaster & Mining',
    findDistrict: 'Find district...',
    criticalNeed: 'Critical (>80)',
    activeIssues: 'Active Issues',
    activeProjects: 'Project Active',
    assignedAcademicCapabilities: 'Assigned Academic Capabilities',
  },
  hi: {
    // App & Header
    appTitle: 'झारखंड इनोवेशन हब',
    tagline: 'सामुदायिक समस्याओं को वास्तविक समाधानों में बदलना',
    stateGovt: 'झारखंड सरकार',
    subTagline: 'राज्य सामाजिक नवाचार पारिस्थितिकी तंत्र',
    innovationEcosystem: 'नवाचार पारिस्थितिकी तंत्र',
    stateCouncil: 'झारखंड सरकार • राज्य अनुसंधान परिषद',
    stateBenchmark: 'राज्य बेंचमार्क',
    goldenTransformation: 'गोल्डन परिवर्तन: मानसून बाढ़ टेलीमेट्री बुंडू',
    launchGoldenDemo: '10-चरणीय गोल्डन डेमो चलाएं',
    tenSteps: '10 चरण',
    resetDemo: 'डेमो रीसेट करें',
    resetting: 'रीसेट हो रहा है...',
    aiStatus: 'एआई स्थिति',
    engineActive: 'इंजन सक्रिय',
    switchLanguage: 'भाषा',
    loadingEcosystem: 'राज्य नवाचार पारिस्थितिकी तंत्र लोड हो रहा है...',

    // Nav Tabs
    navDashboard: 'कार्यकारी डैशबोर्ड',
    navSearch: 'ग्लोबल सर्च',
    navCitizen: 'नागरिक पोर्टल',
    navGovt: 'सरकारी कमांड',
    navUniversity: 'विश्वविद्यालय कार्यक्षेत्र',
    navIndustry: 'उद्योग एवं सीएसआर',
    navLifecycle: 'प्रोजेक्ट जीवनचक्र',
    navImpact: 'प्रभाव एवं ब्लूप्रिंट',
    navMap: '24-ज़िला मानचित्र',

    // Personas
    personaOfficer: 'अधिकारी: डॉ. अमितेश सिन्हा (आईएएस)',
    personaCitizen: 'नागरिक: रमेश मुंडा (बुंडू)',
    personaFaculty: 'संकाय: डॉ. आनंद मिश्रा (बीआईटी मेसरा)',
    personaIndustry: 'उद्योग: विक्रम सेन (टाटा स्टील)',

    // Common Actions & Badges
    home: 'अवलोकन',
    citizenPortal: 'नागरिक पोर्टल',
    govtCommand: 'सरकारी कमांड सेंटर',
    universityWorkspace: 'विश्वविद्यालय कार्यक्षेत्र',
    industryOpportunities: 'उद्योग एवं सीएसआर',
    lifecycleTracker: 'प्रोजेक्ट जीवनचक्र',
    impactVerification: 'प्रभाव एवं सत्यापन',
    knowledgeReuse: 'समाधान पुनर्उपयोग',
    jharkhandMap: 'झारखंड नक्शा',
    reportProblem: 'समस्या दर्ज करें',
    exploreSolutions: 'समाधान देखें',
    goldenDemo: 'गोल्डन डेमो',
    runDemo: 'गोल्डन डेमो चलाएं',
    blueprintLibrary: 'ब्लूप्रिंट लाइब्रेरी',
    filterProblems: 'समस्याएं फ़िल्टर करें',
    clearFilter: 'फ़िल्टर हटाएं',
    viewAll: 'सभी देखें',
    close: 'बंद करें',
    back: 'पीछे',
    next: 'आगे',
    submit: 'सबमिट करें',

    // Auth & Login
    signIn: 'साइन इन करें',
    signOut: 'लॉग आउट',
    myAccount: 'मेरा खाता',
    loginTitle: 'झारखंड इनोवेशन हब में प्रवेश',
    loginSubtitle: 'Google, Facebook, GitHub या मेरी पहचान सरकारी SSO से लॉगिन करें',
    continueWithGoogle: 'Google से आगे बढ़ें',
    continueWithFacebook: 'Facebook से आगे बढ़ें',
    continueWithGithub: 'GitHub से आगे बढ़ें',
    continueWithLinkedin: 'LinkedIn से आगे बढ़ें',
    continueWithMeriPehchaan: 'मेरी पहचान (राष्ट्रीय सरकारी SSO)',
    orWithEmail: 'या ईमेल / मोबाइल से साइन इन करें',
    emailOrPhone: 'ईमेल या मोबाइल नंबर',
    password: 'पासवर्ड / ओटीपी',
    selectYourRole: 'अपनी भूमिका चुनें',
    homeDistrict: 'झारखंड में गृह ज़िला',
    instantDemoLogin: 'एक-क्लिक त्वरित व्यक्तित्व लॉगिन',
    connectedWith: 'माध्यम से जुड़ा हुआ',

    // Roles
    roleCitizen: 'नागरिक',
    roleGovt: 'सरकारी अधिकारी',
    roleUniv: 'विश्वविद्यालय संकाय',
    roleStudent: 'छात्र अन्वेषक',
    roleIndustry: 'उद्योग भागीदार',

    // Core Metrics
    totalProblems: 'कुल समस्याएं',
    validatedProblems: 'सत्यापित समस्याएं',
    inDevelopment: 'विकास कार्य जारी',
    completedProjects: 'पूर्ण परियोजनाएं',
    deployedSolutions: 'तैनात समाधान',
    peopleImpacted: 'लाभान्वित नागरिक',
    participatingHEIs: 'संबद्ध विश्वविद्यालय',
    industryPartners: 'उद्योग भागीदार',
    totalImpact: 'कुल प्रभाव',
    validatedIssues: 'सत्यापित समस्याएं',
    deployed: 'तैनात समाधान',

    // Attributes
    district: 'ज़िला',
    category: 'श्रेणी',
    priority: 'प्राथमिकता',
    status: 'स्थिति',
    searchPlaceholder: 'समस्याएं, प्रोजेक्ट, विश्वविद्यालय, ज़िले खोजें...',
    whyExplanation: 'यह सिफारिश क्यों?',
    matchScore: 'मैच स्कोर',
    nextAction: 'अगली कार्रवाई',
    responsibleActor: 'जिम्मेदार कर्ता',

    // Home Hero
    stateInnovationSystem: 'राज्य नवाचार प्रणाली',
    stateTransformationInfra: 'राज्य परिवर्तन अवसंरचना',
    aiPipelineLive: 'एआई पाइपलाइन लाइव',
    featuredTransformation: 'विशेष रूपांतरण',
    phasePilot: 'चरण: पायलट / परीक्षण',
    heroTitleLine1: 'स्मार्ट बाढ़',
    heroTitleLine2: 'पूर्वानुमान एवं',
    heroTitleLine3: 'पूर्व चेतावनी',
    heroDescription: 'झारखंड में जमीनी सामुदायिक समस्याओं को क्रियान्वित इंजीनियरिंग समाधानों में बदलना। बुंडू में रमेश मुंडा की मानसून जलभराव रिपोर्ट से लेकर बीआईटी मेसरा की आईओटी स्लुइस टेलीमेट्री और टाटा स्टील सीएसआर परिनियोजन तक।',
    problemId: 'समस्या आईडी',
    assignedHei: 'संबद्ध संस्थान',
    targetLocation: 'लक्षित स्थान',
    reportAProblem: 'समस्या दर्ज करें',

    // Home Sections
    aiContextAnalysis: 'एआई संदर्भ विश्लेषण',
    primaryCategory: 'प्राथमिक श्रेणी',
    explainablePriorityScore: 'व्याख्यात्मक प्राथमिकता स्कोर',
    requiredEngineeringSkills: 'आवश्यक इंजीनियरिंग कौशल',
    regionalDistribution: 'क्षेत्रीय वितरण',
    activeHotspotDistricts: 'सक्रिय हॉटस्पॉट ज़िले',
    viewFullMap: 'पूर्ण 24-ज़िला मानचित्र देखें',
    goldenDemoPipeline: '10-चरणीय गोल्डन प्रदर्शन',
    goldenDemoSub: 'समस्या पंजीकरण से लेकर तैनाती तक का संपूर्ण नवाचार जीवनचक्र',
    clickStepToInspect: 'सत्यापन योग्य कलाकृतियां, एपीआई लॉग एवं आधिकारिक अधिसूचनाएं देखने के लिए किसी भी चरण पर क्लिक करें',
    quickActionPortals: 'भूमिका-आधारित पोर्टल',

    // Citizen Submit View
    citizenIntakeTitle: 'नागरिक समस्या पंजीकरण एवं सत्यापन',
    citizenIntakeSub: 'स्थानीय अवसंरचना, जल, कृषि या आपदा से जुड़ी समस्याएं सीधे राज्य सरकार को दर्ज करें',
    step1Title: '1. समस्या का विवरण',
    step2Title: '2. स्थान एवं विभाग',
    step3Title: '3. फील्ड साक्ष्य (तस्वीरें)',
    step4Title: '4. समीक्षा एवं एआई सत्यापन',
    problemTitleLabel: 'समस्या का शीर्षक (स्पष्ट एवं संक्षिप्त)',
    problemDescLabel: 'सामुदायिक समस्या का विस्तृत विवरण',
    selectDistrictLabel: 'झारखंड का ज़िला',
    blockPanchayatLabel: 'प्रखंड / पंचायत / गांव',
    urgencyLabel: 'नागरिक तात्कालिकता स्तर',
    submitButtonText: 'राज्य हब में समस्या दर्ज करें',
    submittingText: 'एआई विश्लेषण एवं सबमिट हो रहा है...',
    myReportsTab: 'मेरी दर्ज की गई रिपोर्ट',
    newReportTab: 'नई सामुदायिक समस्या दर्ज करें',

    // Cartogram & Map View
    cartogramTitle: 'राज्य क्षेत्रीय कार्टोग्राम',
    cartogramSub: '24 ज़िलों में स्थानिक समस्या वितरण',
    filterSector: 'क्षेत्र फ़िल्टर करें',
    allSectors: 'सभी क्षेत्र',
    waterSanitation: 'जल एवं स्वच्छता',
    education: 'शिक्षा',
    agriculture: 'कृषि एवं खाद्य',
    healthcare: 'स्वास्थ्य सेवा',
    infrastructure: 'अवसंरचना एवं सड़कें',
    disasterMining: 'आपदा एवं खनन',
    findDistrict: 'ज़िला खोजें...',
    criticalNeed: 'अति गंभीर (>80)',
    activeIssues: 'सक्रिय समस्याएं',
    activeProjects: 'परियोजना सक्रिय',
    assignedAcademicCapabilities: 'संबद्ध शैक्षणिक संकाय',
  },
};

/**
 * Status Dictionary Translation
 */
export const STATUS_TRANSLATIONS: Record<string, { en: string; hi: string }> = {
  SUBMITTED: { en: 'Submitted', hi: 'दर्ज की गई' },
  AI_ANALYZED: { en: 'AI Analyzed', hi: 'एआई विश्लेषित' },
  GOVT_VALIDATED: { en: 'Govt Validated', hi: 'सरकार द्वारा सत्यापित' },
  PROPOSED: { en: 'Proposed', hi: 'प्रस्तावित' },
  MATCHED: { en: 'Matched', hi: 'संबद्ध' },
  ASSIGNED: { en: 'Assigned', hi: 'आवंटित' },
  PROTOTYPE_READY: { en: 'Prototype Ready', hi: 'प्रोटोटाइप तैयार' },
  TESTING_PASSED: { en: 'Testing Passed', hi: 'परीक्षण सफल' },
  PILOT_DEPLOYED: { en: 'Pilot Deployed', hi: 'पायलट तैनात' },
  DEPLOYED: { en: 'Deployed', hi: 'पूर्ण तैनात' },
  DEPRECATED: { en: 'Deprecated', hi: 'अमान्य' },
  REJECTED: { en: 'Rejected', hi: 'अस्वीकृत' },
};

/**
 * Category Dictionary Translation
 */
export const CATEGORY_TRANSLATIONS: Record<string, { en: string; hi: string }> = {
  WATER_SANITATION: { en: 'Water & Sanitation', hi: 'जल एवं स्वच्छता' },
  EDUCATION: { en: 'Education & Skills', hi: 'शिक्षा एवं कौशल' },
  AGRICULTURE: { en: 'Agriculture & Food', hi: 'कृषि एवं खाद्य' },
  HEALTHCARE: { en: 'Healthcare & Medical', hi: 'स्वास्थ्य सेवा' },
  INFRASTRUCTURE: { en: 'Infrastructure & Roads', hi: 'अवसंरचना एवं सड़कें' },
  DISASTER_MANAGEMENT: { en: 'Disaster & Mining', hi: 'आपदा एवं पर्यावरण' },
  RURAL_DEVELOPMENT: { en: 'Rural Development', hi: 'ग्रामीण विकास' },
  ENVIRONMENT: { en: 'Environment', hi: 'पर्यावरण' },
  ENERGY_COMMUNICATION: { en: 'Energy & Telecom', hi: 'ऊर्जा एवं दूरसंचार' },
};

/**
 * Priority Level Dictionary Translation
 */
export const PRIORITY_TRANSLATIONS: Record<string, { en: string; hi: string }> = {
  CRITICAL: { en: 'Critical Priority', hi: 'अति गंभीर प्राथमिकता' },
  HIGH: { en: 'High Priority', hi: 'उच्च प्राथमिकता' },
  MEDIUM: { en: 'Medium Priority', hi: 'मध्यम प्राथमिकता' },
  LOW: { en: 'Low Priority', hi: 'सामान्य प्राथमिकता' },
  P1: { en: 'P1 - Emergency', hi: 'P1 - आपातकालीन' },
  P2: { en: 'P2 - High Need', hi: 'P2 - उच्च आवश्यकता' },
  P3: { en: 'P3 - Moderate', hi: 'P3 - मध्यम' },
  P4: { en: 'P4 - Low', hi: 'P4 - सामान्य' },
};

/**
 * District Dictionary Translation
 */
export const DISTRICT_TRANSLATIONS: Record<string, string> = {
  Ranchi: 'राँची',
  Bundu: 'बुंडू',
  Dhanbad: 'धनबाद',
  'East Singhbhum': 'पूर्वी सिंहभूम',
  Jamshedpur: 'जमशेदपुर',
  Bokaro: 'बोकारो',
  Hazaribagh: 'हज़ारीबाग',
  Deoghar: 'देवघर',
  Dumka: 'दुमका',
  Palamu: 'पलामू',
  Giridih: 'गिरिडीह',
  Ramgarh: 'रामगढ़',
  Khunti: 'खूंटी',
  'West Singhbhum': 'पश्चिमी सिंहभूम',
  Gumla: 'गुमला',
  Simdega: 'सिमडेगा',
  Latehar: 'लातेहार',
  Garhwa: 'गढ़वा',
  Chatra: 'चतरा',
  Koderma: 'कोडरमा',
  Lohardaga: 'लोहरदगा',
  'Seraikela Kharsawan': 'सरायकेला खरसावां',
  'Saraikela Kharsawan': 'सरायकेला खरसावां',
  Jamtara: 'जामताड़ा',
  Godda: 'गोड्डा',
  Sahibganj: 'साहिबगंज',
  Pakur: 'पाकुड़',
};

/**
 * Comprehensive Content Phrases Mapping for Hindi translation of dynamic data
 */
export const PHRASE_TRANSLATIONS: Record<string, string> = {
  'Monsoon Inundation & Sluice Overflow in Subarnarekha River Basin (Bundu)':
    'सुवर्णरेखा नदी बेसिन में मानसून जलभराव एवं स्लुइस ओवरफ्लो (बुंडू)',
  'Tribal School Solar Power & Smart Blackboard Infrastructure Shortage (Dumka)':
    'आदिवासी स्कूल सौर ऊर्जा एवं स्मार्ट ब्लैकबोर्ड अवसंरचना की कमी (दुमका)',
  'Acid Mine Drainage & Fluoride Contamination in Ground Wells (Dhanbad)':
    'कुओं में एसिड माइन जल निकासी एवं फ्लोराइड प्रदूषण (धनबाद)',
  'Cold Storage & Rural Perishable Food Loss (Palamu)':
    'कोल्ड स्टोरेज एवं ग्रामीण खाद्यान्न क्षय की समस्या (पलामू)',
  'Forest Edge Elephant Intrusion Early Warning System (Latehar)':
    'हाथी घुसपैठ पूर्व चेतावनी एवं वन सीमा प्रणाली (लातेहार)',
  'Lac Farmers Post-Harvest Processing & Resin Extractor Machine (Khunti)':
    'लाह किसानों के लिए कटाई उपरांत राल निष्कर्षण मशीन (खूंटी)',
  'Mica Mining Scrap Workers Respiratory Dust Filtration Device (Giridih)':
    'अभ्रक खनन मलबे के श्रमिकों हेतु धूल निस्पंदन उपकरण (गिरिडीह)',
  'Chhau Folk Artists Digital Archiving & Biomechanical VR Motion Sensor (Saraikela Kharsawan)':
    'छऊ लोक कलाकारों हेतु डिजिटल संग्रह एवं बायोमैकेनिकल सेंसर (सरायकेला खरसावां)',
  'Subarnarekha Monsoon Sluice IoT Telemetry & Solar Gate Control':
    'सुवर्णरेखा मानसून स्लुइस आईओटी टेलीमेट्री एवं सोलर गेट नियंत्रण',
  'Off-Grid Solar Micro-Inverter & Smart Digital Classroom System':
    'ऑफ-ग्रिड सोलर माइक्रो-इन्वर्टर एवं स्मार्ट डिजिटल क्लासरूम सिस्टम',
  'Electrochemical Fluoride & Heavy Metal Removal Unit':
    'इलेक्ट्रोकेमिकल फ्लोराइड एवं भारी धातु निष्कासन इकाई',
  'Solar Phase-Change Material Cold Micro-Storage Unit':
    'सोलर फेज़-चेंज मटेरियल कोल्ड माइक्रो-स्टोरेज यूनिट',
  'AI Acoustic Sensor & Thermal Camera Elephant Intrusion Grid':
    'एआई ध्वनिक सेंसर एवं थर्मल कैमरा हाथी चेतावनी ग्रिड',
  'Department of Water Resources': 'जल संसाधन विभाग',
  'Department of School Education': 'स्कूली शिक्षा एवं साक्षरता विभाग',
  'Department of Agriculture & Farmers Welfare': 'कृषि एवं किसान कल्याण विभाग',
  'Department of Health & Family Welfare': 'स्वास्थ्य एवं परिवार कल्याण विभाग',
  'Department of Forest & Environment': 'वन एवं पर्यावरण विभाग',
  'Department of Rural Development': 'ग्रामीण विकास विभाग',
  'Department of Energy & Telecommunications': 'ऊर्जा एवं दूरसंचार विभाग',
  'Department of Higher & Technical Education': 'उच्च एवं तकनीकी शिक्षा विभाग',
  'Birla Institute of Technology (BIT) Mesra': 'बीआईटी मेसरा, राँची',
  'IIT ISM Dhanbad': 'आईआईटी आईएसएम धनबाद',
  'NIT Jamshedpur': 'एनआईटी जमशेदपुर',
  'Tata Steel Foundation & CSR Innovation Lab': 'टाटा स्टील फाउंडेशन एवं सीएसआर',
  'Ranchi University': 'राँची विश्वविद्यालय',
  'Sido Kanhu Murmu University (SKMU)': 'सिदो कान्हू मुर्मू विश्वविद्यालय (दुमका)',
  'District Magistrate': 'ज़िलाधिकारी / उपायुक्त',
  'Executive Engineer': 'कार्यपालक अभियंता',
  'Chief Secretary Office': 'मुख्य सचिव कार्यालय',
  'State Innovation Council': 'राज्य नवाचार परिषद',
  'Ramesh Munda': 'रमेश मुंडा',
  'Dr. Amitesh Sinha, IAS': 'डॉ. अमितेश सिन्हा (आईएएस)',
  'Prof. Indranil Manna': 'प्रो. इन्द्रनील मन्ना',
  'Dr. Anand Kumar Mishra': 'डॉ. आनंद कुमार मिश्रा',
  'Priya Kumari': 'प्रिया कुमारी',
  'Sanjeev Sengupta': 'संजीव सेनगुप्ता',
};

/**
 * Helper to translate Status
 */
export function translateStatus(status: string, lang: Language = 'en'): string {
  if (lang !== 'hi') return STATUS_TRANSLATIONS[status]?.en || status;
  return STATUS_TRANSLATIONS[status]?.hi || status;
}

/**
 * Helper to translate Category
 */
export function translateCategory(cat: string, lang: Language = 'en'): string {
  if (lang !== 'hi') return CATEGORY_TRANSLATIONS[cat]?.en || cat;
  return CATEGORY_TRANSLATIONS[cat]?.hi || cat;
}

/**
 * Helper to translate Priority
 */
export function translatePriority(pri: string, lang: Language = 'en'): string {
  if (lang !== 'hi') return PRIORITY_TRANSLATIONS[pri]?.en || pri;
  return PRIORITY_TRANSLATIONS[pri]?.hi || pri;
}

/**
 * Helper to translate District
 */
export function translateDistrict(district: string, lang: Language = 'en'): string {
  if (lang !== 'hi') return district;
  return DISTRICT_TRANSLATIONS[district] || district;
}

/**
 * Helper to translate dynamic content text (titles, descriptions, phrases)
 */
export function translateText(text: string | null | undefined, lang: Language = 'en'): string {
  if (!text) return '';
  if (lang !== 'hi') return text;
  if (PHRASE_TRANSLATIONS[text]) return PHRASE_TRANSLATIONS[text];

  // Common keyword replacements for fallback translation
  let result = text;
  for (const [key, val] of Object.entries(PHRASE_TRANSLATIONS)) {
    if (result.includes(key)) {
      result = result.replaceAll(key, val);
    }
  }

  // Common vocabulary replacements
  result = result
    .replace(/\bDistrict\b/gi, 'ज़िला')
    .replace(/\bDepartment\b/gi, 'विभाग')
    .replace(/\bGovernment\b/gi, 'सरकार')
    .replace(/\bUniversity\b/gi, 'विश्वविद्यालय')
    .replace(/\bProject\b/gi, 'परियोजना')
    .replace(/\bProblem\b/gi, 'समस्या')
    .replace(/\bSolution\b/gi, 'समाधान')
    .replace(/\bValidated\b/gi, 'सत्यापित')
    .replace(/\bPriority\b/gi, 'प्राथमिकता')
    .replace(/\bCritical\b/gi, 'अति गंभीर')
    .replace(/\bHigh\b/gi, 'उच्च')
    .replace(/\bMedium\b/gi, 'मध्यम')
    .replace(/\bLow\b/gi, 'सामान्य')
    .replace(/\bMilestone\b/gi, 'मील का पत्थर')
    .replace(/\bDeployed\b/gi, 'तैनात')
    .replace(/\bTesting\b/gi, 'परीक्षण')
    .replace(/\bPrototype\b/gi, 'प्रोटोटाइप')
    .replace(/\bAssigned\b/gi, 'आवंटित')
    .replace(/\bCitizen\b/gi, 'नागरिक')
    .replace(/\bOfficer\b/gi, 'अधिकारी')
    .replace(/\bFaculty\b/gi, 'संकाय')
    .replace(/\bStudent\b/gi, 'छात्र');

  return result;
}

/**
 * Utility helper to select localized string based on current language
 */
export function tText(lang: Language = 'en', en: string, hi: string): string {
  return lang === 'hi' ? hi : en;
}

