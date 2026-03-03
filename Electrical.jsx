import BackNav from "./BackNav";
import { useState, useEffect } from "react";

const SERVICE_SIZES = { "100A": 100, "200A": 200, "320A": 320, "400A": 400 };

const COMMON_CIRCUITS = [
  { name: "General Lighting (15A)", amps: 15, watts: 1800, wire: "14 AWG" },
  { name: "Kitchen Counter (20A)", amps: 20, watts: 2400, wire: "12 AWG" },
  { name: "Bathroom (20A GFCI)", amps: 20, watts: 2400, wire: "12 AWG" },
  { name: "Laundry (20A)", amps: 20, watts: 2400, wire: "12 AWG" },
  { name: "Dishwasher (20A)", amps: 20, watts: 1800, wire: "12 AWG" },
  { name: "Garbage Disposal (20A)", amps: 20, watts: 1200, wire: "12 AWG" },
  { name: "Refrigerator (20A)", amps: 20, watts: 1500, wire: "12 AWG" },
  { name: "Microwave (20A)", amps: 20, watts: 1800, wire: "12 AWG" },
  { name: "Electric Range (50A)", amps: 50, watts: 12000, wire: "6 AWG" },
  { name: "Electric Dryer (30A)", amps: 30, watts: 7200, wire: "10 AWG" },
  { name: "Water Heater (30A)", amps: 30, watts: 4500, wire: "10 AWG" },
  { name: "EV Charger (50A)", amps: 50, watts: 9600, wire: "6 AWG" },
  { name: "AC Condenser (30A)", amps: 30, watts: 5000, wire: "10 AWG" },
  { name: "Sub-Panel Feed (60A)", amps: 60, watts: 14400, wire: "4 AWG" },
  { name: "Hot Tub / Spa (50A)", amps: 50, watts: 12000, wire: "6 AWG" },
  { name: "Workshop / Garage (20A)", amps: 20, watts: 2400, wire: "12 AWG" },
];

const JOB_TYPES = {
  "Panel Upgrade (100A to 200A)": { baseCost: 1800, baseLab: 2200 },
  "New Panel Install (200A)": { baseCost: 2200, baseLab: 2800 },
  "Sub-Panel Install": { baseCost: 800, baseLab: 1200 },
  "Whole House Rewire": { baseCost: 4500, baseLab: 8000 },
  "EV Charger Install": { baseCost: 600, baseLab: 800 },
  "Generator Transfer Switch": { baseCost: 500, baseLab: 900 },
  "Circuit Addition (per circuit)": { baseCost: 120, baseLab: 250 },
  "Lighting Install (per fixture)": { baseCost: 45, baseLab: 85 },
  "Outlet/Switch Install (each)": { baseCost: 15, baseLab: 65 },
  "Service Call / Troubleshoot": { baseCost: 0, baseLab: 175 },
};

function fmt(n) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n); }

