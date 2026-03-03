import BackNav from "./BackNav";
import { useState, useEffect, useRef } from "react";

const TIERS = {
  basic: {
    name: "Basic",
    tagline: "Quick Estimates, Fast Bids",
    price: "$497",
    monthly: "$49/mo",
    color: "#2D6A4F",
    accent: "#95D5B2",
    features: [
      "Roof area calculator (length × width × pitch multiplier)",
      "Material quantity estimator (shingles, underlayment, drip edge)",
      "Waste factor adjustment (10–20%)",
      "Basic labor cost estimator",
      "Printable estimate summary",
    ],
    notIncluded: [
      "Multi-section / complex roof layouts",
      "Tear-off & disposal costing",
      "Customer-facing quote tool",
    ],
  },
  advanced: {
    name: "Advanced",
    tagline: "Full-Service Estimating Engine",
    price: "$1,497",
    monthly: "$129/mo",
    color: "#1B4332",
    accent: "#74C69D",
    features: [
      "Everything in Basic, plus…",
      "Multi-section roof builder (valleys, hips, dormers)",
      "Tear-off & disposal cost calculator",
      "Material cost database (update your own prices)",
      "Profit margin & markup calculator",
      "Crew size & timeline estimator",
      "PDF quote generator with your logo",
      "Customer-facing embed for your website",
    ],
    notIncluded: ["CRM integration", "Custom branding & design"],
  },
  custom: {
    name: "Custom",
    tagline: "Built Exactly For Your Business",
    price: "From $2,997",
    monthly: "Custom",
    color: "#081C15",
    accent: "#52B788",
    features: [
      "Everything in Advanced, plus…",
      "Custom UI with your branding & colors",
      "Integration with your CRM / job management",
      "Satellite measurement API hookup",
      "Financing calculator for homeowners",
      "Lead capture & email notifications",
      "Multi-user / team access",
      "Dedicated support & quarterly updates",
    ],
    notIncluded: [],
  },
};

const PITCH_MULTIPLIERS = {
  "1/12": 1.003,
  "2/12": 1.014,
  "3/12": 1.031,
  "4/12": 1.054,
  "5/12": 1.083,
  "6/12": 1.118,
  "7/12": 1.158,
  "8/12": 1.202,
  "9/12": 1.25,
  "10/12": 1.302,
  "11/12": 1.357,
  "12/12": 1.414,
};

const MATERIALS = {
  "3-Tab Shingles": { perSquare: 85, laborPerSquare: 65 },
  "Architectural Shingles": { perSquare: 120, laborPerSquare: 75 },
  "Premium/Designer Shingles": { perSquare: 200, laborPerSquare: 90 },
  "Metal Roofing (Standing Seam)": { perSquare: 350, laborPerSquare: 120 },
  "Metal Roofing (Corrugated)": { perSquare: 200, laborPerSquare: 100 },
  TPO: { perSquare: 175, laborPerSquare: 85 },
  "Clay Tile": { perSquare: 400, laborPerSquare: 150 },
  "Concrete Tile": { perSquare: 250, laborPerSquare: 130 },
};

const ACCESSORIES = {
  "Synthetic Underlayment": { unit: "roll", coversSqFt: 1000, cost: 65 },
  "Ice & Water Shield": { unit: "roll", coversSqFt: 200, cost: 95 },
  "Drip Edge (10ft)": { unit: "piece", coversLF: 10, cost: 8 },
  "Ridge Vent (4ft)": { unit: "piece", coversLF: 4, cost: 12 },
  "Roofing Nails (coil)": { unit: "box", coversSqFt: 500, cost: 45 },
  "Pipe Boots / Flashing": { unit: "each", cost: 15 },
  "Starter Strip (roll)": { unit: "roll", coversLF: 120, cost: 28 },
};

function formatCurrency(num) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

