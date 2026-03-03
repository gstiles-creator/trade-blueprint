import BackNav from "./BackNav";
import { useState, useEffect } from "react";

const CLIMATE_ZONES = {
  "Zone 1 — Hot/Humid (Miami, Houston)": { heatingFactor: 25, coolingFactor: 600 },
  "Zone 2 — Hot/Dry (Phoenix, Las Vegas)": { heatingFactor: 30, coolingFactor: 550 },
  "Zone 3 — Mixed/Warm (Atlanta, Dallas)": { heatingFactor: 35, coolingFactor: 500 },
  "Zone 4 — Mixed (Nashville, Charlotte)": { heatingFactor: 40, coolingFactor: 500 },
  "Zone 5 — Cool (Chicago, Denver)": { heatingFactor: 50, coolingFactor: 450 },
  "Zone 6 — Cold (Minneapolis, Milwaukee)": { heatingFactor: 55, coolingFactor: 400 },
  "Zone 7 — Very Cold (Duluth, Fargo)": { heatingFactor: 60, coolingFactor: 400 },
};

const INSULATION_LEVELS = {
  "Poor (older home, no upgrades)": { modifier: 1.3 },
  "Average (standard insulation)": { modifier: 1.0 },
  "Good (upgraded insulation, new windows)": { modifier: 0.8 },
  "Excellent (spray foam, triple-pane)": { modifier: 0.65 },
};

const SYSTEM_TYPES = {
  "Central AC + Gas Furnace": { costPerTon: 3200, laborPerTon: 1800, seer: 15, afue: 80 },
  "Central AC + Gas Furnace (High Eff)": { costPerTon: 4500, laborPerTon: 2200, seer: 18, afue: 96 },
  "Heat Pump (Standard)": { costPerTon: 3800, laborPerTon: 2000, seer: 16, hspf: 9 },
  "Heat Pump (High Efficiency)": { costPerTon: 5500, laborPerTon: 2400, seer: 20, hspf: 11 },
  "Mini-Split (Single Zone)": { costPerTon: 3000, laborPerTon: 1500, seer: 20, hspf: 10 },
  "Mini-Split (Multi-Zone)": { costPerTon: 4200, laborPerTon: 2000, seer: 19, hspf: 10 },
  "Package Unit (Rooftop)": { costPerTon: 3600, laborPerTon: 2200, seer: 14, afue: 80 },
};

const DUCT_MATERIALS = {
  "Sheet Metal": { costPerLF: 18, laborPerLF: 12 },
  "Flex Duct": { costPerLF: 6, laborPerLF: 5 },
  "Ductboard": { costPerLF: 10, laborPerLF: 8 },
};

const ACCESSORIES_HVAC = {
  "Thermostat (Smart)": 250, "Thermostat (Basic Programmable)": 85,
  "UV Air Purifier": 650, "Media Air Filter Cabinet": 350,
  "Humidifier (Whole House)": 500, "Condensate Pump": 120,
  "Drain Pan (Emergency)": 75, "Line Set Cover Kit": 95,
  "Refrigerant (per lb)": 45, "Concrete Pad (condenser)": 65,
};

function fmt(n) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n); }

