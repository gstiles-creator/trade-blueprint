import BackNav from "./BackNav";
import { useState } from "react";

const FIXTURES = {
  "Toilet": { units: 3, drain: "3\"", cost: 350, labor: 280 },
  "Bathroom Sink": { units: 1, drain: "1-1/2\"", cost: 180, labor: 200 },
  "Kitchen Sink": { units: 2, drain: "1-1/2\"", cost: 280, labor: 250 },
  "Bathtub": { units: 2, drain: "1-1/2\"", cost: 450, labor: 350 },
  "Shower": { units: 2, drain: "2\"", cost: 380, labor: 320 },
  "Dishwasher": { units: 2, drain: "1-1/2\"", cost: 120, labor: 180 },
  "Washing Machine": { units: 2, drain: "2\"", cost: 95, labor: 200 },
  "Utility Sink": { units: 2, drain: "1-1/2\"", cost: 200, labor: 220 },
  "Hose Bib": { units: 1, drain: "—", cost: 45, labor: 120 },
  "Ice Maker": { units: 0.5, drain: "—", cost: 35, labor: 80 },
  "Wet Bar Sink": { units: 1, drain: "1-1/2\"", cost: 150, labor: 180 },
};

const WH_TYPES = {
  "Tank Gas 40gal": { cost: 650, labor: 450, fhr: 70 },
  "Tank Gas 50gal": { cost: 800, labor: 450, fhr: 80 },
  "Tank Electric 40gal": { cost: 500, labor: 350, fhr: 52 },
  "Tank Electric 50gal": { cost: 600, labor: 350, fhr: 62 },
  "Tankless Gas": { cost: 1800, labor: 800, fhr: 999 },
  "Tankless Electric": { cost: 1200, labor: 600, fhr: 999 },
  "Heat Pump": { cost: 2200, labor: 650, fhr: 68 },
};

const PIPE_MAT = {
  "PEX": { matFt: 1.5, labFt: 3.5 },
  "Copper (Type L)": { matFt: 4.5, labFt: 6.0 },
  "CPVC": { matFt: 1.8, labFt: 4.0 },
  "PVC Drain": { matFt: 2.2, labFt: 4.5 },
  "ABS Drain": { matFt: 1.9, labFt: 4.0 },
  "Cast Iron Drain": { matFt: 8.0, labFt: 10.0 },
};

const JOBS = {
  "Bathroom Remodel (Full)": { mat: 600, lab: 1800 },
  "Kitchen Remodel": { mat: 400, lab: 1200 },
  "New Construction Rough-In": { mat: 800, lab: 2500 },
  "Water Heater Replace": { mat: 0, lab: 0 },
  "Re-pipe Whole House": { mat: 1200, lab: 3500 },
  "Sewer Line Replace": { mat: 800, lab: 2800 },
  "Water Line Replace": { mat: 500, lab: 1500 },
  "Drain Cleaning / Service": { mat: 50, lab: 175 },
  "Gas Line Install": { mat: 300, lab: 600 },
  "Sump Pump Install": { mat: 450, lab: 400 },
};

function fmt(n) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}

