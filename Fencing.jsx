import BackNav from "./BackNav";
import { useState } from "react";

const FENCE_TYPES = {
  "Wood Privacy (6ft)": { matPerLF: 18, labPerLF: 12, postSpacing: 8, postCost: 22, height: 6 },
  "Wood Privacy (8ft)": { matPerLF: 24, labPerLF: 15, postSpacing: 8, postCost: 28, height: 8 },
  "Wood Picket (4ft)": { matPerLF: 12, labPerLF: 9, postSpacing: 8, postCost: 18, height: 4 },
  "Wood Board-on-Board": { matPerLF: 22, labPerLF: 14, postSpacing: 8, postCost: 22, height: 6 },
  "Cedar Privacy (6ft)": { matPerLF: 26, labPerLF: 13, postSpacing: 8, postCost: 30, height: 6 },
  "Chain Link (4ft)": { matPerLF: 8, labPerLF: 7, postSpacing: 10, postCost: 15, height: 4 },
  "Chain Link (6ft)": { matPerLF: 11, labPerLF: 8, postSpacing: 10, postCost: 18, height: 6 },
  "Chain Link + Privacy Slats": { matPerLF: 15, labPerLF: 10, postSpacing: 10, postCost: 18, height: 6 },
  "Vinyl Privacy (6ft)": { matPerLF: 28, labPerLF: 11, postSpacing: 8, postCost: 35, height: 6 },
  "Vinyl Picket (4ft)": { matPerLF: 22, labPerLF: 9, postSpacing: 8, postCost: 30, height: 4 },
  "Aluminum Ornamental (4ft)": { matPerLF: 30, labPerLF: 10, postSpacing: 6, postCost: 40, height: 4 },
  "Aluminum Ornamental (6ft)": { matPerLF: 38, labPerLF: 12, postSpacing: 6, postCost: 45, height: 6 },
  "Wrought Iron (4ft)": { matPerLF: 45, labPerLF: 14, postSpacing: 6, postCost: 55, height: 4 },
  "Wrought Iron (6ft)": { matPerLF: 58, labPerLF: 16, postSpacing: 6, postCost: 65, height: 6 },
  "Split Rail (3-rail)": { matPerLF: 10, labPerLF: 6, postSpacing: 8, postCost: 14, height: 4 },
  "Farm / Ranch Wire": { matPerLF: 5, labPerLF: 4, postSpacing: 8, postCost: 10, height: 4 },
};

const GATE_TYPES = {
  "Walk Gate (3ft)": { cost: 180, labor: 120, width: 3 },
  "Walk Gate (4ft)": { cost: 220, labor: 140, width: 4 },
  "Single Drive Gate (6ft)": { cost: 380, labor: 220, width: 6 },
  "Double Drive Gate (10ft)": { cost: 650, labor: 350, width: 10 },
  "Double Drive Gate (12ft)": { cost: 780, labor: 400, width: 12 },
  "Sliding Gate (12ft)": { cost: 1200, labor: 600, width: 12 },
  "Sliding Gate (16ft)": { cost: 1600, labor: 750, width: 16 },
};

const POST_SET_METHODS = {
  "Concrete (standard)": { costPerPost: 12, labPerPost: 15 },
  "Gravel Pack": { costPerPost: 6, labPerPost: 10 },
  "Foam Set": { costPerPost: 18, labPerPost: 8 },
  "Drive Posts (no dig)": { costPerPost: 0, labPerPost: 12 },
};

const ADDONS_FENCE = {
  "Post Caps (each)": 4,
  "Stain / Seal (per LF)": 3.50,
  "Paint (per LF)": 4.50,
  "Lattice Top (per LF)": 6,
  "Remove Old Fence (per LF)": 3,
  "Haul Away / Disposal": 250,
  "Property Survey Stake": 350,
  "Permit Fee": 150,
};

function fmt(n) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}

