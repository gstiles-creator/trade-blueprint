import { useNavigate } from "react-router-dom";

export default function BackNav({ title, color }) {
  const navigate = useNavigate();
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: "rgba(18,18,12,0.95)", backdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 24px",
    }}>
      <div style={{ maxWidth: "720px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", height: "52px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div onClick={() => navigate("/")} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", fontWeight: 600, color: "#8a8a7a", fontFamily: "'Outfit',sans-serif" }}>
            <span style={{ fontSize: "16px" }}>←</span> Trade Blueprint
          </div>
          <span style={{ color: "#3a3a32" }}>|</span>
          <span style={{ fontSize: "13px", fontWeight: 700, color: color || "#D4A017", fontFamily: "'Outfit',sans-serif" }}>{title}</span>
        </div>
        <button onClick={() => navigate("/")} style={{
          background: "rgba(212,160,23,0.15)", border: "1px solid rgba(212,160,23,0.3)",
          color: "#D4A017", padding: "6px 16px", borderRadius: "8px",
          fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit',sans-serif",
        }}>All Calculators</button>
      </div>
    </div>
  );
}