export default function PlumbingCalculator() {
  const [selFix, setSelFix] = useState([
    { name: "Toilet", qty: 2 }, { name: "Bathroom Sink", qty: 2 },
    { name: "Kitchen Sink", qty: 1 }, { name: "Shower", qty: 1 },
    { name: "Dishwasher", qty: 1 }, { name: "Washing Machine", qty: 1 },
  ]);
  const [occupants, setOccupants] = useState("4");
  const [whType, setWhType] = useState("Tank Gas 50gal");
  const [includeWH, setIncludeWH] = useState(true);
  const [pipeMat, setPipeMat] = useState("PEX");
  const [pipeRun, setPipeRun] = useState("");
  const [jobType, setJobType] = useState("Bathroom Remodel (Full)");
  const [margin, setMargin] = useState(35);
  const [permit, setPermit] = useState("250");

  const S = {
    inp: { width: "100%", padding: "10px 12px", border: "2px solid #1a3a3a", borderRadius: "6px", fontSize: "14px", fontFamily: "'Outfit',sans-serif", background: "#0a1a1a", color: "#c8e8e0", outline: "none", boxSizing: "border-box" },
    lbl: { display: "block", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#508888", marginBottom: "5px" },
    sel: { width: "100%", padding: "10px 12px", border: "2px solid #1a3a3a", borderRadius: "6px", fontSize: "14px", fontFamily: "'Outfit',sans-serif", background: "#0a1a1a", color: "#c8e8e0", outline: "none", boxSizing: "border-box", appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath fill='%23508888' d='M5 7L1 3h8z'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center", paddingRight: "28px" },
    card: { background: "#0f1f1f", borderRadius: "16px", padding: "28px", border: "1px solid #1a3333", marginBottom: "20px" },
    h3: { fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#00897B", marginTop: 0, marginBottom: "18px" },
  };

  const totalUnits = selFix.reduce((s, f) => s + (FIXTURES[f.name]?.units || 0) * f.qty, 0);
  const occ = parseInt(occupants) || 4;
  const peakGPH = occ * 20;
  const wh = WH_TYPES[whType];
  const mainSize = totalUnits > 30 ? '1-1/4"' : totalUnits > 15 ? '1"' : '3/4"';
  const estRun = parseFloat(pipeRun) || selFix.reduce((s, f) => s + f.qty, 0) * 25;
  const pm = PIPE_MAT[pipeMat];
  const jb = JOBS[jobType];
  const prm = parseInt(permit) || 0;

  const fixMat = selFix.reduce((s, f) => s + (FIXTURES[f.name]?.cost || 0) * f.qty, 0);
  const fixLab = selFix.reduce((s, f) => s + (FIXTURES[f.name]?.labor || 0) * f.qty, 0);
  const whCost = includeWH ? wh.cost : 0;
  const whLab = includeWH ? wh.labor : 0;
  const pipeCost = Math.round(estRun * pm.matFt);
  const pipeLab = Math.round(estRun * pm.labFt);

  const totalMat = fixMat + whCost + pipeCost + jb.mat;
  const totalLab = fixLab + whLab + pipeLab + jb.lab;
  const totalCost = totalMat + totalLab + prm;
  const sellPrice = Math.round(totalCost / (1 - margin / 100));
  const profit = sellPrice - totalCost;

  const toggle = (n) => setSelFix(p => p.find(f => f.name === n) ? p.filter(f => f.name !== n) : [...p, { name: n, qty: 1 }]);
  const setQty = (n, q) => setSelFix(p => p.map(f => f.name === n ? { ...f, qty: Math.max(1, parseInt(q) || 1) } : f));

  return (
    <div style={{ fontFamily: "'Outfit',sans-serif", background: "#060f0f", color: "#c8e8e0", minHeight: "100vh" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@700;800;900&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ background: "linear-gradient(160deg,#004D40,#00695C,#00897B)", padding: "40px 24px 48px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 30% 70%,rgba(100,255,218,0.06) 0%,transparent 50%)" }} />
        <div style={{ position: "relative", maxWidth: "700px", margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "100px", padding: "5px 16px", marginBottom: "16px", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.8)" }}>
            🔧 Plumbing Calculator
          </div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(28px,4vw,42px)", fontWeight: 900, lineHeight: 1.1, margin: "0 0 10px", color: "white" }}>
            Flow Rates to Final Bids — <span style={{ color: "#80CBC4" }}>Calculated.</span>
          </h1>
          <p style={{ fontSize: "15px", opacity: 0.75, maxWidth: "480px", margin: "0 auto", lineHeight: 1.6 }}>
            Fixture units, pipe sizing, water heater selection, and profit-driven quoting.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "32px 20px" }}>

        {/* Fixtures */}
        <div style={S.card}>
          <h3 style={S.h3}>Fixtures</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
            {Object.entries(FIXTURES).map(([name, data]) => {
              const s = selFix.find(f => f.name === name);
              return (
                <div key={name} onClick={() => toggle(name)} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 10px", borderRadius: "8px", background: s ? "rgba(0,137,123,0.12)" : "transparent", border: s ? "1px solid rgba(0,137,123,0.3)" : "1px solid transparent", cursor: "pointer" }}>
                  <input type="checkbox" checked={!!s} readOnly style={{ accentColor: "#00897B", width: "15px", height: "15px", pointerEvents: "none" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "12px", color: s ? "#c8e8e0" : "#5a8888" }}>{name}</div>
                    <div style={{ fontSize: "10px", color: "#3a6666" }}>{data.units} FU · {data.drain} drain</div>
                  </div>
                  {s && <input type="number" value={s.qty} onClick={e => e.stopPropagation()} onChange={e => setQty(name, e.target.value)} min="1" max="20" style={{ ...S.inp, width: "48px", padding: "4px 6px", fontSize: "12px", textAlign: "center" }} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Water Heater & Piping */}
        <div style={S.card}>
          <h3 style={S.h3}>Water Heater & Piping</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
            <div><label style={S.lbl}>Occupants</label><input type="number" value={occupants} onChange={e => setOccupants(e.target.value)} style={S.inp} /></div>
            <div style={{ display: "flex", alignItems: "end", paddingBottom: "4px" }}>
              <label style={{ ...S.lbl, display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", marginBottom: 0 }}>
                <input type="checkbox" checked={includeWH} onChange={e => setIncludeWH(e.target.checked)} style={{ accentColor: "#00897B", width: "16px", height: "16px" }} />
                <span style={{ fontSize: "13px", textTransform: "none", letterSpacing: "0" }}>Include Water Heater</span>
              </label>
            </div>
          </div>
          {includeWH && (
            <div style={{ marginBottom: "14px" }}>
              <label style={S.lbl}>Water Heater Type</label>
              <select value={whType} onChange={e => setWhType(e.target.value)} style={S.sel}>
                {Object.keys(WH_TYPES).map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div><label style={S.lbl}>Supply Pipe Material</label><select value={pipeMat} onChange={e => setPipeMat(e.target.value)} style={S.sel}>{Object.keys(PIPE_MAT).map(p => <option key={p} value={p}>{p}</option>)}</select></div>
            <div><label style={S.lbl}>Est. Pipe Run (ft)</label><input type="number" value={pipeRun} onChange={e => setPipeRun(e.target.value)} placeholder="Auto estimate" style={S.inp} /></div>
          </div>
        </div>

        {/* Job & Margin */}
        <div style={S.card}>
          <h3 style={S.h3}>Job Type & Pricing</h3>
          <div style={{ marginBottom: "14px" }}>
            <label style={S.lbl}>Job Type</label>
            <select value={jobType} onChange={e => setJobType(e.target.value)} style={S.sel}>
              {Object.keys(JOBS).map(j => <option key={j} value={j}>{j}</option>)}
            </select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
            <div><label style={S.lbl}>Permit Cost</label><input type="number" value={permit} onChange={e => setPermit(e.target.value)} style={S.inp} /></div>
            <div><label style={S.lbl}>Margin: {margin}%</label><input type="range" min="10" max="60" value={margin} onChange={e => setMargin(+e.target.value)} style={{ width: "100%", accentColor: "#00897B", marginTop: "8px" }} /></div>
          </div>
        </div>

        {/* Results */}
        <div style={{ background: "linear-gradient(135deg,#004D40,#00695C,#00897B)", borderRadius: "16px", padding: "28px", color: "white", marginBottom: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <div style={{ fontSize: "12px", opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.1em" }}>Quote Price</div>
              <div style={{ fontSize: "40px", fontWeight: 800, lineHeight: 1.1 }}>{fmt(sellPrice)}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "12px", opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.1em" }}>Your Profit</div>
              <div style={{ fontSize: "26px", fontWeight: 700, color: "#80CBC4" }}>{fmt(profit)}</div>
              <div style={{ fontSize: "13px", opacity: 0.7 }}>{margin}% margin</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px" }}>
            {[
              { l: "Fixture Units", v: totalUnits },
              { l: "Main Size", v: mainSize },
              { l: "Peak GPH", v: `${peakGPH} gal` },
              { l: "Pipe Run", v: `${estRun} ft` },
            ].map(x => (
              <div key={x.l} style={{ background: "rgba(255,255,255,0.1)", borderRadius: "10px", padding: "12px", textAlign: "center" }}>
                <div style={{ fontSize: "9px", opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.08em" }}>{x.l}</div>
                <div style={{ fontSize: "18px", fontWeight: 700, marginTop: "2px" }}>{x.v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Cost Breakdown */}
        <div style={S.card}>
          <h3 style={S.h3}>Cost Breakdown</h3>
          {[
            { label: "Fixtures (material)", value: fixMat, sub: selFix.map(f => `${f.name} ×${f.qty}`).join(", ") },
            { label: "Fixtures (labor)", value: fixLab, sub: "Installation labor" },
            ...(includeWH ? [{ label: `Water Heater (${whType})`, value: whCost + whLab, sub: `Equipment: ${fmt(whCost)} + Install: ${fmt(whLab)}` }] : []),
            { label: `Piping (${pipeMat})`, value: pipeCost + pipeLab, sub: `${estRun} ft — Mat: ${fmt(pipeCost)} + Lab: ${fmt(pipeLab)}` },
            { label: `${jobType} (base)`, value: jb.mat + jb.lab, sub: `Mat: ${fmt(jb.mat)} + Lab: ${fmt(jb.lab)}` },
            { label: "Permits", value: prm, sub: "Local jurisdiction" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #1a3333" }}>
              <div>
                <div style={{ fontSize: "14px", fontWeight: 600 }}>{item.label}</div>
                <div style={{ fontSize: "11px", color: "#4a7a7a" }}>{item.sub}</div>
              </div>
              <div style={{ fontSize: "15px", fontWeight: 700 }}>{fmt(item.value)}</div>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 0 0" }}>
            <div style={{ fontSize: "15px", fontWeight: 800, color: "#00897B" }}>Total Job Cost</div>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "#00897B" }}>{fmt(totalCost)}</div>
          </div>
        </div>

        {/* Specs */}
        <div style={S.card}>
          <h3 style={S.h3}>System Recommendations</h3>
          {[
            { l: "Total Fixture Units", v: totalUnits },
            { l: "Recommended Main Size", v: mainSize },
            { l: "Peak Hour Demand", v: `${peakGPH} gallons (${occ} occupants)` },
            ...(includeWH ? [{ l: "Water Heater FHR", v: `${wh.fhr === 999 ? "Continuous" : wh.fhr + " gal"}/hr` }] : []),
            ...(includeWH ? [{ l: "WH Meets Demand?", v: wh.fhr >= peakGPH ? "✓ Yes" : "⚠️ May be undersized" }] : []),
            { l: "Supply Pipe Material", v: pipeMat },
            { l: "Estimated Pipe Run", v: `${estRun} linear feet` },
          ].map((row, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1a3333" }}>
              <span style={{ fontSize: "13px", color: "#6a9a9a" }}>{row.l}</span>
              <span style={{ fontSize: "13px", fontWeight: 700 }}>{row.v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
