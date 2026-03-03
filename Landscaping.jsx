import BackNav from "./BackNav";
import { useState } from "react";

const MATERIAL_TYPES = {
  "Mulch (Hardwood)": { costYd: 35, coverSqftAt3in: 108, unit: "cubic yards", density: "standard" },
  "Mulch (Cedar)": { costYd: 45, coverSqftAt3in: 108, unit: "cubic yards", density: "standard" },
  "Mulch (Rubber)": { costYd: 110, coverSqftAt3in: 108, unit: "cubic yards", density: "standard" },
  "River Rock (3/4\")": { costYd: 55, coverSqftAt3in: 100, unit: "cubic yards", density: "heavy" },
  "Pea Gravel": { costYd: 45, coverSqftAt3in: 100, unit: "cubic yards", density: "heavy" },
  "Crushed Granite": { costYd: 50, coverSqftAt3in: 100, unit: "cubic yards", density: "heavy" },
  "Topsoil": { costYd: 30, coverSqftAt3in: 108, unit: "cubic yards", density: "standard" },
  "Compost Blend": { costYd: 40, coverSqftAt3in: 108, unit: "cubic yards", density: "standard" },
  "Sand (Fill)": { costYd: 25, coverSqftAt3in: 108, unit: "cubic yards", density: "heavy" },
  "Decorative Stone": { costYd: 85, coverSqftAt3in: 90, unit: "cubic yards", density: "heavy" },
};

const PAVER_TYPES = {
  "Concrete Pavers (standard)": { costSqft: 4, labSqft: 6 },
  "Concrete Pavers (premium)": { costSqft: 7, labSqft: 7 },
  "Natural Stone Flagstone": { costSqft: 10, labSqft: 9 },
  "Travertine": { costSqft: 12, labSqft: 8 },
  "Brick Pavers": { costSqft: 6, labSqft: 7 },
  "Porcelain Pavers": { costSqft: 14, labSqft: 8 },
  "Permeable Pavers": { costSqft: 9, labSqft: 8 },
};

const PAVER_PATTERNS = {
  "Running Bond": { wastePct: 5 },
  "Herringbone": { wastePct: 10 },
  "Basket Weave": { wastePct: 8 },
  "Circular": { wastePct: 15 },
  "Random": { wastePct: 12 },
  "Soldier Course Border": { wastePct: 7 },
};

const SOD_TYPES = {
  "Bermuda": { costSqft: 0.35, labSqft: 0.25 },
  "Zoysia": { costSqft: 0.55, labSqft: 0.25 },
  "Fescue": { costSqft: 0.40, labSqft: 0.25 },
  "St. Augustine": { costSqft: 0.45, labSqft: 0.28 },
  "Kentucky Bluegrass": { costSqft: 0.50, labSqft: 0.28 },
  "Seed (Bermuda)": { costSqft: 0.08, labSqft: 0.10 },
  "Seed (Fescue)": { costSqft: 0.10, labSqft: 0.10 },
  "Hydroseed": { costSqft: 0.12, labSqft: 0.08 },
};

const SERVICES = {
  "Bed Preparation (per sqft)": 1.50,
  "Edging Install (per LF)": 3.50,
  "Landscape Fabric (per sqft)": 0.35,
  "Tree Planting (small, each)": 150,
  "Tree Planting (large, each)": 350,
  "Shrub Planting (each)": 45,
  "Annual/Perennial (each)": 12,
  "Irrigation Repair (per zone)": 175,
  "Drainage French Drain (per LF)": 28,
  "Retaining Wall (per LF)": 55,
  "Outdoor Lighting (per fixture)": 185,
  "Grading / Leveling (per sqft)": 1.25,
};

function fmt(n) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}

