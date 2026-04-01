// src/components/WalletConnect.jsx
import { useState, useEffect } from "react";

export default function WalletConnect({ onGetStarted }) {
  const [visible, setVisible] = useState(false);
  const [btnVisible, setBtnVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 200);
    setTimeout(() => setBtnVisible(true), 2200);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-[#f5f2eb]"
      style={{ fontFamily: "'Lora', Georgia, serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&family=DM+Sans:wght@300;400;500&display=swap');
        .fade-in { opacity: 0; transform: translateY(18px); transition: opacity 1.2s ease, transform 1.2s ease; }
        .fade-in.show { opacity: 1; transform: translateY(0); }
        .btn-fade { opacity: 0; transform: translateY(10px); transition: opacity 0.9s ease 0.1s, transform 0.9s ease 0.1s; }
        .btn-fade.show { opacity: 1; transform: translateY(0); }
      `}</style>

      {/* Background texture */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 80%, rgba(74,124,54,0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(161,120,60,0.07) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(74,124,54,0.04) 0%, transparent 70%)`
        }} />

      {/* Subtle leaf pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cellipse cx='30' cy='30' rx='8' ry='18' fill='%234a7c36' transform='rotate(30 30 30)'/%3E%3C/svg%3E")`,
          backgroundSize: "60px 60px"
        }} />

      {/* Logo */}
      <div className={`fade-in ${visible ? "show" : ""} mb-10`}>
        <div className="flex items-center gap-3 justify-center mb-2">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
            style={{ background: "linear-gradient(135deg, #4a7c36, #6aaa50)" }}>
            🌿
          </div>
          <span className="text-[#2d5a1e] text-xl font-semibold tracking-wide" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            GreenLedger
          </span>
        </div>
      </div>

      {/* Main heading */}
      <div className={`fade-in ${visible ? "show" : ""} text-center px-6 max-w-xl`}>
        <h1 className="text-4xl md:text-5xl font-bold text-[#1e3d12] leading-tight mb-5"
          style={{ letterSpacing: "-0.5px" }}>
          Welcome to<br />
          <span style={{ color: "#4a7c36" }}>GreenLedger</span>
        </h1>
        <p className="text-[#5a7045] text-lg md:text-xl leading-relaxed font-normal"
          style={{ fontFamily: "'DM Sans', sans-serif" }}>
          Empowering farmers to earn from<br className="hidden md:block" /> sustainable practices
        </p>
      </div>

      {/* Divider */}
      <div className={`fade-in ${visible ? "show" : ""} my-10 flex items-center gap-4`}>
        <div className="w-12 h-px bg-[#c8d8b8]" />
        <span className="text-2xl">🌾</span>
        <div className="w-12 h-px bg-[#c8d8b8]" />
      </div>

      {/* CTA Button */}
      <div className={`btn-fade ${btnVisible ? "show" : ""} flex flex-col items-center gap-4`}>
        <button
          onClick={onGetStarted}
          className="px-10 py-4 text-white text-lg font-semibold rounded-full shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl active:translate-y-0"
          style={{
            background: "linear-gradient(135deg, #4a7c36, #5a9442)",
            fontFamily: "'DM Sans', sans-serif",
            boxShadow: "0 4px 24px rgba(74,124,54,0.35)"
          }}>
          Login to Wallet
        </button>
        <p className="text-[#8a9e7a] text-sm" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          New here? Create your wallet in seconds
        </p>
      </div>

      {/* Bottom trust badges */}
      <div className={`btn-fade ${btnVisible ? "show" : ""} absolute bottom-8 flex items-center gap-6 text-xs text-[#8a9e7a]`}
        style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <span>🔒 Secure</span>
        <span>·</span>
        <span>🌱 Eco-friendly</span>
        <span>·</span>
        <span>🇮🇳 Made for Indian Farmers</span>
      </div>
    </div>
  );
}