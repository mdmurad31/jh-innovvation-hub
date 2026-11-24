/**
 * JH Innovation Hub - Jharkhand 24-District Intelligence Command Center
 * 
 * Comprehensive spatial dashboard providing dynamic drill-down across all 24 districts:
 * - Problems (Total, Filtered, Detailed Registry)
 * - Categories (Live distribution & instant filtering)
 * - Priority (5-Factor Deterministic Calculation, Critical/High/Med/Low counts)
 * - Validated problems (Official validation decisions, routing, departments)
 * - Active projects (University R&D, student teams, milestone tracking)
 * - Completed projects (Finalized solutions & test certifications)
 * - Deployments (Live field installations, hardware versions, operational sites)
 * - People impacted (Total population helped vs affected)
 * - Unresolved problems (Pending issues requiring attention)
 * - University capabilities (Mapped HEIs, specialized research labs, equipment, faculty leads)
 * - Reusable solutions (Proven blueprints, replication costs, measured impact)
 */

import {
  Activity,
  AlertOctagon,
  Award,
  BarChart3,
  BookmarkCheck,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock,
  Cpu,
  ExternalLink,
  Eye,
  FileText,
  Filter,
  Flame,
  Globe,
  GraduationCap,
  Layers,
  MapPin,
  Maximize2,
  Microscope,
  RotateCcw,
  Search,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { translations, tText, translateText, translateStatus, translateCategory, translateDistrict } from '../lib/i18n';
import { Problem, Project, SolutionBlueprint } from '../types';
import { PriorityBreakdownDisplay } from './PriorityBreakdownDisplay';

interface JharkhandMapViewProps {
  districts: any[];
  problems: Problem[];
  projects: Project[];
  blueprints?: SolutionBlueprint[];
  onSelectDistrictFilter: (districtName: string) => void;
  onNavigate?: (tab: string) => void;
  onOpenGoldenDemo: () => void;
  lang: 'en' | 'hi';
}

// Administrative Divisions of Jharkhand
export type JharkhandDivision =
  | 'ALL'
  | 'South Chota Nagpur'
  | 'North Chota Nagpur'
  | 'Santhal Pargana'
  | 'Kolhan'
  | 'Palamu';

// Detailed Geographic Coordinates & Mapped Capabilities for All 24 Districts
export interface DistrictSpatialData {
  id: string;
  name: string;
  code: string;
  hindiName: string;
  division: JharkhandDivision;
  headquarters: string;
  population: number;
  areaKm2: number;
  forestCoverPercent: number;
  cx: number; // SVG Cartographic Centroid X (0 - 800)
  cy: number; // SVG Cartographic Centroid Y (0 - 650)
  keyIssues: string[];
  assignedHEIs: string[];
  leadLabs: { name: string; focus: string; equipment: string }[];
  leadFaculties: { name: string; title: string; institution: string; domain: string }[];
  terrainType: string;
  isGoldenDemo?: boolean;
}

export const JHARKHAND_24_DISTRICTS: DistrictSpatialData[] = [
  {
    id: 'ranchi',
    name: 'Ranchi',
    code: 'RAN',
    hindiName: 'राँची',
    division: 'South Chota Nagpur',
    headquarters: 'Ranchi',
    population: 2914253,
    areaKm2: 5097,
    forestCoverPercent: 28.5,
    cx: 410,
    cy: 390,
    terrainType: 'Plateau & Subarnarekha River Basin',
    keyIssues: ['Urban Flash Floods & Drainage', 'School Inundation in Bundu', 'Industrial Runoff', 'Traffic Gridlock'],
    assignedHEIs: ['BIT Mesra', 'Ranchi University', 'Birsa Agricultural University (BAU)', 'IIM Ranchi', 'CUJ'],
    leadLabs: [
      { name: 'Remote Sensing & GIS Center', focus: 'Hydrological Watershed & Inundation Mapping', equipment: 'Sentinel-2 Synthetic Aperture Radar Gateway & Drone Fleet' },
      { name: 'Rural IoT & Edge Telemetry Lab', focus: 'Flood Early Warning Nodes & Micro-sensors', equipment: 'LoRaWAN Long-Range Gateways & Ultrasonic Probes' },
      { name: 'Civil Stormwater Dynamics Lab', focus: 'Gravity Bypass Channels & Urban Retention Flumes', equipment: 'Open Channel Hydraulic Flumes & Siltation Meters' }
    ],
    leadFaculties: [
      { name: 'Prof. Anand Kumar', title: 'Dean of Civil & Remote Sensing', institution: 'BIT Mesra', domain: 'Hydrology & Flash Flood Mitigation' },
      { name: 'Dr. Sunita Murmu', title: 'Professor of Environmental Tech', institution: 'Ranchi University', domain: 'Watershed & Riparian Ecology' }
    ],
    isGoldenDemo: true,
  },
  {
    id: 'khunti',
    name: 'Khunti',
    code: 'KHU',
    hindiName: 'खूँटी',
    division: 'South Chota Nagpur',
    headquarters: 'Khunti',
    population: 531885,
    areaKm2: 2535,
    forestCoverPercent: 37.2,
    cx: 390,
    cy: 460,
    terrainType: 'Tribal Uplands & Forest Fringe',
    keyIssues: ['Tomato & Perishable Glut Spoilage', 'Cold Storage Shortage', 'Tribal Farmer Income', 'Groundwater Depletion'],
    assignedHEIs: ['NIT Jamshedpur', 'BAU Ranchi', 'Birsa College Khunti'],
    leadLabs: [
      { name: 'Phase Change Thermal Storage Lab', focus: 'Decentralized Solar Cold Rooms & PCM Energy Storage', equipment: 'Thermal Brine Encapsulators & Variable Speed BLDC Compressors' },
      { name: 'Post-Harvest AgriTech Center', focus: 'Solar Crop Dehydration & Value Addition', equipment: 'Forced Convection Solar Dryers & Digital Brix Refractometers' }
    ],
    leadFaculties: [
      { name: 'Dr. Rameshwar Prasad', title: 'Head of Mechanical & Thermal Eng', institution: 'NIT Jamshedpur', domain: 'Phase Change Materials & Cold Chain' },
      { name: 'Dr. B. K. Pandey', title: 'Chief Agronomist', institution: 'BAU Ranchi', domain: 'Tribal Horticulture & Micro-Storage' }
    ],
  },
  {
    id: 'gumla',
    name: 'Gumla',
    code: 'GUM',
    hindiName: 'गुमला',
    division: 'South Chota Nagpur',
    headquarters: 'Gumla',
    population: 1025213,
    areaKm2: 5360,
    forestCoverPercent: 44.8,
    cx: 290,
    cy: 440,
    terrainType: 'Netarhat Plateau & Forest Valleys',
    keyIssues: ['Finger Millet (Ragi) Blast Fungus', 'Minor Forest Produce Spoilage', 'Tribal Agronomy', 'Highlands Transport'],
    assignedHEIs: ['BAU Ranchi', 'Kartik Oraon College Gumla', 'ICAR Research Complex'],
    leadLabs: [
      { name: 'Indigenous Crop Pathology Wing', focus: 'Bio-fungicide Formulations & Blast Resistance Assays', equipment: 'PCR Thermal Cyclers & High-Res Fungal Mycology Incubators' },
      { name: 'Agro-biodiversity & Seed Conservation Lab', focus: 'Indigenous Climate-Resilient Millet Multiplication', equipment: 'Seed Germination Growth Chambers & Cryo-storage' }
    ],
    leadFaculties: [
      { name: 'Dr. Sushil Minz', title: 'Associate Professor of Crop Sciences', institution: 'BAU Ranchi', domain: 'Indigenous Millets & Plant Pathology' }
    ],
  },
  {
    id: 'simdega',
    name: 'Simdega',
    code: 'SIM',
    hindiName: 'सिमडेगा',
    division: 'South Chota Nagpur',
    headquarters: 'Simdega',
    population: 599578,
    areaKm2: 3774,
    forestCoverPercent: 48.2,
    cx: 280,
    cy: 530,
    terrainType: 'Dense Forested Hills & Sankh Basin',
    keyIssues: ['Lac (Kusmi) Processing Spoilage', 'Minor Forest Produce Value Addition', 'Youth Migration', 'Rural Power Outages'],
    assignedHEIs: ['BAU Ranchi', 'Simdega College', 'NIT Jamshedpur Rural Extension'],
    leadLabs: [
      { name: 'Forest Biomass & Bio-processing Lab', focus: 'Solar Lac Dehydration & Grading Systems', equipment: 'Controlled Humidity Solar Drying Chambers & Thermal De-waxers' }
    ],
    leadFaculties: [
      { name: 'Prof. Albinus Ekka', title: 'Lead Coordinator of Tribal Enterprises', institution: 'Simdega College', domain: 'Forest Produce Processing' }
    ],
  },
  {
    id: 'lohardaga',
    name: 'Lohardaga',
    code: 'LOH',
    hindiName: 'लोहरदगा',
    division: 'South Chota Nagpur',
    headquarters: 'Lohardaga',
    population: 461790,
    areaKm2: 1502,
    forestCoverPercent: 32.1,
    cx: 330,
    cy: 370,
    terrainType: 'Bauxite Mining Hills & Valleys',
    keyIssues: ['Bauxite Haulage Road Dust', 'Soil Compaction', 'Fluoride in Wells', 'Rainwater Catchment'],
    assignedHEIs: ['Ranchi University', 'B.S. College Lohardaga', 'BIT Mesra'],
    leadLabs: [
      { name: 'Dust Suppression & Materials Lab', focus: 'Polymer Road Crusting Agents & Culvert Monitoring', equipment: 'Particulate Air Samplers & Soil Shear Testing Apparatus' }
    ],
    leadFaculties: [
      { name: 'Dr. Devendra Bhagat', title: 'Professor of Environmental Geology', institution: 'Ranchi University', domain: 'Mining Ecology & Road Engineering' }
    ],
  },
  {
    id: 'dhanbad',
    name: 'Dhanbad',
    code: 'DHN',
    hindiName: 'धनबाद',
    division: 'North Chota Nagpur',
    headquarters: 'Dhanbad',
    population: 2684487,
    areaKm2: 2040,
    forestCoverPercent: 12.8,
    cx: 560,
    cy: 310,
    terrainType: 'Jharia Coalfield & Damodar Basin',
    keyIssues: ['Underground Mine Fire Seepage', 'CO & Methane Gas Emissions', 'Ground Subsidence', 'Coal Particulate Pollution'],
    assignedHEIs: ['IIT (ISM) Dhanbad', 'BIT Sindri', 'CSIR-CIMFR'],
    leadLabs: [
      { name: 'Mine Fire & Gas Telemetry Lab', focus: 'Underground Thermal Drone Imaging & Multi-Gas Warning', equipment: 'FLIR Radiometric Thermal Cameras & Infrasound Seismic Sensors' },
      { name: 'Environmental Geochemistry Lab', focus: 'Arsenic/Fluoride Filtration & Coal Effluent Treatment', equipment: 'Atomic Absorption Spectrometer & Inductively Coupled Plasma OES' }
    ],
    leadFaculties: [
      { name: 'Prof. Sukumar Roy', title: 'Chair of Environmental Engineering', institution: 'IIT (ISM) Dhanbad', domain: 'Water Decontamination & Mine Hazards' },
      { name: 'Dr. Arvind Rawani', title: 'Senior Scientist', institution: 'CSIR-CIMFR', domain: 'Jharia Fire Telemetry & Gas Dynamics' }
    ],
  },
  {
    id: 'bokaro',
    name: 'Bokaro',
    code: 'BOK',
    hindiName: 'बोकारो',
    division: 'North Chota Nagpur',
    headquarters: 'Bokaro Steel City',
    population: 2062330,
    areaKm2: 2883,
    forestCoverPercent: 24.3,
    cx: 500,
    cy: 340,
    terrainType: 'Industrial Steel Belt & Damodar Plains',
    keyIssues: ['Fly Ash Particulate Dispersion', 'Industrial Effluent', 'Colony Air Quality', 'Slag Waste Utilization'],
    assignedHEIs: ['BIT Sindri', 'IIT (ISM) Dhanbad', 'BSK College'],
    leadLabs: [
      { name: 'Industrial Waste & Slag Material Center', focus: 'Fly Ash Ceramic Eco-Pavers & Geopolymer Concrete', equipment: 'Hydraulic Compressive Testing Presses & Micro-structure SEM' }
    ],
    leadFaculties: [
      { name: 'Prof. Pankaj Rai', title: 'Director of Materials Engineering', institution: 'BIT Sindri', domain: 'Industrial Byproduct Recycling' }
    ],
  },
  {
    id: 'hazaribagh',
    name: 'Hazaribagh',
    code: 'HAZ',
    hindiName: 'हजारीबाग',
    division: 'North Chota Nagpur',
    headquarters: 'Hazaribagh',
    population: 1734495,
    areaKm2: 3555,
    forestCoverPercent: 41.5,
    cx: 410,
    cy: 280,
    terrainType: 'Elevated Plateau & Wildlife Corridors',
    keyIssues: ['Human-Elephant Conflict & Crop Raiding', 'Forest Fires', 'Coal Transit Dust', 'Rural Tele-medicine'],
    assignedHEIs: ['Vinoba Bhave University (VBU)', 'UCET VBU', 'BIT Mesra'],
    leadLabs: [
      { name: 'Acoustic & Geophone Wildlife Telemetry Lab', focus: 'Elephant Infrasound & Seismic Detection Nodes', equipment: 'Seismic Geophone Arrays & Solar GSM Warning Sirens' },
      { name: 'Geosciences & Forest Monitoring Lab', focus: 'Satellite Thermal Forest Fire Warning', equipment: 'GIS Mapping Workstations & MODIS Satellite Receiver Nodes' }
    ],
    leadFaculties: [
      { name: 'Dr. Vivek Pathak', title: 'Head of Electronics & Wildlife Tech', institution: 'VBU Hazaribagh', domain: 'Acoustic Sensor Systems & Bio-acoustics' }
    ],
  },
  {
    id: 'giridih',
    name: 'Giridih',
    code: 'GIR',
    hindiName: 'गिरिडीह',
    division: 'North Chota Nagpur',
    headquarters: 'Giridih',
    population: 2445474,
    areaKm2: 4962,
    forestCoverPercent: 27.6,
    cx: 520,
    cy: 240,
    terrainType: 'Parasnath Hills & Mineral Belts',
    keyIssues: ['Mica Scrap Sorting Ergonomic Hazards', 'Silica Dust Inhalation', 'Groundwater Scarcity', 'Rural Electrification'],
    assignedHEIs: ['Vinoba Bhave University', 'Giridih College', 'BIT Mesra'],
    leadLabs: [
      { name: 'Occupational Health & Ergonomics Center', focus: 'Semi-Mechanized Sieve Workstations & Dust Enclosures', equipment: 'Ergonomic Biomechanics Sensors & Cyclone Dust Separators' }
    ],
    leadFaculties: [
      { name: 'Dr. S. K. Sinha', title: 'Associate Professor of Mechanical Design', institution: 'VBU Hazaribagh', domain: 'Ergonomic Tooling for Artisans' }
    ],
  },
  {
    id: 'ramgarh',
    name: 'Ramgarh',
    code: 'RAM',
    hindiName: 'रामगढ़',
    division: 'North Chota Nagpur',
    headquarters: 'Ramgarh Cantonment',
    population: 949443,
    areaKm2: 1341,
    forestCoverPercent: 34.0,
    cx: 450,
    cy: 350,
    terrainType: 'River Confluences & Coal Mining Basins',
    keyIssues: ['Pilgrim Organic Waste Stagnation at Rajrappa', 'Damodar River Siltation', 'Coal Mine Dust', 'Water Pollution'],
    assignedHEIs: ['Ramgarh Engineering College', 'BIT Mesra', 'Ranchi University'],
    leadLabs: [
      { name: 'Accelerated Bio-Enzyme Composting Lab', focus: 'Decentralized Temple Waste Conversion & Bio-Briquettes', equipment: 'High-Temperature Microbial Aerobic Digesters & Pelletizers' }
    ],
    leadFaculties: [
      { name: 'Dr. Ananya Roy', title: 'Lead Environmental Biotechnologist', institution: 'Ramgarh Tech / BIT Mesra', domain: 'Bio-waste Remediation' }
    ],
  },
  {
    id: 'chatra',
    name: 'Chatra',
    code: 'CHA',
    hindiName: 'चतरा',
    division: 'North Chota Nagpur',
    headquarters: 'Chatra',
    population: 1042886,
    areaKm2: 3718,
    forestCoverPercent: 49.3,
    cx: 340,
    cy: 260,
    terrainType: 'Forested Hills & Agricultural Uplands',
    keyIssues: ['Perishable Tomato & Papaya Glut Wastage', 'Lack of Processing Facilities', 'Forest Fires', 'Remote Connectivity'],
    assignedHEIs: ['Chatra College', 'BAU Ranchi', 'VBU Hazaribagh'],
    leadLabs: [
      { name: 'Solar Agro-Processing & Food Preservation Lab', focus: 'Solar Dehydration & Tomato Puree Micro-plants', equipment: 'Continuous Solar Tunnel Dryers & Vacuum Packaging Units' }
    ],
    leadFaculties: [
      { name: 'Dr. R. N. Dangi', title: 'Horticulture Scientist', institution: 'BAU Extension Chatra', domain: 'Perishable Produce Processing' }
    ],
  },
  {
    id: 'koderma',
    name: 'Koderma',
    code: 'KOD',
    hindiName: 'कोडरमा',
    division: 'North Chota Nagpur',
    headquarters: 'Koderma',
    population: 716259,
    areaKm2: 1500,
    forestCoverPercent: 42.1,
    cx: 440,
    cy: 200,
    terrainType: 'Tilaiya Catchment & Mica Fringe',
    keyIssues: ['Tilaiya Catchment Algal Blooms', 'Elevated Fluoride in Borewells', 'Forest Border Conflict', 'Mica Slag'],
    assignedHEIs: ['J.J. College Koderma', 'VBU Hazaribagh', 'IIT (ISM) Dhanbad'],
    leadLabs: [
      { name: 'Reservoir Limnology & Water Safety Unit', focus: 'Solar UV-C Micro-algae Oxidation & Fluoride Adsorption', equipment: 'Multi-parameter Water Quality Sondes & UV Disinfection Reactors' }
    ],
    leadFaculties: [
      { name: 'Dr. Barnwal Kishore', title: 'Limnologist & Water Chemist', institution: 'VBU Hazaribagh', domain: 'Reservoir Quality & Algal Control' }
    ],
  },
  {
    id: 'deoghar',
    name: 'Deoghar',
    code: 'DEO',
    hindiName: 'देवघर',
    division: 'Santhal Pargana',
    headquarters: 'Deoghar',
    population: 1492073,
    areaKm2: 2477,
    forestCoverPercent: 12.3,
    cx: 590,
    cy: 210,
    terrainType: 'Pilgrim City & Red Granite Plains',
    keyIssues: ['School Handpump Fluoride & Turbidity', 'Pilgrim Crowd Logistics', 'Rural Health Access', 'Water Scarcity'],
    assignedHEIs: ['AIIMS Deoghar', 'BIT Mesra Extension Deoghar', 'SKMU Dumka'],
    leadLabs: [
      { name: 'MedTech Diagnostics & Community Health Wing', focus: 'Point-of-Care Water Testing & Dental Fluorosis Screening', equipment: 'Fluoride Colorimeters & Portable Tele-Health Kits' },
      { name: 'Crowd Dynamics & IoT Flow Lab', focus: 'Pilgrim Safe Queuing Sensors & Sanitation Monitoring', equipment: 'Optical People Counters & Smart Water Metering Nodes' }
    ],
    leadFaculties: [
      { name: 'Dr. Saurabh Mishra', title: 'Professor of Community Medicine', institution: 'AIIMS Deoghar', domain: 'Fluorosis Epidemiology & Rural Health' },
      { name: 'Prof. K. K. Sinha', title: 'Head of Electronics', institution: 'BIT Mesra Deoghar', domain: 'Smart IoT Infrastructure' }
    ],
  },
  {
    id: 'dumka',
    name: 'Dumka',
    code: 'DUM',
    hindiName: 'दुमका',
    division: 'Santhal Pargana',
    headquarters: 'Dumka',
    population: 1321442,
    areaKm2: 3761,
    forestCoverPercent: 15.6,
    cx: 660,
    cy: 230,
    terrainType: 'Mayurakshi River Basin & Uplands',
    keyIssues: ['Severe Arsenic in Ranishwar Handpumps', 'Fluoride Contamination', 'Skin Keratosis', 'Tribal Health Disparities'],
    assignedHEIs: ['IIT (ISM) Dhanbad', 'Sido Kanhu Murmu University (SKMU)', 'Dumka Engineering College'],
    leadLabs: [
      { name: 'Nano-Composite Adsorbent Synthesis Unit', focus: 'Low-Cost Arsenic & Fluoride Laterite Media', equipment: 'Fixed-Bed Adsorption Columns & Backwash Regeneration Cells' },
      { name: 'Santhal Pargana Hydrogeology Lab', focus: 'Deep Aquifer Arsenic Stratigraphy Mapping', equipment: 'Geophysical Resistivity Meters & Gamma Loggers' }
    ],
    leadFaculties: [
      { name: 'Prof. Sukumar Roy', title: 'Chair of Environmental Tech', institution: 'IIT (ISM) Dhanbad', domain: 'Arsenic Adsorption Science' },
      { name: 'Dr. Pradeep Soren', title: 'Dean of Sciences', institution: 'SKMU Dumka', domain: 'Regional Hydrogeology' }
    ],
  },
  {
    id: 'godda',
    name: 'Godda',
    code: 'GOD',
    hindiName: 'गोड्डा',
    division: 'Santhal Pargana',
    headquarters: 'Godda',
    population: 1313551,
    areaKm2: 2266,
    forestCoverPercent: 17.5,
    cx: 680,
    cy: 160,
    terrainType: 'Rajmahal Coal Fringe & Alluvial Plains',
    keyIssues: ['Coal Conveyor Dust on Mango & Paddy', 'Water Scarcity', 'Opencast Mining Air Quality', 'Rural Irrigation'],
    assignedHEIs: ['Godda College', 'SKMU Dumka', 'IIT (ISM) Dhanbad'],
    leadLabs: [
      { name: 'Agricultural Dust Mitigation Lab', focus: 'Biological Vegetative Screens & Wet Spray Nozzles', equipment: 'Dust Deposition Gauges & Plant Chlorophyll Fluorometers' }
    ],
    leadFaculties: [
      { name: 'Dr. Debasis Ghosh', title: 'Senior Agronomist', institution: 'SKMU Dumka', domain: 'Mining Fringe Agronomy' }
    ],
  },
  {
    id: 'sahibganj',
    name: 'Sahibganj',
    code: 'SAH',
    hindiName: 'साहिबगंज',
    division: 'Santhal Pargana',
    headquarters: 'Sahibganj',
    population: 1150567,
    areaKm2: 2063,
    forestCoverPercent: 23.4,
    cx: 730,
    cy: 130,
    terrainType: 'Ganges Riverfront & Rajmahal Traps',
    keyIssues: ['Ganges Riverbank Lateral Erosion', 'Habitation Loss at Rajmahal', 'Monsoon Scouring', 'Inland Freight Logistics'],
    assignedHEIs: ['Sahibganj College', 'NIT Jamshedpur', 'SKMU Dumka'],
    leadLabs: [
      { name: 'Riverine Bio-Engineering & Armor Lab', focus: 'Vetiver Geotextile Scour Protection & Acoustic Silt Sensors', equipment: 'Hydrodynamic Ultrasonic Velocity Meters & Geotextile Tensile Testers' }
    ],
    leadFaculties: [
      { name: 'Dr. Zubair Ansari', title: 'Hydraulic Geotechnical Lead', institution: 'NIT Jamshedpur', domain: 'Riverbank Stabilization' }
    ],
  },
  {
    id: 'pakur',
    name: 'Pakur',
    code: 'PAK',
    hindiName: 'पाकुड़',
    division: 'Santhal Pargana',
    headquarters: 'Pakur',
    population: 900422,
    areaKm2: 1805,
    forestCoverPercent: 16.2,
    cx: 740,
    cy: 210,
    terrainType: 'Stone Quarry Basalt Formations',
    keyIssues: ['Stone Quarry Silica Dust & Silicosis', 'Paharia Worker Health', 'Slurry Runoff', 'Drinking Water Desiltation'],
    assignedHEIs: ['AIIMS Deoghar', 'SKMU Dumka', 'K.K.M. College Pakur'],
    leadLabs: [
      { name: 'Occupational Pulmonology & AI Screening Lab', focus: 'AI Digital Radiography Silicosis Detection & High-Pressure Fogging', equipment: 'Deep Learning Chest X-Ray AI Inference Units & Ultrasonic Fog Curtains' }
    ],
    leadFaculties: [
      { name: 'Dr. Arvind Hansda', title: 'Lead Occupational Pulmonologist', institution: 'AIIMS Deoghar', domain: 'Silicosis Intervention' }
    ],
  },
  {
    id: 'jamtara',
    name: 'Jamtara',
    code: 'JAM',
    hindiName: 'जामताड़ा',
    division: 'Santhal Pargana',
    headquarters: 'Jamtara',
    population: 791042,
    areaKm2: 1811,
    forestCoverPercent: 9.8,
    cx: 610,
    cy: 290,
    terrainType: 'Laterite Uplands & Ajay Basin',
    keyIssues: ['Hyper-Acidic Soil (pH 4.4) Yield Loss', 'Iron Toxicity in Paddy', 'Rural Youth Digital Skilling', 'Water Table Drop'],
    assignedHEIs: ['SKMU Dumka', 'BAU Ranchi', 'Jamtara College'],
    leadLabs: [
      { name: 'Soil Chemistry & Amelioration Lab', focus: 'Biochar-Liming Formulations & Micronutrient Bio-fortification', equipment: 'Automated Soil pH/EC Analyzers & Flame Photometers' }
    ],
    leadFaculties: [
      { name: 'Dr. Shambhu Mandal', title: 'Soil Scientist', institution: 'SKMU / BAU Node', domain: 'Acid Soil Reclamation' }
    ],
  },
  {
    id: 'east-singhbhum',
    name: 'East Singhbhum',
    code: 'ESB',
    hindiName: 'पूर्वी सिंहभूम',
    division: 'Kolhan',
    headquarters: 'Jamshedpur',
    population: 2293919,
    areaKm2: 3562,
    forestCoverPercent: 31.8,
    cx: 560,
    cy: 480,
    terrainType: 'Industrial Jamshedpur & Subarnarekha River',
    keyIssues: ['Kharkai-Subarnarekha Effluent Runoff', 'Heavy Metal Turbidity', 'Fisherfolk Livelihood', 'Urban Air Quality'],
    assignedHEIs: ['NIT Jamshedpur', 'CSIR-NML Jamshedpur', 'XLRI', 'Arka Jain Univ'],
    leadLabs: [
      { name: 'Industrial Bio-Remediation & Wetland Center', focus: 'Floating Phytoremediation Rafts & Heavy Metal Bio-absorption', equipment: 'Atomic Absorption Spectrophotometers & Hydroponic Pilot Raceways' },
      { name: 'Advanced Materials & Metallurgy Lab', focus: 'Corrosion-Resistant Structural Alloys & Slag Pavements', equipment: 'High-Resolution Transmission Electron Microscope (CSIR-NML)' }
    ],
    leadFaculties: [
      { name: 'Prof. Ranjit Prasad', title: 'Dean of Chemical & Environmental Eng', institution: 'NIT Jamshedpur', domain: 'Industrial Effluent Neutralization' },
      { name: 'Dr. Indranil Chattoraj', title: 'Senior Materials Scientist', institution: 'CSIR-NML', domain: 'Bio-metal Remediation' }
    ],
  },
  {
    id: 'west-singhbhum',
    name: 'West Singhbhum',
    code: 'WSB',
    hindiName: 'पश्चिमी सिंहभूम',
    division: 'Kolhan',
    headquarters: 'Chaibasa',
    population: 1502338,
    areaKm2: 7224,
    forestCoverPercent: 57.3,
    cx: 460,
    cy: 530,
    terrainType: 'Saranda Dense Forest & Iron Ore Hills',
    keyIssues: ['Child Malnutrition in Saranda Deep Forest', 'Falciparum Malaria Outbreak', 'Forest Off-Grid Telemetry', 'Iron Ore Red Water'],
    assignedHEIs: ['Kolhan University Chaibasa', 'AIIMS Deoghar', 'NIT Jamshedpur'],
    leadLabs: [
      { name: 'Saranda Forest Rural Diagnostics Cell', focus: 'Solar Rapid Diagnostic Kits & Drone Vaccine Dispatch Nodes', equipment: 'Multiplex Rapid Malaria PCR Assays & Long-Range Delivery Drones' }
    ],
    leadFaculties: [
      { name: 'Dr. Mangal Purty', title: 'Director of Tribal Health Research', institution: 'Kolhan University', domain: 'Vector-Borne Diseases & Malnutrition' }
    ],
  },
  {
    id: 'saraikela-kharsawan',
    name: 'Saraikela Kharsawan',
    code: 'SRK',
    hindiName: 'सरायकेला खरसावां',
    division: 'Kolhan',
    headquarters: 'Saraikela',
    population: 1065056,
    areaKm2: 2657,
    forestCoverPercent: 26.2,
    cx: 490,
    cy: 450,
    terrainType: 'Adityapur Industrial Hub & Kharkai Basin',
    keyIssues: ['Adityapur Industrial Heavy Metal Effluent', 'Hexavalent Chromium Seepage', 'Chhau Artisan Support', 'Industrial Solid Waste'],
    assignedHEIs: ['NIT Jamshedpur', 'AIADA Tech Cell', 'Kolhan University'],
    leadLabs: [
      { name: 'Zero-Liquid Discharge Electro-coagulation Lab', focus: 'Electroplating Rinse Water Recycling & Heavy Metal Recovery', equipment: 'Continuous Electro-Coagulation Pilot Skids & Ion Exchange Columns' }
    ],
    leadFaculties: [
      { name: 'Dr. P. C. Mahato', title: 'Professor of Industrial Chemical Tech', institution: 'NIT Jamshedpur', domain: 'Electroplating Effluent Treatment' }
    ],
  },
  {
    id: 'palamu',
    name: 'Palamu',
    code: 'PAL',
    hindiName: 'पलामू',
    division: 'Palamu',
    headquarters: 'Medininagar (Daltonganj)',
    population: 1939869,
    areaKm2: 4393,
    forestCoverPercent: 43.7,
    cx: 250,
    cy: 280,
    terrainType: 'North Koel River Basin & Drought Plateau',
    keyIssues: ['Ground Fluoride & Dental Fluorosis in Daltonganj', 'Summer Drought', 'Irrigation Shortage', 'Crop Failure'],
    assignedHEIs: ['Nilamber-Pitamber University (NPU)', 'GLA College Medininagar', 'BIT Mesra'],
    leadLabs: [
      { name: 'Arid Watershed & Hydro-Geology Lab', focus: 'Sub-surface Sand Check Dams & Community Fluoride Filters', equipment: 'Geophysical Resistivity Sondes & Fluoride Selective Electrodes' }
    ],
    leadFaculties: [
      { name: 'Dr. Sanjay Pandey', title: 'Dean of Earth Sciences', institution: 'NPU Medininagar', domain: 'Fluoride Hydrogeochemistry' }
    ],
  },
  {
    id: 'garhwa',
    name: 'Garhwa',
    code: 'GAR',
    hindiName: 'गढ़वा',
    division: 'Palamu',
    headquarters: 'Garhwa',
    population: 1322784,
    areaKm2: 4093,
    forestCoverPercent: 45.1,
    cx: 190,
    cy: 230,
    terrainType: 'Kanhar River Basin & Rocky Plateau',
    keyIssues: ['Summer Groundwater Table Collapse', 'Kanhar Runoff Loss', 'Parched Paddy Fields', 'Severe Drought Risk'],
    assignedHEIs: ['NPU Daltonganj', 'SSJA College Garhwa', 'BIT Mesra'],
    leadLabs: [
      { name: 'Drought Resilience & Infiltration Mapping Unit', focus: 'Sub-surface Recharge Wells & High-Infiltration Trenching', equipment: 'Hydraulic Infiltrometers & GIS Spatial Water Balance Toolkits' }
    ],
    leadFaculties: [
      { name: 'Prof. V. A. Shukla', title: 'Hydrological Engineer', institution: 'NPU / BIT Mesra Node', domain: 'Drought Mitigation' }
    ],
  },
  {
    id: 'latehar',
    name: 'Latehar',
    code: 'LAT',
    hindiName: 'लातेहार',
    division: 'Palamu',
    headquarters: 'Latehar',
    population: 726978,
    areaKm2: 4291,
    forestCoverPercent: 56.1,
    cx: 280,
    cy: 330,
    terrainType: 'Dense Betla Forest Reserve & Hills',
    keyIssues: ['Remote Rural Vaccine Cold Chain Breakdown', 'Forest Village Isolation', 'Solar Microgrid Need', 'Wildlife Boundary Safety'],
    assignedHEIs: ['Latehar Polytechnic', 'AIIMS Deoghar Mobile Node', 'NIT Jamshedpur'],
    leadLabs: [
      { name: 'Solar-Peltier Micro-Cooling & Cold Chain Lab', focus: 'Active Thermoelectric Vaccine Coolers & Forest Telemetry', equipment: 'Peltier Solid-State Thermoelectric Coolers & IoT GPS Temperature Loggers' }
    ],
    leadFaculties: [
      { name: 'Dr. Rameshwar Prasad', title: 'Thermal Energy Specialist', institution: 'NIT Jamshedpur', domain: 'Solid-State Peltier Refrigeration' }
    ],
  },
];

export const JharkhandMapView: React.FC<JharkhandMapViewProps> = ({
  districts,
  problems,
  projects,
  blueprints = [],
  onSelectDistrictFilter,
  onNavigate,
  onOpenGoldenDemo,
  lang,
}) => {
  const t = translations[lang];

  // Primary Selection States
  const [selectedDistrictName, setSelectedDistrictName] = useState<string>('Ranchi');
  const [selectedDivision, setSelectedDivision] = useState<JharkhandDivision>('ALL');
  const [sectorFilter, setSectorFilter] = useState<string>('ALL');
  const [searchDistrict, setSearchDistrict] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'problems' | 'validation' | 'projects' | 'capabilities' | 'reusable'>('overview');
  const [mapVisualizationMode, setMapVisualizationMode] = useState<'svg' | 'cartogram'>('svg');
  const [choroplethMetric, setChoroplethMetric] = useState<'problems' | 'priority' | 'projects' | 'impact'>('problems');
  const [selectedProblemModal, setSelectedProblemModal] = useState<Problem | null>(null);

  // Sector list definitions
  const sectors = lang === 'hi' ? [
    { id: 'ALL', label: 'सभी क्षेत्र' },
    { id: 'Water', label: 'जल एवं स्वच्छता' },
    { id: 'Education', label: 'शिक्षा' },
    { id: 'Agriculture', label: 'कृषि एवं खाद्य' },
    { id: 'Healthcare', label: 'स्वास्थ्य सेवाएं' },
    { id: 'Environment', label: 'पर्यावरण एवं प्रदूषण' },
    { id: 'Infrastructure', label: 'सड़क एवं अवसंरचना' },
    { id: 'Disaster', label: 'आपदा एवं खनन' },
    { id: 'Rural Livelihood', label: 'ग्रामीण आजीविका' },
  ] : [
    { id: 'ALL', label: 'All Sectors' },
    { id: 'Water', label: 'Water & Sanitation' },
    { id: 'Education', label: 'Education' },
    { id: 'Agriculture', label: 'Agriculture & Food' },
    { id: 'Healthcare', label: 'Healthcare & MedTech' },
    { id: 'Environment', label: 'Environment & Pollution' },
    { id: 'Infrastructure', label: 'Infrastructure & Energy' },
    { id: 'Disaster', label: 'Disaster & Mining' },
    { id: 'Rural Livelihood', label: 'Rural Livelihood' },
  ];

  const divisions: { id: JharkhandDivision; label: string }[] = [
    { id: 'ALL', label: 'All 5 Divisions' },
    { id: 'South Chota Nagpur', label: 'South Chota Nagpur' },
    { id: 'North Chota Nagpur', label: 'North Chota Nagpur' },
    { id: 'Santhal Pargana', label: 'Santhal Pargana' },
    { id: 'Kolhan', label: 'Kolhan' },
    { id: 'Palamu', label: 'Palamu' },
  ];

  // Helper to match text against chosen sector
  const matchesSector = (text: string | undefined, filter: string): boolean => {
    if (!text) return false;
    if (filter === 'ALL') return true;
    const t = text.toLowerCase();
    const f = filter.toLowerCase();

    if (f === 'water') {
      return (
        t.includes('water') ||
        t.includes('sanitation') ||
        t.includes('flood') ||
        t.includes('arsenic') ||
        t.includes('fluoride') ||
        t.includes('drainage') ||
        t.includes('runoff') ||
        t.includes('river') ||
        t.includes('tank') ||
        t.includes('handpump') ||
        t.includes('borewell')
      );
    }
    if (f === 'education') {
      return (
        t.includes('education') ||
        t.includes('school') ||
        t.includes('student') ||
        t.includes('college') ||
        t.includes('corridor') ||
        t.includes('classroom') ||
        t.includes('stem') ||
        t.includes('teacher')
      );
    }
    if (f === 'agriculture') {
      return (
        t.includes('agri') ||
        t.includes('crop') ||
        t.includes('millet') ||
        t.includes('cold storage') ||
        t.includes('cold-storage') ||
        t.includes('cold chain') ||
        t.includes('tomato') ||
        t.includes('farm') ||
        t.includes('irrigation') ||
        t.includes('pest') ||
        t.includes('lac') ||
        t.includes('soil') ||
        t.includes('harvest')
      );
    }
    if (f === 'healthcare') {
      return (
        t.includes('health') ||
        t.includes('medical') ||
        t.includes('clinic') ||
        t.includes('hospital') ||
        t.includes('vaccine') ||
        t.includes('fluorosis') ||
        t.includes('malnutrition') ||
        t.includes('silicosis') ||
        t.includes('malaria') ||
        t.includes('pulmonology')
      );
    }
    if (f === 'environment') {
      return (
        t.includes('environment') ||
        t.includes('pollution') ||
        t.includes('fly ash') ||
        t.includes('effluent') ||
        t.includes('dust') ||
        t.includes('smoke') ||
        t.includes('heavy metal') ||
        t.includes('silica')
      );
    }
    if (f === 'infrastructure') {
      return (
        t.includes('infra') ||
        t.includes('road') ||
        t.includes('bridge') ||
        t.includes('culvert') ||
        t.includes('energy') ||
        t.includes('power') ||
        t.includes('solar') ||
        t.includes('grid') ||
        t.includes('electric')
      );
    }
    if (f === 'disaster') {
      return (
        t.includes('disaster') ||
        t.includes('flood') ||
        t.includes('fire') ||
        t.includes('subsidence') ||
        t.includes('elephant') ||
        t.includes('erosion') ||
        t.includes('drought') ||
        t.includes('mine')
      );
    }
    if (f === 'rural livelihood') {
      return (
        t.includes('livelihood') ||
        t.includes('shg') ||
        t.includes('lac') ||
        t.includes('mica') ||
        t.includes('tribal') ||
        t.includes('artisan') ||
        t.includes('handicraft')
      );
    }

    return t.includes(f);
  };

  // Find active district spatial record (merging custom static coords with props)
  const activeDistrict: DistrictSpatialData = useMemo(() => {
    const found = JHARKHAND_24_DISTRICTS.find(
      (d) => d.name.toLowerCase() === selectedDistrictName.toLowerCase()
    );
    if (found) return found;

    // Fallback to first
    return JHARKHAND_24_DISTRICTS[0];
  }, [selectedDistrictName]);

  // Dynamically calculate ALL 11 METRICS for any given district
  const getDistrictIntelligence = (districtName: string) => {
    const spatial = JHARKHAND_24_DISTRICTS.find((d) => d.name.toLowerCase() === districtName.toLowerCase());

    // 1. All Problems for this District
    const allDistProblems = problems.filter(
      (p) => p.location.district.toLowerCase() === districtName.toLowerCase()
    );

    // Filtered Problems based on Sector
    const filteredProblems =
      sectorFilter === 'ALL'
        ? allDistProblems
        : allDistProblems.filter((p) =>
            matchesSector(`${p.category} ${p.title} ${p.description}`, sectorFilter)
          );

    // 2. Categories Distribution in this District
    const categoryCounts: Record<string, number> = {};
    allDistProblems.forEach((p) => {
      categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
    });

    // 3. Priority Breakdown
    const criticalProblems = filteredProblems.filter((p) => (p.priority?.totalScore || 0) >= 80);
    const highProblems = filteredProblems.filter(
      (p) => (p.priority?.totalScore || 0) >= 60 && (p.priority?.totalScore || 0) < 80
    );
    const mediumProblems = filteredProblems.filter(
      (p) => (p.priority?.totalScore || 0) >= 40 && (p.priority?.totalScore || 0) < 60
    );
    const lowProblems = filteredProblems.filter((p) => (p.priority?.totalScore || 0) < 40);

    const avgPriorityScore =
      filteredProblems.length > 0
        ? Math.round(
            filteredProblems.reduce((acc, p) => acc + (p.priority?.totalScore || 50), 0) /
              filteredProblems.length
          )
        : 0;

    const highestPriorityProblem = [...filteredProblems].sort(
      (a, b) => (b.priority?.totalScore || 0) - (a.priority?.totalScore || 0)
    )[0];

    // 4. Validated Problems
    const validatedProblems = filteredProblems.filter(
      (p) => p.validation?.decision === 'VALIDATED' || p.status === 'VALIDATED' || p.status === 'ASSIGNED' || p.status === 'ASSIGNED_ACCEPTED'
    );

    // 5. Active University Projects (Matches scope or problem location)
    const activeProjects = projects.filter((pr) => {
      const isDistrictScope =
        pr.scope.toLowerCase().includes(districtName.toLowerCase()) ||
        allDistProblems.some((p) => p.id === pr.problemId);
      if (!isDistrictScope) return false;
      if (pr.status === 'COMPLETED' || pr.status === 'DEPLOYED') return false;
      if (sectorFilter === 'ALL') return true;
      return matchesSector(`${pr.title} ${pr.department} ${pr.scope}`, sectorFilter);
    });

    // 6. Completed Projects
    const completedProjects = projects.filter((pr) => {
      const isDistrictScope =
        pr.scope.toLowerCase().includes(districtName.toLowerCase()) ||
        allDistProblems.some((p) => p.id === pr.problemId);
      if (!isDistrictScope) return false;
      return pr.status === 'COMPLETED';
    });

    // 7. Field Deployments
    const deployedProjects = projects.filter((pr) => {
      const isDistrictScope =
        pr.scope.toLowerCase().includes(districtName.toLowerCase()) ||
        allDistProblems.some((p) => p.id === pr.problemId);
      if (!isDistrictScope) return false;
      return pr.status === 'DEPLOYED' || !!pr.deployment;
    });

    // 8. People Impacted
    const problemAffectedCount = allDistProblems.reduce(
      (sum, p) => sum + (p.affectedPeopleCount || 0),
      0
    );
    const deployedBeneficiaries = deployedProjects.reduce((sum, pr) => {
      return sum + (pr.deployment?.activeBeneficiaries || pr.pilot?.targetUsersCount || 0);
    }, 0);
    const totalPeopleImpacted = Math.max(deployedBeneficiaries, Math.round(problemAffectedCount * 0.75));

    // 9. Unresolved Problems
    const unresolvedProblems = allDistProblems.filter(
      (p) => p.status !== 'DEPLOYED' && !projects.some((pr) => pr.problemId === p.id && (pr.status === 'COMPLETED' || pr.status === 'DEPLOYED'))
    );

    // 10. University Capabilities
    const assignedHEIs = spatial?.assignedHEIs || ['BIT Mesra', 'Ranchi University'];
    const leadLabs = spatial?.leadLabs || [];
    const leadFaculties = spatial?.leadFaculties || [];

    // 11. Reusable Solutions Available for this District
    const districtBlueprints = blueprints.filter(
      (bp) =>
        bp.originatedDistrict.toLowerCase() === districtName.toLowerCase() ||
        spatial?.keyIssues.some((issue) => matchesSector(issue, bp.category))
    );

    return {
      districtName,
      totalProblems: filteredProblems.length,
      allTotalProblems: allDistProblems.length,
      categoryCounts,
      criticalCount: criticalProblems.length,
      highCount: highProblems.length,
      mediumCount: mediumProblems.length,
      lowCount: lowProblems.length,
      avgPriorityScore,
      highestPriorityProblem,
      validatedCount: validatedProblems.length,
      validatedProblems,
      activeProjectsCount: activeProjects.length,
      activeProjects,
      completedProjectsCount: completedProjects.length,
      completedProjects,
      deploymentsCount: deployedProjects.length,
      deployedProjects,
      peopleImpacted: totalPeopleImpacted,
      problemAffectedCount,
      unresolvedCount: unresolvedProblems.length,
      unresolvedProblems,
      assignedHEIs,
      leadLabs,
      leadFaculties,
      reusableBlueprints: districtBlueprints,
      problems: filteredProblems,
    };
  };

  const activeIntelligence = useMemo(
    () => getDistrictIntelligence(activeDistrict.name),
    [activeDistrict.name, problems, projects, blueprints, sectorFilter]
  );

  // Filtered district list for cartogram grid & search
  const filteredDistricts = useMemo(() => {
    return JHARKHAND_24_DISTRICTS.filter((d) => {
      const matchSearch =
        d.name.toLowerCase().includes(searchDistrict.toLowerCase().trim()) ||
        d.hindiName.includes(searchDistrict.trim()) ||
        d.code.toLowerCase().includes(searchDistrict.toLowerCase().trim());
      const matchDivision =
        selectedDivision === 'ALL' || d.division === selectedDivision;
      return matchSearch && matchDivision;
    });
  }, [searchDistrict, selectedDivision]);

  // Dynamic Heatmap Shading based on chosen metric
  const getChoroplethColor = (districtName: string) => {
    const intel = getDistrictIntelligence(districtName);

    if (choroplethMetric === 'problems') {
      const count = intel.totalProblems;
      if (count >= 3) return '#e11d48'; // rose-600
      if (count === 2) return '#f97316'; // orange-500
      if (count === 1) return '#f59e0b'; // amber-500
      return '#334155'; // slate-700
    }
    if (choroplethMetric === 'priority') {
      const score = intel.avgPriorityScore;
      if (score >= 85) return '#e11d48';
      if (score >= 70) return '#ea580c';
      if (score >= 50) return '#d97706';
      return '#475569';
    }
    if (choroplethMetric === 'projects') {
      const projs = intel.activeProjectsCount + intel.deploymentsCount;
      if (projs >= 2) return '#059669'; // emerald-600
      if (projs === 1) return '#0284c7'; // sky-600
      return '#334155';
    }
    if (choroplethMetric === 'impact') {
      const impacted = intel.peopleImpacted;
      if (impacted > 5000) return '#7c3aed'; // violet-600
      if (impacted > 2000) return '#4f46e5'; // indigo-600
      if (impacted > 0) return '#2563eb';
      return '#334155';
    }
    return '#334155';
  };

  return (
    <div className="space-y-6 pb-20 font-sans text-slate-900">
      {/* Top Header Banner */}
      <div className="bg-slate-950 text-white border border-slate-200 p-6 sm:p-8 relative overflow-hidden shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" />
                {tText(lang, 'Statewide Geographic Grid', 'राज्यव्यापी भौगोलिक ग्रिड')}
              </span>
              <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-[10px] font-mono font-bold border border-slate-700">
                {tText(lang, '24 Districts • 5 Administrative Divisions', '24 ज़िले • 5 प्रशासनिक प्रमंडल')}
              </span>
              <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {tText(lang, '100% Live Database Grounded', '100% लाइव डेटाबेस आधारित')}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-white">
              {tText(lang, 'Jharkhand District Intelligence Command Center', 'झारखंड ज़िला इंटेलिजेंस कमांड सेंटर')}
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-300">
              {tText(
                lang,
                'Interactive spatial analytics connecting all 24 districts: local community problems, official government validation, higher education research assignments, live field deployments, and measured population impact.',
                'सभी 24 ज़िलों को जोड़ने वाला इंटरएक्टिव स्थानिक विश्लेषण: स्थानीय नागरिक समस्याएं, सरकारी सत्यापन, विश्वविद्यालय अनुसंधान, क्षेत्र तैनाती और प्रभाव।'
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setSelectedDistrictName('Ranchi');
                setSectorFilter('Education');
                onOpenGoldenDemo();
              }}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider border border-slate-200 transition flex items-center gap-1.5 shadow"
            >
              <Sparkles className="w-4 h-4 text-black" />
              <span>Inspect Golden Demo (Bundu)</span>
            </button>
            {onNavigate && (
              <button
                onClick={() => onNavigate('government')}
                className="px-4 py-2.5 bg-white hover:bg-slate-100 text-black font-black text-xs uppercase tracking-wider border-2 border-white transition flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4 text-orange-600" />
                <span>Government State Dashboard</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Global Filter Bar: Divisions, Sectors & Search */}
      <div className="bg-white border border-slate-200 p-4 sm:p-5 space-y-4">
        {/* Row 1: Division Filter Tabs & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b-2 border-slate-200 pb-3">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
              1. Administrative Division:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {divisions.map((div) => (
                <button
                  key={div.id}
                  onClick={() => setSelectedDivision(div.id)}
                  className={`px-3 py-1 text-xs font-black uppercase tracking-wider border-2 transition ${
                    selectedDivision === div.id
                      ? 'bg-black text-white border-slate-300 shadow'
                      : 'bg-slate-100 text-slate-700 border-slate-300 hover:border-slate-300'
                  }`}
                >
                  {div.label}
                </button>
              ))}
            </div>
          </div>

          {/* District Quick Search Input */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchDistrict}
              onChange={(e) => setSearchDistrict(e.target.value)}
              placeholder="Search 24 districts..."
              className="w-full pl-9 pr-8 py-1.5 bg-slate-50 border border-slate-200 text-xs font-bold text-black placeholder:text-slate-400 focus:bg-white focus:outline-none transition"
            />
            {searchDistrict && (
              <button
                onClick={() => setSearchDistrict('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Sector Filters */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Filter className="w-3 h-3 text-orange-600" />
              2. Domain / Sector Filter:
            </span>
            {sectorFilter !== 'ALL' && (
              <button
                onClick={() => setSectorFilter('ALL')}
                className="text-xs font-black uppercase text-orange-600 hover:text-black flex items-center gap-1 underline"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Sector Filter
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {sectors.map((s) => {
              const isSelected = sectorFilter.toLowerCase() === s.id.toLowerCase();
              return (
                <button
                  key={s.id}
                  onClick={() => setSectorFilter(s.id)}
                  className={`px-3 py-1 text-xs font-black uppercase tracking-wider border-2 transition ${
                    isSelected
                      ? 'bg-orange-600 text-white border-orange-700 shadow-sm'
                      : 'bg-white text-slate-800 border-slate-300 hover:border-slate-300'
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Command Grid: Left (Interactive Map & Cartogram) + Right (11-Dimension Deep Dive) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN (5 Cols): Map / Cartogram Visualization Controls */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 p-4 sm:p-5 space-y-4 shadow-sm">
            {/* Map Header & View Mode Switcher */}
            <div className="flex items-center justify-between border-b-2 border-slate-300 pb-3">
              <div>
                <h3 className="font-black uppercase tracking-wider text-black text-sm flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-orange-600" />
                  Jharkhand Spatial Map
                </h3>
                <span className="text-[10px] text-slate-500 font-bold uppercase">
                  Click any district node to load live intelligence
                </span>
              </div>

              {/* View Switcher: SVG Map vs Cartogram Grid */}
              <div className="flex items-center border border-slate-200 text-xs font-black overflow-hidden">
                <button
                  onClick={() => setMapVisualizationMode('svg')}
                  className={`px-2.5 py-1 uppercase ${
                    mapVisualizationMode === 'svg'
                      ? 'bg-black text-white'
                      : 'bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  SVG Map
                </button>
                <button
                  onClick={() => setMapVisualizationMode('cartogram')}
                  className={`px-2.5 py-1 uppercase ${
                    mapVisualizationMode === 'cartogram'
                      ? 'bg-black text-white'
                      : 'bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Grid Tiles
                </button>
              </div>
            </div>

            {/* Choropleth Metric Selector */}
            <div className="flex items-center justify-between bg-slate-100 border border-slate-300 p-2 text-xs">
              <span className="font-bold text-slate-700 text-[11px] uppercase">Choropleth Color By:</span>
              <div className="flex items-center gap-1">
                {(['problems', 'priority', 'projects', 'impact'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setChoroplethMetric(m)}
                    className={`px-2 py-0.5 text-[10px] font-black uppercase border ${
                      choroplethMetric === m
                        ? 'bg-black text-white border-slate-300'
                        : 'bg-white text-slate-700 border-slate-300 hover:border-slate-300'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* SVG Interactive Cartographic Canvas */}
            {mapVisualizationMode === 'svg' ? (
              <div className="bg-slate-950 border border-slate-200 p-2 sm:p-4 rounded-none relative overflow-hidden">
                {/* SVG Cartographic Map of Jharkhand 24 Districts */}
                <div className="relative w-full aspect-[4/3] max-h-[480px]">
                  <svg
                    viewBox="120 80 660 520"
                    className="w-full h-full select-none"
                    style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.4))' }}
                  >
                    {/* Map Background Grids & State Perimeter Reference */}
                    <defs>
                      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.75" />
                      </pattern>
                      <radialGradient id="stateGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#334155" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#0f172a" stopOpacity="0.8" />
                      </radialGradient>
                    </defs>

                    <rect x="120" y="80" width="660" height="520" fill="url(#grid)" />

                    {/* Regional Outline / Base Canvas */}
                    <ellipse cx="450" cy="340" rx="280" ry="220" fill="url(#stateGlow)" />

                    {/* District Nodes & Connecting Riparian/Transport Lines */}
                    <g className="connections opacity-30">
                      <line x1="410" y1="390" x2="560" y2="480" stroke="#f97316" strokeWidth="2" strokeDasharray="4 4" />
                      <line x1="410" y1="390" x2="560" y2="310" stroke="#f97316" strokeWidth="2" strokeDasharray="4 4" />
                      <line x1="410" y1="390" x2="390" y2="460" stroke="#f97316" strokeWidth="2" strokeDasharray="4 4" />
                      <line x1="410" y1="390" x2="410" y2="280" stroke="#f97316" strokeWidth="2" strokeDasharray="4 4" />
                      <line x1="560" y1="310" x2="660" y2="230" stroke="#f97316" strokeWidth="2" strokeDasharray="4 4" />
                      <line x1="660" y1="230" x2="730" y2="130" stroke="#f97316" strokeWidth="2" strokeDasharray="4 4" />
                    </g>

                    {/* Render All 24 Districts as Clickable Interactive SVG Polygons & Nodes */}
                    {filteredDistricts.map((d) => {
                      const isSelected = d.name.toLowerCase() === selectedDistrictName.toLowerCase();
                      const intel = getDistrictIntelligence(d.name);
                      const color = getChoroplethColor(d.name);

                      return (
                        <g
                          key={d.id}
                          onClick={() => setSelectedDistrictName(d.name)}
                          className="cursor-pointer group select-none"
                        >
                          {/* Stable expanded hit target to prevent jitter at boundaries */}
                          <circle
                            cx={d.cx}
                            cy={d.cy}
                            r="34"
                            fill="transparent"
                            stroke="transparent"
                          />

                          {/* Outer Selection Pulse Ring */}
                          {isSelected && (
                            <circle
                              cx={d.cx}
                              cy={d.cy}
                              r="34"
                              fill="none"
                              stroke="#f97316"
                              strokeWidth="2.5"
                              strokeDasharray="6 3"
                              className="animate-pulse pointer-events-none"
                            />
                          )}

                          {/* Smooth Hover Highlight Ring */}
                          <circle
                            cx={d.cx}
                            cy={d.cy}
                            r={isSelected ? 30 : 25}
                            fill="none"
                            stroke="#ffffff"
                            strokeWidth="2"
                            strokeOpacity="0.8"
                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none"
                          />

                          {/* District Centroid Bubble - Stable geometry without scale jitter */}
                          <circle
                            cx={d.cx}
                            cy={d.cy}
                            r={isSelected ? 26 : 21}
                            fill={isSelected ? '#ea580c' : color}
                            stroke={isSelected ? '#ffffff' : '#0f172a'}
                            strokeWidth={isSelected ? 3 : 1.5}
                            className="transition-colors duration-150 group-hover:brightness-125"
                          />

                          {/* District Code Label */}
                          <text
                            x={d.cx}
                            y={d.cy + 3.5}
                            textAnchor="middle"
                            fill="#ffffff"
                            fontSize={isSelected ? '10' : '9'}
                            fontWeight="900"
                            fontFamily="monospace"
                            className="pointer-events-none tracking-wider select-none"
                          >
                            {d.code}
                          </text>

                          {/* District Name Label below circle */}
                          <text
                            x={d.cx}
                            y={d.cy + (isSelected ? 38 : 32)}
                            textAnchor="middle"
                            fill={isSelected ? '#fb923c' : '#cbd5e1'}
                            fontSize={isSelected ? '11' : '9.5'}
                            fontWeight={isSelected ? '900' : '700'}
                            className="pointer-events-none drop-shadow-md select-none group-hover:fill-white transition-colors"
                          >
                            {d.name}
                          </text>

                          {/* Badge Count on Top Right */}
                          {intel.totalProblems > 0 && (
                            <g transform={`translate(${d.cx + 10}, ${d.cy - 16})`} className="pointer-events-none">
                              <circle r="8" fill="#e11d48" stroke="#ffffff" strokeWidth="1" />
                              <text
                                y="3"
                                textAnchor="middle"
                                fill="#ffffff"
                                fontSize="8"
                                fontWeight="bold"
                                fontFamily="monospace"
                              >
                                {intel.totalProblems}
                              </text>
                            </g>
                          )}

                          {/* Golden Demo Star Badge */}
                          {d.isGoldenDemo && (
                            <g transform={`translate(${d.cx - 14}, ${d.cy - 16})`} className="pointer-events-none">
                              <circle r="7" fill="#facc15" stroke="#000" strokeWidth="1" />
                              <text y="2.5" textAnchor="middle" fill="#000" fontSize="8" fontWeight="black">
                                ★
                              </text>
                            </g>
                          )}
                        </g>
                      );
                    })}
                  </svg>

                  {/* On-Map Legend */}
                  <div className="absolute bottom-2 left-2 right-2 bg-slate-900/90 border border-slate-700 p-2 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-300">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 font-bold">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-600" /> High Activity
                      </span>
                      <span className="flex items-center gap-1 font-bold">
                        <span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> Moderate
                      </span>
                      <span className="flex items-center gap-1 font-bold">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Project Live
                      </span>
                      <span className="flex items-center gap-1 font-bold text-amber-300">
                        ★ Golden Demo
                      </span>
                    </div>
                    <span className="font-mono text-slate-400">
                      Selected: <strong className="text-white uppercase">{activeDistrict.name}</strong>
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* Cartogram Grid Mode */
              <div className="p-3 bg-slate-950 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase text-slate-400">
                  <span>24 Districts Comparative Matrix</span>
                  <span className="font-mono text-orange-400">{filteredDistricts.length} Listed</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[460px] overflow-y-auto pr-1">
                  {filteredDistricts.map((d) => {
                    const isSelected = d.name.toLowerCase() === selectedDistrictName.toLowerCase();
                    const intel = getDistrictIntelligence(d.name);

                    return (
                      <button
                        key={d.id}
                        onClick={() => setSelectedDistrictName(d.name)}
                        className={`p-2.5 text-left transition border-2 ${
                          isSelected
                            ? 'bg-orange-600 text-white border-white shadow-md scale-102 z-10'
                            : 'bg-slate-900 text-slate-200 border-slate-800 hover:border-slate-600 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black truncate">{d.name}</span>
                          <span className="text-[9px] font-mono font-bold text-slate-400">{d.code}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block truncate">{d.hindiName}</span>

                        <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/10 text-[10px] font-mono">
                          <span className={isSelected ? 'text-white' : 'text-orange-400'}>
                            {intel.totalProblems} probs
                          </span>
                          <span className={intel.activeProjectsCount > 0 ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                            {intel.activeProjectsCount + intel.deploymentsCount} projs
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quick Summary of Current District Capabilities */}
            <div className="p-3 bg-slate-50 border-2 border-slate-300 space-y-1.5 text-xs">
              <span className="text-[10px] font-black uppercase text-slate-600 block">
                Assigned University & Institute Hubs:
              </span>
              <p className="font-bold text-black text-xs">
                {activeIntelligence.assignedHEIs.join(' • ')}
              </p>
              <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-[11px] text-slate-600 font-medium">
                <span>Terrain: {activeDistrict.terrainType}</span>
                <span className="font-mono">Pop: ~{activeDistrict.population.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (7 Cols): Dynamic 11-Metric Live Intelligence Panel */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200 p-5 sm:p-6 space-y-6 shadow-sm">
            {/* Active District Banner & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-slate-300 pb-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-black text-white text-xs font-mono font-black tracking-widest">
                    {activeDistrict.code}
                  </span>
                  <span className="px-2 py-0.5 bg-orange-100 text-orange-900 border border-orange-300 text-[10px] font-black uppercase">
                    {activeDistrict.division} Division
                  </span>
                  {activeDistrict.isGoldenDemo && (
                    <span className="px-2 py-0.5 bg-amber-400 text-black border border-slate-300 text-[10px] font-black uppercase flex items-center gap-1">
                      ★ Golden Benchmark
                    </span>
                  )}
                </div>
                <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black flex items-center gap-2 mt-1">
                  {activeDistrict.name} District Intelligence
                </h2>
                <p className="text-xs text-slate-600 font-medium">
                  Hindi: <strong className="text-black">{activeDistrict.hindiName}</strong> &bull; HQ: {activeDistrict.headquarters} &bull; Forest Cover: {activeDistrict.forestCoverPercent}% &bull; Pop: ~{activeDistrict.population.toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onSelectDistrictFilter(activeDistrict.name)}
                  className="px-3.5 py-2 bg-black hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider transition flex items-center gap-1"
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>Filter Registry</span>
                </button>
              </div>
            </div>

            {/* 11 METRICS DYNAMIC INTELLIGENCE SCORECARD */}
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                Real-Time District Metrics (Dynamically Calculated from Database)
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* Metric 1: Total & Sector Problems */}
                <div className="p-3 bg-slate-50 border border-slate-200 space-y-0.5">
                  <span className="text-[10px] font-black uppercase text-slate-600 tracking-wider block">
                    1. Problems
                  </span>
                  <strong className="text-2xl font-mono font-black text-black block">
                    {activeIntelligence.totalProblems}
                  </strong>
                  <span className="text-[10px] text-slate-600 font-medium block">
                    {activeIntelligence.allTotalProblems} total in district
                  </span>
                </div>

                {/* Metric 2: Unresolved Problems */}
                <div className="p-3 bg-rose-50 border-2 border-rose-600 space-y-0.5">
                  <span className="text-[10px] font-black uppercase text-rose-900 tracking-wider block">
                    2. Unresolved
                  </span>
                  <strong className="text-2xl font-mono font-black text-rose-700 block">
                    {activeIntelligence.unresolvedCount}
                  </strong>
                  <span className="text-[10px] text-rose-900 font-medium block">
                    Pending solution deployment
                  </span>
                </div>

                {/* Metric 3: Validated Problems */}
                <div className="p-3 bg-emerald-50 border-2 border-emerald-600 space-y-0.5">
                  <span className="text-[10px] font-black uppercase text-emerald-900 tracking-wider block">
                    3. Validated
                  </span>
                  <strong className="text-2xl font-mono font-black text-emerald-700 block">
                    {activeIntelligence.validatedCount}
                  </strong>
                  <span className="text-[10px] text-emerald-900 font-medium block">
                    Govt authorized for R&D
                  </span>
                </div>

                {/* Metric 4: Priority Benchmark */}
                <div className="p-3 bg-amber-50 border-2 border-amber-600 space-y-0.5">
                  <span className="text-[10px] font-black uppercase text-amber-950 tracking-wider block">
                    4. Priority (Avg)
                  </span>
                  <strong className="text-2xl font-mono font-black text-amber-900 block">
                    {activeIntelligence.avgPriorityScore}/100
                  </strong>
                  <span className="text-[10px] text-amber-900 font-medium block">
                    {activeIntelligence.criticalCount} Critical (&gt;80)
                  </span>
                </div>

                {/* Metric 5: Active Projects */}
                <div className="p-3 bg-slate-50 border border-slate-200 space-y-0.5">
                  <span className="text-[10px] font-black uppercase text-slate-600 tracking-wider block">
                    5. Active Projects
                  </span>
                  <strong className="text-2xl font-mono font-black text-orange-600 block">
                    {activeIntelligence.activeProjectsCount}
                  </strong>
                  <span className="text-[10px] text-slate-600 font-medium block">
                    Under university R&D
                  </span>
                </div>

                {/* Metric 6: Completed Projects */}
                <div className="p-3 bg-slate-50 border border-slate-200 space-y-0.5">
                  <span className="text-[10px] font-black uppercase text-slate-600 tracking-wider block">
                    6. Completed
                  </span>
                  <strong className="text-2xl font-mono font-black text-slate-900 block">
                    {activeIntelligence.completedProjectsCount}
                  </strong>
                  <span className="text-[10px] text-slate-600 font-medium block">
                    Tested & certified
                  </span>
                </div>

                {/* Metric 7: Live Deployments */}
                <div className="p-3 bg-slate-50 border border-slate-200 space-y-0.5">
                  <span className="text-[10px] font-black uppercase text-slate-600 tracking-wider block">
                    7. Deployments
                  </span>
                  <strong className="text-2xl font-mono font-black text-emerald-700 block">
                    {activeIntelligence.deploymentsCount}
                  </strong>
                  <span className="text-[10px] text-emerald-800 font-medium block">
                    Operational in field
                  </span>
                </div>

                {/* Metric 8: People Impacted */}
                <div className="p-3 bg-slate-50 border border-slate-200 space-y-0.5">
                  <span className="text-[10px] font-black uppercase text-slate-600 tracking-wider block">
                    8. People Impacted
                  </span>
                  <strong className="text-2xl font-mono font-black text-indigo-700 block">
                    {activeIntelligence.peopleImpacted.toLocaleString()}
                  </strong>
                  <span className="text-[10px] text-indigo-900 font-medium block">
                    Beneficiaries helped
                  </span>
                </div>
              </div>
            </div>

            {/* Metric 2: Categories in this District */}
            <div className="space-y-1.5 p-3.5 bg-slate-50 border-2 border-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-orange-600" />
                  Categories Active in {activeDistrict.name}
                </span>
                <span className="text-[10px] text-slate-500 font-bold">
                  {Object.keys(activeIntelligence.categoryCounts).length} distinct categories
                </span>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {Object.keys(activeIntelligence.categoryCounts).length === 0 ? (
                  <span className="text-xs text-slate-500 italic">No specific problem category logged yet.</span>
                ) : (
                  Object.entries(activeIntelligence.categoryCounts).map(([cat, count]) => (
                    <button
                      key={cat}
                      onClick={() => setSectorFilter(cat)}
                      className={`px-2.5 py-1 border text-xs font-black uppercase flex items-center gap-1.5 transition ${
                        sectorFilter.toLowerCase() === cat.toLowerCase()
                          ? 'bg-orange-600 text-white border-orange-700'
                          : 'bg-white text-slate-800 border-slate-300 hover:border-slate-300'
                      }`}
                    >
                      <span>{cat}</span>
                      <span className="px-1.5 py-0.2 bg-black/10 text-black text-[10px] font-mono font-bold rounded">
                        {count}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Navigation Tabs for Deep Dive Exploration */}
            <div className="border-b-2 border-slate-300 flex items-center space-x-2 overflow-x-auto no-scrollbar text-xs">
              {[
                { id: 'overview', label: 'Priority & Overview', icon: Activity },
                { id: 'problems', label: `Problems (${activeIntelligence.problems.length})`, icon: AlertOctagon },
                { id: 'validation', label: `Validated (${activeIntelligence.validatedCount})`, icon: ShieldCheck },
                { id: 'projects', label: `Projects & Deployments (${activeIntelligence.activeProjectsCount + activeIntelligence.deploymentsCount})`, icon: Cpu },
                { id: 'capabilities', label: 'University Capabilities', icon: GraduationCap },
                { id: 'reusable', label: `Reusable Blueprints (${activeIntelligence.reusableBlueprints.length})`, icon: BookmarkCheck },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 font-black uppercase tracking-wider border-t-2 border-l-2 border-r-2 transition-colors whitespace-nowrap ${
                      isActive
                        ? 'bg-black text-white border-slate-300 -mb-[2px] z-10'
                        : 'bg-slate-100 text-slate-600 border-transparent hover:border-slate-300 hover:text-black'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENT 1: OVERVIEW & HIGHEST PRIORITY 5-FACTOR BREAKDOWN */}
            {activeTab === 'overview' && (
              <div className="space-y-5">
                {/* Highest Priority Problem Spotlight */}
                {activeIntelligence.highestPriorityProblem ? (
                  <div className="p-4 bg-orange-50 border-2 border-orange-600 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-orange-200 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-rose-600 text-white text-[10px] font-black uppercase">
                          Highest Priority Benchmark Issue
                        </span>
                        <span className="font-mono text-xs font-black text-black">
                          {activeIntelligence.highestPriorityProblem.id}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-black text-rose-700">
                        Priority Score: {activeIntelligence.highestPriorityProblem.priority?.totalScore || 85}/100 ({activeIntelligence.highestPriorityProblem.priority?.level || 'CRITICAL'})
                      </span>
                    </div>

                    <div>
                      <h4 className="font-black text-sm text-black">
                        {translateText(activeIntelligence.highestPriorityProblem.title, lang)}
                      </h4>
                      <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                        {translateText(activeIntelligence.highestPriorityProblem.description, lang)}
                      </p>
                    </div>

                    {/* 5-Factor Deterministic Calculation Breakdown */}
                    {activeIntelligence.highestPriorityProblem.priority && (
                      <div className="pt-2 border-t border-orange-200">
                        <span className="text-[10px] font-black uppercase tracking-wider text-orange-950 block mb-2">
                          5-Factor Deterministic Priority Formula Calculation:
                        </span>
                        <PriorityBreakdownDisplay
                          priority={activeIntelligence.highestPriorityProblem.priority}
                          variant="detailed"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-6 bg-slate-50 border border-dashed border-slate-300 text-center text-xs font-bold text-slate-500">
                    No active problem logged matching current filters.
                  </div>
                )}

                {/* District Key Catchment Priorities */}
                {activeDistrict.keyIssues && (
                  <div className="space-y-2">
                    <span className="text-xs font-black uppercase tracking-wider text-black block">
                      Catchment Vulnerability & Focus Areas:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeDistrict.keyIssues.map((issue, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold"
                        >
                          {issue}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT 2: PROBLEMS & UNRESOLVED REGISTRY */}
            {activeTab === 'problems' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-black uppercase text-slate-600">
                  <span>Problems Registry in {activeDistrict.name} ({activeIntelligence.problems.length})</span>
                  <span className="text-rose-600 font-bold">{activeIntelligence.unresolvedCount} Unresolved</span>
                </div>

                {activeIntelligence.problems.length === 0 ? (
                  <div className="p-8 bg-slate-50 border border-dashed border-slate-300 text-center space-y-2">
                    <p className="text-xs font-bold text-slate-600">
                      No problems found matching the selected filter.
                    </p>
                    {sectorFilter !== 'ALL' && (
                      <button
                        onClick={() => setSectorFilter('ALL')}
                        className="px-3 py-1 bg-black text-white text-xs font-black uppercase"
                      >
                        Show all problems in {activeDistrict.name}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                    {activeIntelligence.problems.map((p) => {
                      const isUnresolved = p.status !== 'DEPLOYED';
                      return (
                        <div
                          key={p.id}
                          className="p-4 bg-slate-50 border border-slate-200 space-y-2 text-xs hover:border-orange-600 transition"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-black text-black">{p.id}</span>
                              <span className="px-2 py-0.5 bg-slate-200 text-slate-800 text-[10px] font-black uppercase">
                                {translateCategory(p.category, lang)}
                              </span>
                              <span
                                className={`px-2 py-0.5 text-[10px] font-black uppercase ${
                                  isUnresolved
                                    ? 'bg-rose-100 text-rose-900 border border-rose-300'
                                    : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                }`}
                              >
                                {isUnresolved ? 'UNRESOLVED' : 'DEPLOYED'}
                              </span>
                            </div>
                            <span className="font-mono font-black text-rose-700">
                              Priority: {p.priority?.totalScore || 70}/100
                            </span>
                          </div>

                          <h4 className="font-black text-sm text-black">{translateText(p.title, lang)}</h4>
                          <p className="text-slate-600 text-xs line-clamp-2">{translateText(p.description, lang)}</p>

                          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 text-[11px] text-slate-600">
                            <span>Block: <strong>{p.location.block ? translateText(p.location.block, lang) : 'District Center'}</strong></span>
                            <span>Affected: <strong>{p.affectedPeopleCount?.toLocaleString()} citizens</strong></span>
                            <button
                              onClick={() => setSelectedProblemModal(p)}
                              className="text-orange-600 font-black uppercase hover:underline flex items-center gap-0.5"
                            >
                              <span>Inspect Details</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT 3: VALIDATED PROBLEMS & ROUTING */}
            {activeTab === 'validation' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-black uppercase text-slate-600">
                  <span>Government Validated Problems ({activeIntelligence.validatedProblems.length})</span>
                  <span className="text-emerald-700 font-bold">Authorized for State HEI Assignment</span>
                </div>

                {activeIntelligence.validatedProblems.length === 0 ? (
                  <div className="p-8 bg-slate-50 border border-dashed border-slate-300 text-center space-y-2 text-xs font-bold text-slate-500">
                    No validated problems logged in this filter yet.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                    {activeIntelligence.validatedProblems.map((p) => (
                      <div key={p.id} className="p-4 bg-emerald-50/60 border-2 border-emerald-700 space-y-2 text-xs">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-200 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-black text-black">{p.id}</span>
                            <span className="px-2 py-0.5 bg-emerald-700 text-white text-[10px] font-black uppercase">
                              VALIDATED
                            </span>
                            <span className="px-2 py-0.5 bg-white text-emerald-950 border border-emerald-400 text-[10px] font-mono font-bold uppercase">
                              Route: {p.validation?.routedTo || 'INNOVATION'}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-500">
                            Validated: {p.validation?.validatedAt ? new Date(p.validation.validatedAt).toLocaleDateString() : 'Active'}
                          </span>
                        </div>

                        <h4 className="font-black text-sm text-black">{translateText(p.title, lang)}</h4>
                        <p className="text-slate-700 text-xs">{translateText(p.validation?.notes || 'Validated as genuine community problem requiring engineered solution.', lang)}</p>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-emerald-200 text-[11px] text-emerald-950 font-bold">
                          <span>Dept: {p.validation?.departmentName || 'State Development Department'}</span>
                          <span>Validator: {p.validation?.validatorName || 'Dr. Amitesh Sinha, IAS'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT 4: PROJECTS & DEPLOYMENTS */}
            {activeTab === 'projects' && (
              <div className="space-y-4">
                {/* Active Projects */}
                <div className="space-y-2">
                  <span className="text-xs font-black uppercase tracking-wider text-black block">
                    Active University R&D Projects ({activeIntelligence.activeProjects.length}):
                  </span>
                  {activeIntelligence.activeProjects.length === 0 ? (
                    <div className="p-4 bg-slate-50 border border-dashed border-slate-300 text-xs font-bold text-slate-500 text-center">
                      No active projects in progress for this district yet.
                    </div>
                  ) : (
                    activeIntelligence.activeProjects.map((pr) => (
                      <div key={pr.id} className="p-4 bg-slate-50 border border-slate-200 space-y-2 text-xs">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                          <span className="font-mono text-xs font-black text-black">{pr.id}</span>
                          <span className="px-2 py-0.5 bg-orange-600 text-white text-[10px] font-black uppercase">
                            {pr.status}
                          </span>
                        </div>
                        <h4 className="font-black text-sm text-black">{pr.title}</h4>
                        <p className="text-slate-600 text-xs">{pr.summary}</p>

                        <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-700">
                          <span>Lead: <strong>{pr.universityName}</strong></span>
                          <span>Mentor: <strong>{pr.facultyMentorName}</strong></span>
                          <span>Students: <strong>{pr.studentTeam?.length || 2} researchers</strong></span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Live Field Deployments */}
                <div className="space-y-2 pt-2 border-t border-slate-300">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-900 block flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Field Deployments Live in {activeDistrict.name} ({activeIntelligence.deployedProjects.length}):
                  </span>
                  {activeIntelligence.deployedProjects.length === 0 ? (
                    <div className="p-4 bg-slate-50 border border-dashed border-slate-300 text-xs font-bold text-slate-500 text-center">
                      No field deployments deployed in this district yet.
                    </div>
                  ) : (
                    activeIntelligence.deployedProjects.map((pr) => (
                      <div key={pr.id} className="p-4 bg-emerald-50 border-2 border-emerald-600 space-y-2 text-xs">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-200 pb-2">
                          <span className="font-mono text-xs font-black text-emerald-950">{pr.title}</span>
                          <span className="px-2 py-0.5 bg-emerald-700 text-white text-[10px] font-black uppercase">
                            LIVE DEPLOYMENT ACTIVE
                          </span>
                        </div>
                        <p className="text-slate-700 text-xs">{pr.summary}</p>
                        <div className="pt-2 border-t border-emerald-200 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-emerald-950 font-bold">
                          <span>Version: {pr.deployment?.hardwareVersion || 'v1.0 Production'}</span>
                          <span>Active Beneficiaries: {pr.deployment?.activeBeneficiaries?.toLocaleString() || '1,200+'}</span>
                          <span>Maintenance: {pr.deployment?.maintenanceSchedule || 'Quarterly'}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT 5: UNIVERSITY CAPABILITIES */}
            {activeTab === 'capabilities' && (
              <div className="space-y-4 text-xs">
                <div className="space-y-2">
                  <span className="text-xs font-black uppercase tracking-wider text-black block">
                    Specialized Research Laboratories Mapped to {activeDistrict.name}:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeDistrict.leadLabs?.map((lab, idx) => (
                      <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 space-y-1.5">
                        <strong className="text-black font-black block text-xs flex items-center gap-1">
                          <Microscope className="w-3.5 h-3.5 text-orange-600" />
                          {lab.name}
                        </strong>
                        <p className="text-slate-700 text-[11px]">
                          <strong>Focus:</strong> {lab.focus}
                        </p>
                        <p className="text-slate-500 text-[10px] font-mono">
                          Equipment: {lab.equipment}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Lead Faculty Investigators */}
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <span className="text-xs font-black uppercase tracking-wider text-black block">
                    Lead Faculty Investigators:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeDistrict.leadFaculties?.map((fac, idx) => (
                      <div key={idx} className="p-3 bg-slate-100 border border-slate-300 space-y-1">
                        <strong className="text-black font-black block text-xs">{fac.name}</strong>
                        <span className="text-[11px] text-slate-700 block">{fac.title} &bull; {fac.institution}</span>
                        <span className="text-[10px] font-bold text-orange-700 block">Domain: {fac.domain}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 6: REUSABLE BLUEPRINTS */}
            {activeTab === 'reusable' && (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-black">
                    Reusable Solution Blueprints for {activeDistrict.name}
                  </span>
                  <span className="text-slate-500 text-[11px] font-bold">
                    Proven in Jharkhand terrain
                  </span>
                </div>

                {activeIntelligence.reusableBlueprints.length === 0 ? (
                  <div className="p-6 bg-slate-50 border border-dashed border-slate-300 text-center space-y-2">
                    <p className="text-xs font-bold text-slate-500">
                      Standard solutions catalog available for cross-district replication.
                    </p>
                    {onNavigate && (
                      <button
                        onClick={() => onNavigate('impact')}
                        className="px-3 py-1 bg-black text-white text-xs font-black uppercase"
                      >
                        Browse All State Blueprints
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeIntelligence.reusableBlueprints.map((bp) => (
                      <div key={bp.id} className="p-4 bg-slate-50 border border-slate-200 space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                          <span className="font-mono text-xs font-black text-black">{bp.id}</span>
                          <span className="px-2 py-0.5 bg-black text-white text-[10px] font-mono font-bold uppercase">
                            Replications: {bp.replicationsCount}x
                          </span>
                        </div>
                        <h4 className="font-black text-sm text-black">{bp.title}</h4>
                        <p className="text-slate-600 text-xs">{bp.problemSummary}</p>
                        <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                          <span>Cost: <strong>{bp.estimatedCost}</strong></span>
                          <span>Developed By: <strong>{bp.developedByHEI}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Problem Quick Modal View */}
      {selectedProblemModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b-2 border-slate-300 pb-3">
              <div>
                <span className="font-mono text-xs font-black text-orange-600">{selectedProblemModal.id}</span>
                <h3 className="text-lg font-black text-black uppercase mt-0.5">{translateText(selectedProblemModal.title, lang)}</h3>
              </div>
              <button
                onClick={() => setSelectedProblemModal(null)}
                className="p-1 text-slate-400 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-700 leading-relaxed">{translateText(selectedProblemModal.description, lang)}</p>

              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 border border-slate-300">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Location:</span>
                  <strong>{selectedProblemModal.location.block ? translateText(selectedProblemModal.location.block, lang) : 'District Center'}, {translateDistrict(selectedProblemModal.location.district, lang)}</strong>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Affected Population:</span>
                  <strong>{selectedProblemModal.affectedPeopleCount?.toLocaleString()} people</strong>
                </div>
              </div>

              {selectedProblemModal.priority && (
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-slate-700 block">5-Factor Priority Breakdown:</span>
                  <PriorityBreakdownDisplay priority={selectedProblemModal.priority} variant="detailed" />
                </div>
              )}
            </div>

            <div className="pt-3 border-t-2 border-slate-300 flex justify-end">
              <button
                onClick={() => setSelectedProblemModal(null)}
                className="px-4 py-1.5 bg-black text-white text-xs font-black uppercase"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
