// src/components/WalletConnect.jsx
import { useState, useEffect } from "react";

const STATS = [
  { value: "12,400+", label: "Farmers" },
  { value: "₹2.8Cr", label: "Distributed" },
  { value: "48K", label: "Credits Minted" },
];

export default function WalletConnect({ onGetStarted }) {
  const [loaded, setLoaded] = useState(false);
  const [btnReady, setBtnReady] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setLoaded(true), 100);
    const t2 = setTimeout(() => setBtnReady(true), 900);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 60% 0%, rgba(0,242,255,0.07) 0%, transparent 60%), radial-gradient(ellipse at 20% 100%, rgba(57,217,138,0.06) 0%, transparent 55%), #070b12" }}>

      {/* Grid overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{ backgroundImage: "linear-gradient(rgba(0,242,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,242,255,1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

      {/* Scan line */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute left-0 right-0 h-px opacity-10"
          style={{ background: "linear-gradient(90deg, transparent, #00f2ff, transparent)", animation: "scanLine 8s linear infinite" }} />
      </div>

      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/6 w-72 h-72 rounded-full pointer-events-none opacity-[0.06]"
        style={{ background: "radial-gradient(circle, #00f2ff, transparent)", filter: "blur(40px)" }} />
      <div className="absolute bottom-1/4 right-1/6 w-96 h-96 rounded-full pointer-events-none opacity-[0.05]"
        style={{ background: "radial-gradient(circle, #39d98a, transparent)", filter: "blur(60px)" }} />

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-2xl">

        {/* Logo */}
        <div className={`mb-10 transition-all duration-700 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <div className="flex items-center gap-3 justify-center mb-1">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center relative"
              style={{ background: "linear-gradient(135deg, rgba(0,242,255,0.15), rgba(57,217,138,0.15))", border: "1px solid rgba(0,242,255,0.3)" }}>
              <span className="text-2xl">🌿</span>
              <div className="absolute inset-0 rounded-2xl animate-pulse-glow" />
            </div>
            <span className="text-2xl font-bold tracking-wider"
              style={{ fontFamily: "'Outfit', sans-serif", background: "linear-gradient(135deg, #00f2ff, #39d98a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              CarbonX
            </span>
          </div>
          <p className="text-xs font-mono-code tracking-widest" style={{ color: "rgba(0,242,255,0.5)" }}>
            CARBONX CREDIT PLATFORM v2.0
          </p>
        </div>

        {/* Headline */}
        <div className={`transition-all duration-700 delay-200 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <h1 className="text-5xl md:text-6xl font-black leading-none mb-5"
            style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: "-1px" }}>
            <span style={{ color: "#e2e8f0" }}>Your farm,</span><br />
            <span style={{ background: "linear-gradient(135deg, #00f2ff, #39d98a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              your credits.
            </span>
          </h1>
          <p className="text-base md:text-lg leading-relaxed max-w-md mx-auto" style={{ color: "rgba(226,232,240,0.55)" }}>
            Empowering Indian farmers to earn verifiable carbon credits through sustainable practices — secured on the blockchain.
          </p>
        </div>

        {/* Stats row */}
        <div className={`flex items-center gap-8 my-10 transition-all duration-700 delay-300 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          {STATS.map((s, i) => (
            <div key={i} className="text-center">
              <p className="text-2xl font-black" style={{ color: "#00f2ff" }}>{s.value}</p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(226,232,240,0.4)" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className={`transition-all duration-700 delay-500 flex flex-col items-center gap-4 ${btnReady ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <button onClick={onGetStarted}
            className="relative px-10 py-4 rounded-full text-base font-bold tracking-wide overflow-hidden group"
            style={{
              background: "linear-gradient(135deg, #00c6d7, #00f2ff 50%, #39d98a)",
              color: "#070b12",
              boxShadow: "0 0 32px rgba(0,242,255,0.35), 0 4px 24px rgba(0,0,0,0.4)"
            }}>
            <span className="relative z-10 flex items-center gap-2">
              <span>⬡</span> Connect Wallet
            </span>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: "linear-gradient(135deg, #00f2ff, #39d98a)" }} />
          </button>
          <p style={{ color: "rgba(226,232,240,0.3)", fontSize: "12px" }}>
            🔒 Encrypted · Non-custodial · Made for Indian Farmers
          </p>
        </div>
      </div>

      {/* Bottom trust bar */}
      <div className={`absolute bottom-0 left-0 right-0 border-t transition-all duration-700 delay-700 ${btnReady ? "opacity-100" : "opacity-0"}`}
        style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)" }}>
        <div className="max-w-4xl mx-auto px-6 py-4 flex flex-wrap items-center justify-center gap-8">
          {["Polygon Network", "AES-256 Encrypted", "IPFS Storage", "ISO 14064 Compliant"].map((t, i) => (
            <span key={i} className="font-mono-code text-xs flex items-center gap-1.5" style={{ color: "rgba(226,232,240,0.25)" }}>
              <span style={{ color: "rgba(0,242,255,0.4)" }}>◆</span> {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}