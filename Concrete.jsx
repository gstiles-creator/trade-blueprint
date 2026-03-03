import BackNav from "./BackNav";
import { useState } from "react";

const PROJECT_TYPES = {
  "Driveway": { thicknessIn: 4, rebarSpacing: 18, finishType: "Broom", baseLabSqft: 4.5 },
  "Sidewalk": { thicknessIn: 4, rebarSpacing: 24, finishType: "Broom", baseLabSqft: 4.0 },
  "Patio": { thicknessIn: 4, rebarSpacing: 18, finishType: "Stamped", baseLabSqft: 5.0 },
  "Garage Floor": { thicknessIn: 4, rebarSpacing: 16, finishType: "Trowel", baseLabSqft: 4.5 },
  "Foundation Wall": { thicknessIn: 8, rebarSpacing: 12, finishType: "Form", baseLabSqft: 8.0 },
  "Slab on Grade": { thicknessIn: 4, rebarSpacing: 18, finishType: "Trowel", baseLabSqft: 5.0 },
  "Footings": { thicknessIn: 12, rebarSpacing: 12, finishType: "None", baseLabSqft: 6.0 },
  "Retaining Wall": { thicknessIn: 8, rebarSpacing: 12, finishType: "Form", baseLabSqft: 9.0 },
  "Pool Deck": { thicknessIn: 4, rebarSpacing: 18, finishType: "Stamped", baseLabSqft: 6.0 },
  "Steps / Stairs": { thicknessIn: 6, rebarSpacing: 12, finishType: "Trowel", baseLabSqft: 12.0 },
  "Custom": { thicknessIn: 4, rebarSpacing: 18, finishType: "Broom", baseLabSqft: 5.0 },
};

const FINISH_TYPES = {
  "Broom": { addPerSqft: 0, desc: "Standard broom finish" },
  "Trowel": { addPerSqft: 0.50, desc: "Smooth trowel finish" },
  "Stamped": { addPerSqft: 6.00, desc: "Decorative stamped pattern" },
  "Exposed Aggregate": { addPerSqft: 4.00, desc: "Exposed stone finish" },
  "Colored": { addPerSqft: 2.50, desc: "Integral color added" },
  "Stained": { addPerSqft: 3.50, desc: "Acid or water-based stain" },
  "Polished": { addPerSqft: 5.00, desc: "Ground and polished" },
  "Form": { addPerSqft: 2.00, desc: "Formed wall finish" },
  "None": { addPerSqft: 0, desc: "No finish required" },
};

const CONCRETE_PRICES = {
  "Regular (3000 PSI)": 145,
  "Mid-Strength (3500 PSI)": 155,
  "High-Strength (4000 PSI)": 165,
  "High-Strength (4500 PSI)": 178,
  "Fiber Mesh (3500 PSI)": 170,
};

const REBAR_TYPES = {
  "#3 (3/8\")": { costPerFt: 0.65, weight: 0.376 },
  "#4 (1/2\")": { costPerFt: 0.85, weight: 0.668 },
  "#5 (5/8\")": { costPerFt: 1.25, weight: 1.043 },
  "Wire Mesh (6x6 W1.4)": { costPerFt: 0.35, weight: 0.0 },
  "Fiber Mesh (per yard)": { costPerFt: 0, weight: 0 },
};

const ADDONS = {
  "Gravel Base (4\" — per sqft)": 0.75,
  "Vapor Barrier (per sqft)": 0.15,
  "Form Boards (per LF)": 2.50,
  "Expansion Joints (per LF)": 1.80,
  "Concrete Pump (flat fee)": 800,
  "Short Load Fee (under 5yd)": 150,
  "Saturday / Rush Delivery": 200,
  "Sealer (per sqft)": 0.45,
};

function fmt(n) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}