export default function ElectricalCalculator() {
  const [tab, setTab] = useState("load");
  const [serviceSize, setServiceSize] = useState("200A");
  const [selectedCircuits, setSelectedCircuits] = useState(COMMON_CIRCUITS.slice(0, 8).map(c => ({ ...c, qty: 1 })));
  const [jobType, setJobType] = useState("Panel Upgrade (100A to 200A)");
  const [addCircuits, setAddCircuits] = useState("4");
  const [addFixtures, setAddFixtures] = useState("8");
  const [addOutlets, setAddOutlets] = useState("6");
  const [wireRun, setWireRun] = useState("50");
  const [margin, setMargin] = useState(35);
  const [permitCost, setPermitCost] = useState("350");

  const inp = { width:"100%", padding:"10px 12px", border:"2px solid #4a2800", borderRadius:"6px", fontSize:"14px", fontFamily:"'Outfit',sans-serif", background:"#1a0e00", color:"#f0d8b8", outline:"none", boxSizing:"border-box" };
  const lbl = { display:"block", fontSize:"10px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:"#a06830", marginBottom:"5px" };
  const sel = { ...inp, appearance:"none", backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath fill='%23a06830' d='M5 7L1 3h8z'/%3E%3C/svg%3E")`, backgroundRepeat:"no-repeat", backgroundPosition:"right 10px center", paddingRight:"28px" };

  const totalAmps = selectedCircuits.reduce((s, c) => s + c.amps * c.qty, 0);
  const totalWatts = selectedCircuits.reduce((s, c) => s + c.watts * c.qty, 0);
  const demandLoad = totalWatts * 0.65;
  const demandAmps = demandLoad / 240;
  const panelCap = SERVICE_SIZES[serviceSize];
  const loadPct = Math.round((demandAmps / panelCap) * 100);

  const job = JOB_TYPES[jobType];
  const ac = parseInt(addCircuits)||0, af = parseInt(addFixtures)||0, ao = parseInt(addOutlets)||0, wr = parseInt(wireRun)||50, pm = parseInt(permitCost)||0;
  const matCost = job.baseCost + ac*120 + af*45 + ao*15 + ac*wr*0.65;
  const labCost = job.baseLab + ac*250 + af*85 + ao*65;
  const totalCost = matCost + labCost + pm;
  const sellPrice = totalCost / (1 - margin/100);
  const profit = sellPrice - totalCost;

  const toggleCircuit = (c) => setSelectedCircuits(p => p.find(x=>x.name===c.name) ? p.filter(x=>x.name!==c.name) : [...p, {...c,qty:1}]);
  const updateQty = (name, qty) => setSelectedCircuits(p => p.map(c => c.name===name ? {...c,qty:Math.max(1,parseInt(qty)||1)} : c));
  const tabBtn = (id, label) => <button onClick={()=>setTab(id)} style={{ padding:"10px 24px", borderRadius:"8px", border:"none", background:tab===id?"#E65100":"rgba(230,81,0,0.15)", color:tab===id?"white":"#E65100", fontSize:"13px", fontWeight:700, cursor:"pointer", fontFamily:"'Outfit',sans-serif" }}>{label}</button>;

  return (
    <div style={{ fontFamily:"'Outfit',sans-serif", background:"#120800", color:"#f0d8b8", minHeight:"100vh", paddingTop:"52px" }}>
      <BackNav title="Electrical Calculator" color="#E65100" />
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@700;800;900&display=swap" rel="stylesheet" />
      <div style={{ background:"linear-gradient(160deg,#BF360C,#E65100)", padding:"40px 24px 48px", textAlign:"center", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(circle at 30% 70%,rgba(255,150,50,0.08) 0%,transparent 50%)" }} />
        <div style={{ position:"relative", maxWidth:"700px", margin:"0 auto" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:"8px", background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:"100px", padding:"5px 16px", marginBottom:"16px", fontSize:"10px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.12em", color:"rgba(255,255,255,0.8)" }}>⚡ Electrical Calculator</div>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(28px,4vw,42px)", fontWeight:900, lineHeight:1.1, margin:"0 0 10px", color:"white" }}>Calculate With Confidence. <span style={{ color:"#FFAB91" }}>Bid With Precision.</span></h1>
          <p style={{ fontSize:"15px", opacity:0.75, maxWidth:"480px", margin:"0 auto", lineHeight:1.6 }}>Panel load analysis, wire sizing, and full job cost estimating for electricians.</p>
        </div>
      </div>
      <div style={{ maxWidth:"720px", margin:"0 auto", padding:"32px 20px" }}>
        <div style={{ display:"flex", gap:"8px", marginBottom:"24px", justifyContent:"center" }}>{tabBtn("load","Panel Load")}{tabBtn("bid","Job Bid Estimator")}</div>

        {tab==="load" && (<div>
          <div style={{ background:"#1f1008", borderRadius:"16px", padding:"28px", border:"1px solid #3a2010", marginBottom:"20px" }}>
            <h3 style={{ fontSize:"12px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:"#E65100", marginTop:0, marginBottom:"18px" }}>Service & Circuits</h3>
            <div style={{ marginBottom:"16px" }}><label style={lbl}>Service Size</label><select value={serviceSize} onChange={e=>setServiceSize(e.target.value)} style={{...sel,width:"200px"}}>{Object.keys(SERVICE_SIZES).map(s=><option key={s} value={s}>{s}</option>)}</select></div>
            <div style={{ fontSize:"11px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", color:"#a06830", marginBottom:"10px" }}>Select Circuits</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"6px" }}>
              {COMMON_CIRCUITS.map(c => { const sel2 = selectedCircuits.find(sc=>sc.name===c.name); return (
                <div key={c.name} onClick={()=>toggleCircuit(c)} style={{ display:"flex", alignItems:"center", gap:"8px", padding:"8px 10px", borderRadius:"8px", background:sel2?"rgba(230,81,0,0.12)":"transparent", border:sel2?"1px solid rgba(230,81,0,0.3)":"1px solid transparent", cursor:"pointer" }}>
                  <input type="checkbox" checked={!!sel2} readOnly style={{ accentColor:"#E65100", width:"15px", height:"15px", pointerEvents:"none" }} />
                  <span style={{ fontSize:"12px", flex:1, color:sel2?"#f0d8b8":"#7a5a3a" }}>{c.name}</span>
                  {sel2 && <input type="number" value={sel2.qty} onClick={e=>e.stopPropagation()} onChange={e=>updateQty(c.name,e.target.value)} min="1" max="20" style={{...inp,width:"48px",padding:"4px 6px",fontSize:"12px",textAlign:"center"}} />}
                </div>
              );})}
            </div>
          </div>
          <div style={{ background:"linear-gradient(135deg,#BF360C,#E65100)", borderRadius:"16px", padding:"28px", color:"white", marginBottom:"20px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px" }}>
              <div><div style={{ fontSize:"12px", opacity:0.7, textTransform:"uppercase", letterSpacing:"0.1em" }}>Panel Load</div><div style={{ fontSize:"36px", fontWeight:800, lineHeight:1.1 }}>{loadPct}%</div><div style={{ fontSize:"13px", opacity:0.7 }}>of {serviceSize} capacity</div></div>
              <div style={{ textAlign:"right" }}><div style={{ fontSize:"12px", opacity:0.7, textTransform:"uppercase", letterSpacing:"0.1em" }}>Status</div><div style={{ fontSize:"20px", fontWeight:700, color:loadPct>80?"#FF8A65":loadPct>60?"#FFE082":"#A5D6A7" }}>{loadPct>80?"⚠️ Near Capacity":loadPct>60?"⚡ Moderate":"✓ Good Capacity"}</div></div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"10px" }}>
              {[{l:"Connected Amps",v:`${totalAmps}A`},{l:"Connected Watts",v:`${(totalWatts/1000).toFixed(1)}kW`},{l:"Demand Load",v:`${(demandLoad/1000).toFixed(1)}kW`},{l:"Demand Amps",v:`${Math.round(demandAmps)}A`}].map(x=>(<div key={x.l} style={{ background:"rgba(255,255,255,0.1)", borderRadius:"10px", padding:"12px", textAlign:"center" }}><div style={{ fontSize:"9px", opacity:0.7, textTransform:"uppercase", letterSpacing:"0.08em" }}>{x.l}</div><div style={{ fontSize:"18px", fontWeight:700, marginTop:"2px" }}>{x.v}</div></div>))}
            </div>
            <div style={{ marginTop:"16px", background:"rgba(0,0,0,0.3)", borderRadius:"8px", height:"12px", overflow:"hidden" }}><div style={{ width:`${Math.min(loadPct,100)}%`, height:"100%", borderRadius:"8px", background:loadPct>80?"#FF5722":loadPct>60?"#FFC107":"#4CAF50", transition:"width 0.5s" }} /></div>
          </div>
          <div style={{ background:"#1f1008", borderRadius:"12px", padding:"24px", border:"1px solid #3a2010" }}>
            <h3 style={{ fontSize:"12px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", color:"#E65100", marginTop:0, marginBottom:"16px" }}>Circuit Summary</h3>
            {selectedCircuits.map((c,i)=>(<div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid #2a1808", fontSize:"13px" }}><span style={{ color:"#c0a080" }}>{c.name} {c.qty>1?`×${c.qty}`:""}</span><span style={{ fontWeight:700 }}>{c.amps*c.qty}A / {((c.watts*c.qty)/1000).toFixed(1)}kW — {c.wire}</span></div>))}
          </div>
        </div>)}

        {tab==="bid" && (<div>
          <div style={{ background:"#1f1008", borderRadius:"16px", padding:"28px", border:"1px solid #3a2010", marginBottom:"20px" }}>
            <h3 style={{ fontSize:"12px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:"#E65100", marginTop:0, marginBottom:"18px" }}>Job Details</h3>
            <div style={{ marginBottom:"14px" }}><label style={lbl}>Primary Job Type</label><select value={jobType} onChange={e=>setJobType(e.target.value)} style={sel}>{Object.keys(JOB_TYPES).map(j=><option key={j} value={j}>{j}</option>)}</select></div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"12px", marginBottom:"14px" }}>
              <div><label style={lbl}>Add'l Circuits</label><input type="number" value={addCircuits} onChange={e=>setAddCircuits(e.target.value)} style={inp} /></div>
              <div><label style={lbl}>Light Fixtures</label><input type="number" value={addFixtures} onChange={e=>setAddFixtures(e.target.value)} style={inp} /></div>
              <div><label style={lbl}>Outlets/Switches</label><input type="number" value={addOutlets} onChange={e=>setAddOutlets(e.target.value)} style={inp} /></div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
              <div><label style={lbl}>Avg Wire Run (ft)</label><input type="number" value={wireRun} onChange={e=>setWireRun(e.target.value)} style={inp} /></div>
              <div><label style={lbl}>Permit Cost</label><input type="number" value={permitCost} onChange={e=>setPermitCost(e.target.value)} style={inp} /></div>
            </div>
          </div>
          <div style={{ background:"#1f1008", borderRadius:"16px", padding:"28px", border:"1px solid #3a2010", marginBottom:"28px" }}><label style={lbl}>Desired Profit Margin: {margin}%</label><input type="range" min="10" max="60" value={margin} onChange={e=>setMargin(+e.target.value)} style={{ width:"100%", accentColor:"#E65100" }} /></div>
          <div style={{ background:"linear-gradient(135deg,#BF360C,#E65100)", borderRadius:"16px", padding:"28px", color:"white", marginBottom:"20px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div><div style={{ fontSize:"12px", opacity:0.7, textTransform:"uppercase", letterSpacing:"0.1em" }}>Quote Price</div><div style={{ fontSize:"40px", fontWeight:800, lineHeight:1.1 }}>{fmt(sellPrice)}</div></div>
              <div style={{ textAlign:"right" }}><div style={{ fontSize:"12px", opacity:0.7, textTransform:"uppercase", letterSpacing:"0.1em" }}>Your Profit</div><div style={{ fontSize:"26px", fontWeight:700, color:"#FFAB91" }}>{fmt(profit)}</div><div style={{ fontSize:"13px", opacity:0.7 }}>{margin}% margin</div></div>
            </div>
          </div>
          <div style={{ background:"#1f1008", borderRadius:"12px", padding:"24px", border:"1px solid #3a2010" }}>
            <h3 style={{ fontSize:"12px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", color:"#E65100", marginTop:0, marginBottom:"16px" }}>Cost Breakdown</h3>
            {[{ label:jobType, value:job.baseCost+job.baseLab, sub:`Material: ${fmt(job.baseCost)} + Labor: ${fmt(job.baseLab)}` },...(ac>0?[{ label:`${ac} Additional Circuit(s)`, value:ac*370+ac*wr*0.65, sub:`Material + wiring (${wr}ft avg run)` }]:[]),...(af>0?[{ label:`${af} Light Fixture(s)`, value:af*130, sub:`Mat: ${fmt(af*45)} + Lab: ${fmt(af*85)}` }]:[]),...(ao>0?[{ label:`${ao} Outlet/Switch(es)`, value:ao*80, sub:`Mat: ${fmt(ao*15)} + Lab: ${fmt(ao*65)}` }]:[]),{ label:"Permits", value:pm, sub:"Local jurisdiction" }].map((item,i)=>(<div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:"1px solid #2a1808" }}><div><div style={{ fontSize:"14px", fontWeight:600 }}>{item.label}</div><div style={{ fontSize:"11px", color:"#7a5a3a" }}>{item.sub}</div></div><div style={{ fontSize:"15px", fontWeight:700 }}>{fmt(item.value)}</div></div>))}
            <div style={{ display:"flex", justifyContent:"space-between", padding:"14px 0 0" }}><div style={{ fontSize:"15px", fontWeight:800, color:"#E65100" }}>Total Job Cost</div><div style={{ fontSize:"18px", fontWeight:800, color:"#E65100" }}>{fmt(totalCost)}</div></div>
          </div>
        </div>)}
      </div>
    </div>
  );
}
