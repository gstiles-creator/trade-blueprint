import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// ═══════════════════════════════════════════════════
// TRADE BLUEPRINT — Main Storefront
// Southern View Development
// ═══════════════════════════════════════════════════

const TRADES = [
  {
    id: "roofing",
    name: "Roofing",
    icon: "🏠",
    tagline: "Nail every estimate. Protect every margin.",
    description: "Pitch multipliers, material quantities, tear-off costs, accessory lists, and profit-driven quote pricing — all in one tool.",
    color: "#2D6A4F",
    gradient: "linear-gradient(135deg, #081C15, #2D6A4F)",
    features: ["Pitch-adjusted area calc", "8 material types", "Full accessory order list", "Tear-off & disposal", "Margin-based quoting"],
    status: "live",
    priceBasic: 497,
  },
  {
    id: "hvac",
    name: "HVAC",
    icon: "❄️",
    tagline: "Size it right. Bid it right.",
    description: "Load calculations, equipment sizing, ductwork estimates, and energy-savings projections for residential and commercial jobs.",
    color: "#1565C0",
    gradient: "linear-gradient(135deg, #0D47A1, #1976D2)",
    features: ["Heat load estimator", "Equipment sizing", "Duct layout calculator", "Energy savings projections", "Service call pricing"],
    status: "live",
    priceBasic: 497,
  },
  {
    id: "electrical",
    name: "Electrical",
    icon: "⚡",
    tagline: "Calculate with confidence. Bid with precision.",
    description: "Voltage drop, conduit fill, panel load, wire sizing, and full job cost estimators built for licensed electricians.",
    color: "#E65100",
    gradient: "linear-gradient(135deg, #BF360C, #E65100)",
    features: ["Voltage drop calculator", "Panel load analysis", "Conduit fill calculator", "Wire sizing tool", "Job bid estimator"],
    status: "live",
    priceBasic: 497,
  },
  {
    id: "plumbing",
    name: "Plumbing",
    icon: "🔧",
    tagline: "Flow rates to final bids — calculated.",
    description: "Fixture units, pipe sizing, water heater selection, drainage slope calculations, and service/install bid tools.",
    color: "#00695C",
    gradient: "linear-gradient(135deg, #004D40, #00897B)",
    features: ["Fixture unit calculator", "Pipe sizing tool", "Water heater sizing", "Drainage slope calc", "Install bid estimator"],
    status: "live",
    priceBasic: 497,
  },
  {
    id: "concrete",
    name: "Concrete & Flatwork",
    icon: "🧱",
    tagline: "Never over-order. Never under-bid.",
    description: "Yardage calculators, rebar spacing, mix ratios, pour cost estimators, and finishing labor calculators.",
    color: "#5D4037",
    gradient: "linear-gradient(135deg, #3E2723, #6D4C41)",
    features: ["Concrete volume calc", "Rebar spacing estimator", "Mix ratio calculator", "Pour cost estimator", "Finishing labor calc"],
    status: "live",
    priceBasic: 397,
  },
  {
    id: "painting",
    name: "Painting",
    icon: "🎨",
    tagline: "Coverage. Gallons. Profit. Done.",
    description: "Wall/ceiling area calculators, paint coverage rates, primer estimates, labor hour projections, and room-by-room bidding.",
    color: "#6A1B9A",
    gradient: "linear-gradient(135deg, #4A148C, #7B1FA2)",
    features: ["Wall area calculator", "Paint coverage estimator", "Primer quantity calc", "Labor hour projector", "Room-by-room bids"],
    status: "live",
    priceBasic: 397,
  },
  {
    id: "fencing",
    name: "Fencing",
    icon: "🏗️",
    tagline: "Post to post. Dollar to dollar.",
    description: "Linear footage, post spacing, material counts, gate sizing, labor estimates, and instant customer quote tools.",
    color: "#37474F",
    gradient: "linear-gradient(135deg, #263238, #455A64)",
    features: ["Material quantity calc", "Post spacing tool", "Gate sizing calculator", "Labor estimator", "Customer quote tool"],
    status: "live",
    priceBasic: 397,
  },
  {
    id: "landscaping",
    name: "Landscaping",
    icon: "🌿",
    tagline: "Measure the yard. Master the bid.",
    description: "Material volumes for mulch, gravel, soil and pavers. Irrigation zone calculators and seasonal bid builders.",
    color: "#33691E",
    gradient: "linear-gradient(135deg, #1B5E20, #43A047)",
    features: ["Material volume calc", "Paver layout planner", "Irrigation zone calc", "Seasonal bid builder", "Hardscape estimator"],
    status: "live",
    priceBasic: 397,
  },
  {
    id: "solar",
    name: "Solar",
    icon: "☀️",
    tagline: "Close more installs with real numbers.",
    description: "System sizing, ROI projections, panel layout tools, offset calculations, and financing comparison calculators.",
    color: "#F57F17",
    gradient: "linear-gradient(135deg, #E65100, #F9A825)",
    features: ["System size estimator", "ROI/savings calculator", "Panel layout tool", "Offset calculator", "Financing comparisons"],
    status: "live",
    priceBasic: 597,
  },
];

