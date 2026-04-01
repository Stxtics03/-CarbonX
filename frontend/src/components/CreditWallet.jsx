// src/components/AdminDashboard.jsx
import { useState, useRef } from "react";
import { useWallet } from "../hooks/useWallet";

const NAV_ITEMS = ["Home", "My Farm Data", "Carbon Credits", "Upload Proof", "Rewards", "Profile"];
const LANGUAGES = ["English", "हिंदी", "ಕನ್ನಡ", "తెలుగు", "தமிழ்"];

export default function AdminDashboard({ user, onLogout }) {
  const { walletId, regenerateWallet, copyWalletId, mediaFiles, uploading, uploadFiles, deleteMedia, stats } = useWallet(user);
  const [activeNav, setActiveNav] = useState("Home");
  const [toast, setToast] = useState(null);
  const [lang, setLang] = useState("English");
  const [showLang, setShowLang] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const fileRef = useRef();

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  const handleCopy = () => { copyWalletId(); showToast("Wallet address copied! 📋"); };
  const shortWallet = walletId ? walletId.slice(0, 14) + "..." + walletId.slice(-6) : "—";
  const credits = user?.credits ?? Math.floor(Math.random() * 120) + 20;
  const earnings = (credits * 42).toLocaleString("en-IN");

  const mockActivity = [
    { id: 1, name: "Rice Field — North Block", status: "approved", date: "28 Mar 2026", icon: "🌾" },
    { id: 2, name: "Organic Compost Pit", status: "pending", date: "30 Mar 2026", icon: "♻️" },
    { id: 3, name: "Drip Irrigation Setup", status: "pending", date: "31 Mar 2026", icon: "💧" },
    { id: 4, name: "Tree Plantation Row A", status: "approved", date: "15 Mar 2026", icon: "🌳" },
    { id: 5, name: "Solar Pump System", status: "rejected", date: "10 Mar 2026", icon: "☀️" },
  ];

  const statusStyle = { approved: "bg-green-100 text-green-700", pending: "bg-amber-100 text-amber-700", rejected: "bg-red-100 text-red-600" };
  const statusLabel = { approved: "✓ Approved", pending: "⏳ Pending", rejected: "✗ Rejected" };

  return (
    <div className="min-h-screen bg-[#f0ede4]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Lora:wght@600;700&family=DM+Sans:wght@300;400;500&display=swap');`}</style>

      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-[#2d5a1e] text-white text-sm px-5 py-3 rounded-xl shadow-lg"
          style={{ animation: "fadeIn 0.3s ease" }}>
          {toast}
        </div>
      )}
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* NAVBAR */}
      <nav className="sticky top-0 z-40 shadow-sm"
        style={{ background: "linear-gradient(135deg, #1e3d12 0%, #2d5a1e 60%, #3a6e28 100%)" }}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
              style={{ background: "rgba(255,255,255,0.15)" }}>🌿</div>
            <span className="text-white font-bold text-lg tracking-wide" style={{ fontFamily: "'Lora', serif" }}>
              GreenLedger
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <button key={item} onClick={() => setActiveNav(item)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all
                  ${activeNav === item ? "bg-white/20 text-white" : "text-white/70 hover:text-white hover:bg-white/10"}`}>
                {item}
              </button>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Language */}
            <div className="relative hidden md:block">
              <button onClick={() => setShowLang(!showLang)}
                className="flex items-center gap-1.5 text-white/80 hover:text-white text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all">
                🌐 {lang}
              </button>
              {showLang && (
                <div className="absolute right-0 top-10 bg-white rounded-xl shadow-xl border border-[#e8f0e0] py-1.5 min-w-[130px] z-50">
                  {LANGUAGES.map((l) => (
                    <button key={l} onClick={() => { setLang(l); setShowLang(false); }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-[#f5f2eb] transition-colors
                        ${lang === l ? "text-[#2d5a1e] font-medium" : "text-[#3d5229]"}`}>
                      {l}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Verify button */}
            <button className="hidden md:flex items-center gap-1.5 bg-white text-[#2d5a1e] text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#eaf4e0] transition-all shadow-sm">
              ✓ Verify Carbon Credits
            </button>

            {/* Mobile menu */}
            <button className="lg:hidden text-white p-2" onClick={() => setMobileMenu(!mobileMenu)}>
              {mobileMenu ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenu && (
          <div className="lg:hidden border-t border-white/10 px-4 py-3 space-y-1"
            style={{ background: "rgba(30,61,18,0.98)" }}>
            {NAV_ITEMS.map((item) => (
              <button key={item} onClick={() => { setActiveNav(item); setMobileMenu(false); }}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all
                  ${activeNav === item ? "bg-white/20 text-white" : "text-white/70 hover:text-white hover:bg-white/10"}`}>
                {item}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-6">

        {/* Welcome banner */}
        <div className="rounded-2xl p-6 text-white relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #2d5a1e, #4a7c36)" }}>
          <div className="absolute right-4 top-4 text-5xl opacity-20 pointer-events-none">🌾</div>
          <div className="relative z-10">
            <p className="text-white/70 text-sm mb-1">Good morning,</p>
            <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: "'Lora', serif" }}>
              {user?.username || "Farmer"} 👋
            </h2>
            <p className="text-white/70 text-sm">Your farm is contributing to a greener planet</p>
          </div>
        </div>

        {/* Overview Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          {/* Wallet Card */}
          <div className="bg-white rounded-2xl p-5 border border-[#e8f0e0] shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-[#7a9060] uppercase tracking-wide">Wallet Address</span>
              <span className="text-lg">💳</span>
            </div>
            <p className="text-[#1e3d12] font-mono text-sm font-medium mb-3 break-all">{shortWallet}</p>
            <div className="flex gap-2">
              <button onClick={handleCopy}
                className="flex-1 text-xs py-2 rounded-lg border border-[#e8f0e0] text-[#4a7c36] hover:bg-[#f5f2eb] transition-all font-medium">
                📋 Copy
              </button>
              <button onClick={() => { regenerateWallet(); showToast("New wallet ID generated 🔄"); }}
                className="flex-1 text-xs py-2 rounded-lg border border-[#e8f0e0] text-[#4a7c36] hover:bg-[#f5f2eb] transition-all font-medium">
                🔄 New
              </button>
            </div>
          </div>

          {/* Credits Card */}
          <div className="bg-white rounded-2xl p-5 border border-[#e8f0e0] shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-[#7a9060] uppercase tracking-wide">Carbon Credits</span>
              <span className="text-lg">🌿</span>
            </div>
            <p className="text-3xl font-bold text-[#2d5a1e] mb-1" style={{ fontFamily: "'Lora', serif" }}>
              {credits}
            </p>
            <p className="text-[#8a9e7a] text-xs">Credits earned this season</p>
          </div>

          {/* Earnings Card */}
          <div className="bg-white rounded-2xl p-5 border border-[#e8f0e0] shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-[#7a9060] uppercase tracking-wide">Estimated Earnings</span>
              <span className="text-lg">💰</span>
            </div>
            <p className="text-3xl font-bold text-[#2d5a1e] mb-1" style={{ fontFamily: "'Lora', serif" }}>
              ₹{earnings}
            </p>
            <p className="text-[#8a9e7a] text-xs">Based on current credit rate</p>
          </div>
        </div>

        {/* Upload Section + Activity — 2-col */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Upload Section */}
          <div className="bg-white rounded-2xl p-6 border border-[#e8f0e0] shadow-sm">
            <h3 className="font-bold text-[#1e3d12] text-lg mb-1" style={{ fontFamily: "'Lora', serif" }}>
              📸 Upload Farm Photos
            </h3>
            <p className="text-[#7a9060] text-sm mb-5">Upload proof to verify your carbon credits</p>

            {/* Drop zone */}
            <div
              onClick={() => fileRef.current.click()}
              className="border-2 border-dashed border-[#c8d8b8] rounded-2xl p-8 text-center cursor-pointer hover:border-[#4a7c36] hover:bg-[#f5f2eb] transition-all group">
              <div className="text-4xl mb-3">🌾</div>
              <p className="text-[#2d5a1e] font-medium text-base mb-1 group-hover:text-[#1e3d12]">
                Tap to upload photos
              </p>
              <p className="text-[#8a9e7a] text-xs">Crops, trees, land practices — JPG, PNG, MP4 up to 50MB</p>
              <input ref={fileRef} type="file" multiple accept="image/*,video/*" className="hidden"
                onChange={(e) => { uploadFiles(e.target.files); e.target.value = ""; }} />
            </div>

            {/* Upload queue */}
            {uploading.length > 0 && (
              <div className="mt-4 space-y-2">
                {uploading.map((u) => (
                  <div key={u.id} className="bg-[#f5f2eb] rounded-xl p-3">
                    <div className="flex justify-between text-xs text-[#5a7045] mb-1.5">
                      <span className="truncate">{u.name}</span>
                      <span>{u.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-[#e8f0e0] rounded-full overflow-hidden">
                      <div className="h-full bg-[#4a7c36] rounded-full transition-all duration-300"
                        style={{ width: u.progress + "%" }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Uploaded files grid */}
            {mediaFiles.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-2">
                {mediaFiles.map((f) => (
                  <div key={f.id} className="relative rounded-xl overflow-hidden aspect-square bg-[#e8f0e0] group">
                    {f.type === "image" ? (
                      <img src={f.url} alt={f.name} className="w-full h-full object-cover" />
                    ) : (
                      <video src={f.url} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <button onClick={() => deleteMedia(f.id)}
                        className="bg-red-500 text-white text-xs px-2 py-1 rounded-lg">
                        Delete
                      </button>
                    </div>
                    <div className="absolute bottom-1 left-1 text-[9px] bg-black/50 text-white px-1.5 py-0.5 rounded">
                      {f.sizeLabel}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Stats */}
            {(stats.photos > 0 || stats.videos > 0) && (
              <div className="mt-4 flex gap-3 text-xs text-[#7a9060]">
                <span>📷 {stats.photos} photos</span>
                <span>🎥 {stats.videos} videos</span>
                <span>💾 {stats.storage}</span>
              </div>
            )}
          </div>

          {/* Activity Section */}
          <div className="bg-white rounded-2xl p-6 border border-[#e8f0e0] shadow-sm">
            <h3 className="font-bold text-[#1e3d12] text-lg mb-1" style={{ fontFamily: "'Lora', serif" }}>
              📋 Recent Activity
            </h3>
            <p className="text-[#7a9060] text-sm mb-5">Track your verification status</p>

            <div className="space-y-3">
              {mockActivity.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3.5 rounded-xl bg-[#f9f7f3] hover:bg-[#f5f2eb] transition-colors">
                  <span className="text-2xl">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#1e3d12] text-sm font-medium truncate">{item.name}</p>
                    <p className="text-[#8a9e7a] text-xs mt-0.5">{item.date}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyle[item.status]}`}>
                    {statusLabel[item.status]}
                  </span>
                </div>
              ))}
            </div>

            <button className="mt-4 w-full text-sm text-[#4a7c36] font-medium py-2.5 rounded-xl border border-[#e8f0e0] hover:bg-[#f5f2eb] transition-all">
              View all uploads →
            </button>
          </div>
        </div>

        {/* Rewards Section */}
        <div className="bg-white rounded-2xl p-6 border border-[#e8f0e0] shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-[#1e3d12] text-lg" style={{ fontFamily: "'Lora', serif" }}>
                💰 Rewards
              </h3>
              <p className="text-[#7a9060] text-sm mt-0.5">Redeem your carbon credits for real money</p>
            </div>
            <button className="bg-[#4a7c36] text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-[#3a6228] transition-all shadow-sm">
              Redeem Credits
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Total Credits", value: credits, icon: "🌿" },
              { label: "Approved", value: mockActivity.filter(a => a.status === "approved").length, icon: "✅" },
              { label: "Pending Review", value: mockActivity.filter(a => a.status === "pending").length, icon: "⏳" },
              { label: "This Month", value: "+" + Math.floor(credits * 0.3), icon: "📈" },
            ].map((s) => (
              <div key={s.label} className="bg-[#f9f7f3] rounded-xl p-4 text-center">
                <div className="text-2xl mb-2">{s.icon}</div>
                <p className="text-2xl font-bold text-[#2d5a1e]" style={{ fontFamily: "'Lora', serif" }}>{s.value}</p>
                <p className="text-xs text-[#7a9060] mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4">
          <div className="flex items-center gap-4 text-sm text-[#7a9060]">
            <button className="flex items-center gap-1.5 hover:text-[#2d5a1e] transition-colors">
              🌐 Offline-ready app
            </button>
            <span>·</span>
            <button className="flex items-center gap-1.5 hover:text-[#2d5a1e] transition-colors">
              ❓ Help & Support
            </button>
          </div>
          <button onClick={onLogout}
            className="text-sm text-red-400 hover:text-red-600 transition-colors px-4 py-2 rounded-lg hover:bg-red-50">
            Sign Out →
          </button>
        </div>
      </main>
    </div>
  );
}