function BasicCalculator() {
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [pitch, setPitch] = useState("4/12");
  const [material, setMaterial] = useState("Architectural Shingles");
  const [wasteFactor, setWasteFactor] = useState(15);
  const [tearOff, setTearOff] = useState(false);
  const [layers, setLayers] = useState(1);
  const [ridgeLength, setRidgeLength] = useState("");
  const [perimeterLength, setPerimeterLength] = useState("");
  const [pipeBoots, setPipeBoots] = useState(3);
  const [desiredMargin, setDesiredMargin] = useState(35);
  const [results, setResults] = useState(null);

  function calculate() {
    const l = parseFloat(length);
    const w = parseFloat(width);
    if (!l || !w) return;

    const flatArea = l * w;
    const multiplier = PITCH_MULTIPLIERS[pitch];
    const actualArea = flatArea * multiplier;
    const areaWithWaste = actualArea * (1 + wasteFactor / 100);
    const squares = areaWithWaste / 100;

    const mat = MATERIALS[material];
    const materialCost = squares * mat.perSquare;
    const laborCost = squares * mat.laborPerSquare;

    // Accessories
    const ridge = parseFloat(ridgeLength) || l;
    const perimeter = parseFloat(perimeterLength) || 2 * (l + w);

    const underlaymentRolls = Math.ceil(areaWithWaste / 1000);
    const iceWaterRolls = Math.ceil((perimeter * 3) / 200); // 3ft up from eaves
    const dripEdgePieces = Math.ceil(perimeter / 10);
    const ridgeVentPieces = Math.ceil(ridge / 4);
    const nailBoxes = Math.ceil(areaWithWaste / 500);
    const starterRolls = Math.ceil(perimeter / 120);

    const accessoryCost =
      underlaymentRolls * 65 +
      iceWaterRolls * 95 +
      dripEdgePieces * 8 +
      ridgeVentPieces * 12 +
      nailBoxes * 45 +
      pipeBoots * 15 +
      starterRolls * 28;

    const tearOffCost = tearOff ? squares * 50 * layers : 0;
    const dumpsterCost = tearOff ? (squares > 20 ? 600 : 400) : 0;

    const totalCost = materialCost + laborCost + accessoryCost + tearOffCost + dumpsterCost;
    const sellingPrice = totalCost / (1 - desiredMargin / 100);
    const profit = sellingPrice - totalCost;
    const pricePerSquare = sellingPrice / squares;

    setResults({
      flatArea: Math.round(flatArea),
      actualArea: Math.round(actualArea),
      areaWithWaste: Math.round(areaWithWaste),
      squares: squares.toFixed(1),
      materialCost: Math.round(materialCost),
      laborCost: Math.round(laborCost),
      accessoryCost: Math.round(accessoryCost),
      tearOffCost: Math.round(tearOffCost),
      dumpsterCost: Math.round(dumpsterCost),
      totalCost: Math.round(totalCost),
      sellingPrice: Math.round(sellingPrice),
      profit: Math.round(profit),
      pricePerSquare: Math.round(pricePerSquare),
      accessories: {
        underlaymentRolls,
        iceWaterRolls,
        dripEdgePieces,
        ridgeVentPieces,
        nailBoxes,
        starterRolls,
        pipeBoots,
      },
    });
  }

  useEffect(() => {
    if (length && width) calculate();
  }, [length, width, pitch, material, wasteFactor, tearOff, layers, ridgeLength, perimeterLength, pipeBoots, desiredMargin]);

  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    border: "2px solid #D5D5D0",
    borderRadius: "8px",
    fontSize: "15px",
    fontFamily: "'DM Sans', sans-serif",
    background: "#FAFAF7",
    transition: "border-color 0.2s",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle = {
    display: "block",
    fontSize: "12px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#5A5A52",
    marginBottom: "6px",
    fontFamily: "'DM Sans', sans-serif",
  };

  const selectStyle = {
    ...inputStyle,
    appearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%235A5A52' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 12px center",
    paddingRight: "36px",
  };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
        <div>
          <label style={labelStyle}>Roof Length (ft)</label>
          <input
            type="number"
            value={length}
            onChange={(e) => setLength(e.target.value)}
            placeholder="e.g. 60"
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "#2D6A4F")}
            onBlur={(e) => (e.target.style.borderColor = "#D5D5D0")}
          />
        </div>
        <div>
          <label style={labelStyle}>Roof Width (ft)</label>
          <input
            type="number"
            value={width}
            onChange={(e) => setWidth(e.target.value)}
            placeholder="e.g. 40"
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "#2D6A4F")}
            onBlur={(e) => (e.target.style.borderColor = "#D5D5D0")}
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
        <div>
          <label style={labelStyle}>Roof Pitch</label>
          <select value={pitch} onChange={(e) => setPitch(e.target.value)} style={selectStyle}>
            {Object.keys(PITCH_MULTIPLIERS).map((p) => (
              <option key={p} value={p}>{p} ({(PITCH_MULTIPLIERS[p] * 100 - 100).toFixed(1)}% added)</option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Roofing Material</label>
          <select value={material} onChange={(e) => setMaterial(e.target.value)} style={selectStyle}>
            {Object.keys(MATERIALS).map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "20px" }}>
        <div>
          <label style={labelStyle}>Waste Factor: {wasteFactor}%</label>
          <input
            type="range"
            min="5"
            max="25"
            value={wasteFactor}
            onChange={(e) => setWasteFactor(parseInt(e.target.value))}
            style={{ width: "100%", accentColor: "#2D6A4F" }}
          />
        </div>
        <div>
          <label style={labelStyle}>Desired Margin: {desiredMargin}%</label>
          <input
            type="range"
            min="10"
            max="60"
            value={desiredMargin}
            onChange={(e) => setDesiredMargin(parseInt(e.target.value))}
            style={{ width: "100%", accentColor: "#2D6A4F" }}
          />
        </div>
        <div>
          <label style={labelStyle}>Pipe Boots / Flashings</label>
          <input
            type="number"
            value={pipeBoots}
            onChange={(e) => setPipeBoots(parseInt(e.target.value) || 0)}
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "#2D6A4F")}
            onBlur={(e) => (e.target.style.borderColor = "#D5D5D0")}
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "20px" }}>
        <div>
          <label style={labelStyle}>Ridge Length (ft)</label>
          <input
            type="number"
            value={ridgeLength}
            onChange={(e) => setRidgeLength(e.target.value)}
            placeholder="Auto = length"
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "#2D6A4F")}
            onBlur={(e) => (e.target.style.borderColor = "#D5D5D0")}
          />
        </div>
        <div>
          <label style={labelStyle}>Perimeter (ft)</label>
          <input
            type="number"
            value={perimeterLength}
            onChange={(e) => setPerimeterLength(e.target.value)}
            placeholder="Auto = 2(L+W)"
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "#2D6A4F")}
            onBlur={(e) => (e.target.style.borderColor = "#D5D5D0")}
          />
        </div>
        <div style={{ display: "flex", alignItems: "end", gap: "12px", paddingBottom: "4px" }}>
          <label style={{ ...labelStyle, display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", marginBottom: 0 }}>
            <input
              type="checkbox"
              checked={tearOff}
              onChange={(e) => setTearOff(e.target.checked)}
              style={{ accentColor: "#2D6A4F", width: "18px", height: "18px" }}
            />
            <span style={{ fontSize: "14px", textTransform: "none", letterSpacing: "0" }}>Include Tear-Off</span>
          </label>
          {tearOff && (
            <select value={layers} onChange={(e) => setLayers(parseInt(e.target.value))} style={{ ...selectStyle, width: "100px" }}>
              <option value={1}>1 Layer</option>
              <option value={2}>2 Layers</option>
              <option value={3}>3 Layers</option>
            </select>
          )}
        </div>
      </div>

      {results && (
        <div style={{ marginTop: "28px" }}>
          <div
            style={{
              background: "linear-gradient(135deg, #081C15 0%, #1B4332 50%, #2D6A4F 100%)",
              borderRadius: "16px",
              padding: "28px",
              color: "white",
              marginBottom: "20px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <div style={{ fontSize: "13px", opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.1em" }}>Quote Price</div>
                <div style={{ fontSize: "42px", fontWeight: 800, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.1 }}>
                  {formatCurrency(results.sellingPrice)}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "13px", opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.1em" }}>Your Profit</div>
                <div style={{ fontSize: "28px", fontWeight: 700, color: "#95D5B2" }}>{formatCurrency(results.profit)}</div>
                <div style={{ fontSize: "14px", opacity: 0.8 }}>{desiredMargin}% margin</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
              {[
                { label: "Squares", value: results.squares },
                { label: "Actual Sq Ft", value: results.actualArea.toLocaleString() },
                { label: "Price / Square", value: formatCurrency(results.pricePerSquare) },
              ].map((item) => (
                <div key={item.label} style={{ background: "rgba(255,255,255,0.1)", borderRadius: "10px", padding: "12px", textAlign: "center" }}>
                  <div style={{ fontSize: "11px", opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.08em" }}>{item.label}</div>
                  <div style={{ fontSize: "20px", fontWeight: 700, marginTop: "2px" }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Cost Breakdown */}
          <div style={{ background: "#F5F5F0", borderRadius: "12px", padding: "24px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#2D6A4F", marginTop: 0, marginBottom: "16px" }}>
              Cost Breakdown
            </h3>
            {[
              { label: `${material}`, value: results.materialCost, sub: `${results.squares} squares × ${formatCurrency(MATERIALS[material].perSquare)}` },
              { label: "Labor", value: results.laborCost, sub: `${results.squares} squares × ${formatCurrency(MATERIALS[material].laborPerSquare)}` },
              { label: "Accessories & Supplies", value: results.accessoryCost, sub: `Underlayment, ice shield, drip edge, vents, nails, starter, boots` },
              ...(tearOff ? [{ label: `Tear-Off (${layers} layer${layers > 1 ? "s" : ""})`, value: results.tearOffCost, sub: `${results.squares} sq × $50 × ${layers} layer(s)` }] : []),
              ...(tearOff ? [{ label: "Dumpster / Disposal", value: results.dumpsterCost, sub: results.squares > 20 ? "Large job — 30yd dumpster" : "Standard 20yd dumpster" }] : []),
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 0",
                  borderBottom: "1px solid #E5E5E0",
                }}
              >
                <div>
                  <div style={{ fontSize: "15px", fontWeight: 600, color: "#1a1a1a" }}>{item.label}</div>
                  <div style={{ fontSize: "12px", color: "#888" }}>{item.sub}</div>
                </div>
                <div style={{ fontSize: "16px", fontWeight: 700, color: "#1a1a1a" }}>{formatCurrency(item.value)}</div>
              </div>
            ))}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "14px 0 0",
                marginTop: "4px",
              }}
            >
              <div style={{ fontSize: "16px", fontWeight: 800, color: "#2D6A4F" }}>Total Job Cost</div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: "#2D6A4F" }}>{formatCurrency(results.totalCost)}</div>
            </div>
          </div>

          {/* Material List */}
          <div style={{ background: "#F5F5F0", borderRadius: "12px", padding: "24px", marginTop: "16px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#2D6A4F", marginTop: 0, marginBottom: "16px" }}>
              Material Order List
            </h3>
            {[
              { item: material, qty: `${results.squares} squares`, note: `(${results.areaWithWaste.toLocaleString()} sq ft w/ ${wasteFactor}% waste)` },
              { item: "Synthetic Underlayment", qty: `${results.accessories.underlaymentRolls} rolls`, note: "" },
              { item: "Ice & Water Shield", qty: `${results.accessories.iceWaterRolls} rolls`, note: "3ft up from eaves" },
              { item: "Drip Edge (10ft)", qty: `${results.accessories.dripEdgePieces} pieces`, note: "" },
              { item: "Ridge Vent (4ft)", qty: `${results.accessories.ridgeVentPieces} pieces`, note: "" },
              { item: "Roofing Nails", qty: `${results.accessories.nailBoxes} boxes`, note: "" },
              { item: "Starter Strip", qty: `${results.accessories.starterRolls} rolls`, note: "" },
              { item: "Pipe Boots / Flashing", qty: `${results.accessories.pipeBoots} each`, note: "" },
            ].map((row, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 0",
                  borderBottom: i < 7 ? "1px solid #E5E5E0" : "none",
                }}
              >
                <div style={{ fontSize: "14px", color: "#1a1a1a" }}>
                  {row.item} {row.note && <span style={{ fontSize: "12px", color: "#999" }}>{row.note}</span>}
                </div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#1a1a1a" }}>{row.qty}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TierCard({ tier, isActive, onClick }) {
  const t = TIERS[tier];
  const isCustom = tier === "custom";
  return (
    <div
      onClick={onClick}
      style={{
        background: isActive
          ? `linear-gradient(160deg, ${t.color} 0%, ${t.color}ee 100%)`
          : "#FAFAF7",
        border: isActive ? "2px solid transparent" : "2px solid #E5E5E0",
        borderRadius: "16px",
        padding: "28px 24px",
        cursor: "pointer",
        transition: "all 0.3s ease",
        color: isActive ? "white" : "#1a1a1a",
        position: "relative",
        overflow: "hidden",
        transform: isActive ? "scale(1.02)" : "scale(1)",
      }}
    >
      {tier === "advanced" && (
        <div
          style={{
            position: "absolute",
            top: "14px",
            right: "-28px",
            background: "#D4A017",
            color: "#fff",
            fontSize: "10px",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            padding: "4px 36px",
            transform: "rotate(35deg)",
          }}
        >
          Most Popular
        </div>
      )}
      <div style={{ fontSize: "22px", fontWeight: 800, marginBottom: "4px", fontFamily: "'DM Sans', sans-serif" }}>{t.name}</div>
      <div style={{ fontSize: "13px", opacity: 0.7, marginBottom: "20px" }}>{t.tagline}</div>
      <div style={{ marginBottom: "20px" }}>
        <span style={{ fontSize: "36px", fontWeight: 800, fontFamily: "'DM Sans', sans-serif" }}>{t.price}</span>
        <span style={{ fontSize: "14px", opacity: 0.6 }}> one-time</span>
        <div style={{ fontSize: "14px", opacity: 0.7, marginTop: "2px" }}>or {t.monthly}</div>
      </div>
      <div style={{ borderTop: `1px solid ${isActive ? "rgba(255,255,255,0.2)" : "#E5E5E0"}`, paddingTop: "16px" }}>
        {t.features.map((f, i) => (
          <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "10px", fontSize: "13.5px", lineHeight: 1.4 }}>
            <span style={{ color: isActive ? t.accent : t.color, fontSize: "16px", lineHeight: 1, flexShrink: 0 }}>✓</span>
            <span style={{ opacity: isActive ? 0.95 : 0.8 }}>{f}</span>
          </div>
        ))}
        {t.notIncluded.map((f, i) => (
          <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "10px", fontSize: "13.5px", lineHeight: 1.4, opacity: 0.4 }}>
            <span style={{ fontSize: "16px", lineHeight: 1, flexShrink: 0 }}>✗</span>
            <span style={{ textDecoration: "line-through" }}>{f}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RoofingCalculatorSuite() {
  const [activeTier, setActiveTier] = useState("basic");
  const [showDemo, setShowDemo] = useState(false);
  const calcRef = useRef(null);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#F0F0E8", minHeight: "100vh", paddingTop: "52px" }}>
      <BackNav title="Roofing Calculator" color="#2D6A4F" />
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,500;0,9..40,700;0,9..40,800;1,9..40,400&family=Playfair+Display:wght@700;800;900&display=swap" rel="stylesheet" />

      {/* Hero */}
      <div
        style={{
          background: "linear-gradient(160deg, #081C15 0%, #1B4332 40%, #2D6A4F 100%)",
          padding: "48px 24px 56px",
          color: "white",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle at 20% 80%, rgba(149,213,178,0.12) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(116,198,157,0.08) 0%, transparent 50%)",
          }}
        />
        <div style={{ position: "relative", maxWidth: "800px", margin: "0 auto" }}>
          <div
            style={{
              display: "inline-block",
              background: "rgba(255,255,255,0.1)",
              borderRadius: "100px",
              padding: "6px 20px",
              fontSize: "12px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              marginBottom: "20px",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            🏠 Roofing Contractor Tools
          </div>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(32px, 5vw, 52px)",
              fontWeight: 900,
              lineHeight: 1.1,
              margin: "0 0 16px",
              letterSpacing: "-0.02em",
            }}
          >
            Stop Guessing.
            <br />
            <span style={{ color: "#95D5B2" }}>Start Profiting.</span>
          </h1>
          <p style={{ fontSize: "17px", opacity: 0.8, maxWidth: "560px", margin: "0 auto 28px", lineHeight: 1.6 }}>
            Professional roofing calculators that nail your estimates, order the right materials, and protect your margins on every job.
          </p>
          <button
            onClick={() => {
              setShowDemo(true);
              setTimeout(() => calcRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
            }}
            style={{
              background: "#95D5B2",
              color: "#081C15",
              border: "none",
              padding: "14px 36px",
              borderRadius: "100px",
              fontSize: "15px",
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              transition: "transform 0.2s",
            }}
            onMouseOver={(e) => (e.target.style.transform = "translateY(-2px)")}
            onMouseOut={(e) => (e.target.style.transform = "translateY(0)")}
          >
            Try the Calculator ↓
          </button>
        </div>
      </div>

      {/* Tier Cards */}
      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "40px 20px" }}>
        <h2 style={{ textAlign: "center", fontFamily: "'Playfair Display', serif", fontSize: "28px", fontWeight: 800, marginBottom: "8px", color: "#1a1a1a" }}>
          Choose Your Package
        </h2>
        <p style={{ textAlign: "center", fontSize: "15px", color: "#777", marginBottom: "32px" }}>
          All calculators are custom-built and branded for your business
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))", gap: "20px", marginBottom: "48px" }}>
          {Object.keys(TIERS).map((tier) => (
            <TierCard key={tier} tier={tier} isActive={activeTier === tier} onClick={() => setActiveTier(tier)} />
          ))}
        </div>

        {/* Live Demo */}
        <div ref={calcRef}>
          {(showDemo || true) && (
            <div
              style={{
                background: "white",
                borderRadius: "20px",
                padding: "36px",
                boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
                border: "1px solid #E5E5E0",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#2D6A4F", marginBottom: "4px" }}>
                    Live Demo
                  </div>
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "26px", fontWeight: 800, margin: 0, color: "#1a1a1a" }}>
                    Roofing Estimate Calculator
                  </h2>
                </div>
                <div
                  style={{
                    background: "#E8F5E9",
                    color: "#2D6A4F",
                    padding: "6px 16px",
                    borderRadius: "100px",
                    fontSize: "12px",
                    fontWeight: 700,
                  }}
                >
                  BASIC TIER
                </div>
              </div>
              <p style={{ fontSize: "14px", color: "#888", marginBottom: "28px", marginTop: "8px" }}>
                Enter your roof measurements to get an instant estimate with material quantities, costs, and suggested quote price.
              </p>
              <BasicCalculator />
            </div>
          )}
        </div>

        {/* Comparison Table */}
        <div style={{ marginTop: "48px", background: "white", borderRadius: "20px", padding: "36px", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", border: "1px solid #E5E5E0" }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "26px", fontWeight: 800, textAlign: "center", marginTop: 0, marginBottom: "28px", color: "#1a1a1a" }}>
            Feature Comparison
          </h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "12px 16px", borderBottom: "2px solid #E5E5E0", fontWeight: 700, color: "#555" }}>Feature</th>
                  {["Basic", "Advanced", "Custom"].map((t) => (
                    <th key={t} style={{ textAlign: "center", padding: "12px 16px", borderBottom: "2px solid #E5E5E0", fontWeight: 700, color: "#2D6A4F" }}>{t}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["Roof area + pitch calculator", true, true, true],
                  ["Material quantity estimator", true, true, true],
                  ["Waste factor adjustment", true, true, true],
                  ["Labor cost estimator", true, true, true],
                  ["Profit margin calculator", true, true, true],
                  ["Accessory / supplies list", true, true, true],
                  ["Tear-off & disposal costs", false, true, true],
                  ["Multi-section roof builder", false, true, true],
                  ["Editable price database", false, true, true],
                  ["PDF quote with your logo", false, true, true],
                  ["Website embed code", false, true, true],
                  ["Crew size & timeline est.", false, true, true],
                  ["Your custom branding", false, false, true],
                  ["CRM / job mgmt integration", false, false, true],
                  ["Satellite measurement API", false, false, true],
                  ["Financing calculator", false, false, true],
                  ["Lead capture + emails", false, false, true],
                  ["Multi-user / team access", false, false, true],
                  ["Dedicated support", false, false, true],
                ].map((row, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "#FAFAF7" : "white" }}>
                    <td style={{ padding: "10px 16px", borderBottom: "1px solid #F0F0E8" }}>{row[0]}</td>
                    {[row[1], row[2], row[3]].map((v, j) => (
                      <td key={j} style={{ textAlign: "center", padding: "10px 16px", borderBottom: "1px solid #F0F0E8", fontSize: "16px" }}>
                        {v ? <span style={{ color: "#2D6A4F" }}>✓</span> : <span style={{ color: "#ccc" }}>—</span>}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr style={{ fontWeight: 700, background: "#E8F5E9" }}>
                  <td style={{ padding: "14px 16px" }}>Price (one-time)</td>
                  <td style={{ textAlign: "center", padding: "14px 16px", color: "#2D6A4F" }}>$497</td>
                  <td style={{ textAlign: "center", padding: "14px 16px", color: "#1B4332" }}>$1,497</td>
                  <td style={{ textAlign: "center", padding: "14px 16px", color: "#081C15" }}>From $2,997</td>
                </tr>
                <tr style={{ fontWeight: 700 }}>
                  <td style={{ padding: "14px 16px" }}>Monthly option</td>
                  <td style={{ textAlign: "center", padding: "14px 16px" }}>$49/mo</td>
                  <td style={{ textAlign: "center", padding: "14px 16px" }}>$129/mo</td>
                  <td style={{ textAlign: "center", padding: "14px 16px" }}>Custom</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA */}
        <div
          style={{
            marginTop: "48px",
            background: "linear-gradient(160deg, #081C15, #2D6A4F)",
            borderRadius: "20px",
            padding: "40px",
            textAlign: "center",
            color: "white",
          }}
        >
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", fontWeight: 800, margin: "0 0 12px" }}>
            Ready to Close More Jobs?
          </h2>
          <p style={{ fontSize: "16px", opacity: 0.8, maxWidth: "500px", margin: "0 auto 24px", lineHeight: 1.6 }}>
            Every wrong estimate costs you money. Get a calculator built for your business and start quoting with confidence.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              style={{
                background: "#95D5B2",
                color: "#081C15",
                border: "none",
                padding: "14px 32px",
                borderRadius: "100px",
                fontSize: "15px",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Get Started — $497
            </button>
            <button
              style={{
                background: "transparent",
                color: "white",
                border: "2px solid rgba(255,255,255,0.3)",
                padding: "14px 32px",
                borderRadius: "100px",
                fontSize: "15px",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Book a Demo Call
            </button>
          </div>
        </div>

        <div style={{ textAlign: "center", padding: "32px 0 16px", fontSize: "13px", color: "#aaa" }}>
          Built with precision. Powered by real roofing math.
        </div>
      </div>
    </div>
  );
}
