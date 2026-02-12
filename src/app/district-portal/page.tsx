"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// ========== TYPES ==========
interface CheckItem { name: string; status: "pass" | "fail" | "warn"; }
interface School {
  id: number; name: string; address: string; type: string; region: string;
  status: "compliant" | "in-progress" | "critical"; compliance: number;
  priorityItems: number; lastInspected: string; sqft: string;
  students: number; checks: CheckItem[]; nextInspection: string;
  image: string;
}

// ========== DATA GENERATION ==========
const regions = ["North", "South", "East", "West", "Central"];
const schoolTypes = ["Elementary", "Middle", "High School", "Early Childhood", "K-8", "Alternative"];
const statuses: ("compliant" | "in-progress" | "critical")[] = ["compliant", "in-progress", "critical"];
const statusWeights = [0.33, 0.50, 0.17];
const streets = ["Oak","Main","Elm","Pine","Maple","Cedar","Walnut","Birch","Park","Lake","River","Spring","Hill","Valley","Forest","Ridge","Meadow","Brook"];
const suffixes = ["St","Ave","Blvd","Dr","Ln","Way"];
const lastNamePool = ["Washington","Lincoln","Jefferson","Kennedy","Roosevelt","Adams","Franklin","Hamilton","Madison","Jackson","Monroe","Harrison","Carter","Reagan","Marshall","Grant","Lee","Davis","King","Johnson","Anderson","Taylor","Martinez","Garcia","Lopez","Williams","Brown","Wilson","Thomas","Harris","Clark","Lewis","Robinson","Walker","Young","Allen","Wright","Scott","Torres","Hill","Green","Baker","Nelson","Mitchell","Campbell","Roberts","Turner","Phillips","Evans","Edwards","Collins","Stewart","Morris","Murphy","Rivera","Cook","Rogers","Morgan","Peterson","Cooper","Reed","Bailey","Bell","Howard","Ward","Cox","Richardson","Russell","Brooks","Gray","Price","Bennett","Wood","Barnes","Ross","Henderson","Coleman","Jenkins","Perry","Powell","Long","Patterson","Hughes","Flores","Simmons","Foster","Gonzales","Bryant","Alexander","George","Dixon","Boyd"];
const systemChecks = ["Fire Alarm System","Sprinkler System","Emergency Exits","Fire Extinguishers","Emergency Lighting","Kitchen Suppression","Smoke Detectors","Pull Stations","Egress Signage","Fire Doors","Standpipe System","Elevator Recall"];

function randomPick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function weightedStatus(): "compliant" | "in-progress" | "critical" {
  const r = Math.random(); let c = 0;
  for (let i = 0; i < statuses.length; i++) { c += statusWeights[i]; if (r < c) return statuses[i]; }
  return statuses[0];
}

// Deterministic school images using picsum with seed
function schoolImage(id: number): string {
  // Use specific picsum IDs that look like buildings/schools
  const buildingIds = [101,103,164,174,183,199,209,211,224,238,248,256,260,271,274,279,281,286,290,299,301,304,308,312,316,319,322,325,328,335,338,341,344,349,352,356,358,362,365,368,372,376,380,384,387,390,393,396,399,402,405,408,411,414,417,420,423,426,429,432,435,438,441,444,447,450,453,456,459,462];
  return `https://picsum.photos/seed/school${buildingIds[id % buildingIds.length]}/600/400`;
}

function generateSchools(): School[] {
  const names = [...lastNamePool];
  const result: School[] = [];
  for (let i = 1; i <= 70; i++) {
    const type = randomPick(schoolTypes);
    const lastName = names.length > 0
      ? names.splice(Math.floor(Math.random() * names.length), 1)[0]
      : randomPick(["Heritage","Horizon","Summit","Crestview","Lakeview"]);
    const status = weightedStatus();
    const compliance = status === "compliant" ? 90 + Math.floor(Math.random()*11) : status === "in-progress" ? 55 + Math.floor(Math.random()*30) : 20 + Math.floor(Math.random()*35);
    const priorityItems = status === "compliant" ? Math.floor(Math.random()*2) : status === "in-progress" ? 2 + Math.floor(Math.random()*5) : 5 + Math.floor(Math.random()*8);
    const region = regions[i % 5];
    const daysAgo = Math.floor(Math.random()*90);
    const inspDate = new Date(Date.now() - daysAgo*86400000);
    const sqft = type === "High School" ? 120000+Math.floor(Math.random()*80000) : type === "Middle" ? 80000+Math.floor(Math.random()*40000) : 40000+Math.floor(Math.random()*30000);
    const checks: CheckItem[] = systemChecks.map(s => ({
      name: s,
      status: compliance > 85 ? (Math.random()>0.1?"pass":"warn") : compliance > 55 ? (Math.random()>0.4?"pass":Math.random()>0.5?"warn":"fail") : (Math.random()>0.3?"fail":Math.random()>0.5?"warn":"pass") as "pass"|"fail"|"warn"
    }));
    result.push({
      id: i, name: `${lastName} ${type}`,
      address: `${1000+Math.floor(Math.random()*8000)} ${randomPick(streets)} ${randomPick(suffixes)}`,
      type, region, status, compliance, priorityItems,
      lastInspected: inspDate.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}),
      sqft: sqft.toLocaleString(), students: Math.floor(sqft/60),
      checks, nextInspection: new Date(Date.now() + (Math.floor(Math.random()*60)+1)*86400000).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}),
      image: schoolImage(i),
    });
  }
  return result;
}

