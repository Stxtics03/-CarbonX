// src/components/SubmissionForm.jsx
import { useState } from "react";

function generateWalletId() {
  const seg = (n) =>
    Array.from({ length: n }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");
  return `0x${seg(8)}-${seg(4)}-${seg(4)}-${seg(4)}-${seg(12)}`;
}

function InputField({ label, tooltip, error, ...props }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1.5">
        <label className="text-xs font-semibold tracking-widest uppercase" style={{ color: "rgba(0,242,255,0.7)" }}>
          {label}
        </label>
        {tooltip && (
          <div className="tooltip-container">
            <span className="cursor-help text-xs rounded-full w-4 h-4 flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.06)", color: "rgba(226,232,240,0.4)", fontSize: "10px" }}>?</span>
            <span className="tooltip-text">{tooltip}</span>
          </div>
        )}
      </div>
      <input {...props}
        className={`w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all placeholder:opacity-30`}
        style={{
          background: "rgba(255,255,255,0.04)",
          border: error ? "1px solid rgba(239,68,68,0.6)" : "1px solid rgba(255,255,255,0.08)",
          color: "#e2e8f0",
          fontFamily: "'Outfit', sans-serif",
        }}
        onFocus={e => e.target.style.borderColor = "rgba(0,242,255,0.5)"}
        onBlur={e => e.target.style.borderColor = error ? "rgba(239,68,68,0.6)" : "rgba(255,255,255,0.08)"}
      />
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

