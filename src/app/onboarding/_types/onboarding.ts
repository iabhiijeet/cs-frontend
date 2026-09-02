export type OrgType = "company" | "university";

export interface CompanyIdentity {
  legalName: string;
  brandName: string;
  registrationNumber: string;
  industry: string;
  subsector: string;
  website: string;
  orgStructure: "single" | "multi" | "";
  consolidationApproach: string;
  employeeCount: string;
  annualRevenue: string;
  fiscalYearEnd: string;
}

export interface UniversityIdentity {
  legalName: string;          // Legal registered name
  brandName: string;          // Common/display name
  ugcId: string;              // UGC / AICTE registration ID
  universityType: string;     // Central | State | Deemed | Private | Autonomous
  affiliation: string;        // Affiliated board / regulatory body
  naacGrade: string;          // NAAC Grade (A++, A+, A, B++, etc.) — optional
  campusCount: string;        // Number of campuses
  studentEnrollment: string;  // Total students
  staffCount: string;         // Total faculty + staff
  website: string;
  fiscalYearEnd: string;
}

export interface LocationsOperations {
  facilityCount: string;
  countries: string[];
  facilityTypes: string[];
  ownershipStatus: string;
  floorArea: string;
  vehicles: string;
  onSiteEnergy: string[];
}

export interface ReportingCompliance {
  primaryReason: string;
  frameworks: string[];
  reportingType: string;
  deadline: string;
  previousReporting: string;
  assurance: string;
  audience: string[];
}

export interface DataIntegrations {
  erp: string;
  accounting: string;
  utilityBilling: "yes" | "no" | "";
  utilityBillingMethod: string;
  fleet: string;
  travel: string;
  procurement: string;
  iot: string[];
  dataInputMethod: string;
  centralization: string;
}

export interface EmissionsProfile {
  scope1Fuels: string[];
  refrigerants: string[];
  electricitySource: string;
  recs: string;
  steam: string;
}

export interface ValueChain {
  supplierData: string;
  spendCategories: string[];
  commuting: string;
  businessTravel: string;
  logisticsOwnership: string;
  waste: string;
  cloudProviders: string[];
  physicalProducts: "yes" | "no" | "";
  franchises: string;
  leasedAssets: string;
  investments: string;
}

export interface StrategyTeam {
  targets: string;
  targetYear: string;
  reduction: string;
  commitments: string[];
  carbonCredits: string;
  role: string;
  teammateEmails: string;
  workflows: string[];
  primaryContact: string;
  contactEmail: string;
}

export interface PhysicalFloor {
  name: string;
  code?: string;
  floorNumber?: number;
  areaSqm?: number;
  occupancy?: number;
  metadata?: Record<string, any>;
}

export interface PhysicalBuilding {
  name: string;
  code?: string;
  buildingType?: string;
  areaSqm?: number;
  occupancy?: number;
  metadata?: Record<string, any>;
  floors?: PhysicalFloor[];
}

export interface PhysicalCampus {
  name: string;
  code?: string;
  city?: string;
  region?: string;
  country?: string;
  metadata?: Record<string, any>;
  buildings?: PhysicalBuilding[];
}

export interface PhysicalHierarchy {
  campuses: PhysicalCampus[];
}

export interface OnboardingData {
  company: CompanyIdentity;
  university?: UniversityIdentity;
  locations: LocationsOperations;
  reporting: ReportingCompliance;
  integrations: DataIntegrations;
  emissions: EmissionsProfile;
  valueChain: ValueChain;
  strategy: StrategyTeam;
  physicalHierarchy?: PhysicalHierarchy;
  intakeRaw?: Record<string, any>;
}

export type OnboardingKey = "company" | "university" | "locations" | "reporting" | "integrations" | "emissions" | "valueChain" | "strategy" | "physicalHierarchy";

export type StepId =
  | "company"
  | "campusStructure"
  | "locations"
  | "reporting"
  | "integrations"
  | "emissions"
  | "valueChain"
  | "strategy";

export interface StepMeta {
  id: StepId;
  eyebrow: string;
  title: string;
  description: string;
  icon: string;
}