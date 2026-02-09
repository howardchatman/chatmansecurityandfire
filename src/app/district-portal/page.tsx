"use client";

import { useState, useEffect, useCallback, useRef } from "react";

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

interface CheckItem { name: string; status: "pass" | "fail" | "warn"; }
interface School {
  id: number; name: string; address: string; type: string; region: string;
  status: "compliant" | "in-progress" | "critical"; compliance: number;
  priorityItems: number; lastInspected: string; sqft: string;
  students: number; checks: CheckItem[]; nextInspection: string;
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
      checks, nextInspection: new Date(Date.now() + (Math.floor(Math.random()*60)+1)*86400000).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})
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
  const [detailSchool, setDetailSchool] = useState<School | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const perPage = 15;
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      setSchools(generateSchools());
    }
  }, []);

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
  };

  const openDetail = (id: number) => {
    const s = schools.find(x => x.id === id);
    if (s) { setDetailSchool(s); setDetailOpen(true); }
  };

  const closeDetail = () => { setDetailOpen(false); };

  const tabTitles: Record<string, string> = {
    overview: "District Overview", schools: "All Schools", compliance: "Compliance Tracker",
    marshal: "Fire Marshal Coordination", reports: "Reports & Documents", schedule: "Schedule"
  };

  const tabs = ["overview","schools","compliance","marshal","reports"];
  const navItems = [
    { id: "overview", label: "Overview", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px]"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
    { id: "schools", label: "All Schools", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px]"><path d="M2 20h20M4 20V8l8-4 8 4v12"/><path d="M9 20v-6h6v6"/><path d="M9 12h6"/></svg>, badge: "70" },
    { id: "compliance", label: "Compliance", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px]"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg> },
    { id: "marshal", label: "Fire Marshal", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px]"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, badge: "5" },
    { id: "reports", label: "Reports & Docs", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px]"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
    { id: "schedule", label: "Schedule", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px]"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
  ];

  // Compliance chart data
  const complianceCats = [
    {label:"Fire Alarms", pct:82, color:"#E87722"},
    {label:"Sprinkler Systems", pct:71, color:"#E87722"},
    {label:"Emergency Exits", pct:91, color:"#22C55E"},
    {label:"Fire Extinguishers", pct:88, color:"#22C55E"},
    {label:"Emergency Lighting", pct:64, color:"#F59E0B"},
    {label:"Kitchen Suppression", pct:58, color:"#EF4444"},
    {label:"Smoke Detectors", pct:86, color:"#22C55E"},
    {label:"Egress Signage", pct:93, color:"#22C55E"},
  ];

  // Donut data
  const donutData = [
    {label:"Compliant", count:23, color:"#22C55E"},
    {label:"In Progress", count:35, color:"#F59E0B"},
    {label:"Critical", count:12, color:"#EF4444"},
  ];
  const donutTotal = donutData.reduce((s,d) => s+d.count, 0);
  const cx=80, cy=80, r=60, sw=20;

  // Activity
  const activities = [
    {color:"#22C55E", text:<><strong>Adams Elementary</strong> passed Fire Marshal inspection</>, time:"2 hours ago"},
    {color:"#E87722", text:<>Compliance report generated for <strong>Region North</strong> (14 campuses)</>, time:"5 hours ago"},
    {color:"#EF4444", text:<><strong>Harrison High School</strong> — critical sprinkler deficiency flagged</>, time:"Yesterday"},
    {color:"#3B82F6", text:<>Fire Marshal walkthrough scheduled for <strong>Kennedy Middle</strong></>, time:"Yesterday"},
    {color:"#22C55E", text:<><strong>Franklin K-8</strong> remediation complete — moved to Compliant</>, time:"2 days ago"},
    {color:"#F59E0B", text:<>Kitchen suppression work order created for <strong>Jefferson Elementary</strong></>, time:"3 days ago"},
  ];

  // Deficiency data
  const deficiencyData = [
    {label:"Kitchen Suppression", total:62, resolved:28, color:"#EF4444"},
    {label:"Sprinkler Systems", total:54, resolved:31, color:"#E87722"},
    {label:"Emergency Lighting", total:48, resolved:30, color:"#F59E0B"},
    {label:"Fire Alarms", total:43, resolved:29, color:"#E87722"},
    {label:"Smoke Detectors", total:38, resolved:28, color:"#F59E0B"},
    {label:"Fire Extinguishers", total:35, resolved:25, color:"#22C55E"},
    {label:"Emergency Exits", total:28, resolved:20, color:"#22C55E"},
    {label:"Egress Signage", total:22, resolved:18, color:"#22C55E"},
    {label:"Fire Doors", total:17, resolved:9, color:"#F59E0B"},
  ];
  const maxDeficiency = Math.max(...deficiencyData.map(i => i.total));

  // Marshal data
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

  // Reports data
  const reports = [
    {icon:"📊",title:"District Master Compliance Summary",desc:"Consolidated overview of all 70 campuses with risk prioritization",date:"Feb 7, 2026"},
    {icon:"📋",title:"Region North Compliance Report",desc:"Individual reports for 14 campuses in the North region",date:"Feb 5, 2026"},
    {icon:"📋",title:"Region South Compliance Report",desc:"Individual reports for 14 campuses in the South region",date:"Feb 3, 2026"},
    {icon:"📋",title:"Region East Compliance Report",desc:"Individual reports for 14 campuses in the East region",date:"Feb 1, 2026"},
    {icon:"📋",title:"Region West Compliance Report",desc:"Individual reports for 14 campuses in the West region",date:"Jan 30, 2026"},
    {icon:"📋",title:"Region Central Compliance Report",desc:"Individual reports for 14 campuses in the Central region",date:"Jan 28, 2026"},
    {icon:"💰",title:"District-Wide Cost Estimate",desc:"Detailed remediation cost breakdown by campus and priority level",date:"Feb 6, 2026"},
    {icon:"📄",title:"Fire Marshal Correspondence Log",desc:"All communications and inspection results with the Fire Marshal office",date:"Feb 7, 2026"},
    {icon:"📅",title:"Remediation Timeline & Schedule",desc:"Phased timeline for all approved compliance work",date:"Feb 4, 2026"},
    {icon:"📄",title:"Scope of Work — Full Service",desc:"Original signed scope of work and engagement terms",date:"Jan 10, 2026"},
  ];

  // Donut SVG offset calculation
  let donutOffset = 0;
  const donutPaths = donutData.map(d => {
    const pct = d.count / donutTotal;
    const dash = pct * 2 * Math.PI * r;
    const gap = 2 * Math.PI * r - dash;
    const currentOffset = donutOffset;
    donutOffset += dash;
    return { ...d, dash, gap, offset: currentOffset };
  });

  const upcomingInspections = schools.filter(s => s.status !== "compliant").slice(0, 6);

  const statusLabel = (s: string) => s === "in-progress" ? "In Progress" : s === "compliant" ? "Compliant" : s === "critical" ? "Critical" : "Pending";

  return (
    <div className="font-sans" style={{ fontFamily: "'DM Sans', sans-serif", background: "#1A1A2E", color: "#F1F1F6", minHeight: "100vh" }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
        .dp-scrollbar::-webkit-scrollbar { width: 6px; }
        .dp-scrollbar::-webkit-scrollbar-track { background: #222240; }
        .dp-scrollbar::-webkit-scrollbar-thumb { background: #2A2A4A; border-radius: 3px; }
        @keyframes dpFadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .dp-fade-up { animation: dpFadeUp 0.5s ease both; }
      `}</style>

      {/* SIDEBAR */}
      <nav className="fixed left-0 top-0 bottom-0 w-[260px] flex flex-col z-[100] border-r border-white/[0.06] max-md:-translate-x-full transition-transform" style={{ background: "#222240" }}>
        <div className="px-6 py-5 border-b border-white/[0.06] flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-base text-white" style={{ background: "#E87722" }}>CS</div>
          <div className="text-[13px] font-semibold leading-tight"><span style={{ color: "#E87722" }}>Chatman</span> Security<br/>& Fire</div>
        </div>
        <div className="flex-1 p-3 overflow-y-auto dp-scrollbar">
          <div className="text-[10px] font-bold tracking-[1.5px] text-gray-500 px-3 pt-3 pb-2 uppercase">Main</div>
          {navItems.slice(0, 4).map(item => (
            <div key={item.id} onClick={() => switchTab(item.id)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-sm mb-0.5 transition-all ${currentTab === item.id ? "font-semibold" : "text-gray-400 hover:bg-white/5 hover:text-white"}`} style={currentTab === item.id ? { background: "rgba(232,119,34,0.12)", color: "#E87722" } : {}}>
              {item.icon}
              {item.label}
              {item.badge && <span className="ml-auto text-[10px] font-bold px-[7px] py-0.5 rounded-[10px] text-white" style={{ background: "#EF4444" }}>{item.badge}</span>}
            </div>
          ))}
          <div className="text-[10px] font-bold tracking-[1.5px] text-gray-500 px-3 pt-3 pb-2 uppercase">Reports</div>
          {navItems.slice(4).map(item => (
            <div key={item.id} onClick={() => switchTab(item.id)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-sm mb-0.5 transition-all ${currentTab === item.id ? "font-semibold" : "text-gray-400 hover:bg-white/5 hover:text-white"}`} style={currentTab === item.id ? { background: "rgba(232,119,34,0.12)", color: "#E87722" } : {}}>
              {item.icon}
              {item.label}
            </div>
          ))}
        </div>
        <div className="px-5 py-4 border-t border-white/[0.06] text-xs text-gray-500">
          <div className="inline-block text-[10px] font-bold px-2 py-[3px] rounded text-white tracking-[0.5px] mb-1.5" style={{ background: "#E87722" }}>DEMO MODE</div>
          <div>District Compliance Portal v2.0</div>
          <div className="mt-1">chatmansecurityandfire.com</div>
        </div>
      </nav>

      {/* HEADER */}
      <header className="fixed top-0 left-[260px] right-0 h-16 backdrop-blur-[20px] border-b border-white/[0.06] flex items-center justify-between px-8 z-[90] max-md:left-0" style={{ background: "rgba(26,26,46,0.85)" }}>
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">{tabTitles[currentTab] || "Dashboard"}</h1>
          <span className="px-3 py-1 rounded-[20px] text-xs text-gray-400 border border-white/[0.08]" style={{ background: "#2A2A4A" }}>Houston ISD Demo &bull; 70 Campuses</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => alert("Export feature — available in full version")} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] text-white border border-white/[0.08] transition-all hover:border-[#E87722] hover:text-[#E87722]" style={{ background: "#2A2A4A", fontFamily: "inherit" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export
          </button>
          <button onClick={() => alert("Schedule a consultation at chatmansecurityandfire.com")} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] text-white font-medium transition-all hover:brightness-90" style={{ background: "#E87722", fontFamily: "inherit" }}>Get Started</button>
        </div>
      </header>

      {/* MAIN */}
      <main className="ml-[260px] mt-16 p-7 min-h-[calc(100vh-64px)] max-md:ml-0">
        {/* TABS */}
        <div className="flex gap-1 p-1 rounded-xl w-fit mb-7" style={{ background: "#222240" }}>
          {tabs.map(tab => (
            <button key={tab} onClick={() => switchTab(tab)} className={`px-5 py-2 rounded-lg text-[13px] font-medium transition-all border-none capitalize ${currentTab === tab ? "text-white font-semibold" : "text-gray-400 hover:text-white"}`} style={currentTab === tab ? { background: "#E87722" } : { background: "transparent" }}>
              {tab === "marshal" ? "Fire Marshal" : tab}
            </button>
          ))}
        </div>

        {/* ======= OVERVIEW TAB ======= */}
        {currentTab === "overview" && (
          <div>
            {/* KPIs */}
            <div className="grid grid-cols-4 gap-4 mb-7 max-xl:grid-cols-2 max-md:grid-cols-1">
              {[
                { icon: "🏫", label: "Total Campuses", value: "70", sub: "Across 5 regions", iconBg: "rgba(59,130,246,0.12)", iconColor: "#3B82F6", valueColor: "#F1F1F6", glowColor: "#3B82F6" },
                { icon: "✓", label: "Fully Compliant", value: "23", trend: "↑ 8 this month", trendBg: "rgba(34,197,94,0.12)", trendColor: "#22C55E", iconBg: "rgba(34,197,94,0.12)", iconColor: "#22C55E", valueColor: "#22C55E", glowColor: "#22C55E" },
                { icon: "⚠", label: "In Progress", value: "35", sub: "Remediation underway", iconBg: "rgba(245,158,11,0.12)", iconColor: "#F59E0B", valueColor: "#F59E0B", glowColor: "#F59E0B" },
                { icon: "🔥", label: "Critical Issues", value: "12", trend: "↓ 3 from last week", trendBg: "rgba(239,68,68,0.12)", trendColor: "#EF4444", iconBg: "rgba(239,68,68,0.12)", iconColor: "#EF4444", valueColor: "#EF4444", glowColor: "#EF4444" },
              ].map((kpi, i) => (
                <div key={i} className="relative overflow-hidden rounded-xl p-5 border border-white/[0.06] transition-all hover:-translate-y-0.5 hover:border-white/[0.12] dp-fade-up" style={{ background: "#252545", animationDelay: `${i*0.05}s` }}>
                  <div className="w-10 h-10 rounded-[10px] flex items-center justify-center mb-3.5 text-lg" style={{ background: kpi.iconBg, color: kpi.iconColor }}>{kpi.icon}</div>
                  <div className="text-[13px] text-gray-400 mb-1.5">{kpi.label}</div>
                  <div className="text-[28px] font-bold" style={{ fontFamily: "'Space Mono', monospace", color: kpi.valueColor }}>{kpi.value}</div>
                  {kpi.sub && <div className="text-xs text-gray-500 mt-1">{kpi.sub}</div>}
                  {kpi.trend && <div className="inline-flex items-center gap-[3px] text-[11px] font-semibold mt-2 px-2 py-[3px] rounded" style={{ background: kpi.trendBg, color: kpi.trendColor }}>{kpi.trend}</div>}
                  <div className="absolute -top-[30px] -right-[30px] w-[100px] h-[100px] rounded-full opacity-[0.08] pointer-events-none" style={{ background: kpi.glowColor }} />
                </div>
              ))}
            </div>

            {/* CHARTS */}
            <div className="grid grid-cols-2 gap-4 mb-7 max-xl:grid-cols-1">
              <div className="rounded-xl p-6 border border-white/[0.06] dp-fade-up" style={{ background: "#252545", animationDelay: "0.25s" }}>
                <h3 className="text-sm font-semibold mb-5">Compliance by Category</h3>
                <div className="flex flex-col gap-3">
                  {complianceCats.map((c, i) => (
                    <div key={i} className="flex items-center gap-3">
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

            {/* ACTIVITY + INSPECTIONS */}
            <div className="grid grid-cols-2 gap-4 max-xl:grid-cols-1">
              <div className="rounded-xl p-6 border border-white/[0.06] dp-fade-up" style={{ background: "#252545" }}>
                <h3 className="text-sm font-semibold mb-4">Recent Activity</h3>
                {activities.map((a, i) => (
                  <div key={i} className={`flex gap-3 py-2.5 ${i < activities.length-1 ? "border-b border-white/[0.04]" : ""}`}>
                    <div className="w-2 h-2 rounded-full mt-[5px] shrink-0" style={{ background: a.color }} />
                    <div>
                      <div className="text-[13px] text-gray-400 leading-relaxed">{a.text}</div>
                      <div className="text-[11px] text-gray-500 mt-0.5">{a.time}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-xl p-6 border border-white/[0.06] dp-fade-up" style={{ background: "#252545" }}>
                <h3 className="text-sm font-semibold mb-4">Upcoming Inspections</h3>
                {upcomingInspections.map((s, i) => (
                  <div key={i} onClick={() => openDetail(s.id)} className={`flex gap-3 py-2.5 cursor-pointer ${i < upcomingInspections.length-1 ? "border-b border-white/[0.04]" : ""}`}>
                    <div className="w-2 h-2 rounded-full mt-[5px] shrink-0" style={{ background: s.status === "critical" ? "#EF4444" : "#F59E0B" }} />
                    <div className="flex-1">
                      <div className="text-[13px] text-gray-400"><strong className="text-white font-semibold">{s.name}</strong></div>
                      <div className="text-[11px] text-gray-500 mt-0.5">{s.nextInspection} &bull; {s.region} Region</div>
                    </div>
                    <StatusPill status={s.status} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ======= SCHOOLS TAB ======= */}
        {currentTab === "schools" && (
          <div className="rounded-xl border border-white/[0.06] overflow-hidden dp-fade-up" style={{ background: "#252545" }}>
            <div className="flex items-center gap-3 p-4 border-b border-white/[0.06] flex-wrap">
              <div className="relative">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input type="text" placeholder="Search schools..." value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="pl-9 pr-3.5 py-2 rounded-lg text-[13px] text-white w-[280px] outline-none transition-all border border-white/[0.08] focus:border-[#E87722]" style={{ background: "#2A2A4A", fontFamily: "inherit" }} />
              </div>
              {[{label:`All (70)`,val:"all"},{label:"Compliant (23)",val:"compliant"},{label:"In Progress (35)",val:"in-progress"},{label:"Critical (12)",val:"critical"}].map(f => (
                <button key={f.val} onClick={() => { setCurrentFilter(f.val); setCurrentPage(1); }} className={`px-3.5 py-1.5 rounded-[20px] text-xs transition-all border ${currentFilter === f.val ? "border-[#E87722] text-[#E87722]" : "border-white/[0.08] text-gray-400 hover:border-[#E87722] hover:text-[#E87722]"}`} style={{ background: currentFilter === f.val ? "rgba(232,119,34,0.1)" : "#2A2A4A", fontFamily: "inherit" }}>
                  {f.label}
                </button>
              ))}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    {["Campus","Region","Status","Compliance","Priority Items","Last Inspected"].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-white/[0.06]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageSchools.map(s => (
                    <tr key={s.id} onClick={() => openDetail(s.id)} className="border-b border-white/[0.04] cursor-pointer transition-colors hover:bg-white/[0.03]">
                      <td className="px-5 py-3.5 text-[13px]">
                        <div className="font-semibold text-white">{s.name}</div>
                        <div className="text-[11px] text-gray-500 mt-0.5">{s.address}</div>
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-gray-400">{s.region}</td>
                      <td className="px-5 py-3.5"><StatusPill status={s.status} /></td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: "#2A2A4A" }}>
                            <div className="h-full rounded-full transition-all duration-800" style={{ width: `${s.compliance}%`, background: s.compliance > 80 ? "#22C55E" : s.compliance > 50 ? "#F59E0B" : "#EF4444" }} />
                          </div>
                          <span className="text-xs text-gray-400" style={{ fontFamily: "'Space Mono', monospace" }}>{s.compliance}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-[11px] font-semibold px-2 py-[3px] rounded ${s.priorityItems > 5 ? "text-red-400" : s.priorityItems > 2 ? "text-yellow-400" : "text-green-400"}`} style={{ background: s.priorityItems > 5 ? "rgba(239,68,68,0.12)" : s.priorityItems > 2 ? "rgba(245,158,11,0.12)" : "rgba(34,197,94,0.12)" }}>
                          {s.priorityItems} items
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-400">{s.lastInspected}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-white/[0.06]">
              <div className="text-[13px] text-gray-400">Showing {(currentPage-1)*perPage+1}-{Math.min(currentPage*perPage, filteredSchools.length)} of {filteredSchools.length} campuses</div>
              <div className="flex gap-1">
                {Array.from({length: totalPages}, (_, i) => i+1).map(p => (
                  <button key={p} onClick={() => setCurrentPage(p)} className={`w-8 h-8 flex items-center justify-center rounded-md text-xs transition-all border ${p === currentPage ? "text-white border-[#E87722]" : "text-gray-400 border-white/[0.08] hover:border-[#E87722] hover:text-[#E87722]"}`} style={{ background: p === currentPage ? "#E87722" : "#2A2A4A", fontFamily: "inherit" }}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ======= COMPLIANCE TAB ======= */}
        {currentTab === "compliance" && (
          <div>
            <div className="grid grid-cols-4 gap-4 mb-6 max-xl:grid-cols-2 max-md:grid-cols-1">
              {[
                { label: "Total Deficiencies Found", value: "347", sub: "Across all 70 campuses", valueColor: "#E87722" },
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
                      <div className="absolute top-0 left-0 h-full rounded-md" style={{ width: `${(d.total/maxDeficiency)*100}%`, background: d.color, opacity: 0.3 }} />
                      <div className="h-full rounded-md relative z-[1] flex items-center" style={{ width: `${(d.resolved/maxDeficiency)*100}%`, background: d.color }}>
                        <span className="ml-auto pr-2.5 text-[11px] font-semibold text-white" style={{ fontFamily: "'Space Mono', monospace" }}>{d.resolved}/{d.total}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex gap-4 text-[11px] text-gray-500">
                <span>■ Resolved</span>
                <span className="opacity-40">■ Total Found</span>
              </div>
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
                { label: "Pending Responses", value: "5", sub: "Awaiting Fire Marshal review", valueColor: "#E87722" },
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
                <div key={i} className="rounded-xl p-5 border border-white/[0.06] cursor-pointer transition-all hover:border-[#E87722] hover:-translate-y-0.5" style={{ background: "#252545" }}>
                  <h4 className="text-sm font-semibold mb-1">{m.campus}</h4>
                  <p className="text-xs text-gray-400 mb-3">{m.notes}</p>
                  <div className="mb-2.5"><StatusPill status={m.status} /></div>
                  <div className="flex gap-4 text-[11px] text-gray-500">
                    <span>📅 {m.date}</span>
                    <span>📋 {m.type}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======= REPORTS TAB ======= */}
        {currentTab === "reports" && (
          <div>
            <h2 className="text-base font-semibold mb-4">Available Reports & Documents</h2>
            {reports.map((r, i) => (
              <div key={i} onClick={() => alert("Download available in full version")} className="flex items-center gap-4 px-5 py-4 rounded-xl border border-white/[0.06] mb-2 cursor-pointer transition-all hover:border-[#E87722]" style={{ background: "#252545" }}>
                <div className="w-[42px] h-[42px] rounded-[10px] flex items-center justify-center text-lg shrink-0" style={{ background: "#2A2A4A" }}>{r.icon}</div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold mb-0.5">{r.title}</h4>
                  <p className="text-xs text-gray-400">{r.desc} &bull; {r.date}</p>
                </div>
                <div className="text-xs font-semibold whitespace-nowrap" style={{ color: "#E87722" }}>Download ↓</div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* DETAIL PANEL OVERLAY */}
      {detailOpen && (
        <div className="fixed inset-0 z-[200] bg-black/60 transition-opacity" onClick={closeDetail} />
      )}

      {/* DETAIL PANEL */}
      <div className={`fixed top-0 right-0 bottom-0 w-[520px] max-md:w-full border-l border-white/[0.08] z-[210] overflow-y-auto p-7 transition-transform duration-300 ${detailOpen ? "translate-x-0" : "translate-x-full"}`} style={{ background: "#222240" }}>
        <button onClick={closeDetail} className="absolute top-5 right-5 w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 border border-white/10 transition-all hover:text-white hover:border-[#E87722]" style={{ background: "#2A2A4A" }}>✕</button>
        {detailSchool && (
          <div>
            <div className="mb-6 pr-10">
              <h2 className="text-xl font-bold mb-1">{detailSchool.name}</h2>
              <p className="text-[13px] text-gray-400">{detailSchool.address} &bull; {detailSchool.region} Region</p>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { label: "Compliance", value: `${detailSchool.compliance}%`, color: detailSchool.compliance > 80 ? "#22C55E" : detailSchool.compliance > 50 ? "#F59E0B" : "#EF4444", fontSize: "20px" },
                { label: "Status", isStatus: true },
                { label: "Square Footage", value: detailSchool.sqft, fontSize: "16px" },
                { label: "Est. Students", value: detailSchool.students.toLocaleString(), fontSize: "16px" },
                { label: "Last Inspection", value: detailSchool.lastInspected, fontSize: "14px" },
                { label: "Next Inspection", value: detailSchool.nextInspection, fontSize: "14px" },
              ].map((stat, i) => (
                <div key={i} className="rounded-lg p-3.5" style={{ background: "#2A2A4A" }}>
                  <div className="text-[11px] text-gray-500 uppercase tracking-[0.5px] mb-1">{stat.label}</div>
                  {stat.isStatus ? (
                    <div className="mt-1"><StatusPill status={detailSchool.status} /></div>
                  ) : (
                    <div className="font-bold" style={{ fontFamily: "'Space Mono', monospace", fontSize: stat.fontSize, color: stat.color || "#F1F1F6" }}>{stat.value}</div>
                  )}
                </div>
              ))}
            </div>
            <div className="mb-5">
              <h3 className="text-[13px] font-bold uppercase tracking-wider text-gray-500 mb-3">System Checklist ({detailSchool.checks.filter(c => c.status === "pass").length}/{detailSchool.checks.length} Passing)</h3>
              {detailSchool.checks.map((c, i) => (
                <div key={i} className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg mb-1.5 text-[13px] border border-white/[0.04]" style={{ background: "#252545" }}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[11px] ${c.status === "pass" ? "text-green-400" : c.status === "fail" ? "text-red-400" : "text-yellow-400"}`} style={{ background: c.status === "pass" ? "rgba(34,197,94,0.12)" : c.status === "fail" ? "rgba(239,68,68,0.12)" : "rgba(245,158,11,0.12)" }}>
                    {c.status === "pass" ? "✓" : c.status === "fail" ? "✕" : "!"}
                  </div>
                  <span className="flex-1">{c.name}</span>
                  <StatusPill status={c.status === "pass" ? "compliant" : c.status === "fail" ? "critical" : "in-progress"} label={c.status === "pass" ? "Pass" : c.status === "fail" ? "Fail" : "Warning"} />
                </div>
              ))}
            </div>
            <button onClick={() => alert("Full report download available in live version")} className="w-full py-2.5 rounded-lg text-[13px] font-medium text-white text-center transition-all hover:brightness-90" style={{ background: "#E87722" }}>
              Download Full Report
            </button>
          </div>
        )}
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