export default function SubmissionForm({ onRegistered, onBack }) {
  const [tab, setTab] = useState("signup");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [metaMaskLoading, setMetaMaskLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const e = {};
    if (tab === "signup" && !form.name) e.name = "Name is required";
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email required";
    if (!form.password || form.password.length < 6) e.password = "Min 6 characters";
    return e;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      const userData = {
        username: form.name || form.email.split("@")[0],
        email: form.email,
        walletId: generateWalletId(),
        createdAt: new Date().toISOString(),
        credits: Math.floor(Math.random() * 80) + 20,
      };
      setTimeout(() => onRegistered(userData), 2200);
    }, 1600);
  };

  const handleMetaMask = () => {
    if (typeof window.ethereum === "undefined") {
      alert("MetaMask not detected. Please install MetaMask extension.");
      return;
    }
    setMetaMaskLoading(true);
    window.ethereum.request({ method: "eth_requestAccounts" }).then((accounts) => {
      setMetaMaskLoading(false);
      setSuccess(true);
      const userData = {
        username: "Farmer_" + accounts[0].slice(2, 7),
        email: "",
        walletId: accounts[0],
        createdAt: new Date().toISOString(),
        credits: Math.floor(Math.random() * 80) + 20,
        metaMask: true,
      };
      setTimeout(() => onRegistered(userData), 2200);
    }).catch(() => {
      setMetaMaskLoading(false);
      alert("MetaMask connection failed.");
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-10"
      style={{ background: "radial-gradient(ellipse at 30% 20%, rgba(0,242,255,0.06) 0%, transparent 55%), radial-gradient(ellipse at 70% 80%, rgba(57,217,138,0.05) 0%, transparent 55%), #070b12" }}>

      {/* Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: "linear-gradient(rgba(0,242,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,242,255,1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

      {!success ? (
        <div className="w-full max-w-md relative z-10">
          <button onClick={onBack} className="flex items-center gap-2 text-sm mb-8 transition-colors"
            style={{ color: "rgba(0,242,255,0.6)" }}
            onMouseEnter={e => e.target.style.color = "#00f2ff"}
            onMouseLeave={e => e.target.style.color = "rgba(0,242,255,0.6)"}>
            ← Back to Home
          </button>

          <div className="rounded-3xl p-8" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(20px)" }}>

            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 relative"
                style={{ background: "linear-gradient(135deg, rgba(0,242,255,0.12), rgba(57,217,138,0.12))", border: "1px solid rgba(0,242,255,0.25)" }}>
                🌱
                <div className="absolute inset-0 rounded-2xl animate-pulse-glow" />
              </div>
              <h1 className="text-2xl font-black mb-1.5" style={{ fontFamily: "'Outfit', sans-serif" }}>
                {tab === "signup" ? "Create Wallet" : "Welcome Back"}
              </h1>
              <p className="text-sm" style={{ color: "rgba(226,232,240,0.4)" }}>
                {tab === "signup" ? "Join 12,400+ farmers earning carbon credits" : "Sign in to your GreenLedger account"}
              </p>
            </div>

            {/* Tab toggle */}
            <div className="flex rounded-xl p-1 mb-6" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
              {["signup", "login"].map((t) => (
                <button key={t} onClick={() => { setTab(t); setErrors({}); }}
                  className="flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all"
                  style={tab === t
                    ? { background: "linear-gradient(135deg, rgba(0,242,255,0.15), rgba(57,217,138,0.1))", color: "#00f2ff", border: "1px solid rgba(0,242,255,0.25)" }
                    : { color: "rgba(226,232,240,0.35)" }}>
                  {t === "signup" ? "New Farmer" : "Sign In"}
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {tab === "signup" && (
                <InputField
                  label="Full Name"
                  tooltip="Your name as it will appear on carbon credit certificates"
                  value={form.name}
                  placeholder="e.g. Ramesh Kumar"
                  error={errors.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              )}
              <InputField
                label="Email Address"
                tooltip="Used for login and credit notifications"
                type="email"
                value={form.email}
                placeholder="you@example.com"
                error={errors.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <InputField
                label="Password"
                tooltip="Minimum 6 characters. We never store passwords in plain text."
                type="password"
                value={form.password}
                placeholder="Min 6 characters"
                error={errors.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />

              <button type="submit" disabled={loading}
                className="w-full py-4 rounded-xl font-bold text-sm tracking-wide mt-2 transition-all relative overflow-hidden group disabled:opacity-50"
                style={{
                  background: "linear-gradient(135deg, #00c6d7, #00f2ff)",
                  color: "#070b12",
                  boxShadow: "0 0 24px rgba(0,242,255,0.3)"
                }}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 rounded-full" style={{ borderColor: "rgba(7,11,18,0.3)", borderTopColor: "#070b12", animation: "spin 0.8s linear infinite" }} />
                    Generating wallet...
                  </span>
                ) : tab === "signup" ? "Create Wallet & Launch →" : "Sign In →"}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
              <span className="text-xs font-mono-code" style={{ color: "rgba(226,232,240,0.2)" }}>or</span>
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
            </div>

            {/* MetaMask */}
            <button onClick={handleMetaMask} disabled={metaMaskLoading}
              className="w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-3 transition-all disabled:opacity-50"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#e2e8f0" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(0,242,255,0.3)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}>
              {metaMaskLoading ? (
                <div className="w-4 h-4 border-2 border-t-current rounded-full" style={{ animation: "spin 0.8s linear infinite" }} />
              ) : (
                <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" className="w-5 h-5" />
              )}
              Connect with MetaMask
            </button>

            <p className="text-center text-xs mt-6 font-mono-code" style={{ color: "rgba(226,232,240,0.2)" }}>
              🔒 AES-256 encrypted · Non-custodial
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center relative z-10">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 animate-pulse-glow"
            style={{ background: "linear-gradient(135deg, rgba(0,242,255,0.15), rgba(57,217,138,0.15))", border: "1px solid rgba(0,242,255,0.4)" }}>
            ✅
          </div>
          <h2 className="text-2xl font-black mb-2">Wallet Initialized!</h2>
          <p className="text-sm mb-6" style={{ color: "rgba(226,232,240,0.4)" }}>Taking you to your command center...</p>
          <div className="w-48 h-1 rounded-full mx-auto overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div className="h-full rounded-full" style={{ background: "linear-gradient(90deg, #00f2ff, #39d98a)", animation: "fillBar 2.2s linear forwards" }} />
          </div>
        </div>
      )}
    </div>
  );
}