// ========== MAIN COMPONENT ==========
export default function DistrictPortal() {
  const [schools, setSchools] = useState<School[]>([]);
  const [currentTab, setCurrentTab] = useState("overview");
  const [currentFilter, setCurrentFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [kpiPopup, setKpiPopup] = useState<string | null>(null);
  const [categoryPopup, setCategoryPopup] = useState<string | null>(null);
  const [marshalPopup, setMarshalPopup] = useState<number | null>(null);
  const [reportPopup, setReportPopup] = useState<number | null>(null);
  const perPage = 12;
  const initialized = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add Location form state
  const [newSchool, setNewSchool] = useState({ name: "", address: "", type: "Elementary", region: "North", image: "" });
  const [uploadPreview, setUploadPreview] = useState<string>("");

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      setSchools(generateSchools());
    }
  }, []);

  const compliantCount = schools.filter(s => s.status === "compliant").length;
  const inProgressCount = schools.filter(s => s.status === "in-progress").length;
  const criticalCount = schools.filter(s => s.status === "critical").length;

  const getFilteredSchools = useCallback(() => {
    let list = [...schools];
    if (searchQuery) list = list.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.region.toLowerCase().includes(searchQuery.toLowerCase()) || s.type.toLowerCase().includes(searchQuery.toLowerCase()));
    if (currentFilter !== "all") list = list.filter(s => s.status === currentFilter);
    return list;
  }, [schools, searchQuery, currentFilter]);

  const filteredSchools = getFilteredSchools();
  const totalPages = Math.ceil(filteredSchools.length / perPage);
  const pageSchools = filteredSchools.slice((currentPage-1)*perPage, currentPage*perPage);

  const switchTab = (tab: string) => {
    setCurrentTab(tab);
    setCurrentPage(1);
    setSelectedSchool(null);
  };

  const openSchoolProfile = (id: number) => {
    const s = schools.find(x => x.id === id);
    if (s) { setSelectedSchool(s); setCurrentTab("profile"); }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, schoolId?: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (schoolId) {
        // Update existing school image
        setSchools(prev => prev.map(s => s.id === schoolId ? { ...s, image: dataUrl } : s));
        if (selectedSchool?.id === schoolId) {
          setSelectedSchool(prev => prev ? { ...prev, image: dataUrl } : null);
        }
      } else {
        // For the add-location form
        setUploadPreview(dataUrl);
        setNewSchool(prev => ({ ...prev, image: dataUrl }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddSchool = () => {
    if (!newSchool.name || !newSchool.address) return;
    const id = schools.length + 1;
    const status = "in-progress" as const;
    const compliance = 0;
    const checks: CheckItem[] = systemChecks.map(s => ({ name: s, status: "fail" as const }));
    const now = new Date();
    const added: School = {
      id, name: newSchool.name, address: newSchool.address, type: newSchool.type, region: newSchool.region,
      status, compliance, priorityItems: 12, sqft: "0", students: 0,
      lastInspected: "Not yet inspected",
      checks, nextInspection: new Date(Date.now() + 14*86400000).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}),
      image: newSchool.image || schoolImage(id),
    };
    setSchools(prev => [...prev, added]);
    setNewSchool({ name: "", address: "", type: "Elementary", region: "North", image: "" });
    setUploadPreview("");
    setShowAddModal(false);
  };

  const tabTitles: Record<string, string> = {
    overview: "District Overview", schools: "All Schools", compliance: "Compliance Tracker",
    marshal: "Fire Marshal Coordination", reports: "Reports & Documents", profile: selectedSchool?.name || "School Profile"
  };

  const tabs = ["overview","schools","compliance","marshal","reports"];
  const navItems = [
    { id: "overview", label: "Overview", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px]"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
    { id: "schools", label: "All Schools", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px]"><path d="M2 20h20M4 20V8l8-4 8 4v12"/><path d="M9 20v-6h6v6"/><path d="M9 12h6"/></svg>, badge: String(schools.length) },
    { id: "compliance", label: "Compliance", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px]"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg> },
    { id: "marshal", label: "Fire Marshal", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px]"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, badge: String(criticalCount) },
    { id: "reports", label: "Reports & Docs", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px]"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
    { id: "schedule", label: "Schedule", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px]"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
  ];

  // Chart data
  const complianceCats = [
    {label:"Fire Alarms", pct:82, color:"#E87722"}, {label:"Sprinkler Systems", pct:71, color:"#E87722"},
    {label:"Emergency Exits", pct:91, color:"#22C55E"}, {label:"Fire Extinguishers", pct:88, color:"#22C55E"},
    {label:"Emergency Lighting", pct:64, color:"#F59E0B"}, {label:"Kitchen Suppression", pct:58, color:"#EF4444"},
    {label:"Smoke Detectors", pct:86, color:"#22C55E"}, {label:"Egress Signage", pct:93, color:"#22C55E"},
  ];

  const donutData = [
    {label:"Compliant", count:compliantCount, color:"#22C55E"},
    {label:"In Progress", count:inProgressCount, color:"#F59E0B"},
    {label:"Critical", count:criticalCount, color:"#EF4444"},
  ];
  const donutTotal = donutData.reduce((s,d) => s+d.count, 0);
  const cx=80, cy=80, r=60, sw=20;
  let donutOffset = 0;
  const donutPaths = donutData.map(d => {
    const pct = d.count / (donutTotal || 1);
    const dash = pct * 2 * Math.PI * r;
    const gap = 2 * Math.PI * r - dash;
    const off = donutOffset;
    donutOffset += dash;
    return { ...d, dash, gap, offset: off };
  });

  const activities = [
    {color:"#22C55E", text:<><strong>Adams Elementary</strong> passed Fire Marshal inspection</>, time:"2 hours ago", schoolHint:"Adams"},
    {color:"#E87722", text:<>Compliance report generated for <strong>Region North</strong></>, time:"5 hours ago", schoolHint:""},
    {color:"#EF4444", text:<><strong>Harrison High School</strong> — critical sprinkler deficiency flagged</>, time:"Yesterday", schoolHint:"Harrison"},
    {color:"#3B82F6", text:<>Fire Marshal walkthrough scheduled for <strong>Kennedy Middle</strong></>, time:"Yesterday", schoolHint:"Kennedy"},
    {color:"#22C55E", text:<><strong>Franklin K-8</strong> remediation complete — moved to Compliant</>, time:"2 days ago", schoolHint:"Franklin"},
    {color:"#F59E0B", text:<>Kitchen suppression work order created for <strong>Jefferson Elementary</strong></>, time:"3 days ago", schoolHint:"Jefferson"},
  ];

  const deficiencyData = [
    {label:"Kitchen Suppression", total:62, resolved:28, color:"#EF4444"}, {label:"Sprinkler Systems", total:54, resolved:31, color:"#E87722"},
    {label:"Emergency Lighting", total:48, resolved:30, color:"#F59E0B"}, {label:"Fire Alarms", total:43, resolved:29, color:"#E87722"},
    {label:"Smoke Detectors", total:38, resolved:28, color:"#F59E0B"}, {label:"Fire Extinguishers", total:35, resolved:25, color:"#22C55E"},
    {label:"Emergency Exits", total:28, resolved:20, color:"#22C55E"}, {label:"Egress Signage", total:22, resolved:18, color:"#22C55E"},
    {label:"Fire Doors", total:17, resolved:9, color:"#F59E0B"},
  ];
  const maxDef = Math.max(...deficiencyData.map(i => i.total));

  const marshalItems = [
    {campus:"Harrison High School",date:"Feb 14, 2026",type:"Re-inspection",status:"critical" as const,notes:"Sprinkler deficiency follow-up required"},
    {campus:"Monroe Middle",date:"Feb 16, 2026",type:"Annual Inspection",status:"in-progress" as const,notes:"Kitchen hood suppression review"},
    {campus:"Grant Elementary",date:"Feb 18, 2026",type:"Follow-up",status:"in-progress" as const,notes:"Emergency lighting corrections verified"},
    {campus:"Carter K-8",date:"Feb 21, 2026",type:"Annual Inspection",status:"in-progress" as const,notes:"Full campus walkthrough scheduled"},
    {campus:"Wilson High School",date:"Feb 24, 2026",type:"Re-inspection",status:"critical" as const,notes:"Fire alarm panel replacement verification"},
    {campus:"Taylor Elementary",date:"Feb 26, 2026",type:"Annual Inspection",status:"pending" as const,notes:"First-time assessment under new contract"},
    {campus:"Anderson Middle",date:"Mar 1, 2026",type:"Follow-up",status:"in-progress" as const,notes:"Egress signage updates verification"},
    {campus:"Martinez High School",date:"Mar 3, 2026",type:"Annual Inspection",status:"pending" as const,notes:"Comprehensive systems review"},
    {campus:"Clark Elementary",date:"Mar 6, 2026",type:"Re-inspection",status:"critical" as const,notes:"Smoke detector replacement confirmation"},
  ];

  const reportsList = [
    {icon:"📊",title:"District Master Compliance Summary",desc:"Consolidated overview of all campuses with risk prioritization",date:"Feb 7, 2026"},
    {icon:"📋",title:"Region North Compliance Report",desc:"Individual reports for campuses in the North region",date:"Feb 5, 2026"},
    {icon:"📋",title:"Region South Compliance Report",desc:"Individual reports for campuses in the South region",date:"Feb 3, 2026"},
    {icon:"📋",title:"Region East Compliance Report",desc:"Individual reports for campuses in the East region",date:"Feb 1, 2026"},
    {icon:"📋",title:"Region West Compliance Report",desc:"Individual reports for campuses in the West region",date:"Jan 30, 2026"},
    {icon:"📋",title:"Region Central Compliance Report",desc:"Individual reports for campuses in the Central region",date:"Jan 28, 2026"},
    {icon:"💰",title:"District-Wide Cost Estimate",desc:"Detailed remediation cost breakdown by campus and priority level",date:"Feb 6, 2026"},
    {icon:"📄",title:"Fire Marshal Correspondence Log",desc:"All communications and inspection results with the Fire Marshal office",date:"Feb 7, 2026"},
    {icon:"📅",title:"Remediation Timeline & Schedule",desc:"Phased timeline for all approved compliance work",date:"Feb 4, 2026"},
    {icon:"📄",title:"Scope of Work — Full Service",desc:"Original signed scope of work and engagement terms",date:"Jan 10, 2026"},
  ];

  const upcomingInspections = schools.filter(s => s.status !== "compliant").slice(0, 6);

  return (
    <div className="font-sans overflow-x-hidden" style={{ fontFamily: "'DM Sans', sans-serif", background: "#1A1A2E", color: "#F1F1F6", minHeight: "100vh" }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
        .dp-scrollbar::-webkit-scrollbar { width: 6px; }
        .dp-scrollbar::-webkit-scrollbar-track { background: #222240; }
        .dp-scrollbar::-webkit-scrollbar-thumb { background: #2A2A4A; border-radius: 3px; }
        @keyframes dpFadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .dp-fade-up { animation: dpFadeUp 0.5s ease both; }
        .max-md\\:scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>

      {/* MOBILE OVERLAY */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-[95] md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* SIDEBAR */}
      <nav className={`fixed left-0 top-0 bottom-0 w-[260px] flex flex-col z-[100] border-r border-white/[0.06] transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : 'max-md:-translate-x-full'}`} style={{ background: "#222240" }}>
        <div className="px-6 py-5 border-b border-white/[0.06] flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-base text-white" style={{ background: "#E87722" }}>CS</div>
          <div className="text-[13px] font-semibold leading-tight"><span style={{ color: "#E87722" }}>Chatman</span> Security<br/>& Fire</div>
        </div>
        <div className="flex-1 p-3 overflow-y-auto dp-scrollbar">
          <div className="text-[10px] font-bold tracking-[1.5px] text-gray-500 px-3 pt-3 pb-2 uppercase">Main</div>
          {navItems.slice(0, 4).map(item => (
            <div key={item.id} onClick={() => { switchTab(item.id); setSidebarOpen(false); }} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-sm mb-0.5 transition-all ${currentTab === item.id || (currentTab === "profile" && item.id === "schools") ? "font-semibold" : "text-gray-400 hover:bg-white/5 hover:text-white"}`} style={currentTab === item.id || (currentTab === "profile" && item.id === "schools") ? { background: "rgba(232,119,34,0.12)", color: "#E87722" } : {}}>
              {item.icon}
              {item.label}
              {item.badge && <span className="ml-auto text-[10px] font-bold px-[7px] py-0.5 rounded-[10px] text-white" style={{ background: "#EF4444" }}>{item.badge}</span>}
            </div>
          ))}
          <div className="text-[10px] font-bold tracking-[1.5px] text-gray-500 px-3 pt-3 pb-2 uppercase">Reports</div>
          {navItems.slice(4).map(item => (
            <div key={item.id} onClick={() => { switchTab(item.id); setSidebarOpen(false); }} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-sm mb-0.5 transition-all ${currentTab === item.id ? "font-semibold" : "text-gray-400 hover:bg-white/5 hover:text-white"}`} style={currentTab === item.id ? { background: "rgba(232,119,34,0.12)", color: "#E87722" } : {}}>
              {item.icon}
              {item.label}
            </div>
          ))}
        </div>
        <div className="px-5 py-4 border-t border-white/[0.06] text-xs text-gray-500">
          <div className="inline-block text-[10px] font-bold px-2 py-[3px] rounded text-white tracking-[0.5px] mb-1.5" style={{ background: "#E87722" }}>DEMO</div>
          <div>District Compliance Portal v2.0</div>
          <div className="mt-1">chatmansecurityandfire.com</div>
        </div>
      </nav>

      {/* HEADER */}
      <header className="fixed top-0 left-[260px] right-0 h-16 backdrop-blur-[20px] border-b border-white/[0.06] flex items-center justify-between px-8 z-[90] max-md:left-0 max-md:px-4" style={{ background: "rgba(26,26,46,0.85)" }}>
        <div className="flex items-center gap-4">
          <button className="max-md:block hidden shrink-0" onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E87722" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          {currentTab === "profile" && (
            <button onClick={() => switchTab("schools")} className="mr-1 w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 border border-white/[0.08] hover:border-[#E87722] hover:text-[#E87722] transition-all" style={{ background: "#2A2A4A" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
            </button>
          )}
          <h1 className="text-lg font-semibold">{tabTitles[currentTab] || "Dashboard"}</h1>
          <span className="px-3 py-1 rounded-[20px] text-xs text-gray-400 border border-white/[0.08]" style={{ background: "#2A2A4A" }}>{schools.length} Campuses</span>
        </div>
        <div className="flex items-center gap-4 max-md:gap-2">
          <button onClick={() => alert("Export feature — available in full version")} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] text-white border border-white/[0.08] transition-all hover:border-[#E87722] hover:text-[#E87722] max-md:hidden" style={{ background: "#2A2A4A", fontFamily: "inherit" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export
          </button>
          <button onClick={() => alert("Schedule a consultation at chatmansecurityandfire.com")} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] text-white font-medium transition-all hover:brightness-90 max-md:px-3 max-md:text-[12px]" style={{ background: "#E87722", fontFamily: "inherit" }}>Get Started</button>
        </div>
      </header>

      {/* MAIN */}
      <main className="ml-[260px] mt-16 p-7 min-h-[calc(100vh-64px)] max-md:ml-0 max-md:p-4">
        {/* TABS (hide when on profile) */}
        {currentTab !== "profile" && (
          <div className="flex gap-1 p-1 rounded-xl w-fit mb-7 max-md:w-full max-md:overflow-x-auto max-md:scrollbar-hide" style={{ background: "#222240", scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {tabs.map(tab => (
              <button key={tab} onClick={() => switchTab(tab)} className={`px-5 py-2 rounded-lg text-[13px] font-medium transition-all border-none capitalize whitespace-nowrap ${currentTab === tab ? "text-white font-semibold" : "text-gray-400 hover:text-white"}`} style={currentTab === tab ? { background: "#E87722" } : { background: "transparent" }}>
                {tab === "marshal" ? "Fire Marshal" : tab}
              </button>
            ))}
          </div>
        )}

        {/* ======= OVERVIEW TAB ======= */}
        {currentTab === "overview" && (
          <div>
            <div className="grid grid-cols-4 gap-4 mb-7 max-xl:grid-cols-2 max-md:grid-cols-1">
              {[
                { key: "total", icon: "🏫", label: "Total Campuses", value: String(schools.length), sub: "Across 5 regions", iconBg: "rgba(59,130,246,0.12)", iconColor: "#3B82F6", valueColor: "#F1F1F6", glowColor: "#3B82F6" },
                { key: "compliant", icon: "✓", label: "Fully Compliant", value: String(compliantCount), trend: `${Math.round(compliantCount/schools.length*100)}% of district`, trendBg: "rgba(34,197,94,0.12)", trendColor: "#22C55E", iconBg: "rgba(34,197,94,0.12)", iconColor: "#22C55E", valueColor: "#22C55E", glowColor: "#22C55E" },
                { key: "progress", icon: "⚠", label: "In Progress", value: String(inProgressCount), sub: "Remediation underway", iconBg: "rgba(245,158,11,0.12)", iconColor: "#F59E0B", valueColor: "#F59E0B", glowColor: "#F59E0B" },
                { key: "critical", icon: "🔥", label: "Critical Issues", value: String(criticalCount), sub: "Requires immediate action", iconBg: "rgba(239,68,68,0.12)", iconColor: "#EF4444", valueColor: "#EF4444", glowColor: "#EF4444" },
              ].map((kpi, i) => (
                <div key={i} onClick={() => setKpiPopup(kpi.key)} className="relative overflow-hidden rounded-xl p-5 border border-white/[0.06] transition-all hover:-translate-y-0.5 hover:border-[#E87722]/40 cursor-pointer dp-fade-up" style={{ background: "#252545", animationDelay: `${i*0.05}s` }}>
                  <div className="w-10 h-10 rounded-[10px] flex items-center justify-center mb-3.5 text-lg" style={{ background: kpi.iconBg, color: kpi.iconColor }}>{kpi.icon}</div>
                  <div className="text-[13px] text-gray-400 mb-1.5">{kpi.label}</div>
                  <div className="text-[28px] font-bold" style={{ fontFamily: "'Space Mono', monospace", color: kpi.valueColor }}>{kpi.value}</div>
                  {kpi.sub && <div className="text-xs text-gray-500 mt-1">{kpi.sub}</div>}
                  {kpi.trend && <div className="inline-flex items-center gap-[3px] text-[11px] font-semibold mt-2 px-2 py-[3px] rounded" style={{ background: kpi.trendBg, color: kpi.trendColor }}>{kpi.trend}</div>}
                  <div className="text-[10px] text-gray-500 mt-2 group-hover:text-[#E87722]">Click for details &rarr;</div>
                  <div className="absolute -top-[30px] -right-[30px] w-[100px] h-[100px] rounded-full opacity-[0.08] pointer-events-none" style={{ background: kpi.glowColor }} />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-7 max-xl:grid-cols-1">
              <div className="rounded-xl p-6 border border-white/[0.06] dp-fade-up" style={{ background: "#252545", animationDelay: "0.25s" }}>
                <h3 className="text-sm font-semibold mb-5">Compliance by Category</h3>
                <div className="flex flex-col gap-3">
                  {complianceCats.map((c, i) => (
                    <div key={i} className="flex items-center gap-3 cursor-pointer hover:bg-white/[0.03] rounded-lg px-1 py-0.5 -mx-1 transition-all" onClick={() => setCategoryPopup(c.label)}>
                      <div className="w-[130px] text-xs text-gray-400 shrink-0">{c.label}</div>
                      <div className="flex-1 h-7 rounded-md overflow-hidden" style={{ background: "#2A2A4A" }}>
                        <div className="h-full rounded-md flex items-center pl-2.5 transition-all duration-1000" style={{ width: `${c.pct}%`, background: c.color }}>
                          <span className="ml-auto pr-2.5 text-[11px] font-semibold text-white" style={{ fontFamily: "'Space Mono', monospace" }}>{c.pct}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl p-6 border border-white/[0.06] dp-fade-up" style={{ background: "#252545", animationDelay: "0.3s" }}>
                <h3 className="text-sm font-semibold mb-5">Campus Status Breakdown</h3>
                <div className="flex items-center gap-8">
                  <svg width="160" height="160" viewBox="0 0 160 160">
                    <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={sw}/>
                    {donutPaths.map((d, i) => (
                      <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={d.color} strokeWidth={sw} strokeDasharray={`${d.dash} ${d.gap}`} strokeDashoffset={-d.offset} strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease" }}/>
                    ))}
                    <text x={cx} y={cy-4} textAnchor="middle" fill="#fff" fontSize="24" fontWeight="700" fontFamily="Space Mono">{donutTotal}</text>
                    <text x={cx} y={cy+14} textAnchor="middle" fill="#9CA3AF" fontSize="10">campuses</text>
                  </svg>
                  <div className="flex flex-col gap-2.5">
                    {donutData.map((d, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-[13px]">
                        <div className="w-2.5 h-2.5 rounded-[3px] shrink-0" style={{ background: d.color }} />
                        <span>{d.label}</span>
                        <span className="ml-auto font-bold" style={{ fontFamily: "'Space Mono', monospace" }}>{d.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 max-xl:grid-cols-1">
              <div className="rounded-xl p-6 border border-white/[0.06] dp-fade-up" style={{ background: "#252545" }}>
                <h3 className="text-sm font-semibold mb-4">Recent Activity</h3>
                {activities.map((a, i) => {
                  const matchedSchool = a.schoolHint ? schools.find(s => s.name.toLowerCase().includes(a.schoolHint.toLowerCase())) : null;
                  return (
                    <div key={i} className={`flex gap-3 py-2.5 ${matchedSchool ? 'cursor-pointer hover:bg-white/[0.03] rounded-lg px-1 -mx-1' : ''} transition-all ${i < activities.length-1 ? "border-b border-white/[0.04]" : ""}`} onClick={() => matchedSchool && openSchoolProfile(matchedSchool.id)}>
                      <div className="w-2 h-2 rounded-full mt-[5px] shrink-0" style={{ background: a.color }} />
                      <div className="flex-1"><div className="text-[13px] text-gray-400 leading-relaxed">{a.text}</div><div className="text-[11px] text-gray-500 mt-0.5">{a.time}{matchedSchool ? <span className="ml-2" style={{ color: '#E87722' }}>&rarr; View profile</span> : ''}</div></div>
                    </div>
                  );
                })}
              </div>
              <div className="rounded-xl p-6 border border-white/[0.06] dp-fade-up" style={{ background: "#252545" }}>
                <h3 className="text-sm font-semibold mb-4">Upcoming Inspections</h3>
                {upcomingInspections.map((s, i) => (
                  <div key={i} onClick={() => openSchoolProfile(s.id)} className={`flex gap-3 py-2.5 cursor-pointer hover:bg-white/[0.03] rounded-lg px-1 -mx-1 transition-all ${i < upcomingInspections.length-1 ? "border-b border-white/[0.04]" : ""}`}>
                    <div className="w-2 h-2 rounded-full mt-[5px] shrink-0" style={{ background: s.status === "critical" ? "#EF4444" : "#F59E0B" }} />
                    <div className="flex-1">
                      <div className="text-[13px] text-gray-400"><strong className="text-white font-semibold">{s.name}</strong></div>
                      <div className="text-[11px] text-gray-500 mt-0.5">{s.nextInspection} &bull; {s.region} Region <span style={{ color: '#E87722' }}>&rarr;</span></div>
                    </div>
                    <StatusPill status={s.status} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* KPI POPUP */}
        {kpiPopup && (() => {
          const kpiSchools = kpiPopup === 'total' ? schools
            : kpiPopup === 'compliant' ? schools.filter(s => s.status === 'compliant')
            : kpiPopup === 'progress' ? schools.filter(s => s.status === 'in-progress')
            : schools.filter(s => s.status === 'critical');
          const sorted = [...kpiSchools].sort((a, b) => b.compliance - a.compliance);
          const top5 = sorted.slice(0, 5);
          const filterVal = kpiPopup === 'total' ? 'all' : kpiPopup === 'compliant' ? 'compliant' : kpiPopup === 'progress' ? 'in-progress' : 'critical';
          const titles: Record<string, string> = { total: 'All Campuses', compliant: 'Fully Compliant Campuses', progress: 'In-Progress Campuses', critical: 'Critical Campuses' };
          return (
            <Popup title={titles[kpiPopup] || 'Details'} onClose={() => setKpiPopup(null)}>
              <div className="text-sm text-gray-400 mb-4">{kpiSchools.length} campuses in this category across {new Set(kpiSchools.map(s => s.region)).size} regions</div>
              <div className="mb-4">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Region Breakdown</div>
                <div className="grid grid-cols-5 gap-2 max-md:grid-cols-3">
                  {regions.map(r => {
                    const cnt = kpiSchools.filter(s => s.region === r).length;
                    return (
                      <div key={r} className="rounded-lg p-2 text-center border border-white/[0.06]" style={{ background: '#1A1A2E' }}>
                        <div className="text-lg font-bold" style={{ fontFamily: "'Space Mono', monospace", color: '#E87722' }}>{cnt}</div>
                        <div className="text-[10px] text-gray-500">{r}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="mb-4">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Top 5 Schools</div>
                {top5.map((s, i) => (
                  <div key={s.id} className="flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0 cursor-pointer hover:bg-white/[0.03] rounded px-2 transition-all" onClick={() => { setKpiPopup(null); openSchoolProfile(s.id); }}>
                    <span className="text-xs font-bold text-gray-500 w-5">{i+1}</span>
                    <span className="flex-1 text-sm text-white">{s.name}</span>
                    <span className="text-xs font-bold" style={{ fontFamily: "'Space Mono', monospace", color: s.compliance > 80 ? '#22C55E' : s.compliance > 50 ? '#F59E0B' : '#EF4444' }}>{s.compliance}%</span>
                    <StatusPill status={s.status} />
                  </div>
                ))}
              </div>
              <button onClick={() => { setKpiPopup(null); setCurrentFilter(filterVal); switchTab('schools'); }} className="w-full py-2.5 rounded-lg text-[13px] font-semibold text-white transition-all hover:brightness-90" style={{ background: '#E87722' }}>
                View All {kpiSchools.length} Schools &rarr;
              </button>
            </Popup>
          );
        })()}

        {/* CATEGORY POPUP */}
        {categoryPopup && (() => {
          const cat = complianceCats.find(c => c.label === categoryPopup);
          if (!cat) return null;
          const affectedSchools = schools.filter(s => s.checks.some(c => c.name === categoryPopup && c.status !== 'pass')).slice(0, 8);
          const passCount = schools.filter(s => s.checks.some(c => c.name === categoryPopup && c.status === 'pass')).length;
          const failCount = schools.filter(s => s.checks.some(c => c.name === categoryPopup && c.status === 'fail')).length;
          const warnCount = schools.filter(s => s.checks.some(c => c.name === categoryPopup && c.status === 'warn')).length;
          return (
            <Popup title={categoryPopup} onClose={() => setCategoryPopup(null)}>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: 'Passing', value: passCount, color: '#22C55E' },
                  { label: 'Warning', value: warnCount, color: '#F59E0B' },
                  { label: 'Failing', value: failCount, color: '#EF4444' },
                ].map((st, i) => (
                  <div key={i} className="rounded-lg p-3 text-center border border-white/[0.06]" style={{ background: '#1A1A2E' }}>
                    <div className="text-xl font-bold" style={{ fontFamily: "'Space Mono', monospace", color: st.color }}>{st.value}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">{st.label}</div>
                  </div>
                ))}
              </div>
              <div className="mb-1">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">District Compliance Rate</div>
                <div className="h-3 rounded-full overflow-hidden mb-1" style={{ background: '#2A2A4A' }}>
                  <div className="h-full rounded-full" style={{ width: `${cat.pct}%`, background: cat.color }} />
                </div>
                <div className="text-right text-xs font-bold" style={{ fontFamily: "'Space Mono', monospace", color: cat.color }}>{cat.pct}%</div>
              </div>
              {affectedSchools.length > 0 && (
                <div className="mb-4 mt-3">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Schools With Issues</div>
                  {affectedSchools.map(s => (
                    <div key={s.id} className="flex items-center gap-3 py-1.5 cursor-pointer hover:bg-white/[0.03] rounded px-2 transition-all" onClick={() => { setCategoryPopup(null); openSchoolProfile(s.id); }}>
                      <span className="flex-1 text-sm text-white">{s.name}</span>
                      <StatusPill status={s.status} />
                    </div>
                  ))}
                </div>
              )}
              <button onClick={() => { setCategoryPopup(null); alert('Inspection scheduling available in full version'); }} className="w-full py-2.5 rounded-lg text-[13px] font-semibold text-white transition-all hover:brightness-90" style={{ background: '#E87722' }}>
                Schedule Inspections
              </button>
            </Popup>
          );
        })()}

        {/* ======= SCHOOLS TAB ======= */}
        {currentTab === "schools" && (
          <div className="dp-fade-up">
            {/* Toolbar */}
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <div className="relative">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input type="text" placeholder="Search schools..." value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="pl-9 pr-3.5 py-2 rounded-lg text-[13px] text-white w-[280px] max-md:w-full outline-none transition-all border border-white/[0.08] focus:border-[#E87722]" style={{ background: "#2A2A4A", fontFamily: "inherit" }} />
              </div>
              {[{label:`All (${schools.length})`,val:"all"},{label:`Compliant (${compliantCount})`,val:"compliant"},{label:`In Progress (${inProgressCount})`,val:"in-progress"},{label:`Critical (${criticalCount})`,val:"critical"}].map(f => (
                <button key={f.val} onClick={() => { setCurrentFilter(f.val); setCurrentPage(1); }} className={`px-3.5 py-1.5 rounded-[20px] text-xs transition-all border ${currentFilter === f.val ? "border-[#E87722] text-[#E87722]" : "border-white/[0.08] text-gray-400 hover:border-[#E87722] hover:text-[#E87722]"}`} style={{ background: currentFilter === f.val ? "rgba(232,119,34,0.1)" : "#2A2A4A", fontFamily: "inherit" }}>{f.label}</button>
              ))}
              <div className="ml-auto flex items-center gap-2">
                {/* View toggle */}
                <button onClick={() => setViewMode("grid")} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all border ${viewMode==="grid" ? "border-[#E87722] text-[#E87722]" : "border-white/[0.08] text-gray-400"}`} style={{ background: viewMode==="grid" ? "rgba(232,119,34,0.1)" : "#2A2A4A" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                </button>
                <button onClick={() => setViewMode("table")} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all border ${viewMode==="table" ? "border-[#E87722] text-[#E87722]" : "border-white/[0.08] text-gray-400"}`} style={{ background: viewMode==="table" ? "rgba(232,119,34,0.1)" : "#2A2A4A" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                </button>
                {/* Add Location */}
                <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] text-white font-medium transition-all hover:brightness-90 ml-2" style={{ background: "#E87722", fontFamily: "inherit" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Add Location
                </button>
              </div>
            </div>

            {/* GRID VIEW */}
            {viewMode === "grid" && (
              <div className="grid grid-cols-3 gap-4 mb-6 max-xl:grid-cols-2 max-md:grid-cols-1">
                {pageSchools.map(s => (
                  <div key={s.id} onClick={() => openSchoolProfile(s.id)} className="rounded-xl border border-white/[0.06] overflow-hidden cursor-pointer transition-all hover:border-[#E87722] hover:-translate-y-1 group" style={{ background: "#252545" }}>
                    {/* School Image */}
                    <div className="relative h-44 overflow-hidden">
                      <img src={s.image} alt={s.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${s.id}/600/400`; }} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute top-3 right-3"><StatusPill status={s.status} /></div>
                      <div className="absolute bottom-3 left-4 right-4">
                        <h3 className="text-white font-semibold text-[15px] leading-tight">{s.name}</h3>
                        <p className="text-white/70 text-[11px] mt-0.5">{s.address}</p>
                      </div>
                    </div>
                    {/* Card Body */}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <span>{s.type === 'Elementary' || s.type === 'Early Childhood' ? '\uD83C\uDFEB' : s.type === 'Middle' || s.type === 'K-8' ? '\uD83C\uDFE2' : s.type === 'High School' ? '\uD83C\uDF93' : '\uD83C\uDFEB'}</span>
                          {s.region} Region
                        </span>
                        <span className="text-xs text-gray-400">{s.type}</span>
                      </div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "#2A2A4A" }}>
                          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${s.compliance}%`, background: s.compliance > 80 ? "#22C55E" : s.compliance > 50 ? "#F59E0B" : "#EF4444" }} />
                        </div>
                        <span className="text-xs font-bold" style={{ fontFamily: "'Space Mono', monospace", color: s.compliance > 80 ? "#22C55E" : s.compliance > 50 ? "#F59E0B" : "#EF4444" }}>{s.compliance}%</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-gray-500 mb-2">
                        <span>{s.priorityItems} priority items</span>
                        <span>Inspected {s.lastInspected}</span>
                      </div>
                      <div className="text-[11px] font-semibold group-hover:translate-x-1 transition-transform" style={{ color: '#E87722' }}>View Profile &rarr;</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TABLE VIEW */}
            {viewMode === "table" && (
              <div className="rounded-xl border border-white/[0.06] overflow-hidden mb-6" style={{ background: "#252545" }}>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        {["","Campus","Region","Status","Compliance","Priority Items","Last Inspected"].map(h => (
                          <th key={h} className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-white/[0.06]">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pageSchools.map(s => (
                        <tr key={s.id} onClick={() => openSchoolProfile(s.id)} className="border-b border-white/[0.04] cursor-pointer transition-colors hover:bg-white/[0.03]">
                          <td className="px-4 py-3 w-16">
                            <img src={s.image} alt={s.name} className="w-10 h-10 rounded-lg object-cover" onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${s.id}/100/100`; }} />
                          </td>
                          <td className="px-4 py-3 text-[13px]">
                            <div className="font-semibold text-white">{s.name}</div>
                            <div className="text-[11px] text-gray-500 mt-0.5">{s.address}</div>
                          </td>
                          <td className="px-4 py-3 text-[13px] text-gray-400">{s.region}</td>
                          <td className="px-4 py-3"><StatusPill status={s.status} /></td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: "#2A2A4A" }}>
                                <div className="h-full rounded-full" style={{ width: `${s.compliance}%`, background: s.compliance > 80 ? "#22C55E" : s.compliance > 50 ? "#F59E0B" : "#EF4444" }} />
                              </div>
                              <span className="text-xs text-gray-400" style={{ fontFamily: "'Space Mono', monospace" }}>{s.compliance}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-[11px] font-semibold px-2 py-[3px] rounded`} style={{ background: s.priorityItems > 5 ? "rgba(239,68,68,0.12)" : s.priorityItems > 2 ? "rgba(245,158,11,0.12)" : "rgba(34,197,94,0.12)", color: s.priorityItems > 5 ? "#EF4444" : s.priorityItems > 2 ? "#F59E0B" : "#22C55E" }}>{s.priorityItems} items</span>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-400">{s.lastInspected}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <div className="text-[13px] text-gray-400">Showing {(currentPage-1)*perPage+1}-{Math.min(currentPage*perPage, filteredSchools.length)} of {filteredSchools.length} campuses</div>
              <div className="flex gap-1">
                {Array.from({length: totalPages}, (_, i) => i+1).map(p => (
                  <button key={p} onClick={() => setCurrentPage(p)} className={`w-8 h-8 flex items-center justify-center rounded-md text-xs transition-all border ${p === currentPage ? "text-white border-[#E87722]" : "text-gray-400 border-white/[0.08] hover:border-[#E87722] hover:text-[#E87722]"}`} style={{ background: p === currentPage ? "#E87722" : "#2A2A4A", fontFamily: "inherit" }}>{p}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ======= SCHOOL PROFILE ======= */}
        {currentTab === "profile" && selectedSchool && (
          <div className="dp-fade-up">
            {/* Hero Banner */}
            <div className="relative rounded-xl overflow-hidden mb-6 h-64">
              <img src={selectedSchool.image} alt={selectedSchool.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${selectedSchool.id}/1200/400`; }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <StatusPill status={selectedSchool.status} />
                    <span className="text-white/70 text-xs">{selectedSchool.type} &bull; {selectedSchool.region} Region</span>
                  </div>
                  <h2 className="text-3xl font-bold text-white">{selectedSchool.name}</h2>
                  <p className="text-white/70 text-sm mt-1">{selectedSchool.address}</p>
                </div>
                <div className="flex gap-2">
                  <label className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] text-white border border-white/20 cursor-pointer transition-all hover:border-[#E87722] hover:text-[#E87722]" style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
                    Update Photo
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, selectedSchool.id)} />
                  </label>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-6 gap-3 mb-6 max-xl:grid-cols-3 max-md:grid-cols-2">
              {[
                { label: "Compliance", value: `${selectedSchool.compliance}%`, color: selectedSchool.compliance > 80 ? "#22C55E" : selectedSchool.compliance > 50 ? "#F59E0B" : "#EF4444" },
                { label: "Priority Items", value: String(selectedSchool.priorityItems), color: selectedSchool.priorityItems > 5 ? "#EF4444" : selectedSchool.priorityItems > 2 ? "#F59E0B" : "#22C55E" },
                { label: "Square Footage", value: selectedSchool.sqft, color: "#F1F1F6" },
                { label: "Est. Students", value: selectedSchool.students.toLocaleString(), color: "#F1F1F6" },
                { label: "Last Inspection", value: selectedSchool.lastInspected, color: "#F1F1F6" },
                { label: "Next Inspection", value: selectedSchool.nextInspection, color: "#E87722" },
              ].map((stat, i) => (
                <div key={i} className="rounded-xl p-4 border border-white/[0.06]" style={{ background: "#252545" }}>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{stat.label}</div>
                  <div className="text-lg font-bold" style={{ fontFamily: "'Space Mono', monospace", color: stat.color }}>{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Compliance Progress */}
            <div className="rounded-xl p-6 border border-white/[0.06] mb-6" style={{ background: "#252545" }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold">Overall Compliance</h3>
                <span className="text-2xl font-bold" style={{ fontFamily: "'Space Mono', monospace", color: selectedSchool.compliance > 80 ? "#22C55E" : selectedSchool.compliance > 50 ? "#F59E0B" : "#EF4444" }}>{selectedSchool.compliance}%</span>
              </div>
              <div className="h-4 rounded-full overflow-hidden mb-2" style={{ background: "#2A2A4A" }}>
                <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${selectedSchool.compliance}%`, background: selectedSchool.compliance > 80 ? "#22C55E" : selectedSchool.compliance > 50 ? "#F59E0B" : "#EF4444" }} />
              </div>
              <div className="flex justify-between text-[11px] text-gray-500">
                <span>{selectedSchool.checks.filter(c => c.status === "pass").length} systems passing</span>
                <span>{selectedSchool.checks.filter(c => c.status === "fail").length} failing &bull; {selectedSchool.checks.filter(c => c.status === "warn").length} warnings</span>
              </div>
            </div>

            {/* System Checklist */}
            <div className="rounded-xl p-6 border border-white/[0.06] mb-6" style={{ background: "#252545" }}>
              <h3 className="text-sm font-semibold mb-4">System Checklist ({selectedSchool.checks.filter(c => c.status === "pass").length}/{selectedSchool.checks.length} Passing)</h3>
              <div className="grid grid-cols-2 gap-2 max-md:grid-cols-1">
                {selectedSchool.checks.map((c, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-lg border border-white/[0.04]" style={{ background: "#1A1A2E" }}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold`} style={{ background: c.status === "pass" ? "rgba(34,197,94,0.15)" : c.status === "fail" ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.15)", color: c.status === "pass" ? "#22C55E" : c.status === "fail" ? "#EF4444" : "#F59E0B" }}>
                      {c.status === "pass" ? "✓" : c.status === "fail" ? "✕" : "!"}
                    </div>
                    <span className="flex-1 text-[13px]">{c.name}</span>
                    <StatusPill status={c.status === "pass" ? "compliant" : c.status === "fail" ? "critical" : "in-progress"} label={c.status === "pass" ? "Pass" : c.status === "fail" ? "Fail" : "Warning"} />
                  </div>
                ))}
              </div>
            </div>

            {/* Contact & Cost Estimate */}
            <div className="grid grid-cols-2 gap-4 mb-6 max-md:grid-cols-1">
              <div className="rounded-xl p-6 border border-white/[0.06]" style={{ background: "#252545" }}>
                <h3 className="text-sm font-semibold mb-3">Contact Information</h3>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <span className="text-base">📞</span>
                    <span>(555) {300 + selectedSchool.id}-{1000 + selectedSchool.id * 7}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <span className="text-base">📧</span>
                    <span>admin@{selectedSchool.name.split(' ')[0].toLowerCase()}.edu</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <span className="text-base">👤</span>
                    <span>Principal {lastNamePool[(selectedSchool.id + 20) % lastNamePool.length]}</span>
                  </div>
                </div>
                <button onClick={() => alert('Contact feature available in full version')} className="w-full mt-4 py-2 rounded-lg text-[12px] font-semibold text-white border border-white/[0.08] transition-all hover:border-[#E87722] hover:text-[#E87722]" style={{ background: '#2A2A4A' }}>Contact School</button>
              </div>
              <div className="rounded-xl p-6 border border-white/[0.06]" style={{ background: "#252545" }}>
                <h3 className="text-sm font-semibold mb-3">Remediation Cost Estimate</h3>
                <div className="text-[28px] font-bold mb-1" style={{ fontFamily: "'Space Mono', monospace", color: '#E87722' }}>
                  ${(selectedSchool.priorityItems * 2800 + 5000).toLocaleString()} &ndash; ${(selectedSchool.priorityItems * 4200 + 12000).toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 mb-3">Based on {selectedSchool.priorityItems} priority items identified</div>
                <div className="space-y-1.5">
                  {[
                    { label: 'Parts & Materials', pct: 40 },
                    { label: 'Labor & Installation', pct: 35 },
                    { label: 'Permits & Inspection Fees', pct: 15 },
                    { label: 'Project Management', pct: 10 },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px] text-gray-400">
                      <div className="w-[100px] shrink-0">{item.label}</div>
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#2A2A4A' }}>
                        <div className="h-full rounded-full" style={{ width: `${item.pct}%`, background: '#E87722', opacity: 0.4 + (i * 0.15) }} />
                      </div>
                      <span className="w-8 text-right" style={{ fontFamily: "'Space Mono', monospace" }}>{item.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Compliance History Timeline */}
            <div className="rounded-xl p-6 border border-white/[0.06] mb-6" style={{ background: "#252545" }}>
              <h3 className="text-sm font-semibold mb-4">Compliance History</h3>
              <div className="relative pl-6 border-l-2 border-white/[0.08] space-y-4">
                {[
                  { date: 'Jan 2026', event: 'Annual compliance audit completed', detail: `Overall score: ${selectedSchool.compliance}%`, color: selectedSchool.compliance > 80 ? '#22C55E' : selectedSchool.compliance > 50 ? '#F59E0B' : '#EF4444' },
                  { date: 'Oct 2025', event: 'Fire Marshal follow-up inspection', detail: 'Sprinkler system pressure test passed', color: '#22C55E' },
                  { date: 'Jul 2025', event: 'Emergency lighting upgrade completed', detail: 'All exit signs replaced with LED models', color: '#3B82F6' },
                  { date: 'Mar 2025', event: 'Initial assessment by Chatman Security & Fire', detail: 'Baseline compliance score established', color: '#E87722' },
                ].map((entry, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[31px] w-3 h-3 rounded-full border-2 border-[#222240]" style={{ background: entry.color }} />
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">{entry.date}</div>
                    <div className="text-sm text-white font-medium">{entry.event}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{entry.detail}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Notes */}
            <div className="rounded-xl p-6 border border-white/[0.06] mb-6" style={{ background: "#252545" }}>
              <h3 className="text-sm font-semibold mb-4">Recent Notes</h3>
              <div className="space-y-3">
                {[
                  { author: 'Chatman Field Tech', date: '2 days ago', note: `Completed walkthrough of ${selectedSchool.name}. ${selectedSchool.priorityItems} items flagged for remediation. Kitchen suppression hood requires immediate attention.` },
                  { author: 'District Facilities Mgr', date: '1 week ago', note: 'Budget approved for Phase 1 remediation. Awaiting vendor quotes for fire alarm panel replacement.' },
                  { author: 'Fire Marshal Office', date: '2 weeks ago', note: `Re-inspection scheduled. Previous citation for emergency lighting deficiency must be resolved prior to visit.` },
                ].map((n, i) => (
                  <div key={i} className="rounded-lg p-3.5 border border-white/[0.04]" style={{ background: '#1A1A2E' }}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-white">{n.author}</span>
                      <span className="text-[10px] text-gray-500">{n.date}</span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">{n.note}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 max-md:flex-col">
              <button onClick={() => alert("Full report download available in live version")} className="flex-1 py-3 rounded-xl text-[13px] font-semibold text-white text-center transition-all hover:brightness-90" style={{ background: "#E87722" }}>
                Download Full Report
              </button>
              <button onClick={() => alert("Schedule inspection available in live version")} className="flex-1 py-3 rounded-xl text-[13px] font-semibold text-white text-center transition-all hover:bg-white/10 border border-white/[0.08]" style={{ background: "#2A2A4A" }}>
                Schedule Inspection
              </button>
              <button onClick={() => alert("Contact feature available in full version")} className="flex-1 py-3 rounded-xl text-[13px] font-semibold text-white text-center transition-all hover:bg-white/10 border border-white/[0.08]" style={{ background: "#2A2A4A" }}>
                Contact School
              </button>
            </div>
          </div>
        )}

        {/* ======= COMPLIANCE TAB ======= */}
        {currentTab === "compliance" && (
          <div>
            <div className="grid grid-cols-4 gap-4 mb-6 max-xl:grid-cols-2 max-md:grid-cols-1">
              {[
                { label: "Total Deficiencies Found", value: "347", sub: `Across all ${schools.length} campuses`, valueColor: "#E87722" },
                { label: "Resolved", value: "198", trend: "57% complete", trendBg: "rgba(34,197,94,0.12)", trendColor: "#22C55E", valueColor: "#22C55E" },
                { label: "In Remediation", value: "104", sub: "Work orders active", valueColor: "#F59E0B" },
                { label: "Outstanding Critical", value: "45", sub: "Requires immediate action", valueColor: "#EF4444" },
              ].map((kpi, i) => (
                <div key={i} className="rounded-xl p-5 border border-white/[0.06] dp-fade-up" style={{ background: "#252545", animationDelay: `${i*0.05}s` }}>
                  <div className="text-[13px] text-gray-400 mb-1.5">{kpi.label}</div>
                  <div className="text-[28px] font-bold" style={{ fontFamily: "'Space Mono', monospace", color: kpi.valueColor }}>{kpi.value}</div>
                  {kpi.sub && <div className="text-xs text-gray-500 mt-1">{kpi.sub}</div>}
                  {kpi.trend && <div className="inline-flex items-center gap-[3px] text-[11px] font-semibold mt-2 px-2 py-[3px] rounded" style={{ background: kpi.trendBg, color: kpi.trendColor }}>{kpi.trend}</div>}
                </div>
              ))}
            </div>
            <div className="rounded-xl p-6 border border-white/[0.06] dp-fade-up" style={{ background: "#252545", animationDelay: "0.25s" }}>
              <h3 className="text-sm font-semibold mb-5">Deficiency Breakdown by System</h3>
              <div className="flex flex-col gap-3">
                {deficiencyData.map((d, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-[130px] text-xs text-gray-400 shrink-0">{d.label}</div>
                    <div className="flex-1 h-7 rounded-md overflow-hidden relative" style={{ background: "#2A2A4A" }}>
                      <div className="absolute top-0 left-0 h-full rounded-md" style={{ width: `${(d.total/maxDef)*100}%`, background: d.color, opacity: 0.3 }} />
                      <div className="h-full rounded-md relative z-[1] flex items-center" style={{ width: `${(d.resolved/maxDef)*100}%`, background: d.color }}>
                        <span className="ml-auto pr-2.5 text-[11px] font-semibold text-white" style={{ fontFamily: "'Space Mono', monospace" }}>{d.resolved}/{d.total}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex gap-4 text-[11px] text-gray-500"><span>■ Resolved</span><span className="opacity-40">■ Total Found</span></div>
            </div>
          </div>
        )}

        {/* ======= FIRE MARSHAL TAB ======= */}
        {currentTab === "marshal" && (
          <div>
            <div className="grid grid-cols-3 gap-4 mb-6 max-xl:grid-cols-2 max-md:grid-cols-1">
              {[
                { label: "Scheduled Inspections", value: "18", sub: "Next 30 days", valueColor: "#3B82F6" },
                { label: "Inspections Passed", value: "41", trend: "93% pass rate", trendBg: "rgba(34,197,94,0.12)", trendColor: "#22C55E", valueColor: "#22C55E" },
                { label: "Pending Responses", value: String(criticalCount), sub: "Awaiting Fire Marshal review", valueColor: "#E87722" },
              ].map((kpi, i) => (
                <div key={i} className="rounded-xl p-5 border border-white/[0.06] dp-fade-up" style={{ background: "#252545", animationDelay: `${i*0.05}s` }}>
                  <div className="text-[13px] text-gray-400 mb-1.5">{kpi.label}</div>
                  <div className="text-[28px] font-bold" style={{ fontFamily: "'Space Mono', monospace", color: kpi.valueColor }}>{kpi.value}</div>
                  {kpi.sub && <div className="text-xs text-gray-500 mt-1">{kpi.sub}</div>}
                  {kpi.trend && <div className="inline-flex items-center gap-[3px] text-[11px] font-semibold mt-2 px-2 py-[3px] rounded" style={{ background: kpi.trendBg, color: kpi.trendColor }}>{kpi.trend}</div>}
                </div>
              ))}
            </div>
            <h2 className="text-base font-semibold mb-4">Upcoming Inspections & Coordination</h2>
            <div className="grid grid-cols-3 gap-4 max-xl:grid-cols-2 max-md:grid-cols-1">
              {marshalItems.map((m, i) => (
                <div key={i} onClick={() => setMarshalPopup(i)} className="rounded-xl p-5 border border-white/[0.06] cursor-pointer transition-all hover:border-[#E87722] hover:-translate-y-0.5" style={{ background: "#252545" }}>
                  <h4 className="text-sm font-semibold mb-1">{m.campus}</h4>
                  <p className="text-xs text-gray-400 mb-3">{m.notes}</p>
                  <div className="mb-2.5"><StatusPill status={m.status} /></div>
                  <div className="flex gap-4 text-[11px] text-gray-500"><span>📅 {m.date}</span><span>📋 {m.type}</span></div>
                  <div className="text-[10px] mt-2" style={{ color: '#E87722' }}>Click for details &rarr;</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======= REPORTS TAB ======= */}
        {currentTab === "reports" && (
          <div>
            <h2 className="text-base font-semibold mb-4">Available Reports & Documents</h2>
            {reportsList.map((r, i) => (
              <div key={i} onClick={() => setReportPopup(i)} className="flex items-center gap-4 px-5 py-4 rounded-xl border border-white/[0.06] mb-2 cursor-pointer transition-all hover:border-[#E87722] hover:bg-white/[0.02]" style={{ background: "#252545" }}>
                <div className="w-[42px] h-[42px] rounded-[10px] flex items-center justify-center text-lg shrink-0" style={{ background: "#2A2A4A" }}>{r.icon}</div>
                <div className="flex-1"><h4 className="text-sm font-semibold mb-0.5">{r.title}</h4><p className="text-xs text-gray-400">{r.desc} &bull; {r.date}</p></div>
                <div className="text-xs font-semibold whitespace-nowrap" style={{ color: "#E87722" }}>View &rarr;</div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* MARSHAL POPUP */}
      {marshalPopup !== null && (() => {
        const m = marshalItems[marshalPopup];
        if (!m) return null;
        const inspectorNames = ['Chief Robert Daniels','Lt. Maria Sanchez','Inspector James Park','Captain Olivia Chen','Inspector David Lee'];
        const inspector = inspectorNames[marshalPopup % inspectorNames.length];
        const checkItems = [
          { name: 'Fire alarm panel operational', status: m.status === 'critical' ? 'fail' : 'pass' },
          { name: 'Sprinkler system pressure test', status: m.status === 'critical' ? 'fail' : 'pass' },
          { name: 'Emergency exit signage visible', status: 'pass' },
          { name: 'Fire extinguisher inspection tags', status: m.status === 'critical' ? 'warn' : 'pass' },
          { name: 'Kitchen suppression system', status: m.type === 'Re-inspection' ? 'fail' : 'pass' },
          { name: 'Smoke detector functionality', status: 'pass' },
          { name: 'Emergency lighting backup power', status: m.status === 'in-progress' ? 'warn' : 'pass' },
          { name: 'Egress pathway clearance', status: 'pass' },
        ];
        return (
          <Popup title={m.campus} onClose={() => setMarshalPopup(null)}>
            <div className="grid grid-cols-2 gap-3 mb-4 max-md:grid-cols-1">
              <div className="rounded-lg p-3 border border-white/[0.06]" style={{ background: '#1A1A2E' }}>
                <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Inspection Date</div>
                <div className="text-sm font-semibold text-white">{m.date}</div>
              </div>
              <div className="rounded-lg p-3 border border-white/[0.06]" style={{ background: '#1A1A2E' }}>
                <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Type</div>
                <div className="text-sm font-semibold text-white">{m.type}</div>
              </div>
              <div className="rounded-lg p-3 border border-white/[0.06]" style={{ background: '#1A1A2E' }}>
                <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Assigned Inspector</div>
                <div className="text-sm font-semibold text-white">{inspector}</div>
              </div>
              <div className="rounded-lg p-3 border border-white/[0.06]" style={{ background: '#1A1A2E' }}>
                <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Status</div>
                <div><StatusPill status={m.status} /></div>
              </div>
            </div>
            <div className="text-sm text-gray-400 mb-3"><strong className="text-white">Notes:</strong> {m.notes}</div>
            <div className="mb-4">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Inspection Checklist Preview</div>
              <div className="grid grid-cols-1 gap-1.5">
                {checkItems.map((c, i) => (
                  <div key={i} className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-white/[0.04]" style={{ background: '#1A1A2E' }}>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold" style={{ background: c.status === 'pass' ? 'rgba(34,197,94,0.15)' : c.status === 'fail' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)', color: c.status === 'pass' ? '#22C55E' : c.status === 'fail' ? '#EF4444' : '#F59E0B' }}>
                      {c.status === 'pass' ? '\u2713' : c.status === 'fail' ? '\u2715' : '!'}
                    </div>
                    <span className="flex-1 text-xs text-gray-300">{c.name}</span>
                    <span className="text-[10px] font-semibold" style={{ color: c.status === 'pass' ? '#22C55E' : c.status === 'fail' ? '#EF4444' : '#F59E0B' }}>{c.status.toUpperCase()}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setMarshalPopup(null); alert('Contact feature available in full version'); }} className="flex-1 py-2.5 rounded-lg text-[13px] font-semibold text-white transition-all hover:brightness-90" style={{ background: '#E87722' }}>
                Contact Inspector
              </button>
              <button onClick={() => { setMarshalPopup(null); const s = schools.find(x => m.campus.toLowerCase().includes(x.name.split(' ')[0].toLowerCase())); if (s) openSchoolProfile(s.id); }} className="flex-1 py-2.5 rounded-lg text-[13px] font-semibold text-white border border-white/[0.08] transition-all hover:bg-white/10" style={{ background: '#2A2A4A' }}>
                View Campus
              </button>
            </div>
          </Popup>
        );
      })()}

      {/* REPORT POPUP */}
      {reportPopup !== null && (() => {
        const r = reportsList[reportPopup];
        if (!r) return null;
        const fileSizes = ['2.4 MB','1.8 MB','1.6 MB','1.5 MB','1.7 MB','1.4 MB','3.2 MB','890 KB','2.1 MB','1.1 MB'];
        const fileSize = fileSizes[reportPopup % fileSizes.length];
        return (
          <Popup title={r.title} onClose={() => setReportPopup(null)}>
            <div className="rounded-lg p-4 border border-white/[0.06] mb-4" style={{ background: '#1A1A2E' }}>
              <div className="text-4xl mb-3">{r.icon}</div>
              <p className="text-sm text-gray-300 leading-relaxed mb-3">{r.desc}</p>
              <div className="flex gap-4 text-[11px] text-gray-500">
                <span>Generated: {r.date}</span>
                <span>Size: {fileSize}</span>
                <span>Format: PDF</span>
              </div>
            </div>
            <div className="rounded-lg p-4 border border-white/[0.06] mb-4" style={{ background: '#1A1A2E' }}>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Report Contents</div>
              <ul className="text-sm text-gray-400 space-y-1.5">
                <li className="flex items-center gap-2"><span style={{ color: '#E87722' }}>&bull;</span> Executive Summary & Key Findings</li>
                <li className="flex items-center gap-2"><span style={{ color: '#E87722' }}>&bull;</span> Detailed Compliance Metrics by Campus</li>
                <li className="flex items-center gap-2"><span style={{ color: '#E87722' }}>&bull;</span> Priority Remediation Recommendations</li>
                <li className="flex items-center gap-2"><span style={{ color: '#E87722' }}>&bull;</span> Cost Estimates & Timeline Projections</li>
                <li className="flex items-center gap-2"><span style={{ color: '#E87722' }}>&bull;</span> Photographic Documentation</li>
              </ul>
            </div>
            <div className="flex gap-2">
              <button onClick={() => alert('PDF download available in full version')} className="flex-1 py-2.5 rounded-lg text-[13px] font-semibold text-white transition-all hover:brightness-90" style={{ background: '#E87722' }}>
                Download PDF
              </button>
              <button onClick={() => alert('Share feature available in full version')} className="flex-1 py-2.5 rounded-lg text-[13px] font-semibold text-white border border-white/[0.08] transition-all hover:bg-white/10" style={{ background: '#2A2A4A' }}>
                Share Report
              </button>
            </div>
          </Popup>
        );
      })()}

      {/* ======= ADD LOCATION MODAL ======= */}
      {showAddModal && (
        <>
          <div className="fixed inset-0 z-[200] bg-black/60" onClick={() => setShowAddModal(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] max-w-[90vw] max-h-[90vh] overflow-auto z-[210] rounded-xl p-6 border border-white/[0.08] max-md:w-[95vw]" style={{ background: "#222240" }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Add New Location</h2>
              <button onClick={() => setShowAddModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 border border-white/10 hover:text-white hover:border-[#E87722] transition-all" style={{ background: "#2A2A4A" }}>✕</button>
            </div>

            {/* Image Upload */}
            <div className="mb-4">
              <label className="text-xs text-gray-400 uppercase tracking-wider block mb-2">School Photo</label>
              <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-white/[0.12] rounded-xl h-40 flex flex-col items-center justify-center cursor-pointer transition-all hover:border-[#E87722] overflow-hidden" style={{ background: "#1A1A2E" }}>
                {uploadPreview ? (
                  <img src={uploadPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.5"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
                    <span className="text-xs text-gray-500 mt-2">Click to upload school photo</span>
                  </>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e)} />
            </div>

            {/* Form Fields */}
            <div className="mb-3">
              <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1">School Name *</label>
              <input type="text" value={newSchool.name} onChange={e => setNewSchool(p => ({...p, name: e.target.value}))} placeholder="e.g. Lincoln Elementary" className="w-full px-3.5 py-2.5 rounded-lg text-[13px] text-white outline-none border border-white/[0.08] focus:border-[#E87722] transition-all" style={{ background: "#2A2A4A", fontFamily: "inherit" }} />
            </div>
            <div className="mb-3">
              <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1">Address *</label>
              <input type="text" value={newSchool.address} onChange={e => setNewSchool(p => ({...p, address: e.target.value}))} placeholder="e.g. 1234 Oak St" className="w-full px-3.5 py-2.5 rounded-lg text-[13px] text-white outline-none border border-white/[0.08] focus:border-[#E87722] transition-all" style={{ background: "#2A2A4A", fontFamily: "inherit" }} />
            </div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1">School Type</label>
                <select value={newSchool.type} onChange={e => setNewSchool(p => ({...p, type: e.target.value}))} className="w-full px-3.5 py-2.5 rounded-lg text-[13px] text-white outline-none border border-white/[0.08] focus:border-[#E87722] transition-all" style={{ background: "#2A2A4A", fontFamily: "inherit" }}>
                  {schoolTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1">Region</label>
                <select value={newSchool.region} onChange={e => setNewSchool(p => ({...p, region: e.target.value}))} className="w-full px-3.5 py-2.5 rounded-lg text-[13px] text-white outline-none border border-white/[0.08] focus:border-[#E87722] transition-all" style={{ background: "#2A2A4A", fontFamily: "inherit" }}>
                  {regions.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 rounded-lg text-[13px] font-medium text-gray-400 border border-white/[0.08] transition-all hover:text-white" style={{ background: "#2A2A4A" }}>Cancel</button>
              <button onClick={handleAddSchool} disabled={!newSchool.name || !newSchool.address} className="flex-1 py-2.5 rounded-lg text-[13px] font-semibold text-white transition-all hover:brightness-90 disabled:opacity-40 disabled:cursor-not-allowed" style={{ background: "#E87722" }}>Add Location</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ========== POPUP COMPONENT ==========
function Popup({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={onClose}>
      <div className="bg-[#222240] rounded-2xl shadow-2xl w-[600px] max-w-[92vw] max-h-[80vh] overflow-auto border border-white/[0.08] max-md:w-full max-md:h-full max-md:rounded-none max-md:max-w-full max-md:max-h-full" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-5 border-b border-white/[0.06] sticky top-0 z-10" style={{ background: '#222240' }}>
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 border border-white/10 hover:text-white hover:border-[#E87722] transition-all" style={{ background: '#2A2A4A' }}>&#x2715;</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

// ========== STATUS PILL COMPONENT ==========
function StatusPill({ status, label }: { status: string; label?: string }) {
  const config: Record<string, { bg: string; color: string; text: string }> = {
    compliant: { bg: "rgba(34,197,94,0.12)", color: "#22C55E", text: "Compliant" },
    "in-progress": { bg: "rgba(245,158,11,0.12)", color: "#F59E0B", text: "In Progress" },
    critical: { bg: "rgba(239,68,68,0.12)", color: "#EF4444", text: "Critical" },
    pending: { bg: "rgba(59,130,246,0.12)", color: "#3B82F6", text: "Pending" },
  };
  const c = config[status] || config.pending;
  return (
    <span className="inline-flex items-center gap-[5px] px-2.5 py-1 rounded-[20px] text-[11px] font-semibold" style={{ background: c.bg, color: c.color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.color }} />
      {label || c.text}
    </span>
  );
}
