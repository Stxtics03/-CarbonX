// src/components/SubmissionForm.jsx
import { useState, useEffect } from "react";

function generateWalletId() {
  const seg = (n) =>
    Array.from({ length: n }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");
  return `0x${seg(8)}-${seg(4)}-${seg(4)}-${seg(4)}-${seg(12)}`;
}

function getStrength(pwd) {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  const levels = [
    { pct: 0, color: "#ef4444", label: "" },
    { pct: 20, color: "#ef4444", label: "Too weak" },
    { pct: 40, color: "#f97316", label: "Weak" },
    { pct: 60, color: "#eab308", label: "Fair" },
    { pct: 80, color: "#84cc16", label: "Good" },
    { pct: 100, color: "#22c55e", label: "Strong 🔥" },
  ];
  return levels[Math.min(score, 5)];
}

export default function SubmissionForm({ onRegistered, onBack }) {
  const [form, setForm] = useState({ username: "", mobile: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const strength = getStrength(form.password);

  const validate = (f) => {
    const e = {};
    if (!f.username) e.username = "Username is required.";
    else if (f.username.length < 3) e.username = "At least 3 characters.";
    else if (!/^[a-zA-Z0-9_]+$/.test(f.username)) e.username = "Letters, numbers, underscore only.";
    if (!f.mobile) e.mobile = "Mobile number is required.";
    else if (f.mobile.replace(/\D/g, "").length < 10) e.mobile = "Enter a valid mobile number.";
    if (!f.password) e.password = "Password is required.";
    else if (f.password.length < 8) e.password = "Minimum 8 characters.";
    if (!f.confirm) e.confirm = "Please confirm your password.";
    else if (f.confirm !== f.password) e.confirm = "Passwords do not match.";
    return e;
  };

  useEffect(() => {
    if (form.username || form.mobile || form.password) setActiveStep(1);
    else setActiveStep(0);
  }, [form]);

  const handleChange = (key, val) => {
    const newForm = { ...form, [key]: val };
    setForm(newForm);
    if (touched[key]) {
      const e = validate(newForm);
      setErrors((prev) => ({ ...prev, [key]: e[key] }));
    }
  };

  const handleBlur = (key) => {
    setTouched((prev) => ({ ...prev, [key]: true }));
    const e = validate(form);
    setErrors((prev) => ({ ...prev, [key]: e[key] }));
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    const allTouched = { username: true, mobile: true, password: true, confirm: true };
    setTouched(allTouched);
    const e = validate(form);
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    if (!terms) { alert("Please accept the Terms of Service."); return; }

    setActiveStep(2);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      const userData = {
        username: form.username,
        mobile: form.mobile,
        walletId: generateWalletId(),
        createdAt: new Date().toISOString(),
      };
      setTimeout(() => onRegistered(userData), 2500);
    }, 1800);
  };

  const fieldStatus = (key) => {
    if (!touched[key] || !form[key]) return "neutral";
    return errors[key] ? "invalid" : "valid";
  };

  const inputClass = (key) => {
    const s = fieldStatus(key);
    const base = "w-full bg-white/4 rounded-md px-11 py-3.5 text-white text-sm placeholder-gray-600 outline-none transition-all";
    if (s === "valid") return `${base} border border-green-500`;
    if (s === "invalid") return `${base} border border-red-500`;
    return `${base} border border-white/6 focus:border-amber-400 focus:bg-amber-400/4 focus:shadow-[0_0_0_3px_rgba(245,166,35,0.15)]`;
  };

  const steps = ["Create Account", "Generate Wallet", "Access Dashboard"];

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'DM Sans','Space Mono',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;700&display=swap');`}</style>

      {/* LEFT PANEL */}
      <aside className="hidden md:flex w-[380px] bg-[#0c0c18] border-r border-white/5 flex-col p-10 relative overflow-hidden shrink-0">
        <div className="absolute bottom-[-80px] left-[-80px] w-72 h-72 rounded-full bg-amber-400/6 blur-3xl pointer-events-none" />

        <button onClick={onBack} className="text-gray-600 hover:text-amber-400 text-sm tracking-wider transition-colors mb-10 text-left">← Back to Home</button>

        <div className="flex items-center gap-2 text-amber-400 font-bold text-base tracking-widest mb-14" style={{ fontFamily: "'Space Mono',monospace" }}>
          <span className="text-xl">⬡</span> MetaMesh
        </div>

        {/* Ring animation */}
        <div className="relative w-44 h-44 mx-auto mb-12">
          {[180, 130, 80].map((sz, i) => (
            <div key={i} className={`absolute rounded-full border border-amber-400/20 ring${i + 1}`}
              style={{ width: sz, height: sz, top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />
          ))}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl" style={{ animation: "floatOrb 2s ease-in-out infinite" }}>🔐</div>
        </div>

        <blockquote className="border-l-2 border-amber-400 pl-4 text-gray-500 text-xs leading-loose mb-12" style={{ fontFamily: "'Space Mono',monospace" }}>
          "Your identity. Your rules. Your vault."
        </blockquote>

        <div className="space-y-0">
          {steps.map((s, i) => (
            <div key={i}>
              <div className={`flex items-center gap-3 py-1.5 text-sm transition-colors
                ${i < activeStep ? "text-green-400" : i === activeStep ? "text-white" : "text-gray-600"}`}>
                <div className={`w-2.5 h-2.5 rounded-full border-2 shrink-0 transition-all
                  ${i < activeStep ? "bg-green-400 border-green-400" : i === activeStep ? "bg-amber-400 border-amber-400 shadow-[0_0_10px_rgba(245,166,35,0.5)]" : "border-gray-700"}`} />
                {s}
              </div>
              {i < steps.length - 1 && <div className="w-px h-5 bg-white/5 ml-1" />}
            </div>
          ))}
        </div>
      </aside>

      {/* RIGHT PANEL */}
      <main className="flex-1 flex items-center justify-center p-8 bg-[#080810]">

        {!success ? (
          <div className="w-full max-w-lg">
            {/* Mobile back */}
            <button onClick={onBack} className="md:hidden text-gray-600 hover:text-amber-400 text-sm mb-6 block">← Back</button>

            <div className="mb-10">
              <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Space Mono',monospace" }}>Initialize Wallet</h1>
              <p className="text-gray-500 text-sm leading-relaxed">Set up your credentials to generate your unique wallet address.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* USERNAME */}
              <div>
                <label className="block text-xs font-medium tracking-widest text-gray-500 uppercase mb-2">Username</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base">👤</span>
                  <input className={inputClass("username")} placeholder="e.g. crypto_legend"
                    value={form.username} onChange={(e) => handleChange("username", e.target.value)}
                    onBlur={() => handleBlur("username")} />
                  {fieldStatus("username") === "valid" && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">✅</span>}
                  {fieldStatus("username") === "invalid" && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">❌</span>}
                </div>
                {errors.username && touched.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
              </div>

              {/* MOBILE */}
              <div>
                <label className="block text-xs font-medium tracking-widest text-gray-500 uppercase mb-2">Mobile Number</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base">📱</span>
                  <input className={inputClass("mobile")} placeholder="+91 98765 43210" type="tel"
                    value={form.mobile} onChange={(e) => handleChange("mobile", e.target.value)}
                    onBlur={() => handleBlur("mobile")} />
                  {fieldStatus("mobile") === "valid" && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">✅</span>}
                  {fieldStatus("mobile") === "invalid" && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">❌</span>}
                </div>
                {errors.mobile && touched.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
              </div>

              {/* PASSWORD */}
              <div>
                <label className="block text-xs font-medium tracking-widest text-gray-500 uppercase mb-2">Password</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base">🔒</span>
                  <input className={inputClass("password")} placeholder="Min 8 characters"
                    type={showPass ? "text" : "password"}
                    value={form.password} onChange={(e) => handleChange("password", e.target.value)}
                    onBlur={() => handleBlur("password")} style={{ paddingRight: "5rem" }} />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-sm transition-colors">
                    {showPass ? "🙈" : "👁"}
                  </button>
                  {fieldStatus("password") === "valid" && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">✅</span>}
                </div>
                {form.password && (
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: strength.pct + "%", background: strength.color }} />
                    </div>
                    <span className="text-xs min-w-[60px] text-right" style={{ color: strength.color }}>{strength.label}</span>
                  </div>
                )}
                {errors.password && touched.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              {/* CONFIRM */}
              <div>
                <label className="block text-xs font-medium tracking-widest text-gray-500 uppercase mb-2">Confirm Password</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base">🔐</span>
                  <input className={inputClass("confirm")} placeholder="Re-enter password"
                    type="password" value={form.confirm}
                    onChange={(e) => handleChange("confirm", e.target.value)}
                    onBlur={() => handleBlur("confirm")} />
                  {fieldStatus("confirm") === "valid" && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">✅</span>}
                  {fieldStatus("confirm") === "invalid" && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">❌</span>}
                </div>
                {errors.confirm && touched.confirm && <p className="text-red-500 text-xs mt-1">{errors.confirm}</p>}
              </div>

              {/* TERMS */}
              <label className="flex items-start gap-3 cursor-pointer">
                <div className={`w-5 h-5 rounded border-2 shrink-0 mt-0.5 flex items-center justify-center transition-all ${terms ? "bg-amber-400 border-amber-400" : "border-white/10 bg-white/4"}`}
                  onClick={() => setTerms(!terms)}>
                  {terms && <span className="text-[#080810] text-xs font-bold">✓</span>}
                </div>
                <input type="checkbox" className="hidden" checked={terms} onChange={() => setTerms(!terms)} />
                <span className="text-gray-500 text-sm leading-relaxed">
                  I agree to the <a href="#" className="text-amber-400 hover:underline">Terms of Service</a> and <a href="#" className="text-amber-400 hover:underline">Privacy Policy</a>
                </span>
              </label>

              {/* SUBMIT */}
              <button type="submit" disabled={loading}
                className={`w-full py-4 font-bold tracking-widest text-sm rounded transition-all flex items-center justify-center gap-3
                ${loading ? "opacity-60 cursor-not-allowed" : "hover:bg-amber-300 hover:shadow-[0_0_25px_rgba(245,166,35,0.4)] hover:-translate-y-0.5"}
                bg-amber-400 text-[#080810]`}
                style={{ fontFamily: "'Space Mono',monospace" }}>
                {loading ? (
                  <div className="w-5 h-5 border-2 border-[#080810]/30 border-t-[#080810] rounded-full animate-spin" />
                ) : "Create Wallet"}
              </button>
            </form>

            <p className="text-center text-gray-600 text-sm mt-6">
              Already have a wallet? <button className="text-amber-400 hover:underline">Sign in</button>
            </p>
          </div>
        ) : (
          /* SUCCESS STATE */
          <div className="text-center">
            <div className="text-7xl mb-6">✅</div>
            <h2 className="text-3xl font-bold text-green-400 mb-2" style={{ fontFamily: "'Space Mono',monospace" }}>Wallet Created!</h2>
            <p className="text-gray-500 mb-8">Redirecting to your dashboard...</p>
            <div className="w-48 h-1 bg-white/5 rounded-full mx-auto overflow-hidden">
              <div className="h-full bg-amber-400 rounded-full animate-[fillBar_2.5s_linear_forwards]" />
            </div>
            <style>{`@keyframes fillBar{from{width:0}to{width:100%}}`}</style>
          </div>
        )}
      </main>
    </div>
  );
}