export default function LandscapingCalculator() {
  const [tab, setTab] = useState("material");

  // Material calc
  const [matType, setMatType] = useState("Mulch (Hardwood)");
  const [matSqft, setMatSqft] = useState("500");
  const [matDepth, setMatDepth] = useState("3");
  const [deliveryFee, setDeliveryFee] = useState("75");

  // Paver calc
  const [paverType, setPaverType] = useState("Concrete Pavers (standard)");
  const [paverPattern, setPaverPattern] = useState("Running Bond");
  const [paverSqft, setPaverSqft] = useState("300");
  const [paverBase, setPaverBase] = useState(true);
  const [paverEdge, setPaverEdge] = useState("");

  // Sod calc
  const [sodType, setSodType] = useState("Bermuda");
  const [sodSqft, setSodSqft] = useState("2000");
  const [soilPrep, setSoilPrep] = useState(true);

  // Services
  const [selServices, setSelServices] = useState([]);
  const [serviceQtys, setServiceQtys] = useState({});

  const [margin, setMargin] = useState(35);

  const S = {
    inp: { width: "100%", padding: "10px 12px", border: "2px solid #1a2a18", borderRadius: "6px", fontSize: "14px", fontFamily: "'Outfit',sans-serif", background: "#0a1408", color: "#c0e0b0", outline: "none", boxSizing: "border-box" },
    lbl: { display: "block", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#508030", marginBottom: "5px" },
    sel: { width: "100%", padding: "10px 12px", border: "2px solid #1a2a18", borderRadius: "6px", fontSize: "14px", fontFamily: "'Outfit',sans-serif", background: "#0a1408", color: "#c0e0b0", outline: "none", boxSizing: "border-box", appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath fill='%23508030' d='M5 7L1 3h8z'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center", paddingRight: "28px" },
    card: { background: "#101c0e", borderRadius: "16px", padding: "28px", border: "1px solid #1a2a18", marginBottom: "20px" },
    h3: { fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#43A047", marginTop: 0, marginBottom: "18px" },
  };

  // Material calculations
  const mat = MATERIAL_TYPES[matType];
  const mSqft = parseFloat(matSqft) || 0;
  const mDepth = parseFloat(matDepth) || 3;
  const cubicFt = mSqft * (mDepth / 12);
  const cubicYards = cubicFt / 27;
  const yardsToOrder = Math.ceil(cubicYards * 4) / 4;
  const matCost = yardsToOrder * mat.costYd;
  const matLabor = mSqft * 0.50; // $0.50/sqft install
  const delFee = parseFloat(deliveryFee) || 0;
  const matTotal = matCost + matLabor + delFee;

  // Paver calculations
  const pv = PAVER_TYPES[paverType];
  const pp = PAVER_PATTERNS[paverPattern];
  const pSqft = parseFloat(paverSqft) || 0;
  const pSqftWithWaste = pSqft * (1 + pp.wastePct / 100);
  const pEdgeLF = parseFloat(paverEdge) || Math.sqrt(pSqft) * 4;
  const pvMatCost = pSqftWithWaste * pv.costSqft;
  const pvLabCost = pSqft * pv.labSqft;
  const pvBaseCost = paverBase ? pSqft * 2.50 : 0; // gravel + sand base
  const pvEdgeCost = pEdgeLF * 3.50;
  const pvTotal = pvMatCost + pvLabCost + pvBaseCost + pvEdgeCost;

  // Sod calculations
  const sd = SOD_TYPES[sodType];
  const sSqft = parseFloat(sodSqft) || 0;
  const sodMatCost = sSqft * sd.costSqft;
  const sodLabCost = sSqft * sd.labSqft;
  const sodPrepCost = soilPrep ? sSqft * 0.35 : 0;
  const sodTotal = sodMatCost + sodLabCost + sodPrepCost;

  // Services
  let serviceCost = 0;
  selServices.forEach(s => {
    const price = SERVICES[s];
    const qty = parseInt(serviceQtys[s]) || 1;
    serviceCost += price * qty;
  });

  // Grand total based on active tab
  const tabCost = tab === "material" ? matTotal : tab === "paver" ? pvTotal : sodTotal;
  const totalCost = Math.round(tabCost + serviceCost);
  const sellPrice = Math.round(totalCost / (1 - margin / 100));
  const profit = sellPrice - totalCost;

  const toggleService = (s) => {
    setSelServices(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);
    if (!serviceQtys[s]) setServiceQtys(p => ({ ...p, [s]: "1" }));
  };

  const tabBtn = (id, label) => <button onClick={() => setTab(id)} style={{ padding: "10px 24px", borderRadius: "8px", border: "none", background: tab === id ? "#43A047" : "rgba(67,160,71,0.15)", color: tab === id ? "white" : "#43A047", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}>{label}</button>;

  return (
    <div style={{ fontFamily: "'Outfit',sans-serif", background: "#060e04", color: "#c0e0b0", minHeight: "100vh" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@700;800;900&display=swap" rel="stylesheet" />

      <div style={{ background: "linear-gradient(160deg,#1B5E20,#2E7D32,#43A047)", padding: "40px 24px 48px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 30% 70%,rgba(100,255,100,0.05) 0%,transparent 50%)" }} />
        <div style={{ position: "relative", maxWidth: "700px", margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "100px", padding: "5px 16px", marginBottom: "16px", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.8)" }}>🌿 Landscaping Calculator</div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(28px,4vw,42px)", fontWeight: 900, lineHeight: 1.1, margin: "0 0 10px", color: "white" }}>
            Measure the Yard. <span style={{ color: "#A5D6A7" }}>Master the Bid.</span>
          </h1>
          <p style={{ fontSize: "15px", opacity: 0.75, maxWidth: "480px", margin: "0 auto", lineHeight: 1.6 }}>Material volumes, paver layouts, sod estimates, and profit-driven quoting.</p>
        </div>
      </div>

      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "32px 20px" }}>
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px", justifyContent: "center" }}>
          {tabBtn("material", "Bulk Material")}
          {tabBtn("paver", "Pavers")}
          {tabBtn("sod", "Sod / Seed")}
        </div>

        {tab === "material" && (
          <div style={S.card}>
            <h3 style={S.h3}>Bulk Material Calculator</h3>
            <div style={{ marginBottom: "14px" }}>
              <label style={S.lbl}>Material Type</label>
              <select value={matType} onChange={e => setMatType(e.target.value)} style={S.sel}>
                {Object.keys(MATERIAL_TYPES).map(m => <option key={m} value={m}>{m} — {fmt(MATERIAL_TYPES[m].costYd)}/yd³</option>)}
              </select>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
              <div><label style={S.lbl}>Area (sq ft)</label><input type="number" value={matSqft} onChange={e => setMatSqft(e.target.value)} style={S.inp} /></div>
              <div><label style={S.lbl}>Depth (inches)</label><input type="number" value={matDepth} onChange={e => setMatDepth(e.target.value)} style={S.inp} /></div>
              <div><label style={S.lbl}>Delivery Fee</label><input type="number" value={deliveryFee} onChange={e => setDeliveryFee(e.target.value)} style={S.inp} /></div>
            </div>
            {mSqft > 0 && (
              <div style={{ marginTop: "16px", background: "rgba(67,160,71,0.08)", borderRadius: "10px", padding: "14px", border: "1px solid rgba(67,160,71,0.2)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", fontSize: "13px" }}>
                  <div><span style={{ color: "#508030", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", display: "block" }}>Volume</span><span style={{ fontWeight: 700, fontSize: "16px" }}>{yardsToOrder} yd³</span></div>
                  <div><span style={{ color: "#508030", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", display: "block" }}>Material</span><span style={{ fontWeight: 700, fontSize: "16px" }}>{fmt(matCost)}</span></div>
                  <div><span style={{ color: "#508030", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", display: "block" }}>Install Labor</span><span style={{ fontWeight: 700, fontSize: "16px" }}>{fmt(Math.round(matLabor))}</span></div>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "paver" && (
          <div style={S.card}>
            <h3 style={S.h3}>Paver Calculator</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
              <div><label style={S.lbl}>Paver Type</label><select value={paverType} onChange={e => setPaverType(e.target.value)} style={S.sel}>{Object.keys(PAVER_TYPES).map(p => <option key={p} value={p}>{p}</option>)}</select></div>
              <div><label style={S.lbl}>Pattern</label><select value={paverPattern} onChange={e => setPaverPattern(e.target.value)} style={S.sel}>{Object.keys(PAVER_PATTERNS).map(p => <option key={p} value={p}>{p} (+{PAVER_PATTERNS[p].wastePct}% waste)</option>)}</select></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
              <div><label style={S.lbl}>Area (sq ft)</label><input type="number" value={paverSqft} onChange={e => setPaverSqft(e.target.value)} style={S.inp} /></div>
              <div><label style={S.lbl}>Edge (LF)</label><input type="number" value={paverEdge} onChange={e => setPaverEdge(e.target.value)} placeholder={`Auto: ${Math.round(pEdgeLF)}`} style={S.inp} /></div>
              <div style={{ display: "flex", alignItems: "end", paddingBottom: "4px" }}>
                <label style={{ ...S.lbl, display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", marginBottom: 0 }}>
                  <input type="checkbox" checked={paverBase} onChange={e => setPaverBase(e.target.checked)} style={{ accentColor: "#43A047", width: "16px", height: "16px" }} />
                  <span style={{ fontSize: "13px", textTransform: "none", letterSpacing: "0" }}>Include Base</span>
                </label>
              </div>
            </div>
            {pSqft > 0 && (
              <div style={{ marginTop: "16px", background: "rgba(67,160,71,0.08)", borderRadius: "10px", padding: "14px", border: "1px solid rgba(67,160,71,0.2)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "10px", fontSize: "13px" }}>
                  <div><span style={{ color: "#508030", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", display: "block" }}>Pavers</span><span style={{ fontWeight: 700 }}>{fmt(Math.round(pvMatCost))}</span></div>
                  <div><span style={{ color: "#508030", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", display: "block" }}>Labor</span><span style={{ fontWeight: 700 }}>{fmt(Math.round(pvLabCost))}</span></div>
                  <div><span style={{ color: "#508030", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", display: "block" }}>Base</span><span style={{ fontWeight: 700 }}>{fmt(Math.round(pvBaseCost))}</span></div>
                  <div><span style={{ color: "#508030", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", display: "block" }}>Edging</span><span style={{ fontWeight: 700 }}>{fmt(Math.round(pvEdgeCost))}</span></div>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "sod" && (
          <div style={S.card}>
            <h3 style={S.h3}>Sod / Seed Calculator</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
              <div><label style={S.lbl}>Grass Type</label><select value={sodType} onChange={e => setSodType(e.target.value)} style={S.sel}>{Object.keys(SOD_TYPES).map(s => <option key={s} value={s}>{s} — ${SOD_TYPES[s].costSqft}/sqft</option>)}</select></div>
              <div><label style={S.lbl}>Area (sq ft)</label><input type="number" value={sodSqft} onChange={e => setSodSqft(e.target.value)} style={S.inp} /></div>
            </div>
            <label style={{ ...S.lbl, display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
              <input type="checkbox" checked={soilPrep} onChange={e => setSoilPrep(e.target.checked)} style={{ accentColor: "#43A047", width: "16px", height: "16px" }} />
              <span style={{ fontSize: "13px", textTransform: "none", letterSpacing: "0" }}>Include Soil Prep (+$0.35/sqft)</span>
            </label>
            {sSqft > 0 && (
              <div style={{ marginTop: "16px", background: "rgba(67,160,71,0.08)", borderRadius: "10px", padding: "14px", border: "1px solid rgba(67,160,71,0.2)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", fontSize: "13px" }}>
                  <div><span style={{ color: "#508030", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", display: "block" }}>Material</span><span style={{ fontWeight: 700 }}>{fmt(Math.round(sodMatCost))}</span></div>
                  <div><span style={{ color: "#508030", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", display: "block" }}>Labor</span><span style={{ fontWeight: 700 }}>{fmt(Math.round(sodLabCost))}</span></div>
                  <div><span style={{ color: "#508030", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", display: "block" }}>Soil Prep</span><span style={{ fontWeight: 700 }}>{fmt(Math.round(sodPrepCost))}</span></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Additional Services */}
        <div style={S.card}>
          <h3 style={S.h3}>Additional Services</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
            {Object.entries(SERVICES).map(([name, cost]) => (
              <div key={name} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 10px", borderRadius: "8px", background: selServices.includes(name) ? "rgba(67,160,71,0.12)" : "transparent", border: selServices.includes(name) ? "1px solid rgba(67,160,71,0.3)" : "1px solid transparent", cursor: "pointer" }} onClick={() => toggleService(name)}>
                <input type="checkbox" checked={selServices.includes(name)} readOnly style={{ accentColor: "#43A047", width: "15px", height: "15px", pointerEvents: "none" }} />
                <span style={{ fontSize: "11px", flex: 1, color: selServices.includes(name) ? "#c0e0b0" : "#4a6a3a" }}>{name}</span>
                {selServices.includes(name) && (
                  <input type="number" value={serviceQtys[name] || "1"} onClick={e => e.stopPropagation()} onChange={e => setServiceQtys(p => ({ ...p, [name]: e.target.value }))} min="1" style={{ ...S.inp, width: "50px", padding: "4px 6px", fontSize: "12px", textAlign: "center" }} />
                )}
                <span style={{ fontSize: "10px", fontWeight: 700, color: "#43A047" }}>${cost}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Margin */}
        <div style={S.card}>
          <label style={S.lbl}>Desired Profit Margin: {margin}%</label>
          <input type="range" min="10" max="60" value={margin} onChange={e => setMargin(+e.target.value)} style={{ width: "100%", accentColor: "#43A047" }} />
        </div>

        {/* Results */}
        <div style={{ background: "linear-gradient(135deg,#1B5E20,#2E7D32,#43A047)", borderRadius: "16px", padding: "28px", color: "white", marginBottom: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <div style={{ fontSize: "12px", opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.1em" }}>Quote Price</div>
              <div style={{ fontSize: "40px", fontWeight: 800, lineHeight: 1.1 }}>{fmt(sellPrice)}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "12px", opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.1em" }}>Your Profit</div>
              <div style={{ fontSize: "26px", fontWeight: 700, color: "#A5D6A7" }}>{fmt(profit)}</div>
              <div style={{ fontSize: "13px", opacity: 0.7 }}>{margin}% margin</div>
            </div>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div style={S.card}>
          <h3 style={S.h3}>Cost Breakdown</h3>
          {tab === "material" && mSqft > 0 && [
            { label: `${matType}`, value: Math.round(matCost), sub: `${yardsToOrder} yd³ × ${fmt(mat.costYd)}/yd — ${mSqft} sqft @ ${mDepth}" deep` },
            { label: "Install Labor", value: Math.round(matLabor), sub: `${mSqft} sqft × $0.50/sqft` },
            { label: "Delivery", value: delFee, sub: mat.density === "heavy" ? "Heavy material" : "Standard delivery" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #1a2a18" }}>
              <div><div style={{ fontSize: "14px", fontWeight: 600 }}>{item.label}</div><div style={{ fontSize: "11px", color: "#3a5a2a" }}>{item.sub}</div></div>
              <div style={{ fontSize: "15px", fontWeight: 700 }}>{fmt(item.value)}</div>
            </div>
          ))}
          {tab === "paver" && pSqft > 0 && [
            { label: `${paverType}`, value: Math.round(pvMatCost), sub: `${Math.round(pSqftWithWaste)} sqft (incl. ${pp.wastePct}% waste for ${paverPattern})` },
            { label: "Paver Labor", value: Math.round(pvLabCost), sub: `${pSqft} sqft × ${fmt(pv.labSqft)}/sqft` },
            ...(paverBase ? [{ label: "Gravel + Sand Base", value: Math.round(pvBaseCost), sub: `${pSqft} sqft × $2.50/sqft` }] : []),
            { label: "Edge Restraint", value: Math.round(pvEdgeCost), sub: `${Math.round(pEdgeLF)} LF × $3.50/LF` },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #1a2a18" }}>
              <div><div style={{ fontSize: "14px", fontWeight: 600 }}>{item.label}</div><div style={{ fontSize: "11px", color: "#3a5a2a" }}>{item.sub}</div></div>
              <div style={{ fontSize: "15px", fontWeight: 700 }}>{fmt(item.value)}</div>
            </div>
          ))}
          {tab === "sod" && sSqft > 0 && [
            { label: `${sodType}`, value: Math.round(sodMatCost), sub: `${sSqft} sqft × $${sd.costSqft}/sqft` },
            { label: "Install Labor", value: Math.round(sodLabCost), sub: `${sSqft} sqft × $${sd.labSqft}/sqft` },
            ...(soilPrep ? [{ label: "Soil Prep", value: Math.round(sodPrepCost), sub: `${sSqft} sqft × $0.35/sqft` }] : []),
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #1a2a18" }}>
              <div><div style={{ fontSize: "14px", fontWeight: 600 }}>{item.label}</div><div style={{ fontSize: "11px", color: "#3a5a2a" }}>{item.sub}</div></div>
              <div style={{ fontSize: "15px", fontWeight: 700 }}>{fmt(item.value)}</div>
            </div>
          ))}
          {serviceCost > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #1a2a18" }}>
              <div><div style={{ fontSize: "14px", fontWeight: 600 }}>Additional Services</div><div style={{ fontSize: "11px", color: "#3a5a2a" }}>{selServices.map(s => `${s} ×${serviceQtys[s] || 1}`).join(", ")}</div></div>
              <div style={{ fontSize: "15px", fontWeight: 700 }}>{fmt(Math.round(serviceCost))}</div>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 0 0" }}>
            <div style={{ fontSize: "15px", fontWeight: 800, color: "#43A047" }}>Total Job Cost</div>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "#43A047" }}>{fmt(totalCost)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
