import BackNav from "./BackNav";
import { useState } from "react";

const ROOM_PRESETS = {
  "Small Bedroom (10×10)": { l: 10, w: 10, h: 8, windows: 1, doors: 1 },
  "Medium Bedroom (12×12)": { l: 12, w: 12, h: 8, windows: 2, doors: 1 },
  "Large Bedroom (14×16)": { l: 14, w: 16, h: 8, windows: 2, doors: 1 },
  "Master Bedroom (16×18)": { l: 16, w: 18, h: 9, windows: 3, doors: 2 },
  "Living Room (16×20)": { l: 16, w: 20, h: 9, windows: 3, doors: 2 },
  "Kitchen (12×14)": { l: 12, w: 14, h: 8, windows: 2, doors: 2 },
  "Bathroom (8×10)": { l: 8, w: 10, h: 8, windows: 1, doors: 1 },
  "Hallway (4×20)": { l: 4, w: 20, h: 8, windows: 0, doors: 3 },
  "Dining Room (12×14)": { l: 12, w: 14, h: 9, windows: 2, doors: 2 },
  "Garage (20×22)": { l: 20, w: 22, h: 10, windows: 1, doors: 2 },
  "Custom": { l: 0, w: 0, h: 8, windows: 0, doors: 0 },
};

const PAINT_TYPES = {
  "Builder Grade (Flat)": { costGal: 22, coverSqft: 400, coats: 2 },
  "Standard (Eggshell)": { costGal: 35, coverSqft: 380, coats: 2 },
  "Premium (Satin)": { costGal: 52, coverSqft: 370, coats: 2 },
  "High-End (Semi-Gloss)": { costGal: 58, coverSqft: 360, coats: 2 },
  "Cabinet/Trim (Semi-Gloss)": { costGal: 62, coverSqft: 350, coats: 2 },
  "Exterior (Flat)": { costGal: 38, coverSqft: 350, coats: 2 },
  "Exterior (Satin)": { costGal: 48, coverSqft: 340, coats: 2 },
  "Elastomeric": { costGal: 65, coverSqft: 200, coats: 2 },
};

const PRIMER_TYPES = {
  "None": { costGal: 0, coverSqft: 999999 },
  "Standard Latex": { costGal: 25, coverSqft: 400 },
  "Stain-Blocking": { costGal: 38, coverSqft: 350 },
  "Bonding Primer": { costGal: 42, coverSqft: 350 },
  "Shellac (odor/smoke)": { costGal: 55, coverSqft: 300 },
};

const SURFACE_CONDITIONS = {
  "New Drywall": { prepHrsPer1000: 1.5, primerNeeded: true },
  "Previously Painted (good)": { prepHrsPer1000: 1.0, primerNeeded: false },
  "Previously Painted (peeling)": { prepHrsPer1000: 3.0, primerNeeded: true },
  "Smoke/Water Damage": { prepHrsPer1000: 4.0, primerNeeded: true },
  "Bare Wood": { prepHrsPer1000: 2.5, primerNeeded: true },
  "Textured Walls": { prepHrsPer1000: 1.5, primerNeeded: false },
  "Exterior Siding": { prepHrsPer1000: 3.5, primerNeeded: true },
  "Exterior Stucco": { prepHrsPer1000: 2.0, primerNeeded: true },
};

const EXTRAS = {
  "Ceiling Paint (per room)": 85,
  "Trim / Baseboard (per room)": 65,
  "Crown Molding (per room)": 45,
  "Door Paint (per door)": 55,
  "Window Trim (per window)": 35,
  "Accent Wall": 120,
  "Wallpaper Removal (per room)": 200,
  "Drywall Patch / Repair": 75,
  "Caulking (per room)": 25,
  "Tape & Mask (per room)": 20,
};

function fmt(n) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}

