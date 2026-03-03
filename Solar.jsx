import BackNav from "./BackNav";
import { useState } from "react";

const PANEL_TYPES = {
  "Standard (400W)": { watts: 400, cost: 185, sqft: 18.5, efficiency: 0.20, warranty: 25 },
  "Premium (420W)": { watts: 420, cost: 220, sqft: 18.5, efficiency: 0.21, warranty: 25 },
  "High-Eff (440W)": { watts: 440, cost: 260, sqft: 18.5, efficiency: 0.22, warranty: 30 },
  "Budget (370W)": { watts: 370, cost: 145, sqft: 18.5, efficiency: 0.185, warranty: 20 },
  "Commercial (550W)": { watts: 550, cost: 310, sqft: 24, efficiency: 0.21, warranty: 25 },
};

const INVERTER_TYPES = {
  "String Inverter": { costPerKW: 180, efficiency: 0.96, warranty: 12 },
  "Microinverters": { costPerKW: 280, efficiency: 0.97, warranty: 25 },
  "Power Optimizers + String": { costPerKW: 240, efficiency: 0.97, warranty: 25 },
  "Hybrid (Battery Ready)": { costPerKW: 320, efficiency: 0.96, warranty: 12 },
};

const BATTERY_OPTIONS = {
  "None": { cost: 0, kwh: 0, warranty: 0 },
  "Tesla Powerwall (13.5 kWh)": { cost: 12500, kwh: 13.5, warranty: 10 },
  "Enphase IQ 5P (5 kWh)": { cost: 6500, kwh: 5, warranty: 15 },
  "Enphase IQ 10T (10 kWh)": { cost: 10500, kwh: 10, warranty: 15 },
  "Franklin aPower (13.6 kWh)": { cost: 11500, kwh: 13.6, warranty: 12 },
  "SolarEdge Home Batt (10 kWh)": { cost: 10000, kwh: 10, warranty: 10 },
};

const MOUNT_TYPES = {
  "Roof Mount (Comp Shingle)": { costPerPanel: 45, labPerPanel: 65 },
  "Roof Mount (Tile)": { costPerPanel: 75, labPerPanel: 95 },
  "Roof Mount (Metal)": { costPerPanel: 55, labPerPanel: 70 },
  "Roof Mount (Flat / Ballast)": { costPerPanel: 65, labPerPanel: 80 },
  "Ground Mount (Standard)": { costPerPanel: 120, labPerPanel: 110 },
  "Ground Mount (Pole)": { costPerPanel: 180, labPerPanel: 140 },
  "Carport": { costPerPanel: 200, labPerPanel: 160 },
};

// Sun hours by region (peak sun hours/day annual avg)
const SUN_REGIONS = {
  "Southwest (AZ, NV, NM)": 6.5,
  "Southeast (FL, GA, SC)": 5.2,
  "South Central (TX, OK, LA)": 5.5,
  "Mid-Atlantic (VA, NC, MD)": 4.7,
  "Midwest (OH, IN, IL, MO)": 4.2,
  "Northeast (NY, PA, NJ, CT)": 4.0,
  "Upper Midwest (MN, WI, MI)": 3.8,
  "Pacific NW (WA, OR)": 3.5,
  "California (South)": 5.8,
  "California (North)": 5.0,
  "Mountain (CO, UT, MT)": 5.3,
  "Hawaii": 5.5,
};

const FINANCING_OPTIONS = {
  "Cash Purchase": { apr: 0, term: 0, downPct: 100 },
  "Solar Loan (12yr, 3.99%)": { apr: 3.99, term: 12, downPct: 0 },
  "Solar Loan (20yr, 4.99%)": { apr: 4.99, term: 20, downPct: 0 },
  "Solar Loan (25yr, 5.99%)": { apr: 5.99, term: 25, downPct: 0 },
  "HELOC (10yr, 7.5%)": { apr: 7.5, term: 10, downPct: 0 },
  "PPA / Lease": { apr: 0, term: 25, downPct: 0 },
};

function fmt(n) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}

