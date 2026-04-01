// src/components/SubmissionForm.jsx
import { useState } from "react";

function generateWalletId() {
  const seg = (n) =>
    Array.from({ length: n }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");
  return `0x${seg(8)}-${seg(4)}-${seg(4)}-${seg(4)}-${seg(12)}`;
}

export default function SubmissionForm({ onRegistered, onBack }) {
  const [tab, setTab] = useState("signup"); // "signup" | "login"
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
        credits: 0,
      };
      setTimeout(() => onRegistered(userData), 2000);
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
        credits: 0,
        metaMask: true,
      };
      setTimeout(() => onRegistered(userData), 2000);
    }).catch(() => {
      setMetaMaskLoading(false);
      alert("MetaMask connection failed.");
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f2eb] px-4 py-10"
      style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Lora:wght@600;700&family=DM+Sans:wght@300;400;500&display=swap');`}</style>

      {!success ? (
        <div className="w-full max-w-md">
          {/* Back */}
          <button onClick={onBack} className="flex items-center gap-2 text-[#5a7045] hover:text-[#2d5a1e] text-sm mb-8 transition-colors">
            ← Back to Home
          </button>

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-[0_4px_40px_rgba(74,124,54,0.12)] p-8 border border-[#e8f0e0]">

            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
                style={{ background: "linear-gradient(135deg, #eaf4e0, #d4ecbf)" }}>
                🌱
              </div>
              <h1 className="text-2xl font-bold text-[#1e3d12] mb-1" style={{ fontFamily: "'Lora', serif" }}>
                {tab === "signup" ? "Create Your Wallet" : "Welcome Back"}
              </h1>
              <p className="text-[#7a9060] text-sm">
                {tab === "signup" ? "Join thousands of farmers earning carbon credits" : "Sign in to your GreenLedger account"}
              </p>
            </div>

            {/* Tab toggle */}
            <div className="flex bg-[#f5f2eb] rounded-xl p-1 mb-6">
              {["signup", "login"].map((t) => (
                <button key={t} onClick={() => { setTab(t); setErrors({}); }}
                  className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${tab === t ? "bg-white text-[#2d5a1e] shadow-sm" : "text-[#7a9060]"}`}>
                  {t === "signup" ? "New Farmer" : "Sign In"}
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {tab === "signup" && (
                <div>
                  <label className="block text-xs font-medium text-[#5a7045] mb-1.5 tracking-wide uppercase">Full Name</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Ramesh Kumar"
                    className={`w-full px-4 py-3.5 rounded-xl text-[#1e3d12] text-sm bg-[#f5f2eb] border outline-none transition-all placeholder-[#b0be98]
                      ${errors.name ? "border-red-400" : "border-transparent focus:border-[#4a7c36] focus:bg-white focus:shadow-[0_0_0_3px_rgba(74,124,54,0.1)]"}`}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-[#5a7045] mb-1.5 tracking-wide uppercase">Email Address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className={`w-full px-4 py-3.5 rounded-xl text-[#1e3d12] text-sm bg-[#f5f2eb] border outline-none transition-all placeholder-[#b0be98]
                    ${errors.email ? "border-red-400" : "border-transparent focus:border-[#4a7c36] focus:bg-white focus:shadow-[0_0_0_3px_rgba(74,124,54,0.1)]"}`}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-[#5a7045] mb-1.5 tracking-wide uppercase">Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Min 6 characters"
                  className={`w-full px-4 py-3.5 rounded-xl text-[#1e3d12] text-sm bg-[#f5f2eb] border outline-none transition-all placeholder-[#b0be98]
                    ${errors.password ? "border-red-400" : "border-transparent focus:border-[#4a7c36] focus:bg-white focus:shadow-[0_0_0_3px_rgba(74,124,54,0.1)]"}`}
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-4 text-white text-base font-semibold rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                style={{ background: "linear-gradient(135deg, #4a7c36, #5a9442)", boxShadow: "0 4px 20px rgba(74,124,54,0.3)" }}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating wallet...
                  </span>
                ) : tab === "signup" ? "Create Wallet & Login" : "Sign In"}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-[#e8f0e0]" />
              <span className="text-[#b0be98] text-xs">or</span>
              <div className="flex-1 h-px bg-[#e8f0e0]" />
            </div>

            {/* MetaMask */}
            <button onClick={handleMetaMask} disabled={metaMaskLoading}
              className="w-full py-3.5 rounded-xl border-2 border-[#e8f0e0] bg-white text-[#1e3d12] text-sm font-medium flex items-center justify-center gap-3 hover:border-[#4a7c36] hover:bg-[#f5f2eb] transition-all disabled:opacity-60">
              {metaMaskLoading ? (
                <div className="w-4 h-4 border-2 border-[#4a7c36]/30 border-t-[#4a7c36] rounded-full animate-spin" />
              ) : (
                <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" className="w-5 h-5" />
              )}
              Connect with MetaMask
            </button>

            <p className="text-center text-[#8a9e7a] text-xs mt-6">
              🔒 Your data is secure and encrypted
            </p>
          </div>
        </div>
      ) : (
        /* Success */
        <div className="text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-6"
            style={{ background: "linear-gradient(135deg, #eaf4e0, #d4ecbf)" }}>
            ✅
          </div>
          <h2 className="text-2xl font-bold text-[#2d5a1e] mb-2" style={{ fontFamily: "'Lora', serif" }}>Wallet Ready!</h2>
          <p className="text-[#7a9060] mb-6">Taking you to your dashboard...</p>
          <div className="w-48 h-1.5 bg-[#e8f0e0] rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-[#4a7c36] rounded-full animate-[fillBar_2s_linear_forwards]" />
          </div>
          <style>{`@keyframes fillBar{from{width:0}to{width:100%}}`}</style>
        </div>
      )}
    </div>
  );
}