export default function PaintingCalculator() {
  const [rooms, setRooms] = useState([
    { id: 1, preset: "Medium Bedroom (12×12)", name: "Bedroom 1", l: 12, w: 12, h: 8, windows: 2, doors: 1 },
    { id: 2, preset: "Living Room (16×20)", name: "Living Room", l: 16, w: 20, h: 9, windows: 3, doors: 2 },
  ]);
  const [paintType, setPaintType] = useState("Standard (Eggshell)");
  const [coats, setCoats] = useState(2);
  const [primerType, setPrimerType] = useState("Standard Latex");
  const [surface, setSurface] = useState("Previously Painted (good)");
  const [laborRate, setLaborRate] = useState("45");
  const [selExtras, setSelExtras] = useState(["Trim / Baseboard (per room)", "Tape & Mask (per room)"]);
  const [margin, setMargin] = useState(35);
  const [nextId, setNextId] = useState(3);

  const S = {
    inp: { width: "100%", padding: "10px 12px", border: "2px solid #2a1a3a", borderRadius: "6px", fontSize: "14px", fontFamily: "'Outfit',sans-serif", background: "#12081a", color: "#dcc8f0", outline: "none", boxSizing: "border-box" },
    lbl: { display: "block", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#7a50a0", marginBottom: "5px" },
    sel: { width: "100%", padding: "10px 12px", border: "2px solid #2a1a3a", borderRadius: "6px", fontSize: "14px", fontFamily: "'Outfit',sans-serif", background: "#12081a", color: "#dcc8f0", outline: "none", boxSizing: "border-box", appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath fill='%237a50a0' d='M5 7L1 3h8z'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center", paddingRight: "28px" },
    card: { background: "#1a1022", borderRadius: "16px", padding: "28px", border: "1px solid #2a1a3a", marginBottom: "20px" },
    h3: { fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#7B1FA2", marginTop: 0, marginBottom: "18px" },
  };

  const WINDOW_SQFT = 15;
  const DOOR_SQFT = 21;

  const addRoom = () => {
    const preset = ROOM_PRESETS["Small Bedroom (10×10)"];
    setRooms(p => [...p, { id: nextId, preset: "Small Bedroom (10×10)", name: `Room ${nextId}`, l: preset.l, w: preset.w, h: preset.h, windows: preset.windows, doors: preset.doors }]);
    setNextId(n => n + 1);
  };

  const removeRoom = (id) => setRooms(p => p.filter(r => r.id !== id));

  const updateRoom = (id, field, value) => {
    setRooms(p => p.map(r => {
      if (r.id !== id) return r;
      if (field === "preset") {
        const pr = ROOM_PRESETS[value];
        return { ...r, preset: value, l: pr.l, w: pr.w, h: pr.h, windows: pr.windows, doors: pr.doors };
      }
      return { ...r, [field]: value };
    }));
  };

  // Calc per room
  const roomData = rooms.map(r => {
    const l = parseFloat(r.l) || 0, w = parseFloat(r.w) || 0, h = parseFloat(r.h) || 8;
    const wallSqft = 2 * (l + w) * h;
    const windowDeduct = (parseInt(r.windows) || 0) * WINDOW_SQFT;
    const doorDeduct = (parseInt(r.doors) || 0) * DOOR_SQFT;
    const paintable = Math.max(0, wallSqft - windowDeduct - doorDeduct);
    return { ...r, wallSqft, paintable };
  });

  const totalPaintable = roomData.reduce((s, r) => s + r.paintable, 0);
  const totalRooms = rooms.length;
  const totalWindows = rooms.reduce((s, r) => s + (parseInt(r.windows) || 0), 0);
  const totalDoors = rooms.reduce((s, r) => s + (parseInt(r.doors) || 0), 0);

  const paint = PAINT_TYPES[paintType];
  const primer = PRIMER_TYPES[primerType];
  const surf = SURFACE_CONDITIONS[surface];
  const labRate = parseFloat(laborRate) || 45;

  const paintSqft = totalPaintable * coats;
  const paintGallons = Math.ceil(paintSqft / paint.coverSqft);
  const paintCost = paintGallons * paint.costGal;

  const primerGallons = primerType !== "None" ? Math.ceil(totalPaintable / primer.coverSqft) : 0;
  const primerCost = primerGallons * primer.costGal;

  // Labor: paint time + prep time
  const paintHrsPer1000 = 2.5; // hours per 1000 sqft per coat
  const paintHours = (paintSqft / 1000) * paintHrsPer1000;
  const primerHours = primerType !== "None" ? (totalPaintable / 1000) * 2.0 : 0;
  const prepHours = (totalPaintable / 1000) * surf.prepHrsPer1000;
  const totalHours = paintHours + primerHours + prepHours;
  const laborCost = Math.round(totalHours * labRate);

  // Extras
  let extrasCost = 0;
  selExtras.forEach(e => {
    const price = EXTRAS[e];
    if (e.includes("per room")) extrasCost += price * totalRooms;
    else if (e.includes("per door")) extrasCost += price * totalDoors;
    else if (e.includes("per window")) extrasCost += price * totalWindows;
    else extrasCost += price;
  });

  const suppliesCost = Math.round(totalPaintable * 0.12); // tape, drop cloths, rollers, brushes
  const totalCost = paintCost + primerCost + laborCost + extrasCost + suppliesCost;
  const sellPrice = Math.round(totalCost / (1 - margin / 100));
  const profit = sellPrice - totalCost;

  const toggleExtra = (e) => setSelExtras(p => p.includes(e) ? p.filter(x => x !== e) : [...p, e]);

  return (
    <div style={{ fontFamily: "'Outfit',sans-serif", background: "#0a0410", color: "#dcc8f0", minHeight: "100vh" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@700;800;900&display=swap" rel="stylesheet" />

      <div style={{ background: "linear-gradient(160deg,#4A148C,#6A1B9A,#7B1FA2)", padding: "40px 24px 48px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 30% 70%,rgba(200,100,255,0.06) 0%,transparent 50%)" }} />
        <div style={{ position: "relative", maxWidth: "700px", margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "100px", padding: "5px 16px", marginBottom: "16px", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.8)" }}>🎨 Painting Calculator</div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(28px,4vw,42px)", fontWeight: 900, lineHeight: 1.1, margin: "0 0 10px", color: "white" }}>
            Coverage. Gallons. <span style={{ color: "#CE93D8" }}>Profit. Done.</span>
          </h1>
          <p style={{ fontSize: "15px", opacity: 0.75, maxWidth: "480px", margin: "0 auto", lineHeight: 1.6 }}>Room-by-room estimating with paint coverage, primer needs, labor hours, and quoting.</p>
        </div>
      </div>

      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "32px 20px" }}>

        {/* Rooms */}
        <div style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
            <h3 style={{ ...S.h3, marginBottom: 0 }}>Rooms</h3>
            <button onClick={addRoom} style={{ background: "rgba(123,31,162,0.2)", border: "1px solid rgba(123,31,162,0.4)", color: "#CE93D8", padding: "6px 16px", borderRadius: "8px", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}>+ Add Room</button>
          </div>
          {rooms.map((r, idx) => (
            <div key={r.id} style={{ background: "rgba(123,31,162,0.08)", borderRadius: "12px", padding: "16px", marginBottom: "10px", border: "1px solid rgba(123,31,162,0.15)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <input value={r.name} onChange={e => updateRoom(r.id, "name", e.target.value)} style={{ ...S.inp, width: "150px", padding: "6px 10px", fontSize: "13px", fontWeight: 700 }} />
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <select value={r.preset} onChange={e => updateRoom(r.id, "preset", e.target.value)} style={{ ...S.sel, width: "180px", padding: "6px 10px", fontSize: "11px" }}>
                    {Object.keys(ROOM_PRESETS).map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  {rooms.length > 1 && <button onClick={() => removeRoom(r.id)} style={{ background: "rgba(255,50,50,0.15)", border: "1px solid rgba(255,50,50,0.3)", color: "#ff6666", padding: "5px 10px", borderRadius: "6px", fontSize: "11px", cursor: "pointer" }}>✕</button>}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: "8px" }}>
                <div><label style={{ ...S.lbl, fontSize: "9px" }}>L (ft)</label><input type="number" value={r.l} onChange={e => updateRoom(r.id, "l", e.target.value)} style={{ ...S.inp, padding: "6px 8px", fontSize: "13px" }} /></div>
                <div><label style={{ ...S.lbl, fontSize: "9px" }}>W (ft)</label><input type="number" value={r.w} onChange={e => updateRoom(r.id, "w", e.target.value)} style={{ ...S.inp, padding: "6px 8px", fontSize: "13px" }} /></div>
                <div><label style={{ ...S.lbl, fontSize: "9px" }}>H (ft)</label><input type="number" value={r.h} onChange={e => updateRoom(r.id, "h", e.target.value)} style={{ ...S.inp, padding: "6px 8px", fontSize: "13px" }} /></div>
                <div><label style={{ ...S.lbl, fontSize: "9px" }}>Windows</label><input type="number" value={r.windows} onChange={e => updateRoom(r.id, "windows", e.target.value)} style={{ ...S.inp, padding: "6px 8px", fontSize: "13px" }} /></div>
                <div><label style={{ ...S.lbl, fontSize: "9px" }}>Doors</label><input type="number" value={r.doors} onChange={e => updateRoom(r.id, "doors", e.target.value)} style={{ ...S.inp, padding: "6px 8px", fontSize: "13px" }} /></div>
              </div>
              <div style={{ marginTop: "6px", fontSize: "11px", color: "#7a50a0" }}>
                Paintable: {roomData[idx]?.paintable.toLocaleString()} sq ft
              </div>
            </div>
          ))}
        </div>

        {/* Paint & Surface */}
        <div style={S.card}>
          <h3 style={S.h3}>Paint & Surface</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
            <div><label style={S.lbl}>Paint Type</label><select value={paintType} onChange={e => setPaintType(e.target.value)} style={S.sel}>{Object.keys(PAINT_TYPES).map(p => <option key={p} value={p}>{p} — {fmt(PAINT_TYPES[p].costGal)}/gal</option>)}</select></div>
            <div><label style={S.lbl}>Primer</label><select value={primerType} onChange={e => setPrimerType(e.target.value)} style={S.sel}>{Object.keys(PRIMER_TYPES).map(p => <option key={p} value={p}>{p}{PRIMER_TYPES[p].costGal > 0 ? ` — ${fmt(PRIMER_TYPES[p].costGal)}/gal` : ""}</option>)}</select></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
            <div><label style={S.lbl}>Surface Condition</label><select value={surface} onChange={e => setSurface(e.target.value)} style={S.sel}>{Object.keys(SURFACE_CONDITIONS).map(s => <option key={s} value={s}>{s}</option>)}</select></div>
            <div><label style={S.lbl}>Coats</label><select value={coats} onChange={e => setCoats(+e.target.value)} style={S.sel}><option value={1}>1 Coat</option><option value={2}>2 Coats</option><option value={3}>3 Coats</option></select></div>
            <div><label style={S.lbl}>Labor Rate ($/hr)</label><input type="number" value={laborRate} onChange={e => setLaborRate(e.target.value)} style={S.inp} /></div>
          </div>
        </div>

        {/* Extras */}
        <div style={S.card}>
          <h3 style={S.h3}>Extras & Add-Ons</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
            {Object.entries(EXTRAS).map(([name, cost]) => (
              <label key={name} onClick={() => toggleExtra(name)} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", padding: "8px 10px", borderRadius: "8px", background: selExtras.includes(name) ? "rgba(123,31,162,0.12)" : "transparent", border: selExtras.includes(name) ? "1px solid rgba(123,31,162,0.3)" : "1px solid transparent" }}>
                <input type="checkbox" checked={selExtras.includes(name)} readOnly style={{ accentColor: "#7B1FA2", width: "15px", height: "15px", pointerEvents: "none" }} />
                <span style={{ fontSize: "12px", flex: 1, color: selExtras.includes(name) ? "#dcc8f0" : "#5a3a7a" }}>{name}</span>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#7B1FA2" }}>${cost}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Margin */}
        <div style={S.card}>
          <label style={S.lbl}>Desired Profit Margin: {margin}%</label>
          <input type="range" min="10" max="60" value={margin} onChange={e => setMargin(+e.target.value)} style={{ width: "100%", accentColor: "#7B1FA2" }} />
        </div>

        {/* Results */}
        {totalPaintable > 0 && (<div>
          <div style={{ background: "linear-gradient(135deg,#4A148C,#6A1B9A,#7B1FA2)", borderRadius: "16px", padding: "28px", color: "white", marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <div style={{ fontSize: "12px", opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.1em" }}>Quote Price</div>
                <div style={{ fontSize: "40px", fontWeight: 800, lineHeight: 1.1 }}>{fmt(sellPrice)}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "12px", opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.1em" }}>Your Profit</div>
                <div style={{ fontSize: "26px", fontWeight: 700, color: "#CE93D8" }}>{fmt(profit)}</div>
                <div style={{ fontSize: "13px", opacity: 0.7 }}>{margin}% margin</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px" }}>
              {[
                { l: "Paintable SF", v: totalPaintable.toLocaleString() },
                { l: "Paint Gallons", v: paintGallons },
                { l: "Labor Hours", v: Math.round(totalHours) },
                { l: "Rooms", v: totalRooms },
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
              { label: `Paint (${paintType})`, value: paintCost, sub: `${paintGallons} gal × ${fmt(paint.costGal)} — ${coats} coat(s)` },
              ...(primerType !== "None" ? [{ label: `Primer (${primerType})`, value: primerCost, sub: `${primerGallons} gal × ${fmt(primer.costGal)}` }] : []),
              { label: "Labor", value: laborCost, sub: `${Math.round(totalHours)} hrs × ${fmt(labRate)}/hr (prep: ${prepHours.toFixed(1)}h + paint: ${paintHours.toFixed(1)}h${primerHours > 0 ? ` + primer: ${primerHours.toFixed(1)}h` : ""})` },
              { label: "Supplies", value: suppliesCost, sub: "Tape, drop cloths, rollers, brushes, trays" },
              { label: "Extras", value: extrasCost, sub: selExtras.join(", ") || "None" },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #2a1a3a" }}>
                <div><div style={{ fontSize: "14px", fontWeight: 600 }}>{item.label}</div><div style={{ fontSize: "11px", color: "#5a3a7a" }}>{item.sub}</div></div>
                <div style={{ fontSize: "15px", fontWeight: 700 }}>{fmt(item.value)}</div>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 0 0" }}>
              <div style={{ fontSize: "15px", fontWeight: 800, color: "#7B1FA2" }}>Total Job Cost</div>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "#7B1FA2" }}>{fmt(totalCost)}</div>
            </div>
          </div>

          {/* Room Breakdown */}
          <div style={S.card}>
            <h3 style={S.h3}>Room-by-Room</h3>
            {roomData.map((r, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #2a1a3a" }}>
                <span style={{ fontSize: "13px", color: "#9a7ab0" }}>{r.name} ({r.l}×{r.w}×{r.h})</span>
                <span style={{ fontSize: "13px", fontWeight: 700 }}>{r.paintable.toLocaleString()} sq ft</span>
              </div>
            ))}
          </div>
        </div>)}
      </div>
    </div>
  );
}