export default function ConcreteCalculator() {
  const [projectType, setProjectType] = useState("Driveway");
  const [length, setLength] = useState("20");
  const [width, setWidth] = useState("12");
  const [thickness, setThickness] = useState("4");
  const [concreteMix, setConcreteMix] = useState("Regular (3000 PSI)");
  const [rebarType, setRebarType] = useState("#4 (1/2\")");
  const [rebarSpacing, setRebarSpacing] = useState("18");
  const [finishType, setFinishType] = useState("Broom");
  const [wastePct, setWastePct] = useState(10);
  const [margin, setMargin] = useState(35);
  const [perimeterFt, setPerimeterFt] = useState("");
  const [needsPump, setNeedsPump] = useState(false);
  const [selAddons, setSelAddons] = useState(["Gravel Base (4\" — per sqft)", "Form Boards (per LF)", "Expansion Joints (per LF)"]);

  const S = {
    inp: { width: "100%", padding: "10px 12px", border: "2px solid #3a2a1a", borderRadius: "6px", fontSize: "14px", fontFamily: "'Outfit',sans-serif", background: "#1a1208", color: "#e8d8c0", outline: "none", boxSizing: "border-box" },
    lbl: { display: "block", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#8a7050", marginBottom: "5px" },
    sel: { width: "100%", padding: "10px 12px", border: "2px solid #3a2a1a", borderRadius: "6px", fontSize: "14px", fontFamily: "'Outfit',sans-serif", background: "#1a1208", color: "#e8d8c0", outline: "none", boxSizing: "border-box", appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath fill='%238a7050' d='M5 7L1 3h8z'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center", paddingRight: "28px" },
    card: { background: "#1f1a10", borderRadius: "16px", padding: "28px", border: "1px solid #332a18", marginBottom: "20px" },
    h3: { fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#8D6E63", marginTop: 0, marginBottom: "18px" },
  };

  // When project type changes, update defaults
  const handleProjectChange = (type) => {
    setProjectType(type);
    const p = PROJECT_TYPES[type];
    setThickness(String(p.thicknessIn));
    setRebarSpacing(String(p.rebarSpacing));
    setFinishType(p.finishType);
  };

  // Calculations
  const l = parseFloat(length) || 0;
  const w = parseFloat(width) || 0;
  const t = parseFloat(thickness) || 4;
  const sqft = l * w;
  const cubicFt = sqft * (t / 12);
  const cubicYards = cubicFt / 27;
  const yardsWithWaste = cubicYards * (1 + wastePct / 100);
  const yardsToOrder = Math.ceil(yardsWithWaste * 4) / 4; // round to nearest 0.25

  // Rebar
  const rSpacing = parseInt(rebarSpacing) || 18;
  const rb = REBAR_TYPES[rebarType];
  const rebarLinesL = Math.ceil((w * 12) / rSpacing) + 1;
  const rebarLinesW = Math.ceil((l * 12) / rSpacing) + 1;
  const totalRebarFt = (rebarLinesL * l) + (rebarLinesW * w);
  const rebarCost = rebarType === "Fiber Mesh (per yard)" ? yardsToOrder * 8 : totalRebarFt * rb.costPerFt;

  // Concrete cost
  const concreteCostPerYard = CONCRETE_PRICES[concreteMix];
  const concreteCost = yardsToOrder * concreteCostPerYard;

  // Finish
  const fin = FINISH_TYPES[finishType];
  const finishCost = sqft * fin.addPerSqft;

  // Labor
  const pt = PROJECT_TYPES[projectType];
  const laborCost = sqft * pt.baseLabSqft;

  // Perimeter
  const peri = parseFloat(perimeterFt) || (2 * (l + w));

  // Add-ons
  let addonCost = 0;
  selAddons.forEach(a => {
    const price = ADDONS[a];
    if (a.includes("per sqft")) addonCost += price * sqft;
    else if (a.includes("per LF")) addonCost += price * peri;
    else addonCost += price;
  });
  if (needsPump) addonCost += 800;

  // Totals
  const totalCost = Math.round(concreteCost + rebarCost + finishCost + laborCost + addonCost);
  const sellPrice = Math.round(totalCost / (1 - margin / 100));
  const profit = sellPrice - totalCost;
  const pricePerSqft = sqft > 0 ? (sellPrice / sqft).toFixed(2) : 0;

  const toggleAddon = (a) => setSelAddons(p => p.includes(a) ? p.filter(x => x !== a) : [...p, a]);

  return (
    <div style={{ fontFamily: "'Outfit',sans-serif", background: "#100c04", color: "#e8d8c0", minHeight: "100vh" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@700;800;900&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ background: "linear-gradient(160deg,#3E2723,#5D4037,#6D4C41)", padding: "40px 24px 48px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 30% 70%,rgba(200,160,100,0.06) 0%,transparent 50%)" }} />
        <div style={{ position: "relative", maxWidth: "700px", margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "100px", padding: "5px 16px", marginBottom: "16px", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.8)" }}>
            🧱 Concrete Calculator
          </div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(28px,4vw,42px)", fontWeight: 900, lineHeight: 1.1, margin: "0 0 10px", color: "white" }}>
            Never Over-Order. <span style={{ color: "#BCAAA4" }}>Never Under-Bid.</span>
          </h1>
          <p style={{ fontSize: "15px", opacity: 0.75, maxWidth: "480px", margin: "0 auto", lineHeight: 1.6 }}>
            Yardage, rebar, finishing costs, and profit-driven quoting for every pour.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "32px 20px" }}>

        {/* Project & Dimensions */}
        <div style={S.card}>
          <h3 style={S.h3}>Project & Dimensions</h3>
          <div style={{ marginBottom: "14px" }}>
            <label style={S.lbl}>Project Type</label>
            <select value={projectType} onChange={e => handleProjectChange(e.target.value)} style={S.sel}>
              {Object.keys(PROJECT_TYPES).map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "14px" }}>
            <div><label style={S.lbl}>Length (ft)</label><input type="number" value={length} onChange={e => setLength(e.target.value)} style={S.inp} /></div>
            <div><label style={S.lbl}>Width (ft)</label><input type="number" value={width} onChange={e => setWidth(e.target.value)} style={S.inp} /></div>
            <div><label style={S.lbl}>Thickness (in)</label><input type="number" value={thickness} onChange={e => setThickness(e.target.value)} style={S.inp} /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div><label style={S.lbl}>Perimeter (ft)</label><input type="number" value={perimeterFt} onChange={e => setPerimeterFt(e.target.value)} placeholder={`Auto: ${Math.round(peri)}`} style={S.inp} /></div>
            <div><label style={S.lbl}>Waste Factor: {wastePct}%</label><input type="range" min="5" max="20" value={wastePct} onChange={e => setWastePct(+e.target.value)} style={{ width: "100%", accentColor: "#8D6E63", marginTop: "8px" }} /></div>
          </div>
        </div>

        {/* Materials */}
        <div style={S.card}>
          <h3 style={S.h3}>Materials</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
            <div><label style={S.lbl}>Concrete Mix</label><select value={concreteMix} onChange={e => setConcreteMix(e.target.value)} style={S.sel}>{Object.keys(CONCRETE_PRICES).map(c => <option key={c} value={c}>{c} — {fmt(CONCRETE_PRICES[c])}/yd</option>)}</select></div>
            <div><label style={S.lbl}>Reinforcement</label><select value={rebarType} onChange={e => setRebarType(e.target.value)} style={S.sel}>{Object.keys(REBAR_TYPES).map(r => <option key={r} value={r}>{r}</option>)}</select></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div><label style={S.lbl}>Rebar Spacing (inches OC)</label><input type="number" value={rebarSpacing} onChange={e => setRebarSpacing(e.target.value)} style={S.inp} /></div>
            <div><label style={S.lbl}>Finish Type</label><select value={finishType} onChange={e => setFinishType(e.target.value)} style={S.sel}>{Object.keys(FINISH_TYPES).map(f => <option key={f} value={f}>{f} {FINISH_TYPES[f].addPerSqft > 0 ? `(+$${FINISH_TYPES[f].addPerSqft}/sf)` : ""}</option>)}</select></div>
          </div>
        </div>

        {/* Add-ons */}
        <div style={S.card}>
          <h3 style={S.h3}>Add-Ons</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "12px" }}>
            {Object.entries(ADDONS).filter(([a]) => a !== "Concrete Pump (flat fee)").map(([name, cost]) => (
              <label key={name} onClick={() => toggleAddon(name)} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", padding: "8px 10px", borderRadius: "8px", background: selAddons.includes(name) ? "rgba(141,110,99,0.15)" : "transparent", border: selAddons.includes(name) ? "1px solid rgba(141,110,99,0.3)" : "1px solid transparent" }}>
                <input type="checkbox" checked={selAddons.includes(name)} readOnly style={{ accentColor: "#8D6E63", width: "15px", height: "15px", pointerEvents: "none" }} />
                <span style={{ fontSize: "12px", flex: 1, color: selAddons.includes(name) ? "#e8d8c0" : "#6a5a4a" }}>{name}</span>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#8D6E63" }}>${cost}</span>
              </label>
            ))}
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
            <input type="checkbox" checked={needsPump} onChange={e => setNeedsPump(e.target.checked)} style={{ accentColor: "#8D6E63", width: "16px", height: "16px" }} />
            <span style={{ fontSize: "13px" }}>Concrete Pump Needed (+$800)</span>
          </label>
        </div>

        {/* Margin */}
        <div style={S.card}>
          <label style={S.lbl}>Desired Profit Margin: {margin}%</label>
          <input type="range" min="10" max="60" value={margin} onChange={e => setMargin(+e.target.value)} style={{ width: "100%", accentColor: "#8D6E63" }} />
        </div>

        {/* Results */}
        {sqft > 0 && (
          <div>
            <div style={{ background: "linear-gradient(135deg,#3E2723,#5D4037,#6D4C41)", borderRadius: "16px", padding: "28px", color: "white", marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div>
                  <div style={{ fontSize: "12px", opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.1em" }}>Quote Price</div>
                  <div style={{ fontSize: "40px", fontWeight: 800, lineHeight: 1.1 }}>{fmt(sellPrice)}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "12px", opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.1em" }}>Your Profit</div>
                  <div style={{ fontSize: "26px", fontWeight: 700, color: "#BCAAA4" }}>{fmt(profit)}</div>
                  <div style={{ fontSize: "13px", opacity: 0.7 }}>{margin}% margin</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px" }}>
                {[
                  { l: "Square Feet", v: sqft.toLocaleString() },
                  { l: "Cubic Yards", v: yardsToOrder.toFixed(2) },
                  { l: "Price/Sq Ft", v: `$${pricePerSqft}` },
                  { l: "Rebar (LF)", v: Math.round(totalRebarFt).toLocaleString() },
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
                { label: `Concrete (${concreteMix})`, value: Math.round(concreteCost), sub: `${yardsToOrder} yd³ × ${fmt(concreteCostPerYard)}/yd (incl. ${wastePct}% waste)` },
                { label: `Rebar / Reinforcement`, value: Math.round(rebarCost), sub: rebarType === "Fiber Mesh (per yard)" ? `${yardsToOrder} yd³ fiber mesh` : `${Math.round(totalRebarFt)} LF of ${rebarType} @ ${rSpacing}" OC` },
                { label: `Finish (${finishType})`, value: Math.round(finishCost), sub: fin.desc + (fin.addPerSqft > 0 ? ` — ${sqft} sf × $${fin.addPerSqft}` : " — included") },
                { label: "Labor", value: Math.round(laborCost), sub: `${sqft} sf × $${pt.baseLabSqft.toFixed(2)}/sf (${projectType})` },
                { label: "Add-Ons", value: Math.round(addonCost), sub: [...selAddons, ...(needsPump ? ["Concrete Pump"] : [])].join(", ") || "None" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #2a2010" }}>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 600 }}>{item.label}</div>
                    <div style={{ fontSize: "11px", color: "#6a5a3a" }}>{item.sub}</div>
                  </div>
                  <div style={{ fontSize: "15px", fontWeight: 700 }}>{fmt(item.value)}</div>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 0 0" }}>
                <div style={{ fontSize: "15px", fontWeight: 800, color: "#8D6E63" }}>Total Job Cost</div>
                <div style={{ fontSize: "18px", fontWeight: 800, color: "#8D6E63" }}>{fmt(totalCost)}</div>
              </div>
            </div>

            {/* Order Summary */}
            <div style={S.card}>
              <h3 style={S.h3}>Order Summary</h3>
              {[
                { l: "Concrete to Order", v: `${yardsToOrder} cubic yards` },
                { l: "Mix Strength", v: concreteMix },
                { l: "Reinforcement", v: rebarType === "Fiber Mesh (per yard)" ? `Fiber mesh (${yardsToOrder} yd)` : `${Math.round(totalRebarFt)} LF — ${rebarType} @ ${rSpacing}" OC` },
                { l: "Pour Area", v: `${sqft} sq ft (${l}' × ${w}' × ${t}")` },
                { l: "Finish", v: `${finishType} — ${fin.desc}` },
                { l: "Perimeter (forms/joints)", v: `${Math.round(peri)} linear feet` },
              ].map((row, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #2a2010" }}>
                  <span style={{ fontSize: "13px", color: "#8a7a5a" }}>{row.l}</span>
                  <span style={{ fontSize: "13px", fontWeight: 700 }}>{row.v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