export default function SolarCalculator() {
  const [monthlyBill, setMonthlyBill] = useState("180");
  const [utilityRate, setUtilityRate] = useState("0.13");
  const [rateIncrease, setRateIncrease] = useState("3");
  const [sunRegion, setSunRegion] = useState("South Central (TX, OK, LA)");
  const [offsetTarget, setOffsetTarget] = useState(100);
  const [panelType, setPanelType] = useState("Standard (400W)");
  const [inverterType, setInverterType] = useState("Microinverters");
  const [batteryType, setBatteryType] = useState("None");
  const [mountType, setMountType] = useState("Roof Mount (Comp Shingle)");
  const [financing, setFinancing] = useState("Cash Purchase");
  const [margin, setMargin] = useState(25);
  const [permitCost, setPermitCost] = useState("500");
  const [includeMonitor, setIncludeMonitor] = useState(true);
  const [includeCreed, setIncludeCreed] = useState(false);

  const S = {
    inp: { width: "100%", padding: "10px 12px", border: "2px solid #3a2a00", borderRadius: "6px", fontSize: "14px", fontFamily: "'Outfit',sans-serif", background: "#1a1200", color: "#f0e0a0", outline: "none", boxSizing: "border-box" },
    lbl: { display: "block", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#a08020", marginBottom: "5px" },
    sel: { width: "100%", padding: "10px 12px", border: "2px solid #3a2a00", borderRadius: "6px", fontSize: "14px", fontFamily: "'Outfit',sans-serif", background: "#1a1200", color: "#f0e0a0", outline: "none", boxSizing: "border-box", appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath fill='%23a08020' d='M5 7L1 3h8z'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center", paddingRight: "28px" },
    card: { background: "#1f1a08", borderRadius: "16px", padding: "28px", border: "1px solid #332a10", marginBottom: "20px" },
    h3: { fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#F9A825", marginTop: 0, marginBottom: "18px" },
  };

  // Core calculations
  const bill = parseFloat(monthlyBill) || 0;
  const rate = parseFloat(utilityRate) || 0.13;
  const annualKWH = (bill / rate) * 12;
  const targetKWH = annualKWH * (offsetTarget / 100);
  const sunHours = SUN_REGIONS[sunRegion];
  const panel = PANEL_TYPES[panelType];
  const inverter = INVERTER_TYPES[inverterType];
  const battery = BATTERY_OPTIONS[batteryType];
  const mount = MOUNT_TYPES[mountType];
  const fin = FINANCING_OPTIONS[financing];

  // System sizing
  const systemKW = targetKWH / (sunHours * 365 * inverter.efficiency);
  const numPanels = Math.ceil((systemKW * 1000) / panel.watts);
  const actualKW = (numPanels * panel.watts) / 1000;
  const annualProd = actualKW * sunHours * 365 * inverter.efficiency;
  const actualOffset = Math.round((annualProd / annualKWH) * 100);
  const roofSqft = numPanels * panel.sqft;

  // Costs
  const panelCost = numPanels * panel.cost;
  const inverterCost = Math.round(actualKW * inverter.costPerKW);
  const mountMatCost = numPanels * mount.costPerPanel;
  const mountLabCost = numPanels * mount.labPerPanel;
  const batteryCost = battery.cost;
  const monitorCost = includeMonitor ? 350 : 0;
  const creedCost = includeCreed ? 450 : 0; // critter guard
  const pmCost = parseInt(permitCost) || 0;
  const elecLabor = Math.round(actualKW * 350); // electrical/interconnect
  const designEng = actualKW > 10 ? 1500 : 800;

  const totalCost = panelCost + inverterCost + mountMatCost + mountLabCost + batteryCost + monitorCost + creedCost + pmCost + elecLabor + designEng;
  const sellPrice = Math.round(totalCost / (1 - margin / 100));

  // Federal ITC (30%)
  const fedCredit = Math.round(sellPrice * 0.30);
  const netCost = sellPrice - fedCredit;

  const profit = sellPrice - totalCost;
  const costPerWatt = (sellPrice / (actualKW * 1000)).toFixed(2);

  // Savings
  const annualSaving = Math.round((annualProd / annualKWH) * bill * 12);
  const rateInc = parseFloat(rateIncrease) || 3;

  // 25-year savings
  let totalSavings25 = 0;
  for (let y = 0; y < 25; y++) {
    totalSavings25 += annualSaving * Math.pow(1 + rateInc / 100, y);
  }
  totalSavings25 = Math.round(totalSavings25);

  // Payback
  let paybackYears = 0;
  let cumSavings = 0;
  for (let y = 0; y < 30; y++) {
    cumSavings += annualSaving * Math.pow(1 + rateInc / 100, y);
    if (cumSavings >= netCost && paybackYears === 0) {
      paybackYears = y + 1;
      break;
    }
  }
  if (paybackYears === 0) paybackYears = 30;

  // ROI
  const roi25 = Math.round(((totalSavings25 - netCost) / netCost) * 100);

  // Financing monthly payment
  let monthlyPayment = 0;
  if (fin.term > 0 && fin.apr > 0) {
    const r = fin.apr / 100 / 12;
    const n = fin.term * 12;
    monthlyPayment = Math.round(netCost * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
  }

  return (
    <div style={{ fontFamily: "'Outfit',sans-serif", background: "#100e00", color: "#f0e0a0", minHeight: "100vh" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@700;800;900&display=swap" rel="stylesheet" />

      <div style={{ background: "linear-gradient(160deg,#E65100,#F57F17,#F9A825)", padding: "40px 24px 48px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 30% 70%,rgba(255,255,100,0.08) 0%,transparent 50%)" }} />
        <div style={{ position: "relative", maxWidth: "700px", margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(0,0,0,0.15)", border: "1px solid rgba(0,0,0,0.1)", borderRadius: "100px", padding: "5px 16px", marginBottom: "16px", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(0,0,0,0.6)" }}>☀️ Solar Calculator</div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(28px,4vw,42px)", fontWeight: 900, lineHeight: 1.1, margin: "0 0 10px", color: "#1a1200" }}>
            Close More Installs <span style={{ color: "rgba(0,0,0,0.4)" }}>With Real Numbers.</span>
          </h1>
          <p style={{ fontSize: "15px", color: "rgba(0,0,0,0.5)", maxWidth: "480px", margin: "0 auto", lineHeight: 1.6 }}>System sizing, ROI projections, financing comparisons, and profit-driven quoting.</p>
        </div>
      </div>

      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "32px 20px" }}>

        {/* Usage & Location */}
        <div style={S.card}>
          <h3 style={S.h3}>Energy Usage & Location</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "14px" }}>
            <div><label style={S.lbl}>Monthly Elec Bill</label><input type="number" value={monthlyBill} onChange={e => setMonthlyBill(e.target.value)} style={S.inp} /></div>
            <div><label style={S.lbl}>Utility Rate ($/kWh)</label><input type="number" value={utilityRate} onChange={e => setUtilityRate(e.target.value)} step="0.01" style={S.inp} /></div>
            <div><label style={S.lbl}>Annual Rate Increase</label><input type="number" value={rateIncrease} onChange={e => setRateIncrease(e.target.value)} step="0.5" style={S.inp} /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div><label style={S.lbl}>Sun Region</label><select value={sunRegion} onChange={e => setSunRegion(e.target.value)} style={S.sel}>{Object.keys(SUN_REGIONS).map(r => <option key={r} value={r}>{r} — {SUN_REGIONS[r]} hrs/day</option>)}</select></div>
            <div><label style={S.lbl}>Offset Target: {offsetTarget}%</label><input type="range" min="50" max="150" value={offsetTarget} onChange={e => setOffsetTarget(+e.target.value)} style={{ width: "100%", accentColor: "#F9A825", marginTop: "8px" }} /></div>
          </div>
        </div>

        {/* Equipment */}
        <div style={S.card}>
          <h3 style={S.h3}>Equipment</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
            <div><label style={S.lbl}>Panel Type</label><select value={panelType} onChange={e => setPanelType(e.target.value)} style={S.sel}>{Object.keys(PANEL_TYPES).map(p => <option key={p} value={p}>{p} — {fmt(PANEL_TYPES[p].cost)}/ea</option>)}</select></div>
            <div><label style={S.lbl}>Inverter Type</label><select value={inverterType} onChange={e => setInverterType(e.target.value)} style={S.sel}>{Object.keys(INVERTER_TYPES).map(i => <option key={i} value={i}>{i}</option>)}</select></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
            <div><label style={S.lbl}>Battery Storage</label><select value={batteryType} onChange={e => setBatteryType(e.target.value)} style={S.sel}>{Object.keys(BATTERY_OPTIONS).map(b => <option key={b} value={b}>{b}{BATTERY_OPTIONS[b].cost > 0 ? ` — ${fmt(BATTERY_OPTIONS[b].cost)}` : ""}</option>)}</select></div>
            <div><label style={S.lbl}>Mount Type</label><select value={mountType} onChange={e => setMountType(e.target.value)} style={S.sel}>{Object.keys(MOUNT_TYPES).map(m => <option key={m} value={m}>{m}</option>)}</select></div>
          </div>
          <div style={{ display: "flex", gap: "20px" }}>
            <label style={{ ...S.lbl, display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
              <input type="checkbox" checked={includeMonitor} onChange={e => setIncludeMonitor(e.target.checked)} style={{ accentColor: "#F9A825", width: "16px", height: "16px" }} />
              <span style={{ fontSize: "13px", textTransform: "none", letterSpacing: "0" }}>Monitoring System ($350)</span>
            </label>
            <label style={{ ...S.lbl, display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
              <input type="checkbox" checked={includeCreed} onChange={e => setIncludeCreed(e.target.checked)} style={{ accentColor: "#F9A825", width: "16px", height: "16px" }} />
              <span style={{ fontSize: "13px", textTransform: "none", letterSpacing: "0" }}>Critter Guard ($450)</span>
            </label>
          </div>
        </div>

        {/* Pricing & Financing */}
        <div style={S.card}>
          <h3 style={S.h3}>Pricing & Financing</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "14px" }}>
            <div><label style={S.lbl}>Permit Cost</label><input type="number" value={permitCost} onChange={e => setPermitCost(e.target.value)} style={S.inp} /></div>
            <div><label style={S.lbl}>Financing</label><select value={financing} onChange={e => setFinancing(e.target.value)} style={S.sel}>{Object.keys(FINANCING_OPTIONS).map(f => <option key={f} value={f}>{f}</option>)}</select></div>
            <div><label style={S.lbl}>Margin: {margin}%</label><input type="range" min="10" max="45" value={margin} onChange={e => setMargin(+e.target.value)} style={{ width: "100%", accentColor: "#F9A825", marginTop: "8px" }} /></div>
          </div>
        </div>

        {/* Results */}
        {bill > 0 && (
          <div>
            {/* Hero pricing */}
            <div style={{ background: "linear-gradient(135deg,#E65100,#F57F17,#F9A825)", borderRadius: "16px", padding: "28px", color: "#1a1200", marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div>
                  <div style={{ fontSize: "12px", opacity: 0.6, textTransform: "uppercase", letterSpacing: "0.1em" }}>System Price</div>
                  <div style={{ fontSize: "38px", fontWeight: 800, lineHeight: 1.1 }}>{fmt(sellPrice)}</div>
                  <div style={{ fontSize: "14px", opacity: 0.5 }}>${costPerWatt}/watt</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "12px", opacity: 0.6, textTransform: "uppercase", letterSpacing: "0.1em" }}>After 30% ITC</div>
                  <div style={{ fontSize: "28px", fontWeight: 800, color: "rgba(0,0,0,0.7)" }}>{fmt(netCost)}</div>
                  <div style={{ fontSize: "13px", opacity: 0.5 }}>Fed credit: {fmt(fedCredit)}</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px" }}>
                {[
                  { l: "System Size", v: `${actualKW.toFixed(1)} kW` },
                  { l: "Panels", v: numPanels },
                  { l: "Offset", v: `${actualOffset}%` },
                  { l: "Payback", v: `${paybackYears} yrs` },
                ].map(x => (
                  <div key={x.l} style={{ background: "rgba(0,0,0,0.1)", borderRadius: "10px", padding: "12px", textAlign: "center" }}>
                    <div style={{ fontSize: "9px", opacity: 0.5, textTransform: "uppercase", letterSpacing: "0.08em" }}>{x.l}</div>
                    <div style={{ fontSize: "18px", fontWeight: 700, marginTop: "2px" }}>{x.v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Savings & ROI */}
            <div style={S.card}>
              <h3 style={S.h3}>Savings & ROI</h3>
              {[
                { l: "Annual Energy Production", v: `${Math.round(annualProd).toLocaleString()} kWh` },
                { l: "Year 1 Savings", v: fmt(annualSaving) },
                { l: "25-Year Total Savings", v: fmt(totalSavings25) },
                { l: "25-Year ROI", v: `${roi25}%` },
                { l: "Payback Period", v: `${paybackYears} years` },
                ...(monthlyPayment > 0 ? [{ l: `Monthly Payment (${financing})`, v: fmt(monthlyPayment) }] : []),
                ...(monthlyPayment > 0 ? [{ l: "Monthly Savings vs Payment", v: fmt(Math.round(annualSaving / 12) - monthlyPayment) }] : []),
              ].map((row, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #2a2208" }}>
                  <span style={{ fontSize: "13px", color: "#a09040" }}>{row.l}</span>
                  <span style={{ fontSize: "13px", fontWeight: 700 }}>{row.v}</span>
                </div>
              ))}
            </div>

            {/* Your Profit */}
            <div style={{ background: "rgba(249,168,37,0.1)", borderRadius: "16px", padding: "24px", border: "1px solid rgba(249,168,37,0.25)", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#a08020" }}>Your Profit</div>
                <div style={{ fontSize: "32px", fontWeight: 800, color: "#F9A825" }}>{fmt(profit)}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "13px", color: "#a09040" }}>{margin}% margin</div>
                <div style={{ fontSize: "13px", color: "#a09040" }}>Job cost: {fmt(totalCost)}</div>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div style={S.card}>
              <h3 style={S.h3}>Cost Breakdown</h3>
              {[
                { label: `Panels (${numPanels}× ${panelType})`, value: panelCost, sub: `${numPanels} × ${fmt(panel.cost)} — ${actualKW.toFixed(1)} kW total` },
                { label: `Inverter (${inverterType})`, value: inverterCost, sub: `${actualKW.toFixed(1)} kW × ${fmt(inverter.costPerKW)}/kW` },
                { label: `Racking (${mountType})`, value: mountMatCost + mountLabCost, sub: `Material: ${fmt(mountMatCost)} + Labor: ${fmt(mountLabCost)}` },
                ...(batteryCost > 0 ? [{ label: `Battery (${batteryType})`, value: batteryCost, sub: `${battery.kwh} kWh capacity` }] : []),
                { label: "Electrical / Interconnect", value: elecLabor, sub: `Main panel, conduit, disconnect, metering` },
                { label: "Design & Engineering", value: designEng, sub: `Permits, plans, structural review` },
                { label: "Permits & Inspections", value: pmCost, sub: "Local jurisdiction + utility" },
                ...(monitorCost > 0 ? [{ label: "Monitoring System", value: monitorCost, sub: "Production monitoring + app" }] : []),
                ...(creedCost > 0 ? [{ label: "Critter Guard", value: creedCost, sub: "Panel perimeter mesh" }] : []),
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #2a2208" }}>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 600 }}>{item.label}</div>
                    <div style={{ fontSize: "11px", color: "#6a5a20" }}>{item.sub}</div>
                  </div>
                  <div style={{ fontSize: "15px", fontWeight: 700 }}>{fmt(item.value)}</div>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 0 0" }}>
                <div style={{ fontSize: "15px", fontWeight: 800, color: "#F9A825" }}>Total Job Cost</div>
                <div style={{ fontSize: "18px", fontWeight: 800, color: "#F9A825" }}>{fmt(totalCost)}</div>
              </div>
            </div>

            {/* System Specs */}
            <div style={S.card}>
              <h3 style={S.h3}>System Specifications</h3>
              {[
                { l: "System Size", v: `${actualKW.toFixed(2)} kW DC` },
                { l: "Panel Count", v: `${numPanels} panels` },
                { l: "Panel Type", v: `${panelType} (${panel.efficiency * 100}% eff)` },
                { l: "Inverter", v: `${inverterType} (${(inverter.efficiency * 100).toFixed(0)}% eff)` },
                { l: "Roof Space Needed", v: `${Math.round(roofSqft)} sq ft` },
                { l: "Annual Production", v: `${Math.round(annualProd).toLocaleString()} kWh` },
                { l: "Annual Usage", v: `${Math.round(annualKWH).toLocaleString()} kWh` },
                { l: "Energy Offset", v: `${actualOffset}%` },
                { l: "Peak Sun Hours", v: `${sunHours} hrs/day (${sunRegion})` },
                ...(battery.kwh > 0 ? [{ l: "Battery Storage", v: `${battery.kwh} kWh` }] : []),
              ].map((row, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #2a2208" }}>
                  <span style={{ fontSize: "13px", color: "#8a7a30" }}>{row.l}</span>
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
