"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createOnboarding, updateOnboarding } from "@/lib/api";
import { EMPTY_ONBOARDING } from "../onboarding/_lib/onboardingStorage";
import { useAuth } from "@/context/AuthContext";
import "./intake.css";

const baseSteps = ['welcome','context','electricity','combustion','campus-assets','cooling','buildings','review'];

const meta: Record<string, any> = {
  welcome: { title: 'Welcome', icon: <><circle cx="12" cy="12" r="9"/><path d="M14.5 9.5l-2 5-5 2 2-5z"/></> },
  context: { title: 'Data depth', icon: <><path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/></> },
  electricity: { title: 'Electricity', icon: <><path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z"/></> },
  combustion: { title: 'Stationary & mobile', icon: <><path d="M12 2c1 4-4 5-4 9a4 4 0 008 0c0-2-1-3-1-3s2 1 2 4a6 6 0 01-12 0c0-5 4-6 5-10z"/></> },
  'campus-assets': { title: 'Fugitive & process', icon: <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></> },
  cooling: { title: 'Refrigerants', icon: <><line x1="12" y1="2" x2="12" y2="22"/><line x1="4" y1="7" x2="20" y2="17"/><line x1="20" y1="7" x2="4" y2="17"/></> },
  buildings: { title: 'Buildings', icon: <><rect x="4" y="3" width="16" height="18" rx="1"/><path d="M9 21v-4h6v4"/><line x1="8" y1="7" x2="8" y2="7"/><line x1="16" y1="7" x2="16" y2="7"/><line x1="8" y1="12" x2="8" y2="12"/><line x1="16" y1="12" x2="16" y2="12"/></> },
  review: { title: 'Review', icon: <><rect x="4" y="3" width="16" height="18" rx="1"/><path d="M8 11l3 3 5-6"/></> },
};

const tickIcon = <><path d="M5 13l4 4L19 7"/></>;

const initialState = {
  instName: '', contactEmail: '', contactPhone: '', contactRole: '',
  campusName: '', campusCode: '', city: '', region: '', country: 'India',
  campusCount: '1', granularity: '', year: '2025-26',
  electricityKwh: '', renewable: false, renewablePct: '',
  hasDG: false, dieselLiters: '',
  hasLPG: false, lpgKg: '',
  hasFleet: false, fleetCount: '', fleetFuel: 'Diesel',
  acCount: '', knowsRefrigerant: false, refrigerantType: '',
  campusAssets: {
    sf6: { has: false, chargeKg: '' },
    captivePower: { has: false, capacity: '', fuel: 'Diesel/Gas' },
    purchasedSteam: { has: false, units: '', type: 'Steam' },
    fireSuppression: { has: false, type: 'CO2' },
    labGas: { has: false, type: '', amount: '' },
    labProcess: { has: false, description: '' },
    wastewater: { has: false, biogasCaptured: false },
    incineration: { has: false, type: '', amount: '' }
  },
  stationary: {
    furnace: { has: false, fuel: 'Natural gas', amount: '' },
    waterHeater: { has: false, fuel: 'LPG', amount: '' },
    boiler: { has: false, fuel: 'LPG', amount: '' }
  },
  mobile: {
    ambulance: { has: false, count: '', fuel: 'Diesel' },
    maintenance: { has: false, count: '', fuel: 'Diesel' },
    utility: { has: false, count: '', fuel: 'Petrol' }
  },
  buildings: [] as any[]
};

function newBuilding() {
  return {
    name: '', type: 'Academic', kwh: '', area: '', occupancy: '', floorsCount: '',
    hasDG: false, dgCapacity: '', dgFuel: 'Diesel', dgLiters: '',
    hasChiller: false, chillerRefrigerant: 'R-410A', chillerCharge: '',
    hasSolar: false, solarCapacity: '',
    hasBoiler: false, boilerFuel: 'LPG', boilerCapacity: '',
    floors: [] as any[]
  };
}

function newFloor() {
  return { label: '', area: '', occupancy: '', acCount: '', acTonnage: '1.5', acRefrigerant: 'R-32', fridgeCount: '', geyserCount: '' };
}

export default function UniversityIntake() {
  const router = useRouter();
  const { setAuth } = useAuth();
  const [state, setState] = useState(initialState);
  const [stepIndex, setStepIndex] = useState(0);
  const [showStamp, setShowStamp] = useState(false);
  const [saveText, setSaveText] = useState('Save & continue later');

  const visibleSteps = baseSteps.filter(s => {
    if (s === 'cooling') return state.granularity !== 'floor';
    if (s === 'buildings') return state.granularity === 'building' || state.granularity === 'floor';
    return true;
  });

  if (stepIndex >= visibleSteps.length) {
    setStepIndex(visibleSteps.length - 1);
  }

  const currentStep = visibleSteps[stepIndex];

  // Helper for deep updates
  const updateState = (keyPath: string, val: any) => {
    setState(prev => {
      const copy = { ...prev };
      const keys = keyPath.split('.');
      let target: any = copy;
      for (let i = 0; i < keys.length - 1; i++) {
        target = target[keys[i]];
      }
      target[keys[keys.length - 1]] = val;
      return copy;
    });
  };

  const handleSaveLater = () => {
    setSaveText('Saved ✓');
    setTimeout(() => setSaveText('Save & continue later'), 1600);
  };

  const submitForm = async () => {
    setShowStamp(true);
    try {
      // 1. Build Physical Hierarchy (Campus -> Building -> Floor)
      const campusName = state.campusName?.trim() || "Main Campus";
      const campusCode = state.campusCode?.trim() || "MAIN-01";

      const mappedBuildings = (state.buildings || []).map((b: any, bIdx: number) => {
        const bName = b.name?.trim() || `Building ${bIdx + 1}`;
        const bCode = b.code?.trim() || `BLD-${String(bIdx + 1).padStart(2, "0")}`;

        const mappedFloors = (b.floors || []).map((f: any, fIdx: number) => {
          const fName = f.label?.trim() || (fIdx === 0 ? "Ground Floor" : `Floor ${fIdx}`);
          const fCode = f.code?.trim() || (fIdx === 0 ? "GF" : `F${fIdx}`);

          return {
            name: fName,
            code: fCode,
            floorNumber: f.floorNumber != null ? Number(f.floorNumber) : fIdx,
            areaSqm: f.area ? parseFloat(f.area) : undefined,
            occupancy: f.occupancy ? parseInt(f.occupancy, 10) : undefined,
            metadata: {
              acCount: f.acCount || undefined,
              acTonnage: f.acTonnage || undefined,
              acRefrigerant: f.acRefrigerant || undefined,
              fridgeCount: f.fridgeCount || undefined,
              geyserCount: f.geyserCount || undefined,
            },
          };
        });

        return {
          name: bName,
          code: bCode,
          buildingType: b.type || "Academic",
          areaSqm: b.area ? parseFloat(b.area) : undefined,
          occupancy: b.occupancy ? parseInt(b.occupancy, 10) : undefined,
          metadata: {
            kwhMonthly: b.kwh || undefined,
            hasDG: !!b.hasDG,
            dgCapacity: b.dgCapacity || undefined,
            dgFuel: b.dgFuel || undefined,
            dgLiters: b.dgLiters || undefined,
            hasChiller: !!b.hasChiller,
            chillerRefrigerant: b.chillerRefrigerant || undefined,
            chillerCharge: b.chillerCharge || undefined,
            hasSolar: !!b.hasSolar,
            solarCapacity: b.solarCapacity || undefined,
            hasBoiler: !!b.hasBoiler,
            boilerFuel: b.boilerFuel || undefined,
            boilerCapacity: b.boilerCapacity || undefined,
          },
          floors: mappedFloors,
        };
      });

      const physicalHierarchy = {
        campuses: [
          {
            name: campusName,
            code: campusCode,
            city: state.city || undefined,
            region: state.region || undefined,
            country: state.country || "India",
            metadata: {
              granularity: state.granularity || "campus",
              campusCount: state.campusCount || "1",
              reportingYear: state.year || "2025-26",
            },
            buildings: mappedBuildings,
          },
        ],
      };

      // 2. Build full OnboardingData payload
      const totalBuildingArea = (state.buildings || []).reduce((acc, b) => acc + (parseFloat(b.area) || 0), 0);

      const payload = {
        ...EMPTY_ONBOARDING,
        company: {
          ...EMPTY_ONBOARDING.company,
          legalName: state.instName?.trim() || "University / Institution",
          brandName: state.instName?.trim() || "University / Institution",
          industry: "Higher Education / University",
          fiscalYearEnd: state.year || "2025-26",
        },
        university: {
          legalName: state.instName?.trim() || "University / Institution",
          brandName: state.instName?.trim() || "University / Institution",
          ugcId: "",
          universityType: "University",
          affiliation: state.region || "",
          naacGrade: "",
          campusCount: state.campusCount || "1",
          studentEnrollment: "",
          staffCount: "",
          website: "",
          fiscalYearEnd: state.year || "2025-26",
        },
        locations: {
          ...EMPTY_ONBOARDING.locations,
          facilityCount: state.campusCount || "1",
          countries: [state.country || "India"],
          facilityTypes: ["Educational / University Campus"],
          ownershipStatus: "own",
          floorArea: totalBuildingArea > 0 ? String(totalBuildingArea) : "",
          vehicles: state.hasFleet ? String(state.fleetCount || "") : "",
          onSiteEnergy: [
            state.renewable ? "solar" : "",
            state.hasDG ? "diesel_generator" : "",
          ].filter(Boolean),
        },
        emissions: {
          ...EMPTY_ONBOARDING.emissions,
          scope1Fuels: [
            state.hasDG ? "Diesel" : "",
            state.hasLPG ? "LPG" : "",
          ].filter(Boolean),
          refrigerants: [state.refrigerantType || (state.acCount ? "R-32" : "")].filter(Boolean),
          electricitySource: state.electricityKwh ? `${state.electricityKwh} kWh/yr` : "",
          recs: state.renewable ? `${state.renewablePct || "0"}%` : "",
        },
        strategy: {
          ...EMPTY_ONBOARDING.strategy,
          primaryContact: state.contactRole || "Sustainability Officer",
          contactEmail: state.contactEmail || "",
        },
        physicalHierarchy,
        intakeRaw: state,
      };

      let result = await createOnboarding(payload);
      if (result.kind === "conflict") {
        result = await updateOnboarding(payload);
      }
      
      if (result.kind === "created" || result.kind === "updated") {
        // Update the user session with the newly created organisationId
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");
        if (token && storedUser && "record" in result) {
          const backendUser = JSON.parse(storedUser);
          backendUser.organisationId = result.record.organisationId;
          setAuth(token, backendUser);
        }
      } else {
        console.error("Failed to create/update onboarding", result);
      }
    } catch (err) {
      console.error("Failed to submit intake", err);
    }
    
    setTimeout(() => {
      setShowStamp(false);
      router.push('/dashboard');
    }, 2600);
  };

  // Field helpers
  const Fld = ({ children }: { children: React.ReactNode }) => <div className="field-grid">{children}</div>;
  const Row = ({ children }: { children: React.ReactNode }) => <div className="field-row">{children}</div>;
  const Inp = ({ id, label, ph, val, unit, type = 'text', sub }: any) => (
    <div className="field">
      <label>{label}{sub && <span className="sub">{sub}</span>}</label>
      <div className="unit-input">
        <input type={type} id={id} placeholder={ph || ''} value={val || ''} onChange={(e) => updateState(id, e.target.value)} />
        {unit && <span>{unit}</span>}
      </div>
    </div>
  );
  const Sel = ({ id, label, options, val, sub }: any) => (
    <div className="field">
      <label>{label}{sub && <span className="sub">{sub}</span>}</label>
      <select id={id} value={val} onChange={(e) => updateState(id, e.target.value)}>
        <option value="">Select…</option>
        {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
  const Gate = ({ id, label, sub, on, scopeTag }: any) => {
    const tag = scopeTag ? <span className={`asset-badge ${scopeTag}`}>{scopeTag === 's1' ? 'Scope 1' : 'Scope 2'}</span> : null;
    return (
      <div className="gate-row">
        <div><div className="glabel">{label} {tag}</div>{sub && <div className="gsub">{sub}</div>}</div>
        <div className={`toggle ${on ? 'on' : ''}`} onClick={() => updateState(id, !on)}><div className="knob"></div></div>
      </div>
    );
  };

  const renderWelcome = () => (
    <>
      <svg className="icon-draw" viewBox="0 0 24 24">{meta.welcome.icon}</svg>
      <h1 className="qtitle">Let's set up your campus's climate profile.</h1>
      <p className="qhelp">Just two things to start — everything after this adapts to how much detail you have. Most institutions finish in under 6 minutes, even with full asset detail.</p>
      <Fld>
        <Inp id="instName" label="Institution / university name" ph="e.g. Sunrise Institute of Technology" val={state.instName} />
        <Inp id="campusName" label="Campus name" ph="e.g. Main Campus / North Campus" val={state.campusName} />
        <Row>
          <Inp id="campusCode" label="Campus code" ph="e.g. MAIN-01" val={state.campusCode} />
          <Inp id="campusCount" label="Number of campuses" ph="e.g. 3" val={state.campusCount} type="number" sub="(optional)" />
        </Row>
        <Row>
          <Inp id="city" label="City" ph="e.g. Lucknow" val={state.city} />
          <Sel id="region" label="State / Electricity board" options={['Delhi (BSES/Tata Power)', 'Maharashtra (MSEDCL)', 'Karnataka (BESCOM)', 'Tamil Nadu (TANGEDCO)', 'Uttar Pradesh (UPPCL)', 'Gujarat (UGVCL/PGVCL)', 'West Bengal (WBSEDCL)', 'Other']} val={state.region} />
        </Row>
        <Row>
          <Inp id="contactEmail" label="Official email" ph="name@institute.edu" val={state.contactEmail} type="email" />
          <Inp id="contactPhone" label="Contact number" ph="e.g. +91 98765 43210" val={state.contactPhone} />
        </Row>
        <Sel id="contactRole" label="Responsible person / role" options={['Sustainability Officer', 'Registrar', 'Facilities Head', 'Dean', 'Estate / Works Manager', 'Energy Manager', 'Other']} val={state.contactRole} sub="(recommended)" />
      </Fld>
    </>
  );

  const renderContext = () => {
    const opts = [
      { v: 'campus', t: 'Campus level', d: 'Capture one consolidated profile for the whole campus. Fastest option.', icon: <circle cx="12" cy="12" r="8" /> },
      { v: 'building', t: 'Building level', d: 'Capture separate electricity and major equipment data for each building.', icon: <><rect x="4" y="3" width="16" height="18" rx="1" /><path d="M9 21v-4h6v4" /><line x1="8" y1="7" x2="8" y2="7" /><line x1="16" y1="7" x2="16" y2="7" /><line x1="8" y1="12" x2="8" y2="12" /><line x1="16" y1="12" x2="16" y2="12" /></> },
      { v: 'floor', t: 'Floor level', d: 'Most detailed — campus → building → floor, with room/equipment counts per floor.', icon: <><rect x="4" y="3" width="16" height="18" /><line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" /></> },
    ];
    return (
      <>
        <svg className="icon-draw" viewBox="0 0 24 24">{meta.context.icon}</svg>
        <h1 className="qtitle">How detailed is your data?</h1>
        <p className="qhelp">This decides where you'll log individual assets — campus-wide, per building, or per floor. You can always come back and add more detail.</p>
        <div className="card-choices" style={{ maxWidth: '560px' }}>
          {opts.map(o => (
            <div key={o.v} className={`choice-card ${state.granularity === o.v ? 'selected' : ''}`} onClick={() => updateState('granularity', o.v)}>
              <div className="cicon"><svg viewBox="0 0 24 24" stroke="currentColor" fill="none">{o.icon}</svg></div>
              <div><div className="ctitle">{o.t}</div><div className="cdesc">{o.d}</div></div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '22px', maxWidth: '560px' }}>
          <Fld><Sel id="year" label="Reporting year" options={['2023-24', '2024-25', '2025-26']} val={state.year} /></Fld>
          <div className="info-note" style={{ marginTop: '14px' }}><b>Hierarchy:</b> Campus → Building → Floor. Choose the deepest level for which reliable data is available.</div>
        </div>
      </>
    );
  };

  const renderElectricity = () => (
    <>
      <svg className="icon-draw" viewBox="0 0 24 24">{meta.electricity.icon}</svg>
      <h1 className="qtitle">Scope 2 · Purchased electricity.</h1>
      <p className="qhelp">Pull this from your annual electricity bills. This is the primary purchased-energy category and the single most important Scope 2 input.</p>
      <div className="category-heading"><span className="scope-pill s2">Scope 2</span><span>1 · Purchased electricity</span></div>
      <Fld><Inp id="electricityKwh" label="Total campus electricity" ph="e.g. 480000" val={state.electricityKwh} unit="kWh / year" type="number" /></Fld>
      <Gate id="renewable" label="Any renewable power? (solar, wind PPA, RECs)" sub="Reduces your net Scope 2 figure" on={state.renewable} scopeTag="s2" />
      <div className={`reveal ${state.renewable ? 'open' : ''}`}><div className="reveal-inner">
        <Fld><Inp id="renewablePct" label="Roughly what share is renewable" ph="e.g. 20" val={state.renewablePct} unit="%" type="number" /></Fld>
      </div></div>
    </>
  );

  const renderCombustion = () => {
    const showDG = state.granularity === 'campus';
    return (
      <>
        <svg className="icon-draw" viewBox="0 0 24 24">{meta.combustion.icon}</svg>
        <h1 className="qtitle">Scope 1 · Fuel burned on campus.</h1>
        <p className="qhelp">Capture direct fuel combustion from stationary equipment, kitchens and university-owned vehicles. Only switch on assets that actually exist.</p>

        <div className="category-heading"><span className="scope-pill s1">Scope 1</span><span>1 · Stationary combustion</span></div>

        {showDG ? (
          <>
            <Gate id="hasDG" label="Diesel generators (DG sets)" sub="Backup power for campus operations" on={state.hasDG} scopeTag="s1" />
            <div className={`reveal ${state.hasDG ? 'open' : ''}`}><div className="reveal-inner">
              <Fld><Inp id="dieselLiters" label="Diesel used" ph="e.g. 1200" val={state.dieselLiters} unit="L / month" type="number" /></Fld>
            </div></div>
          </>
        ) : (
          <div className="info-note"><b>DG sets:</b> captured separately under each building because you selected building/floor-level data.</div>
        )}

        <Gate id="stationary.boiler.has" label="Boilers / steam plants" sub="Natural gas, diesel, furnace oil, LPG or other fuels" on={state.stationary.boiler.has} scopeTag="s1" />
        <div className={`reveal ${state.stationary.boiler.has ? 'open' : ''}`}><div className="reveal-inner">
          <Row>
            <Sel id="stationary.boiler.fuel" label="Primary fuel" options={['Natural gas', 'LPG', 'Diesel', 'Furnace oil', 'Biomass', 'Other']} val={state.stationary.boiler.fuel} />
            <Inp id="stationary.boiler.amount" label="Fuel consumed" ph="e.g. 500" val={state.stationary.boiler.amount} unit="units / month" type="number" />
          </Row>
        </div></div>

        <Gate id="stationary.furnace.has" label="Furnaces / laboratory heaters" sub="Only if fuel is combusted directly on campus" on={state.stationary.furnace.has} scopeTag="s1" />
        <div className={`reveal ${state.stationary.furnace.has ? 'open' : ''}`}><div className="reveal-inner">
          <Row>
            <Sel id="stationary.furnace.fuel" label="Primary fuel" options={['Natural gas', 'LPG', 'Diesel', 'Furnace oil', 'Other']} val={state.stationary.furnace.fuel} />
            <Inp id="stationary.furnace.amount" label="Fuel consumed" ph="e.g. 120" val={state.stationary.furnace.amount} unit="units / month" type="number" />
          </Row>
        </div></div>

        <Gate id="stationary.waterHeater.has" label="Fuel-fired water heaters / geysers" sub="Gas-based systems; electric geysers are Scope 2" on={state.stationary.waterHeater.has} scopeTag="s1" />
        <div className={`reveal ${state.stationary.waterHeater.has ? 'open' : ''}`}><div className="reveal-inner">
          <Row>
            <Sel id="stationary.waterHeater.fuel" label="Fuel" options={['LPG', 'Natural gas', 'Diesel', 'Other']} val={state.stationary.waterHeater.fuel} />
            <Inp id="stationary.waterHeater.amount" label="Fuel consumed" ph="e.g. 150" val={state.stationary.waterHeater.amount} unit="units / month" type="number" />
          </Row>
        </div></div>

        <Gate id="hasLPG" label="LPG or PNG for mess / hostel kitchens" sub="Cafeteria and mess cooking fuel" on={state.hasLPG} scopeTag="s1" />
        <div className={`reveal ${state.hasLPG ? 'open' : ''}`}><div className="reveal-inner">
          <Fld><Inp id="lpgKg" label="LPG/PNG used" ph="e.g. 300" val={state.lpgKg} unit="kg / month" type="number" /></Fld>
        </div></div>

        <div className="category-heading"><span className="scope-pill s1">Scope 1</span><span>2 · Mobile combustion</span></div>

        <Gate id="hasFleet" label="Owned buses, vans or shuttles" sub="University-owned student/staff transport" on={state.hasFleet} scopeTag="s1" />
        <div className={`reveal ${state.hasFleet ? 'open' : ''}`}><div className="reveal-inner">
          <Row>
            <Inp id="fleetCount" label="Number of vehicles" ph="e.g. 6" val={state.fleetCount} type="number" />
            <Sel id="fleetFuel" label="Mostly run on" options={['Diesel', 'CNG', 'Petrol', 'Electric']} val={state.fleetFuel} />
          </Row>
        </div></div>

        <Gate id="mobile.ambulance.has" label="University-owned ambulances" sub="Campus medical facility / emergency transport" on={state.mobile.ambulance.has} scopeTag="s1" />
        <div className={`reveal ${state.mobile.ambulance.has ? 'open' : ''}`}><div className="reveal-inner">
          <Row>
            <Inp id="mobile.ambulance.count" label="Number of ambulances" ph="e.g. 1" val={state.mobile.ambulance.count} type="number" />
            <Sel id="mobile.ambulance.fuel" label="Fuel" options={['Diesel', 'Petrol', 'CNG', 'Electric']} val={state.mobile.ambulance.fuel} />
          </Row>
        </div></div>

        <Gate id="mobile.maintenance.has" label="Maintenance vehicles" sub="Trucks, tractors, mowers and other campus maintenance vehicles" on={state.mobile.maintenance.has} scopeTag="s1" />
        <div className={`reveal ${state.mobile.maintenance.has ? 'open' : ''}`}><div className="reveal-inner">
          <Row>
            <Inp id="mobile.maintenance.count" label="Number of vehicles" ph="e.g. 3" val={state.mobile.maintenance.count} type="number" />
            <Sel id="mobile.maintenance.fuel" label="Fuel" options={['Diesel', 'Petrol', 'CNG', 'Electric']} val={state.mobile.maintenance.fuel} />
          </Row>
        </div></div>

        <Gate id="mobile.utility.has" label="Utility / golf carts" sub="Include only petrol/diesel/CNG vehicles; electric carts are Scope 2" on={state.mobile.utility.has} scopeTag="s1" />
        <div className={`reveal ${state.mobile.utility.has ? 'open' : ''}`}><div className="reveal-inner">
          <Row>
            <Inp id="mobile.utility.count" label="Number of vehicles" ph="e.g. 4" val={state.mobile.utility.count} type="number" />
            <Sel id="mobile.utility.fuel" label="Fuel" options={['Diesel', 'Petrol', 'CNG', 'Electric']} val={state.mobile.utility.fuel} />
          </Row>
        </div></div>
      </>
    );
  };

  const renderCampusAssets = () => {
    const ca = state.campusAssets;
    return (
      <>
        <svg className="icon-draw" viewBox="0 0 24 24">{meta['campus-assets'].icon}</svg>
        <h1 className="qtitle">Scope 1 · Fugitive & process emissions.</h1>
        <p className="qhelp">These categories are usually smaller or less common. Toggle only what is genuinely present at the university.</p>

        <div className="category-heading"><span className="scope-pill s1">Scope 1</span><span>3 · Fugitive emissions</span></div>

        <Gate id="campusAssets.sf6.has" label="SF6 gas in electrical switchgear / substation" sub="Applicable where the campus operates its own SF6-containing electrical equipment" on={ca.sf6.has} scopeTag="s1" />
        <div className={`reveal ${ca.sf6.has ? 'open' : ''}`}><div className="reveal-inner">
          <Fld><Inp id="campusAssets.sf6.chargeKg" label="Total SF6 charge" ph="e.g. 8" val={ca.sf6.chargeKg} unit="kg" type="number" /></Fld>
        </div></div>

        <Gate id="campusAssets.fireSuppression.has" label="Gas-based fire suppression" sub="CO2 / FM200 / Halon systems in server rooms, labs or other protected spaces" on={ca.fireSuppression.has} scopeTag="s1" />
        <div className={`reveal ${ca.fireSuppression.has ? 'open' : ''}`}><div className="reveal-inner">
          <Fld><Sel id="campusAssets.fireSuppression.type" label="System type" options={['CO2', 'FM200', 'Halon', 'Not sure']} val={ca.fireSuppression.type} /></Fld>
        </div></div>

        <Gate id="campusAssets.labGas.has" label="Laboratory gas leaks" sub="Applicable to research/teaching laboratories using gases with direct emissions" on={ca.labGas.has} scopeTag="s1" />
        <div className={`reveal ${ca.labGas.has ? 'open' : ''}`}><div className="reveal-inner">
          <Row>
            <Sel id="campusAssets.labGas.type" label="Gas / category" options={['CO2', 'Methane', 'Nitrous oxide', 'Refrigerant / specialty gas', 'Other', 'Not sure']} val={ca.labGas.type} />
            <Inp id="campusAssets.labGas.amount" label="Estimated amount" ph="e.g. 20" val={ca.labGas.amount} unit="kg / year" type="number" />
          </Row>
        </div></div>

        <div className="category-heading"><span className="scope-pill s1">Scope 1</span><span>4 · Process emissions</span></div>

        <Gate id="campusAssets.labProcess.has" label="Laboratory / research process emissions" sub="Only where a chemical or biological process directly releases greenhouse gases" on={ca.labProcess.has} scopeTag="s1" />
        <div className={`reveal ${ca.labProcess.has ? 'open' : ''}`}><div className="reveal-inner">
          <Fld><Inp id="campusAssets.labProcess.description" label="Process / source" ph="e.g. chemical reaction generating CO₂" val={ca.labProcess.description} /></Fld>
        </div></div>

        <Gate id="campusAssets.wastewater.has" label="On-site wastewater treatment (STP)" sub="Applicable if the university operates its own treatment plant with potential methane release" on={ca.wastewater.has} scopeTag="s1" />
        <div className={`reveal ${ca.wastewater.has ? 'open' : ''}`}><div className="reveal-inner">
          <Gate id="campusAssets.wastewater.biogasCaptured" label="Biogas / methane captured or recovered" sub="Helps distinguish released methane from captured gas" on={ca.wastewater.biogasCaptured} scopeTag="s1" />
        </div></div>

        <Gate id="campusAssets.incineration.has" label="On-site waste incineration" sub="Biomedical or solid-waste incineration performed on campus" on={ca.incineration.has} scopeTag="s1" />
        <div className={`reveal ${ca.incineration.has ? 'open' : ''}`}><div className="reveal-inner">
          <Row>
            <Sel id="campusAssets.incineration.type" label="Waste type" options={['Biomedical', 'Municipal / solid waste', 'Laboratory waste', 'Other']} val={ca.incineration.type} />
            <Inp id="campusAssets.incineration.amount" label="Waste processed" ph="e.g. 100" val={ca.incineration.amount} unit="kg / month" type="number" />
          </Row>
        </div></div>

        <div className="category-heading"><span className="scope-pill s2">Scope 2</span><span>Purchased steam / heating / cooling</span></div>

        <Gate id="campusAssets.purchasedSteam.has" label="Purchased steam, heating or chilled water" sub="Energy supplied by an external network/provider; report purchased quantity" on={ca.purchasedSteam.has} scopeTag="s2" />
        <div className={`reveal ${ca.purchasedSteam.has ? 'open' : ''}`}><div className="reveal-inner">
          <Row>
            <Sel id="campusAssets.purchasedSteam.type" label="Purchased energy" options={['Steam', 'Hot water / district heating', 'Chilled water / district cooling']} val={ca.purchasedSteam.type || 'Steam'} />
            <Inp id="campusAssets.purchasedSteam.units" label="Amount purchased" ph="e.g. 4000" val={ca.purchasedSteam.units} unit="units / month" type="number" />
          </Row>
        </div></div>

        <Gate id="campusAssets.captivePower.has" label="Captive power plant" sub="University-owned generation is Scope 1; capture here for completeness" on={ca.captivePower.has} scopeTag="s1" />
        <div className={`reveal ${ca.captivePower.has ? 'open' : ''}`}><div className="reveal-inner">
          <Row>
            <Inp id="campusAssets.captivePower.capacity" label="Capacity" ph="e.g. 500" val={ca.captivePower.capacity} unit="kVA" type="number" />
            <Sel id="campusAssets.captivePower.fuel" label="Fuel" options={['Diesel', 'Natural gas', 'Furnace oil']} val={ca.captivePower.fuel} />
          </Row>
        </div></div>
      </>
    );
  };

  const renderCooling = () => (
    <>
      <svg className="icon-draw" viewBox="0 0 24 24">{meta.cooling.icon}</svg>
      <h1 className="qtitle">Cooling equipment, campus-wide.</h1>
      <p className="qhelp">A rough count is enough — we'll use a typical refrigerant estimate unless you tell us otherwise.</p>
      <Fld><Inp id="acCount" label="ACs & refrigerators across campus (rough count)" ph="e.g. 140" val={state.acCount} unit="units" type="number" /></Fld>
      {state.acCount && <div className="default-tag">⚙ Using default refrigerant estimate (R-32, typical charge) unless specified</div>}
      <br/>
      <Gate id="knowsRefrigerant" label="Know the dominant refrigerant type?" sub="Improves the Scope 1 estimate" on={state.knowsRefrigerant} />
      <div className={`reveal ${state.knowsRefrigerant ? 'open' : ''}`}><div className="reveal-inner">
        <Fld><Sel id="refrigerantType" label="Mostly" options={['R-32', 'R-410A', 'R-22', 'R-134a', 'Not sure']} val={state.refrigerantType} /></Fld>
      </div></div>
    </>
  );

  const renderBuildings = () => {
    const withFloors = state.granularity === 'floor';
    return (
      <>
        <svg className="icon-draw" viewBox="0 0 24 24">{meta.buildings.icon}</svg>
        <h1 className="qtitle">{withFloors ? 'Buildings, and the floors inside them.' : 'Break it down by building.'}</h1>
        <p className="qhelp">Add each major building. Every asset toggle is off by default — switch on only what's actually installed there.</p>
        {state.buildings.map((b, i) => (
          <div key={i} className="level-card">
            <div className="lhead">
              <b>{b.name || 'Building ' + (i + 1)}</b>
              <button className="remove-b" onClick={() => {
                const blds = [...state.buildings];
                blds.splice(i, 1);
                updateState('buildings', blds);
              }}>remove</button>
            </div>
            <Row>
              <Inp id={`buildings.${i}.name`} label="Building name" ph="e.g. Main Academic Block" val={b.name} />
              <Sel id={`buildings.${i}.type`} label="Building type" options={['Academic', 'Administrative', 'Hostel / Residential', 'Laboratory / Research', 'Library', 'Auditorium / Sports', 'Hospital / Medical', 'Canteen / Kitchen', 'Other']} val={b.type} />
            </Row>
            <br />
            <Row>
              <Inp id={`buildings.${i}.kwh`} label="Electricity" ph="e.g. 22000" val={b.kwh} unit="kWh / month" type="number" />
              <Inp id={`buildings.${i}.area`} label="Built-up area" ph="e.g. 8500" val={b.area} unit="m²" type="number" sub="(optional)" />
            </Row>
            <br />
            <Row>
              <Inp id={`buildings.${i}.occupancy`} label="Typical occupancy" ph="e.g. 650" val={b.occupancy} unit="people" type="number" sub="(optional)" />
              <Inp id={`buildings.${i}.floorsCount`} label="Number of floors" ph="e.g. 4" val={b.floorsCount} unit="floors" type="number" sub="(optional)" />
            </Row>

            <div className="section-label">Assets in this building</div>

            <Gate id={`buildings.${i}.hasDG`} label="Backup DG set" on={b.hasDG} scopeTag="s1" />
            <div className={`reveal ${b.hasDG ? 'open' : ''}`}><div className="reveal-inner">
              <Row>
                <Inp id={`buildings.${i}.dgCapacity`} label="Capacity" ph="e.g. 125" val={b.dgCapacity} unit="kVA" type="number" />
                <Inp id={`buildings.${i}.dgLiters`} label="Diesel used" ph="e.g. 200" val={b.dgLiters} unit="L/month" type="number" />
              </Row>
            </div></div>

            <Gate id={`buildings.${i}.hasChiller`} label="Central chiller / VRF system" on={b.hasChiller} scopeTag="s1" />
            <div className={`reveal ${b.hasChiller ? 'open' : ''}`}><div className="reveal-inner">
              <Row>
                <Sel id={`buildings.${i}.chillerRefrigerant`} label="Refrigerant" options={['R-410A', 'R-134a', 'R-407C', 'R-22', 'Not sure']} val={b.chillerRefrigerant} />
                <Inp id={`buildings.${i}.chillerCharge`} label="Charge" ph="e.g. 45" val={b.chillerCharge} unit="kg" type="number" sub="(optional)" />
              </Row>
            </div></div>

            <Gate id={`buildings.${i}.hasSolar`} label="Rooftop solar" sub="Reduces this building's Scope 2" on={b.hasSolar} scopeTag="s2" />
            <div className={`reveal ${b.hasSolar ? 'open' : ''}`}><div className="reveal-inner">
              <Fld><Inp id={`buildings.${i}.solarCapacity`} label="Capacity" ph="e.g. 25" val={b.solarCapacity} unit="kW" type="number" /></Fld>
            </div></div>

            <Gate id={`buildings.${i}.hasBoiler`} label="Boiler / steam plant" on={b.hasBoiler} scopeTag="s1" />
            <div className={`reveal ${b.hasBoiler ? 'open' : ''}`}><div className="reveal-inner">
              <Row>
                <Sel id={`buildings.${i}.boilerFuel`} label="Fuel" options={['LPG', 'Diesel', 'Biomass', 'Coal', 'Electric']} val={b.boilerFuel} />
                <Inp id={`buildings.${i}.boilerCapacity`} label="Capacity" ph="e.g. 500" val={b.boilerCapacity} unit="kg-steam/hr" type="number" />
              </Row>
            </div></div>

            {withFloors && (
              <>
                <div className="section-label" style={{ marginTop: '20px' }}>Floors in this building</div>
                {b.floors.map((f: any, fi: number) => (
                  <div key={fi} className="level-card nested">
                    <div className="lhead">
                      <b>{f.label || 'Floor ' + (fi + 1)}</b>
                      <button className="remove-b" onClick={() => {
                        const blds = [...state.buildings];
                        blds[i].floors.splice(fi, 1);
                        updateState('buildings', blds);
                      }}>remove</button>
                    </div>
                    <Row>
                      <Inp id={`buildings.${i}.floors.${fi}.label`} label="Floor label" ph="e.g. Ground Floor / 2nd Floor" val={f.label} />
                      <Inp id={`buildings.${i}.floors.${fi}.area`} label="Floor area" ph="e.g. 2200" val={f.area} unit="m²" type="number" sub="(optional)" />
                    </Row>
                    <br />
                    <Row>
                      <Inp id={`buildings.${i}.floors.${fi}.occupancy`} label="Typical occupancy" ph="e.g. 180" val={f.occupancy} unit="people" type="number" sub="(optional)" />
                      <Inp id={`buildings.${i}.floors.${fi}.acCount`} label="AC units on this floor" ph="e.g. 8" val={f.acCount} unit="units" type="number" />
                    </Row>
                    <div className={`reveal ${f.acCount ? 'open' : ''}`}><div className="reveal-inner">
                      <br/>
                      <Row>
                        <Sel id={`buildings.${i}.floors.${fi}.acTonnage`} label="Typical tonnage" options={['1', '1.5', '2', 'Central/VRF']} val={f.acTonnage} />
                        <Sel id={`buildings.${i}.floors.${fi}.acRefrigerant`} label="Refrigerant" options={['R-32', 'R-410A', 'R-22', 'Not sure']} val={f.acRefrigerant} />
                      </Row>
                    </div></div>
                    <br/>
                    <Row>
                      <Inp id={`buildings.${i}.floors.${fi}.fridgeCount`} label="Refrigerators" ph="e.g. 2" val={f.fridgeCount} unit="units" type="number" sub="(optional)" />
                      <Inp id={`buildings.${i}.floors.${fi}.geyserCount`} label="Geysers / water heaters" ph="e.g. 3" val={f.geyserCount} unit="units" type="number" sub="(optional)" />
                    </Row>
                  </div>
                ))}
                <button className="add-item small" onClick={() => {
                  const blds = [...state.buildings];
                  blds[i].floors.push(newFloor());
                  updateState('buildings', blds);
                }}>+ Add a floor</button>
              </>
            )}
          </div>
        ))}
        <button className="add-item" onClick={() => {
          updateState('buildings', [...state.buildings, newBuilding()]);
        }}>+ Add a building</button>
      </>
    );
  };

  const renderReview = () => {
    const granMap: any = { campus: 'Campus total only', building: 'Building-wise', floor: 'Floor-wise' };
    const gran = granMap[state.granularity] || '—';
    const ca = state.campusAssets;
    return (
      <>
        <svg className="icon-draw" viewBox="0 0 24 24">{meta.review.icon}</svg>
        <h1 className="qtitle">Review before you submit.</h1>
        <p className="qhelp">Anything in <span style={{ color: 'var(--amber-deep)', fontWeight: 600 }}>amber</span> is using a default estimate — come back anytime to refine it.</p>

        <div className="review-group">
          <h4>Institution</h4>
          <div className="review-row"><span className="rk">Name</span><span className="rv">{state.instName || '—'}</span></div>
          <div className="review-row"><span className="rk">Campus</span><span className="rv">{state.campusName || '—'}{state.campusCode ? ' · ' + state.campusCode : ''}</span></div>
          <div className="review-row"><span className="rk">Location</span><span className="rv">{[state.city, state.region, state.country].filter(Boolean).join(', ') || '—'}</span></div>
          <div className="review-row"><span className="rk">Contact</span><span className="rv">{state.contactEmail || '—'}{state.contactPhone ? ' · ' + state.contactPhone : ''}</span></div>
          <div className="review-row"><span className="rk">Data depth</span><span className="rv">{gran}</span></div>
          <div className="review-row"><span className="rk">Reporting year</span><span className="rv">{state.year || '—'}</span></div>
        </div>

        <div className="review-group">
          <h4>Scope 2 · Electricity</h4>
          <div className="review-row"><span className="rk">Annual consumption</span><span className="rv">{state.electricityKwh ? state.electricityKwh + ' kWh' : '—'}</span></div>
          <div className="review-row"><span className="rk">Renewable share</span><span className="rv">{state.renewable ? (state.renewablePct || '~') + '%' : 'None reported'}</span></div>
        </div>

        <div className="review-group">
          <h4>Scope 1 · Fuel & fleet</h4>
          {state.granularity === 'campus' ? (
            <div className="review-row"><span className="rk">Diesel (DG sets)</span><span className="rv">{state.hasDG ? (state.dieselLiters || '0') + ' L/mo' : 'Not applicable'}</span></div>
          ) : (
            <div className="review-row"><span className="rk">DG sets</span><span className="rv">Logged per building</span></div>
          )}
          <div className="review-row"><span className="rk">LPG/PNG</span><span className="rv">{state.hasLPG ? (state.lpgKg || '0') + ' kg/mo' : 'Not applicable'}</span></div>
          <div className="review-row"><span className="rk">Fleet</span><span className="rv">{state.hasFleet ? state.fleetCount + ' × ' + state.fleetFuel : 'Not applicable'}</span></div>
        </div>

        <div className="review-group">
          <h4>Campus assets</h4>
          <div className="review-row"><span className="rk">SF6 switchgear</span><span className="rv">{ca.sf6.has ? (ca.sf6.chargeKg || '—') + ' kg' : 'None'}</span></div>
          <div className="review-row"><span className="rk">Captive power plant</span><span className="rv">{ca.captivePower.has ? ca.captivePower.capacity + ' kVA (' + ca.captivePower.fuel + ')' : 'None'}</span></div>
          <div className="review-row"><span className="rk">Fire suppression</span><span className="rv">{ca.fireSuppression.has ? ca.fireSuppression.type : 'None'}</span></div>
        </div>

        {state.granularity !== 'floor' && (
          <div className="review-group">
            <h4>Scope 1 · Cooling (campus aggregate)</h4>
            <div className="review-row"><span className="rk">AC / refrigeration units</span><span className="rv">{state.acCount || '—'}</span></div>
            <div className="review-row"><span className="rk">Refrigerant</span><span className={`rv ${!state.knowsRefrigerant ? 'est' : ''}`}>{state.knowsRefrigerant ? state.refrigerantType : 'R-32 (assumed)'}</span></div>
          </div>
        )}

        <div className="review-group">
          <h4>Scope 1 · Stationary & mobile combustion</h4>
          <div className="review-row"><span className="rk">Boiler / steam plant</span><span className="rv">{state.stationary.boiler.has ? (state.stationary.boiler.fuel + ' · ' + (state.stationary.boiler.amount || '—') + ' /mo') : 'None'}</span></div>
          <div className="review-row"><span className="rk">Furnaces / lab heaters</span><span className="rv">{state.stationary.furnace.has ? (state.stationary.furnace.fuel + ' · ' + (state.stationary.furnace.amount || '—') + ' /mo') : 'None'}</span></div>
          <div className="review-row"><span className="rk">Fuel-fired water heaters</span><span className="rv">{state.stationary.waterHeater.has ? (state.stationary.waterHeater.fuel + ' · ' + (state.stationary.waterHeater.amount || '—') + ' /mo') : 'None'}</span></div>
          <div className="review-row"><span className="rk">Ambulances</span><span className="rv">{state.mobile.ambulance.has ? state.mobile.ambulance.count + ' × ' + state.mobile.ambulance.fuel : 'None'}</span></div>
          <div className="review-row"><span className="rk">Maintenance vehicles</span><span className="rv">{state.mobile.maintenance.has ? state.mobile.maintenance.count + ' × ' + state.mobile.maintenance.fuel : 'None'}</span></div>
          <div className="review-row"><span className="rk">Utility / golf carts</span><span className="rv">{state.mobile.utility.has ? state.mobile.utility.count + ' × ' + state.mobile.utility.fuel : 'None'}</span></div>
        </div>

        <div className="review-group">
          <h4>Scope 1 · Fugitive & process</h4>
          <div className="review-row"><span className="rk">Laboratory gas leaks</span><span className="rv">{ca.labGas.has ? (ca.labGas.type || 'Not specified') + ' · ' + (ca.labGas.amount || '—') + ' kg/yr' : 'None'}</span></div>
          <div className="review-row"><span className="rk">Laboratory process emissions</span><span className="rv">{ca.labProcess.has ? (ca.labProcess.description || 'Reported') : 'None'}</span></div>
          <div className="review-row"><span className="rk">On-site wastewater treatment</span><span className="rv">{ca.wastewater.has ? (ca.wastewater.biogasCaptured ? 'Biogas captured' : 'Potential methane release') : 'None'}</span></div>
          <div className="review-row"><span className="rk">On-site waste incineration</span><span className="rv">{ca.incineration.has ? (ca.incineration.type || 'Not specified') + ' · ' + (ca.incineration.amount || '—') + ' kg/mo' : 'None'}</span></div>
        </div>

        <div className="review-group">
          <h4>Scope 2 · Purchased steam / heating / cooling</h4>
          <div className="review-row"><span className="rk">Purchased energy</span><span className="rv">{ca.purchasedSteam.has ? (ca.purchasedSteam.type || 'Steam') + ' · ' + (ca.purchasedSteam.units || '—') + ' /mo' : 'None reported'}</span></div>
        </div>

        {state.buildings.length > 0 && (
          <div className="review-group">
            <h4>Buildings ({state.buildings.length})</h4>
            {state.buildings.map((b: any, i: number) => (
              <React.Fragment key={i}>
                <div className="review-row"><span className="rk">{b.name || 'Unnamed'}</span><span className="rv">{b.kwh || '—'} kWh/mo</span></div>
                <div className="review-row"><span className="rk">&nbsp;&nbsp;&nbsp;Assets</span><span className="rv">{[b.hasDG && 'DG set', b.hasChiller && 'Chiller', b.hasSolar && 'Solar', b.hasBoiler && 'Boiler'].filter(Boolean).join(', ') || '—'}</span></div>
                {b.floors.length > 0 && (
                  <div className="review-row"><span className="rk">&nbsp;&nbsp;&nbsp;Floors logged</span><span className="rv">{b.floors.length}</span></div>
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </>
    );
  };

  // Confidence progress calculation
  const cats = [
    { touched: !!state.electricityKwh, actual: !!state.electricityKwh },
    { touched: state.hasDG || state.hasLPG || state.hasFleet, actual: (state.hasDG ? !!state.dieselLiters : true) && (state.hasLPG ? !!state.lpgKg : true) },
    { touched: state.granularity !== 'floor' ? !!state.acCount : state.buildings.some(b => b.floors.length), actual: state.granularity !== 'floor' ? (!!state.acCount && state.knowsRefrigerant) : state.buildings.some(b => b.floors.length) },
    { touched: state.buildings.length > 0, actual: state.buildings.length > 0 && state.buildings.every(b => b.kwh) },
  ];
  const filled = cats.filter(c => c.touched).length;
  const pct = Math.round((filled / cats.length) * 100);

  const getStepTitle = (s: string) => {
    if (s === 'buildings') return state.granularity === 'floor' ? 'Buildings & floors' : 'Buildings';
    return meta[s].title;
  };

  const isLast = stepIndex === visibleSteps.length - 1;
  const isOptionalStep = currentStep === 'buildings' || currentStep === 'campus-assets';

  return (
    <div className="intake-root">
      <div className="shell">
        <aside className="rail">
          <div className="brand">
            <svg viewBox="0 0 24 24" stroke="var(--cyan)" strokeWidth="1.6" fill="none"><path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6" /></svg>
            <div className="brand-text">
              <div className="t1">University Climate Intake</div>
              <div className="t2">Scope 1 & 2 · Emissions data</div>
            </div>
          </div>
          <div className="confidence-block">
            <div className="confidence-label"><span>Data readiness</span><b>{pct}%</b></div>
            <div className="conf-bar">
              {cats.map((c, i) => {
                let cls = '';
                if (c.touched && c.actual) cls = 'actual';
                else if (c.touched && !c.actual) cls = 'estimate';
                return <div key={i} className={`conf-seg ${cls}`}></div>;
              })}
            </div>
            <div className="conf-note">
              {pct === 0 ? 'Answer a few questions — defaults fill the rest.' : pct < 100 ? 'Green = your actual data. Amber = filled from a typical default.' : 'All core categories captured. Nice work.'}
            </div>
          </div>
          <ul className="steps">
            {visibleSteps.map((s, i) => {
              const cls = i < stepIndex ? 'done' : (i === stepIndex ? 'active' : '');
              const optional = (s === 'buildings' || s === 'campus-assets') ? <span className="skip-tag">optional</span> : null;
              return (
                <li key={s} className={`step-item ${cls}`} onClick={() => { if (i <= stepIndex) setStepIndex(i); }}>
                  <span className="step-icon">
                    {i < stepIndex ? <svg viewBox="0 0 24 24">{tickIcon}</svg> : <svg viewBox="0 0 24 24" stroke="currentColor" fill="none">{meta[s].icon}</svg>}
                  </span>
                  <span>{getStepTitle(s)}</span>
                  {optional}
                </li>
              );
            })}
          </ul>
        </aside>

        <main className="main">
          <div className="topline">
            <span className="eyebrow">Step {stepIndex + 1} of {visibleSteps.length}</span>
            <button className="save-later" onClick={handleSaveLater}>{saveText}</button>
          </div>
          
          <div id="stepPanel">
            {currentStep === 'welcome' && renderWelcome()}
            {currentStep === 'context' && renderContext()}
            {currentStep === 'electricity' && renderElectricity()}
            {currentStep === 'combustion' && renderCombustion()}
            {currentStep === 'campus-assets' && renderCampusAssets()}
            {currentStep === 'cooling' && renderCooling()}
            {currentStep === 'buildings' && renderBuildings()}
            {currentStep === 'review' && renderReview()}
          </div>

          <div className="nav-row">
            <div>
              {stepIndex > 0 ? (
                <button className="btn btn-ghost" onClick={() => { setStepIndex(stepIndex - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Back</button>
              ) : (
                <span className="time-est">≈ 6 min with full detail</span>
              )}
            </div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              {isOptionalStep && (
                <button className="btn-skip" onClick={() => { setStepIndex(stepIndex + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Skip for now</button>
              )}
              <button className="btn btn-primary" onClick={() => {
                if (isLast) submitForm();
                else { setStepIndex(stepIndex + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }
              }}>{isLast ? 'Submit' : 'Continue'}</button>
            </div>
          </div>
        </main>
      </div>

      <div className={`stamp-overlay ${showStamp ? 'show' : ''}`}>
        <div className={`stamp ${showStamp ? 'show' : ''}`}>
          Data logged
          <small>Thank you — Sustainability Cell will review</small>
        </div>
      </div>
    </div>
  );
}