export default function HVACCalculator() {
  const [sqft, setSqft] = useState("");
  const [ceilingHeight, setCeilingHeight] = useState("8");
  const [stories, setStories] = useState("1");
  const [zone, setZone] = useState("Zone 4 — Mixed (Nashville, Charlotte)");
  const [insulation, setInsulation] = useState("Average (standard insulation)");
  const [windows, setWindows] = useState("average");
  const [sunExposure, setSunExposure] = useState("moderate");
  const [occupants, setOccupants] = useState("4");
  const [system, setSystem] = useState("Central AC + Gas Furnace");
  const [ductMaterial, setDuctMaterial] = useState("Flex Duct");
  const [ductLF, setDuctLF] = useState("");
  const [ductReplace, setDuctReplace] = useState(false);
  const [selectedAccessories, setSelectedAccessories] = useState(["Thermostat (Smart)", "Concrete Pad (condenser)"]);
  const [margin, setMargin] = useState(35);
  const [results, setResults] = useState(null);

  function calculate() {
    const sf = parseFloat(sqft); if (!sf) return;
    const ch = parseFloat(ceilingHeight) || 8, st = parseInt(stories) || 1, occ = parseInt(occupants) || 2;
    const zoneData = CLIMATE_ZONES[zone], insulMod = INSULATION_LEVELS[insulation].modifier;
    let coolingBTU = sf * (zoneData.coolingFactor / 100) * 12;
    coolingBTU *= insulMod;
    if (ch > 8) coolingBTU *= 1 + (ch - 8) * 0.04;
    if (st > 1) coolingBTU *= 1 + (st - 1) * 0.08;
    if (windows === "many") coolingBTU *= 1.15; else if (windows === "few") coolingBTU *= 0.9;
    if (sunExposure === "high") coolingBTU *= 1.1; else if (sunExposure === "low") coolingBTU *= 0.9;
    coolingBTU += (occ - 2) * 600;
    let heatingBTU = sf * zoneData.heatingFactor * insulMod;
    if (ch > 8) heatingBTU *= 1 + (ch - 8) * 0.05;
    if (st > 1) heatingBTU *= 1 + (st - 1) * 0.06;
    const tons = Math.ceil(coolingBTU / 12000 * 2) / 2;
    const sys = SYSTEM_TYPES[system];
    const equipCost = tons * sys.costPerTon, laborCost = tons * sys.laborPerTon;
    const estDuctLF = parseFloat(ductLF) || Math.round(sf * 0.15);
    const ductData = DUCT_MATERIALS[ductMaterial];
    const ductMatCost = ductReplace ? estDuctLF * ductData.costPerLF : 0;
    const ductLabCost = ductReplace ? estDuctLF * ductData.laborPerLF : 0;
    const ductTotal = ductMatCost + ductLabCost;
    const accCost = selectedAccessories.reduce((s, a) => s + (ACCESSORIES_HVAC[a] || 0), 0);
    const permitCost = tons <= 3 ? 250 : tons <= 5 ? 400 : 550;
    const totalCost = equipCost + laborCost + ductTotal + accCost + permitCost;
    const sellingPrice = totalCost / (1 - margin / 100);
    const annualCoolingCost = ((coolingBTU / 12000) * 1200 / (sys.seer || 15)) * 0.13;
    setResults({ coolingBTU: Math.round(coolingBTU), heatingBTU: Math.round(heatingBTU), tons, equipCost: Math.round(equipCost), laborCost: Math.round(laborCost), ductTotal: Math.round(ductTotal), ductMatCost: Math.round(ductMatCost), ductLabCost: Math.round(ductLabCost), estDuctLF, accCost: Math.round(accCost), permitCost, totalCost: Math.round(totalCost), sellingPrice: Math.round(sellingPrice), profit: Math.round(sellingPrice - totalCost), annualCoolingCost: Math.round(annualCoolingCost), seer: sys.seer });
  }

  useEffect(() => { if (sqft) calculate(); }, [sqft, ceilingHeight, stories, zone, insulation, windows, sunExposure, occupants, system, ductMaterial, ductLF, ductReplace, selectedAccessories, margin]);

  const inp = { width:"100%", padding:"10px 12px", border:"2px solid #2a3a5a", borderRadius:"6px", fontSize:"14px", fontFamily:"'Outfit',sans-serif", background:"#0f1a2e", color:"#d8e0f0", outline:"none", boxSizing:"border-box" };
  const lbl = { display:"block", fontSize:"10px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:"#6080aa", marginBottom:"5px" };
  const sel = { ...inp, appearance:"none", backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath fill='%236080aa' d='M5 7L1 3h8z'/%3E%3C/svg%3E")`, backgroundRepeat:"no-repeat", backgroundPosition:"right 10px center", paddingRight:"28px" };
  const toggleAcc = (n) => setSelectedAccessories(p => p.includes(n) ? p.filter(a => a !== n) : [...p, n]);

  return (
    <div style={{ fontFamily:"'Outfit',sans-serif", background:"#0a1222", color:"#d8e0f0", minHeight:"100vh", paddingTop:"52px" }}>
      <BackNav title="HVAC Calculator" color="#42A5F5" />
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@700;800;900&display=swap" rel="stylesheet" />
      <div style={{ background:"linear-gradient(160deg,#0D47A1,#1565C0,#1976D2)", padding:"40px 24px 48px", textAlign:"center", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(circle at 30% 70%,rgba(100,180,255,0.08) 0%,transparent 50%),radial-gradient(circle at 70% 30%,rgba(66,165,245,0.06) 0%,transparent 50%)" }} />
        <div style={{ position:"relative", maxWidth:"700px", margin:"0 auto" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:"8px", background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:"100px", padding:"5px 16px", marginBottom:"16px", fontSize:"10px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.12em", color:"rgba(255,255,255,0.8)" }}>❄️ HVAC Calculator</div>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(28px,4vw,42px)", fontWeight:900, lineHeight:1.1, margin:"0 0 10px", color:"white" }}>Size It Right. <span style={{ color:"#90CAF9" }}>Bid It Right.</span></h1>
          <p style={{ fontSize:"15px", opacity:0.75, maxWidth:"480px", margin:"0 auto", lineHeight:1.6 }}>Heat load calculations, equipment sizing, ductwork estimates, and profit-driven quoting.</p>
        </div>
      </div>
      <div style={{ maxWidth:"720px", margin:"0 auto", padding:"32px 20px" }}>
        <div style={{ background:"#111d33", borderRadius:"16px", padding:"28px", border:"1px solid #1a2d4a", marginBottom:"20px" }}>
          <h3 style={{ fontSize:"12px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:"#42A5F5", marginTop:0, marginBottom:"18px" }}>Home Details</h3>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"12px", marginBottom:"14px" }}>
            <div><label style={lbl}>Square Footage</label><input type="number" value={sqft} onChange={e=>setSqft(e.target.value)} placeholder="e.g. 2000" style={inp} /></div>
            <div><label style={lbl}>Ceiling Height (ft)</label><input type="number" value={ceilingHeight} onChange={e=>setCeilingHeight(e.target.value)} style={inp} /></div>
            <div><label style={lbl}>Stories</label><select value={stories} onChange={e=>setStories(e.target.value)} style={sel}><option value="1">1 Story</option><option value="2">2 Stories</option><option value="3">3 Stories</option></select></div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"14px" }}>
            <div><label style={lbl}>Climate Zone</label><select value={zone} onChange={e=>setZone(e.target.value)} style={sel}>{Object.keys(CLIMATE_ZONES).map(z=><option key={z} value={z}>{z}</option>)}</select></div>
            <div><label style={lbl}>Insulation Level</label><select value={insulation} onChange={e=>setInsulation(e.target.value)} style={sel}>{Object.keys(INSULATION_LEVELS).map(il=><option key={il} value={il}>{il}</option>)}</select></div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"12px" }}>
            <div><label style={lbl}>Windows</label><select value={windows} onChange={e=>setWindows(e.target.value)} style={sel}><option value="few">Few / Small</option><option value="average">Average</option><option value="many">Many / Large</option></select></div>
            <div><label style={lbl}>Sun Exposure</label><select value={sunExposure} onChange={e=>setSunExposure(e.target.value)} style={sel}><option value="low">Low (shaded)</option><option value="moderate">Moderate</option><option value="high">High (full sun)</option></select></div>
            <div><label style={lbl}>Occupants</label><input type="number" value={occupants} onChange={e=>setOccupants(e.target.value)} style={inp} /></div>
          </div>
        </div>
        <div style={{ background:"#111d33", borderRadius:"16px", padding:"28px", border:"1px solid #1a2d4a", marginBottom:"20px" }}>
          <h3 style={{ fontSize:"12px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:"#42A5F5", marginTop:0, marginBottom:"18px" }}>Equipment & Ductwork</h3>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"14px" }}>
            <div><label style={lbl}>System Type</label><select value={system} onChange={e=>setSystem(e.target.value)} style={sel}>{Object.keys(SYSTEM_TYPES).map(s=><option key={s} value={s}>{s}</option>)}</select></div>
            <div><label style={lbl}>Duct Material</label><select value={ductMaterial} onChange={e=>setDuctMaterial(e.target.value)} style={sel}>{Object.keys(DUCT_MATERIALS).map(d=><option key={d} value={d}>{d}</option>)}</select></div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
            <div><label style={lbl}>Duct Linear Feet</label><input type="number" value={ductLF} onChange={e=>setDuctLF(e.target.value)} placeholder="Auto estimate" style={inp} /></div>
            <div style={{ display:"flex", alignItems:"end", paddingBottom:"4px" }}>
              <label style={{ ...lbl, display:"flex", alignItems:"center", gap:"8px", cursor:"pointer", marginBottom:0 }}>
                <input type="checkbox" checked={ductReplace} onChange={e=>setDuctReplace(e.target.checked)} style={{ accentColor:"#42A5F5", width:"16px", height:"16px" }} />
                <span style={{ fontSize:"13px", textTransform:"none", letterSpacing:"0" }}>Include Ductwork Replacement</span>
              </label>
            </div>
          </div>
        </div>
        <div style={{ background:"#111d33", borderRadius:"16px", padding:"28px", border:"1px solid #1a2d4a", marginBottom:"20px" }}>
          <h3 style={{ fontSize:"12px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:"#42A5F5", marginTop:0, marginBottom:"18px" }}>Accessories & Add-Ons</h3>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px" }}>
            {Object.entries(ACCESSORIES_HVAC).map(([name, cost])=>(
              <label key={name} style={{ display:"flex", alignItems:"center", gap:"8px", cursor:"pointer", padding:"8px 10px", borderRadius:"8px", background:selectedAccessories.includes(name)?"rgba(66,165,245,0.12)":"transparent", border:selectedAccessories.includes(name)?"1px solid rgba(66,165,245,0.3)":"1px solid transparent", transition:"all 0.2s" }}>
                <input type="checkbox" checked={selectedAccessories.includes(name)} onChange={()=>toggleAcc(name)} style={{ accentColor:"#42A5F5", width:"15px", height:"15px" }} />
                <span style={{ fontSize:"12px", flex:1, color:selectedAccessories.includes(name)?"#d8e0f0":"#6a7a9a" }}>{name}</span>
                <span style={{ fontSize:"11px", fontWeight:700, color:"#42A5F5" }}>{fmt(cost)}</span>
              </label>
            ))}
          </div>
        </div>
        <div style={{ background:"#111d33", borderRadius:"16px", padding:"28px", border:"1px solid #1a2d4a", marginBottom:"28px" }}>
          <label style={lbl}>Desired Profit Margin: {margin}%</label>
          <input type="range" min="10" max="60" value={margin} onChange={e=>setMargin(+e.target.value)} style={{ width:"100%", accentColor:"#42A5F5" }} />
        </div>
        {results && (
          <div>
            <div style={{ background:"linear-gradient(135deg,#0D47A1,#1565C0,#1976D2)", borderRadius:"16px", padding:"28px", color:"white", marginBottom:"20px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px" }}>
                <div>
                  <div style={{ fontSize:"12px", opacity:0.7, textTransform:"uppercase", letterSpacing:"0.1em" }}>Quote Price</div>
                  <div style={{ fontSize:"40px", fontWeight:800, lineHeight:1.1 }}>{fmt(results.sellingPrice)}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:"12px", opacity:0.7, textTransform:"uppercase", letterSpacing:"0.1em" }}>Your Profit</div>
                  <div style={{ fontSize:"26px", fontWeight:700, color:"#90CAF9" }}>{fmt(results.profit)}</div>
                  <div style={{ fontSize:"13px", opacity:0.7 }}>{margin}% margin</div>
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"10px" }}>
                {[{ l:"Cooling Load", v:`${(results.coolingBTU/1000).toFixed(1)}k BTU` },{ l:"Heating Load", v:`${(results.heatingBTU/1000).toFixed(1)}k BTU` },{ l:"System Size", v:`${results.tons} Ton` },{ l:"Est. Cooling/yr", v:fmt(results.annualCoolingCost) }].map(x=>(
                  <div key={x.l} style={{ background:"rgba(255,255,255,0.1)", borderRadius:"10px", padding:"12px", textAlign:"center" }}>
                    <div style={{ fontSize:"9px", opacity:0.7, textTransform:"uppercase", letterSpacing:"0.08em" }}>{x.l}</div>
                    <div style={{ fontSize:"18px", fontWeight:700, marginTop:"2px" }}>{x.v}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background:"#111d33", borderRadius:"12px", padding:"24px", border:"1px solid #1a2d4a", marginBottom:"16px" }}>
              <h3 style={{ fontSize:"12px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", color:"#42A5F5", marginTop:0, marginBottom:"16px" }}>Cost Breakdown</h3>
              {[
                { label:`${system}`, value:results.equipCost, sub:`${results.tons} ton × ${fmt(SYSTEM_TYPES[system].costPerTon)}/ton` },
                { label:"Installation Labor", value:results.laborCost, sub:`${results.tons} ton × ${fmt(SYSTEM_TYPES[system].laborPerTon)}/ton` },
                ...(ductReplace?[{ label:`Ductwork (${ductMaterial})`, value:results.ductTotal, sub:`${results.estDuctLF} LF — Mat: ${fmt(results.ductMatCost)} + Lab: ${fmt(results.ductLabCost)}` }]:[]),
                { label:"Accessories", value:results.accCost, sub:selectedAccessories.join(", ")||"None" },
                { label:"Permits & Inspections", value:results.permitCost, sub:`Based on ${results.tons}-ton system` },
              ].map((item,i)=>(
                <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:"1px solid #1a2d4a" }}>
                  <div><div style={{ fontSize:"14px", fontWeight:600 }}>{item.label}</div><div style={{ fontSize:"11px", color:"#5a7a9a" }}>{item.sub}</div></div>
                  <div style={{ fontSize:"15px", fontWeight:700 }}>{fmt(item.value)}</div>
                </div>
              ))}
              <div style={{ display:"flex", justifyContent:"space-between", padding:"14px 0 0" }}>
                <div style={{ fontSize:"15px", fontWeight:800, color:"#42A5F5" }}>Total Job Cost</div>
                <div style={{ fontSize:"18px", fontWeight:800, color:"#42A5F5" }}>{fmt(results.totalCost)}</div>
              </div>
            </div>
            <div style={{ background:"#111d33", borderRadius:"12px", padding:"24px", border:"1px solid #1a2d4a" }}>
              <h3 style={{ fontSize:"12px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", color:"#42A5F5", marginTop:0, marginBottom:"16px" }}>System Specifications</h3>
              {[{ l:"Recommended Size", v:`${results.tons} Ton (${results.tons*12000} BTU)` },{ l:"Cooling Capacity Needed", v:`${results.coolingBTU.toLocaleString()} BTU` },{ l:"Heating Capacity Needed", v:`${results.heatingBTU.toLocaleString()} BTU` },{ l:"SEER Rating", v:results.seer },{ l:"Est. Annual Cooling Cost", v:fmt(results.annualCoolingCost) },...(ductReplace?[{ l:"Ductwork", v:`${results.estDuctLF} LF of ${ductMaterial}` }]:[])].map((row,i)=>(
                <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid #1a2d4a" }}>
                  <span style={{ fontSize:"13px", color:"#6a8aaa" }}>{row.l}</span>
                  <span style={{ fontSize:"13px", fontWeight:700 }}>{row.v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