const PRICING_TIERS = [
  {
    name: "Basic",
    price: "From $397",
    monthly: "From $39/mo",
    description: "Quick estimates & fast bids",
    color: "#2D6A4F",
    features: [
      "Core area / volume / sizing calculator",
      "Material quantity estimator",
      "Waste factor adjustment",
      "Labor cost estimator",
      "Profit margin calculator",
      "Printable estimate summary",
    ],
    notIncluded: ["PDF quotes with your logo", "Website embed", "CRM integration"],
    cta: "Get Started",
  },
  {
    name: "Advanced",
    price: "From $1,497",
    monthly: "From $129/mo",
    description: "Full-service estimating engine",
    color: "#1B4332",
    popular: true,
    features: [
      "Everything in Basic, plus…",
      "Multi-section / complex job builder",
      "Editable material price database",
      "Crew size & timeline estimator",
      "PDF quote generator with your logo",
      "Customer-facing embed for your website",
      "Tear-off / demo / disposal costing",
    ],
    notIncluded: ["CRM integration", "Custom branding"],
    cta: "Most Popular",
  },
  {
    name: "Custom Build",
    price: "From $2,997",
    monthly: "Custom",
    description: "Built exactly for your business",
    color: "#081C15",
    features: [
      "Everything in Advanced, plus…",
      "Your branding, colors & logo throughout",
      "CRM / job management integration",
      "Lead capture & email notifications",
      "Financing calculator for customers",
      "Multi-user / team access",
      "Dedicated support & quarterly updates",
      "72-hour turnaround on custom builds",
    ],
    notIncluded: [],
    cta: "Let's Talk",
  },
];

const PITCH_MULTIPLIERS = {
  "1/12": 1.003, "2/12": 1.014, "3/12": 1.031, "4/12": 1.054,
  "5/12": 1.083, "6/12": 1.118, "7/12": 1.158, "8/12": 1.202,
  "9/12": 1.25, "10/12": 1.302, "11/12": 1.357, "12/12": 1.414,
};

const MATERIALS = {
  "3-Tab Shingles": { perSquare: 85, laborPerSquare: 65 },
  "Architectural Shingles": { perSquare: 120, laborPerSquare: 75 },
  "Premium/Designer Shingles": { perSquare: 200, laborPerSquare: 90 },
  "Metal (Standing Seam)": { perSquare: 350, laborPerSquare: 120 },
  "Metal (Corrugated)": { perSquare: 200, laborPerSquare: 100 },
  "TPO": { perSquare: 175, laborPerSquare: 85 },
  "Clay Tile": { perSquare: 400, laborPerSquare: 150 },
  "Concrete Tile": { perSquare: 250, laborPerSquare: 130 },
};

function fmt(num) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num);
}