export default function FencingCalculator() {
  const [fenceType, setFenceType] = useState("Wood Privacy (6ft)");
  const [linearFeet, setLinearFeet] = useState("150");
  const [corners, setCorners] = useState("4");
  const [endPosts, setEndPosts] = useState("2");
  const [postMethod, setPostMethod] = useState("Concrete (standard)");
  const [gates, setGates] = useState([{ type: "Walk Gate (3ft)", qty: 1 }, { type: "Double Drive Gate (10ft)", qty: 1 }]);
  const [selAddons, setSelAddons] = useState(["Post Caps (each)", "Permit Fee"]);
  const [terrain, setTerrain] = useState("flat");
  const [margin, setMargin] = useState(35);
  const [nextGateId, setNextGateId] = useState(3);

  const S = {
    inp: { width: "100%", padding: "10px 12px", border: "2px solid #2a3038", borderRadius: "6px", fontSize: "14px", fontFamily: "'Outfit',sans-serif", background: "#0e1218", color: "#c8d0e0", outline: "none", boxSizing: "border-box" },
    lbl: { display: "block", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#607080", marginBottom: "5px" },
    sel: { width: "100%", padding: "10px 12px", border: "2px solid #2a3038", borderRadius: "6px", fontSize: "14px", fontFamily: "'Outfit',sans-serif", background: "#0e1218", color: "#c8d0e0", outline: "none", boxSizing: "border-box", appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath fill='%23607080' d='M5 7L1 3h8z'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center", paddingRight: "28px" },
    card: { background: "#141a22", borderRadius: "16px", padding: "28px", border: "1px solid #222a34", marginBottom: "20px" },
    h3: { fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#546E7A", marginTop: 0, marginBottom: "18px" },
  };

  const ft = FENCE_TYPES[fenceType];
  const lf = parseFloat(linearFeet) || 0;
  const corn = parseInt(corners) || 0;
  const ends = parseInt(endPosts) || 0;
  const terrainMult = terrain === "hilly" ? 1.2 : terrain === "rocky" ? 1.35 : 1.0;

  // Gate LF deduction
  const gateLFDeduct = gates.reduce((s, g) => s + (GATE_TYPES[g.type]?.width || 0) * g.qty, 0);
  const fenceLF = Math.max(0, lf - gateLFDeduct);

  // Posts
  const linePosts = Math.ceil(fenceLF / ft.postSpacing) + 1;
  const totalPosts = linePosts + corn + ends;
  const pm = POST_SET_METHODS[postMethod];

  // Fence material & labor
  const fenceMatCost = fenceLF * ft.matPerLF;
  const fenceLabCost = fenceLF * ft.labPerLF * terrainMult;

  // Post costs
  const postMatCost = totalPosts * ft.postCost;
  const postSetMat = totalPosts * pm.costPerPost;
  const postSetLab = totalPosts * pm.labPerPost * terrainMult;
  const totalPostCost = postMatCost + postSetMat + postSetLab;

  // Gates
  const gateMatCost = gates.reduce((s, g) => s + (GATE_TYPES[g.type]?.cost || 0) * g.qty, 0);
  const gateLabCost = gates.reduce((s, g) => s + (GATE_TYPES[g.type]?.labor || 0) * g.qty, 0);
  const totalGateCost = gateMatCost + gateLabCost;

  // Add-ons
  let addonCost = 0;
  selAddons.forEach(a => {
    const price = ADDONS_FENCE[a];
    if (a.includes("per LF")) addonCost += price * lf;
    else if (a.includes("each")) addonCost += price * totalPosts;
    else addonCost += price;
  });

  const totalCost = Math.round(fenceMatCost + fenceLabCost + totalPostCost + totalGateCost + addonCost);
  const sellPrice = Math.round(totalCost / (1 - margin / 100));
  const profit = sellPrice - totalCost;
  const pricePerLF = lf > 0 ? (sellPrice / lf).toFixed(2) : 0;

  const addGate = () => { setGates(p => [...p, { type: "Walk Gate (3ft)", qty: 1 }]); };
  const removeGate = (i) => setGates(p => p.filter((_, idx) => idx !== i));
  const updateGate = (i, field, val) => setGates(p => p.map((g, idx) => idx === i ? { ...g, [field]: field === "qty" ? Math.max(1, parseInt(val) || 1) : val } : g));
  const toggleAddon = (a) => setSelAddons(p => p.includes(a) ? p.filter(x => x !== a) : [...p, a]);

  return (
    <div style={{ fontFamily: "'Outfit',sans-serif", background: "#0a0e14", color: "#c8d0e0", minHeight: "100vh" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@700;800;900&display=swap" rel="stylesheet" />

      <div style={{ background: "linear-gradient(160deg,#263238,#37474F,#455A64)", padding: "40px 24px 48px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 30% 70%,rgba(150,180,200,0.05) 0%,transparent 50%)" }} />
        <div style={{ position: "relative", maxWidth: "700px", margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "100px", padding: "5px 16px", marginBottom: "16px", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.8)" }}>🏗️ Fencing Calculator</div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(28px,4vw,42px)", fontWeight: 900, lineHeight: 1.1, margin: "0 0 10px", color: "white" }}>
            Post to Post. <span style={{ color: "#B0BEC5" }}>Dollar to Dollar.</span>
          </h1>
          <p style={{ fontSize: "15px", opacity: 0.75, maxWidth: "480px", margin: "0 auto", lineHeight: 1.6 }}>Material counts, post spacing, gate sizing, labor estimates, and instant quoting.</p>
        </div>
      </div>

      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "32px 20px" }}>

        {/* Fence Type & Dimensions */}
        <div style={S.card}>
          <h3 style={S.h3}>Fence Details</h3>
          <div style={{ marginBottom: "14px" }}>
            <label style={S.lbl}>Fence Type</label>
            <select value={fenceType} onChange={e => setFenceType(e.target.value)} style={S.sel}>
              {Object.keys(FENCE_TYPES).map(f => <option key={f} value={f}>{f} — {fmt(FENCE_TYPES[f].matPerLF + FENCE_TYPES[f].labPerLF)}/LF</option>)}
            </select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "14px" }}>
            <div><label style={S.lbl}>Total Linear Feet</label><input type="number" value={linearFeet} onChange={e => setLinearFeet(e.target.value)} style={S.inp} /></div>
            <div><label style={S.lbl}>Corners</label><input type="number" value={corners} onChange={e => setCorners(e.target.value)} style={S.inp} /></div>
            <div><label style={S.lbl}>End Posts</label><input type="number" value={endPosts} onChange={e => setEndPosts(e.target.value)} style={S.inp} /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div><label style={S.lbl}>Post Setting Method</label><select value={postMethod} onChange={e => setPostMethod(e.target.value)} style={S.sel}>{Object.keys(POST_SET_METHODS).map(p => <option key={p} value={p}>{p}</option>)}</select></div>
            <div><label style={S.lbl}>Terrain</label><select value={terrain} onChange={e => setTerrain(e.target.value)} style={S.sel}><option value="flat">Flat / Easy</option><option value="hilly">Hilly (+20% labor)</option><option value="rocky">Rocky / Difficult (+35% labor)</option></select></div>
          </div>
        </div>

        {/* Gates */}
        <div style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
            <h3 style={{ ...S.h3, marginBottom: 0 }}>Gates</h3>
            <button onClick={addGate} style={{ background: "rgba(84,110,122,0.2)", border: "1px solid rgba(84,110,122,0.4)", color: "#B0BEC5", padding: "6px 16px", borderRadius: "8px", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}>+ Add Gate</button>
          </div>
          {gates.map((g, i) => (
            <div key={i} style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "8px" }}>
              <select value={g.type} onChange={e => updateGate(i, "type", e.target.value)} style={{ ...S.sel, flex: 1 }}>
                {Object.keys(GATE_TYPES).map(gt => <option key={gt} value={gt}>{gt} — {fmt(GATE_TYPES[gt].cost + GATE_TYPES[gt].labor)}</option>)}
              </select>
              <input type="number" value={g.qty} onChange={e => updateGate(i, "qty", e.target.value)} min="1" max="10" style={{ ...S.inp, width: "60px", textAlign: "center" }} />
              {gates.length > 0 && <button onClick={() => removeGate(i)} style={{ background: "rgba(255,50,50,0.15)", border: "1px solid rgba(255,50,50,0.3)", color: "#ff6666", padding: "5px 10px", borderRadius: "6px", fontSize: "11px", cursor: "pointer" }}>✕</button>}
            </div>
          ))}
        </div>

        {/* Add-ons */}
        <div style={S.card}>
          <h3 style={S.h3}>Add-Ons</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
            {Object.entries(ADDONS_FENCE).map(([name, cost]) => (
              <label key={name} onClick={() => toggleAddon(name)} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", padding: "8px 10px", borderRadius: "8px", background: selAddons.includes(name) ? "rgba(84,110,122,0.15)" : "transparent", border: selAddons.includes(name) ? "1px solid rgba(84,110,122,0.3)" : "1px solid transparent" }}>
                <input type="checkbox" checked={selAddons.includes(name)} readOnly style={{ accentColor: "#546E7A", width: "15px", height: "15px", pointerEvents: "none" }} />
                <span style={{ fontSize: "12px", flex: 1, color: selAddons.includes(name) ? "#c8d0e0" : "#4a5868" }}>{name}</span>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#546E7A" }}>${cost}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Margin */}
        <div style={S.card}>
          <label style={S.lbl}>Desired Profit Margin: {margin}%</label>
          <input type="range" min="10" max="60" value={margin} onChange={e => setMargin(+e.target.value)} style={{ width: "100%", accentColor: "#546E7A" }} />
        </div>

        {/* Results */}
        {lf > 0 && (<div>
          <div style={{ background: "linear-gradient(135deg,#263238,#37474F,#455A64)", borderRadius: "16px", padding: "28px", color: "white", marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <div style={{ fontSize: "12px", opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.1em" }}>Quote Price</div>
                <div style={{ fontSize: "40px", fontWeight: 800, lineHeight: 1.1 }}>{fmt(sellPrice)}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "12px", opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.1em" }}>Your Profit</div>
                <div style={{ fontSize: "26px", fontWeight: 700, color: "#B0BEC5" }}>{fmt(profit)}</div>
                <div style={{ fontSize: "13px", opacity: 0.7 }}>{margin}% margin</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px" }}>
              {[
                { l: "Linear Feet", v: lf },
                { l: "Total Posts", v: totalPosts },
                { l: "Price/LF", v: `$${pricePerLF}` },
                { l: "Gates", v: gates.reduce((s, g) => s + g.qty, 0) },
              ].map(x => (
                <div key={x.l} style={{ background: "rgba(255,255,255,0.1)", borderRadius: "10px", padding: "12px", textAlign: "center" }}>
                  <div style={{ fontSize: "9px", opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.08em" }}>{x.l}</div>
                  <div style={{ fontSize: "18px", fontWeight: 700, marginTop: "2px" }}>{x.v}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={S.card}>
            <h3 style={S.h3}>Cost Breakdown</h3>
            {[
              { label: `Fence Material (${fenceType})`, value: Math.round(fenceMatCost), sub: `${fenceLF} LF × ${fmt(ft.matPerLF)}/LF` },
              { label: "Fence Labor", value: Math.round(fenceLabCost), sub: `${fenceLF} LF × ${fmt(ft.labPerLF)}/LF${terrainMult > 1 ? ` × ${terrainMult}x terrain` : ""}` },
              { label: `Posts (${totalPosts} total)`, value: Math.round(totalPostCost), sub: `${linePosts} line + ${corn} corner + ${ends} end — ${postMethod}` },
              ...(gates.length > 0 ? [{ label: "Gates", value: Math.round(totalGateCost), sub: gates.map(g => `${g.type} ×${g.qty}`).join(", ") }] : []),
              { label: "Add-Ons", value: Math.round(addonCost), sub: selAddons.join(", ") || "None" },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #222a34" }}>
                <div><div style={{ fontSize: "14px", fontWeight: 600 }}>{item.label}</div><div style={{ fontSize: "11px", color: "#4a5a6a" }}>{item.sub}</div></div>
                <div style={{ fontSize: "15px", fontWeight: 700 }}>{fmt(item.value)}</div>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 0 0" }}>
              <div style={{ fontSize: "15px", fontWeight: 800, color: "#546E7A" }}>Total Job Cost</div>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "#546E7A" }}>{fmt(totalCost)}</div>
            </div>
          </div>

          <div style={S.card}>
            <h3 style={S.h3}>Material Order List</h3>
            {[
              { l: "Fence Type", v: fenceType },
              { l: "Fence Sections", v: `${fenceLF} linear feet` },
              { l: `Posts (${ft.postSpacing}' OC)`, v: `${totalPosts} posts (${linePosts} line + ${corn} corner + ${ends} end)` },
              { l: "Post Setting", v: `${postMethod} × ${totalPosts}` },
              { l: "Height", v: `${ft.height} ft` },
              ...gates.map(g => ({ l: `Gate: ${g.type}`, v: `×${g.qty}` })),
            ].map((row, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #222a34" }}>
                <span style={{ fontSize: "13px", color: "#7a8a9a" }}>{row.l}</span>
                <span style={{ fontSize: "13px", fontWeight: 700 }}>{row.v}</span>
              </div>
            ))}
          </div>
        </div>)}
      </div>
    </div>
  );
}