// ─── Mini Roofing Calculator (Demo) ─────────────────
function RoofingDemo() {
  const [length, setLength] = useState("60");
  const [width, setWidth] = useState("40");
  const [pitch, setPitch] = useState("4/12");
  const [material, setMaterial] = useState("Architectural Shingles");
  const [wasteFactor, setWasteFactor] = useState(15);
  const [margin, setMargin] = useState(35);
  const [results, setResults] = useState(null);

  useEffect(() => {
    const l = parseFloat(length), w = parseFloat(width);
    if (!l || !w) { setResults(null); return; }
    const flat = l * w;
    const actual = flat * PITCH_MULTIPLIERS[pitch];
    const withWaste = actual * (1 + wasteFactor / 100);
    const sq = withWaste / 100;
    const mat = MATERIALS[material];
    const matCost = sq * mat.perSquare;
    const labCost = sq * mat.laborPerSquare;
    const perimeter = 2 * (l + w);
    const accCost = Math.ceil(withWaste/1000)*65 + Math.ceil((perimeter*3)/200)*95 + Math.ceil(perimeter/10)*8 + Math.ceil(l/4)*12 + Math.ceil(withWaste/500)*45 + 3*15 + Math.ceil(perimeter/120)*28;
    const total = matCost + labCost + accCost;
    const sell = total / (1 - margin/100);
    setResults({ squares: sq.toFixed(1), actualArea: Math.round(actual), totalCost: Math.round(total), sellingPrice: Math.round(sell), profit: Math.round(sell - total), matCost: Math.round(matCost), labCost: Math.round(labCost), accCost: Math.round(accCost) });
  }, [length, width, pitch, material, wasteFactor, margin]);

  const inp = { width:"100%", padding:"10px 12px", border:"2px solid #3a3a32", borderRadius:"6px", fontSize:"14px", fontFamily:"'Outfit',sans-serif", background:"#1a1a14", color:"#e8e8d8", outline:"none", boxSizing:"border-box" };
  const lbl = { display:"block", fontSize:"10px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:"#8a8a7a", marginBottom:"5px" };
  const sel = { ...inp, appearance:"none", backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath fill='%238a8a7a' d='M5 7L1 3h8z'/%3E%3C/svg%3E")`, backgroundRepeat:"no-repeat", backgroundPosition:"right 10px center", paddingRight:"28px" };

  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"14px" }}>
        <div><label style={lbl}>Length (ft)</label><input type="number" value={length} onChange={e=>setLength(e.target.value)} style={inp} /></div>
        <div><label style={lbl}>Width (ft)</label><input type="number" value={width} onChange={e=>setWidth(e.target.value)} style={inp} /></div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"14px" }}>
        <div><label style={lbl}>Pitch</label><select value={pitch} onChange={e=>setPitch(e.target.value)} style={sel}>{Object.keys(PITCH_MULTIPLIERS).map(p=><option key={p} value={p}>{p}</option>)}</select></div>
        <div><label style={lbl}>Material</label><select value={material} onChange={e=>setMaterial(e.target.value)} style={sel}>{Object.keys(MATERIALS).map(m=><option key={m} value={m}>{m}</option>)}</select></div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"18px" }}>
        <div><label style={lbl}>Waste: {wasteFactor}%</label><input type="range" min="5" max="25" value={wasteFactor} onChange={e=>setWasteFactor(+e.target.value)} style={{ width:"100%", accentColor:"#D4A017" }} /></div>
        <div><label style={lbl}>Margin: {margin}%</label><input type="range" min="10" max="60" value={margin} onChange={e=>setMargin(+e.target.value)} style={{ width:"100%", accentColor:"#D4A017" }} /></div>
      </div>
      {results && (
        <div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"12px" }}>
            <div style={{ background:"linear-gradient(135deg,#D4A017,#B8860B)", borderRadius:"10px", padding:"18px", textAlign:"center" }}>
              <div style={{ fontSize:"10px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:"rgba(0,0,0,0.5)" }}>Quote Price</div>
              <div style={{ fontSize:"32px", fontWeight:800, color:"#1a1a14", lineHeight:1.1 }}>{fmt(results.sellingPrice)}</div>
            </div>
            <div style={{ background:"rgba(212,160,23,0.15)", borderRadius:"10px", padding:"18px", textAlign:"center", border:"1px solid rgba(212,160,23,0.3)" }}>
              <div style={{ fontSize:"10px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:"#8a8a7a" }}>Your Profit</div>
              <div style={{ fontSize:"32px", fontWeight:800, color:"#D4A017", lineHeight:1.1 }}>{fmt(results.profit)}</div>
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"8px" }}>
            {[
              { l:"Squares", v:results.squares },
              { l:"Materials", v:fmt(results.matCost) },
              { l:"Labor", v:fmt(results.labCost) },
              { l:"Accessories", v:fmt(results.accCost) },
            ].map(x=>(
              <div key={x.l} style={{ background:"rgba(255,255,255,0.04)", borderRadius:"8px", padding:"10px", textAlign:"center", border:"1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize:"9px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", color:"#6a6a5a" }}>{x.l}</div>
                <div style={{ fontSize:"16px", fontWeight:700, color:"#d8d8c8", marginTop:"2px" }}>{x.v}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Trade Card ──────────────────────────────────────
function TradeCard({ trade, index }) {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();
  const ROUTES = { roofing:"/roofing", hvac:"/hvac", electrical:"/electrical", plumbing:"/plumbing", concrete:"/concrete", painting:"/painting", fencing:"/fencing", landscaping:"/landscaping", solar:"/solar" };
  return (
    <div
      onMouseEnter={()=>setHovered(true)}
      onMouseLeave={()=>setHovered(false)}
      onClick={()=>{ if(ROUTES[trade.id]) navigate(ROUTES[trade.id]); }}
      style={{
        background: hovered ? trade.gradient : "#1e1e16",
        borderRadius: "16px",
        padding: "28px 24px",
        border: hovered ? "1px solid transparent" : "1px solid #2a2a22",
        transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
        cursor: "pointer",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        position: "relative",
        overflow: "hidden",
        animationDelay: `${index * 0.08}s`,
      }}
    >
      {trade.status === "live" && (
        <div style={{ position:"absolute", top:"16px", right:"16px", background:"#D4A017", color:"#1a1a14", fontSize:"9px", fontWeight:800, textTransform:"uppercase", letterSpacing:"0.12em", padding:"3px 10px", borderRadius:"100px" }}>
          Try Calculator →
        </div>
      )}
      {trade.status === "coming" && (
        <div style={{ position:"absolute", top:"16px", right:"16px", background:"rgba(255,255,255,0.1)", color:"#8a8a7a", fontSize:"9px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", padding:"3px 10px", borderRadius:"100px" }}>
          Coming Soon
        </div>
      )}
      <div style={{ fontSize:"36px", marginBottom:"12px" }}>{trade.icon}</div>
      <div style={{ fontSize:"20px", fontWeight:800, color:"#e8e8d8", marginBottom:"4px", fontFamily:"'Outfit',sans-serif" }}>{trade.name}</div>
      <div style={{ fontSize:"13px", color: hovered ? "rgba(255,255,255,0.7)" : "#7a7a6a", marginBottom:"16px", lineHeight:1.4 }}>{trade.tagline}</div>
      <div style={{ fontSize:"12px", color: hovered ? "rgba(255,255,255,0.6)" : "#5a5a4a", lineHeight:1.6, marginBottom:"16px" }}>{trade.description}</div>
      <div style={{ borderTop:"1px solid rgba(255,255,255,0.08)", paddingTop:"14px" }}>
        {trade.features.map((f,i)=>(
          <div key={i} style={{ display:"flex", gap:"8px", marginBottom:"6px", fontSize:"12px", color: hovered ? "rgba(255,255,255,0.8)" : "#6a6a5a" }}>
            <span style={{ color:"#D4A017", flexShrink:0 }}>✓</span>
            <span>{f}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop:"16px", fontSize:"18px", fontWeight:800, color:"#D4A017" }}>
        From ${trade.priceBasic} <span style={{ fontSize:"12px", fontWeight:500, color:"#6a6a5a" }}>one-time</span>
      </div>
    </div>
  );
}

// ─── Pricing Tier Card ───────────────────────────────
function PricingCard({ tier, index }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={()=>setHovered(true)}
      onMouseLeave={()=>setHovered(false)}
      style={{
        background: tier.popular
          ? `linear-gradient(160deg, ${tier.color}, ${tier.color}dd)`
          : "#1e1e16",
        borderRadius: "16px",
        padding: "32px 28px",
        border: tier.popular ? "2px solid #D4A017" : "1px solid #2a2a22",
        transition: "all 0.3s ease",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        position: "relative",
        overflow: "hidden",
        color: tier.popular ? "white" : "#e8e8d8",
      }}
    >
      {tier.popular && (
        <div style={{ position:"absolute", top:"0", left:"0", right:"0", background:"#D4A017", color:"#1a1a14", textAlign:"center", fontSize:"10px", fontWeight:800, textTransform:"uppercase", letterSpacing:"0.15em", padding:"5px" }}>
          Most Popular
        </div>
      )}
      <div style={{ marginTop: tier.popular ? "16px" : "0" }}>
        <div style={{ fontSize:"22px", fontWeight:800, marginBottom:"4px", fontFamily:"'Outfit',sans-serif" }}>{tier.name}</div>
        <div style={{ fontSize:"13px", opacity:0.6, marginBottom:"20px" }}>{tier.description}</div>
        <div style={{ marginBottom:"20px" }}>
          <span style={{ fontSize:"34px", fontWeight:800, fontFamily:"'Outfit',sans-serif" }}>{tier.price}</span>
          <div style={{ fontSize:"13px", opacity:0.5, marginTop:"4px" }}>or {tier.monthly}</div>
        </div>
        <div style={{ borderTop:`1px solid ${tier.popular ? "rgba(255,255,255,0.2)" : "#2a2a22"}`, paddingTop:"18px" }}>
          {tier.features.map((f,i) => (
            <div key={i} style={{ display:"flex", gap:"10px", marginBottom:"10px", fontSize:"13px", lineHeight:1.4 }}>
              <span style={{ color:"#D4A017", flexShrink:0 }}>✓</span>
              <span style={{ opacity:0.85 }}>{f}</span>
            </div>
          ))}
          {tier.notIncluded.map((f,i) => (
            <div key={i} style={{ display:"flex", gap:"10px", marginBottom:"10px", fontSize:"13px", lineHeight:1.4, opacity:0.3 }}>
              <span style={{ flexShrink:0 }}>✗</span>
              <span style={{ textDecoration:"line-through" }}>{f}</span>
            </div>
          ))}
        </div>
        <button style={{
          width:"100%", marginTop:"20px", padding:"14px", borderRadius:"10px", border:"none",
          background: tier.popular ? "#D4A017" : "rgba(212,160,23,0.15)",
          color: tier.popular ? "#1a1a14" : "#D4A017",
          fontSize:"14px", fontWeight:700, cursor:"pointer", fontFamily:"'Outfit',sans-serif",
          transition:"all 0.2s",
        }}>
          {tier.cta}
        </button>
      </div>
    </div>
  );
}

// ─── Main App ────────────────────────────────────────
export default function TradeBlueprint() {
  const demoRef = useRef(null);
  const tradesRef = useRef(null);
  const pricingRef = useRef(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (ref) => ref.current?.scrollIntoView({ behavior:"smooth" });

  return (
    <div style={{ fontFamily:"'Outfit',sans-serif", background:"#12120c", color:"#e8e8d8", minHeight:"100vh" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@700;800;900&display=swap" rel="stylesheet" />

      {/* ═══ NAV ═══ */}
      <nav style={{
        position:"fixed", top:0, left:0, right:0, zIndex:100,
        background: scrollY > 50 ? "rgba(18,18,12,0.95)" : "transparent",
        backdropFilter: scrollY > 50 ? "blur(20px)" : "none",
        borderBottom: scrollY > 50 ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
        transition:"all 0.3s ease",
        padding:"0 24px",
      }}>
        <div style={{ maxWidth:"1100px", margin:"0 auto", display:"flex", justifyContent:"space-between", alignItems:"center", height:"64px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
            <div style={{ width:"32px", height:"32px", background:"linear-gradient(135deg,#D4A017,#B8860B)", borderRadius:"8px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"16px", fontWeight:900, color:"#1a1a14" }}>T</div>
            <span style={{ fontSize:"18px", fontWeight:800, letterSpacing:"-0.02em" }}>Trade Blueprint</span>
          </div>
          <div style={{ display:"flex", gap:"28px", alignItems:"center" }}>
            <span onClick={()=>scrollTo(tradesRef)} style={{ fontSize:"13px", fontWeight:500, color:"#8a8a7a", cursor:"pointer", transition:"color 0.2s" }}>Calculators</span>
            <span onClick={()=>scrollTo(pricingRef)} style={{ fontSize:"13px", fontWeight:500, color:"#8a8a7a", cursor:"pointer" }}>Pricing</span>
            <span onClick={()=>scrollTo(demoRef)} style={{ fontSize:"13px", fontWeight:500, color:"#8a8a7a", cursor:"pointer" }}>Live Demo</span>
            <button onClick={()=>scrollTo(pricingRef)} style={{ background:"#D4A017", color:"#1a1a14", border:"none", padding:"8px 20px", borderRadius:"8px", fontSize:"13px", fontWeight:700, cursor:"pointer" }}>
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <div style={{
        position:"relative", overflow:"hidden",
        padding:"140px 24px 100px", textAlign:"center",
        background:"radial-gradient(ellipse at 50% 0%, rgba(212,160,23,0.08) 0%, transparent 60%), radial-gradient(ellipse at 20% 100%, rgba(45,106,79,0.06) 0%, transparent 50%), #12120c",
      }}>
        {/* Grid texture */}
        <div style={{
          position:"absolute", inset:0, opacity:0.03,
          backgroundImage:"linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize:"60px 60px",
        }} />

        <div style={{ position:"relative", maxWidth:"800px", margin:"0 auto" }}>
          <div style={{
            display:"inline-flex", alignItems:"center", gap:"8px",
            background:"rgba(212,160,23,0.1)", border:"1px solid rgba(212,160,23,0.2)",
            borderRadius:"100px", padding:"6px 18px", marginBottom:"28px",
            fontSize:"11px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.15em", color:"#D4A017",
          }}>
            <span style={{ width:"6px", height:"6px", borderRadius:"50%", background:"#D4A017", animation:"pulse 2s infinite" }} />
            Southern View Development
          </div>

          <h1 style={{
            fontFamily:"'Playfair Display',serif", fontSize:"clamp(38px, 6vw, 68px)",
            fontWeight:900, lineHeight:1.05, margin:"0 0 20px", letterSpacing:"-0.03em",
          }}>
            Calculators That
            <br />
            <span style={{ color:"#D4A017" }}>Close Jobs.</span>
          </h1>

          <p style={{ fontSize:"18px", color:"#8a8a7a", maxWidth:"560px", margin:"0 auto 36px", lineHeight:1.7, fontWeight:400 }}>
            Custom-built estimating tools for trade contractors. Stop guessing on material quantities, labor costs, and profit margins.
          </p>

          <div style={{ display:"flex", gap:"14px", justifyContent:"center", flexWrap:"wrap" }}>
            <button onClick={()=>scrollTo(demoRef)} style={{
              background:"#D4A017", color:"#1a1a14", border:"none", padding:"16px 36px",
              borderRadius:"10px", fontSize:"15px", fontWeight:700, cursor:"pointer",
              fontFamily:"'Outfit',sans-serif", transition:"transform 0.2s, box-shadow 0.2s",
              boxShadow:"0 4px 24px rgba(212,160,23,0.3)",
            }}>
              Try the Live Demo ↓
            </button>
            <button onClick={()=>scrollTo(tradesRef)} style={{
              background:"transparent", color:"#e8e8d8", border:"1px solid #3a3a32",
              padding:"16px 36px", borderRadius:"10px", fontSize:"15px", fontWeight:600,
              cursor:"pointer", fontFamily:"'Outfit',sans-serif",
            }}>
              Browse All Trades
            </button>
          </div>

          {/* Stats bar */}
          <div style={{ display:"flex", justifyContent:"center", gap:"48px", marginTop:"56px", flexWrap:"wrap" }}>
            {[
              { num:"9", label:"Trade Verticals" },
              { num:"2", label:"Delivery Formats" },
              { num:"72hr", label:"Custom Turnaround" },
            ].map(s=>(
              <div key={s.label} style={{ textAlign:"center" }}>
                <div style={{ fontSize:"28px", fontWeight:800, color:"#D4A017" }}>{s.num}</div>
                <div style={{ fontSize:"11px", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.1em", color:"#5a5a4a", marginTop:"2px" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ HOW IT WORKS ═══ */}
      <div style={{ maxWidth:"1100px", margin:"0 auto", padding:"80px 24px 60px" }}>
        <div style={{ textAlign:"center", marginBottom:"48px" }}>
          <div style={{ fontSize:"11px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.15em", color:"#D4A017", marginBottom:"12px" }}>How It Works</div>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"32px", fontWeight:800, margin:0 }}>Two Ways to Get Your Calculator</h2>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"24px", maxWidth:"800px", margin:"0 auto" }}>
          <div style={{ background:"#1e1e16", borderRadius:"16px", padding:"32px", border:"1px solid #2a2a22" }}>
            <div style={{ fontSize:"40px", marginBottom:"16px" }}>💻</div>
            <div style={{ fontSize:"18px", fontWeight:700, marginBottom:"6px" }}>Interactive Web App</div>
            <div style={{ fontSize:"13px", color:"#7a7a6a", lineHeight:1.6, marginBottom:"16px" }}>
              Beautiful, branded calculator that lives on your website. Customers can get instant estimates. You can embed it anywhere.
            </div>
            <div style={{ fontSize:"12px", color:"#D4A017", fontWeight:600 }}>✓ Embeddable &nbsp; ✓ Mobile-friendly &nbsp; ✓ Lead capture ready</div>
          </div>
          <div style={{ background:"#1e1e16", borderRadius:"16px", padding:"32px", border:"1px solid #2a2a22" }}>
            <div style={{ fontSize:"40px", marginBottom:"16px" }}>📊</div>
            <div style={{ fontSize:"18px", fontWeight:700, marginBottom:"6px" }}>Excel / Google Sheets</div>
            <div style={{ fontSize:"13px", color:"#7a7a6a", lineHeight:1.6, marginBottom:"16px" }}>
              Downloadable spreadsheet calculator. Works offline, no internet needed. Perfect for job sites and trucks. Edit your own prices.
            </div>
            <div style={{ fontSize:"12px", color:"#D4A017", fontWeight:600 }}>✓ Works offline &nbsp; ✓ Fully editable &nbsp; ✓ Instant download</div>
          </div>
        </div>
      </div>

      {/* ═══ TRADES GRID ═══ */}
      <div ref={tradesRef} style={{ maxWidth:"1100px", margin:"0 auto", padding:"40px 24px 80px" }}>
        <div style={{ textAlign:"center", marginBottom:"48px" }}>
          <div style={{ fontSize:"11px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.15em", color:"#D4A017", marginBottom:"12px" }}>Trade Verticals</div>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"32px", fontWeight:800, margin:"0 0 8px" }}>Calculators For Every Trade</h2>
          <p style={{ fontSize:"15px", color:"#6a6a5a", maxWidth:"500px", margin:"0 auto" }}>Each calculator is built with real industry math — not generic templates.</p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))", gap:"20px" }}>
          {TRADES.map((t,i)=><TradeCard key={t.id} trade={t} index={i} />)}
        </div>
      </div>

      {/* ═══ LIVE DEMO ═══ */}
      <div ref={demoRef} style={{ padding:"80px 24px", background:"radial-gradient(ellipse at 50% 50%, rgba(212,160,23,0.04) 0%, transparent 60%)" }}>
        <div style={{ maxWidth:"640px", margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:"36px" }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:"8px", background:"rgba(212,160,23,0.1)", border:"1px solid rgba(212,160,23,0.2)", borderRadius:"100px", padding:"5px 16px", marginBottom:"16px", fontSize:"10px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.12em", color:"#D4A017" }}>
              <span style={{ width:"6px", height:"6px", borderRadius:"50%", background:"#22c55e" }} /> Live & Interactive
            </div>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"30px", fontWeight:800, margin:"0 0 8px" }}>Try the Roofing Calculator</h2>
            <p style={{ fontSize:"14px", color:"#6a6a5a" }}>This is what your customers see. Enter measurements, get an instant estimate.</p>
          </div>

          <div style={{ background:"#1a1a14", borderRadius:"20px", padding:"32px", border:"1px solid #2a2a22", boxShadow:"0 8px 48px rgba(0,0,0,0.4)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"24px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                <span style={{ fontSize:"22px" }}>🏠</span>
                <div>
                  <div style={{ fontSize:"16px", fontWeight:700 }}>Roofing Estimate</div>
                  <div style={{ fontSize:"11px", color:"#5a5a4a" }}>Basic Tier Demo</div>
                </div>
              </div>
              <div style={{ background:"rgba(212,160,23,0.1)", border:"1px solid rgba(212,160,23,0.2)", color:"#D4A017", padding:"4px 12px", borderRadius:"100px", fontSize:"10px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em" }}>
                Interactive
              </div>
            </div>
            <RoofingDemo />
          </div>

          <div style={{ textAlign:"center", marginTop:"24px" }}>
            <p style={{ fontSize:"13px", color:"#5a5a4a", marginBottom:"16px" }}>This is just the Basic tier. Advanced includes multi-section roofs, PDF quotes, and website embedding.</p>
            <button onClick={()=>scrollTo(pricingRef)} style={{ background:"transparent", color:"#D4A017", border:"1px solid rgba(212,160,23,0.3)", padding:"12px 28px", borderRadius:"8px", fontSize:"13px", fontWeight:700, cursor:"pointer", fontFamily:"'Outfit',sans-serif" }}>
              See All Pricing →
            </button>
          </div>
        </div>
      </div>

      {/* ═══ PRICING ═══ */}
      <div ref={pricingRef} style={{ maxWidth:"1100px", margin:"0 auto", padding:"80px 24px" }}>
        <div style={{ textAlign:"center", marginBottom:"48px" }}>
          <div style={{ fontSize:"11px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.15em", color:"#D4A017", marginBottom:"12px" }}>Pricing</div>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"32px", fontWeight:800, margin:"0 0 8px" }}>Choose Your Package</h2>
          <p style={{ fontSize:"15px", color:"#6a6a5a", maxWidth:"500px", margin:"0 auto" }}>Every calculator is custom-built for your trade. Pricing applies to any vertical.</p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))", gap:"20px", maxWidth:"960px", margin:"0 auto" }}>
          {PRICING_TIERS.map((t,i)=><PricingCard key={t.name} tier={t} index={i} />)}
        </div>

        {/* FAQ-like extras */}
        <div style={{ maxWidth:"700px", margin:"48px auto 0", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px" }}>
          {[
            { q:"What do I get?", a:"A fully functional calculator — web app, Excel file, or both — customized for your trade and your pricing." },
            { q:"How fast is delivery?", a:"Pre-built calculators are instant download. Custom builds are delivered within 72 hours." },
            { q:"Can I update my prices?", a:"Yes. Excel versions are fully editable. Web app Advanced tier includes an editable price database." },
            { q:"Do I need technical skills?", a:"No. We handle everything. Web apps come with an embed code you paste into your site — or we do it for you." },
          ].map(item=>(
            <div key={item.q} style={{ background:"#1e1e16", borderRadius:"12px", padding:"20px", border:"1px solid #2a2a22" }}>
              <div style={{ fontSize:"14px", fontWeight:700, marginBottom:"6px", color:"#D4A017" }}>{item.q}</div>
              <div style={{ fontSize:"12px", color:"#7a7a6a", lineHeight:1.6 }}>{item.a}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ BOTTOM CTA ═══ */}
      <div style={{ padding:"80px 24px", background:"radial-gradient(ellipse at 50% 50%, rgba(212,160,23,0.06) 0%, transparent 50%)" }}>
        <div style={{ maxWidth:"600px", margin:"0 auto", textAlign:"center" }}>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"34px", fontWeight:800, margin:"0 0 14px" }}>
            Every Wrong Estimate <span style={{ color:"#D4A017" }}>Costs You Money.</span>
          </h2>
          <p style={{ fontSize:"16px", color:"#7a7a6a", lineHeight:1.7, marginBottom:"32px" }}>
            Get a calculator built for your trade and start quoting with confidence. Pre-built options available for instant download, or we'll custom-build one for your business in 72 hours.
          </p>
          <div style={{ display:"flex", gap:"14px", justifyContent:"center", flexWrap:"wrap" }}>
            <button style={{
              background:"#D4A017", color:"#1a1a14", border:"none", padding:"16px 36px",
              borderRadius:"10px", fontSize:"15px", fontWeight:700, cursor:"pointer",
              fontFamily:"'Outfit',sans-serif", boxShadow:"0 4px 24px rgba(212,160,23,0.3)",
            }}>
              Get Started — From $397
            </button>
            <button style={{
              background:"transparent", color:"#e8e8d8", border:"1px solid #3a3a32",
              padding:"16px 36px", borderRadius:"10px", fontSize:"15px", fontWeight:600,
              cursor:"pointer", fontFamily:"'Outfit',sans-serif",
            }}>
              Book a Demo Call
            </button>
          </div>
        </div>
      </div>

      {/* ═══ FOOTER ═══ */}
      <div style={{ borderTop:"1px solid #2a2a22", padding:"32px 24px" }}>
        <div style={{ maxWidth:"1100px", margin:"0 auto", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"16px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
            <div style={{ width:"28px", height:"28px", background:"linear-gradient(135deg,#D4A017,#B8860B)", borderRadius:"6px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"14px", fontWeight:900, color:"#1a1a14" }}>T</div>
            <span style={{ fontSize:"14px", fontWeight:700 }}>Trade Blueprint</span>
            <span style={{ fontSize:"12px", color:"#4a4a3a", marginLeft:"4px" }}>by Southern View Development</span>
          </div>
          <div style={{ fontSize:"12px", color:"#4a4a3a" }}>
            Built with precision. Powered by real trade math.
          </div>
        </div>
      </div>

      {/* Pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
