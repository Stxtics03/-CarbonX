// src/components/AdminDashboard.jsx
import { useState, useRef, useCallback } from "react";
import { useWallet } from "../hooks/useWallet";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Tooltip({ text, children }) {
  return (
    <div className="tooltip-container">
      {children}
      <span className="tooltip-text">{text}</span>
    </div>
  );
}

function Badge({ status }) {
  const cfg = {
    approved: { color: "#39d98a", bg: "rgba(57,217,138,0.12)", label: "✓ Approved", pulse: "#39d98a" },
    pending:  { color: "#fbbf24", bg: "rgba(251,191,36,0.12)",  label: "◉ Pending",  pulse: "#fbbf24" },
    rejected: { color: "#f87171", bg: "rgba(248,113,113,0.12)", label: "✕ Rejected", pulse: "#f87171" },
  }[status] || {};
  return (
    <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full font-mono-code"
      style={{ color: cfg.color, background: cfg.bg }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.pulse, boxShadow: `0 0 6px ${cfg.pulse}` }} />
      {cfg.label}
    </span>
  );
}

function StatCard({ icon, label, value, sub, accent = "#00f2ff", tooltip }) {
  return (
    <div className="rounded-2xl p-5 flex flex-col gap-3 transition-all hover:-translate-y-0.5"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="flex items-center justify-between">
        <span className="text-xl">{icon}</span>
        {tooltip && (
          <Tooltip text={tooltip}>
            <span className="w-5 h-5 rounded-full flex items-center justify-center cursor-help text-xs"
              style={{ background: "rgba(255,255,255,0.05)", color: "rgba(226,232,240,0.3)" }}>?</span>
          </Tooltip>
        )}
      </div>
      <div>
        <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "rgba(226,232,240,0.35)" }}>{label}</p>
        <p className="text-2xl font-black" style={{ color: accent }}>{value}</p>
        {sub && <p className="text-xs mt-0.5" style={{ color: "rgba(226,232,240,0.3)" }}>{sub}</p>}
      </div>
    </div>
  );
}

const MOCK_ACTIVITY = [
  { id: 1, name: "Rice Field — North Block",   status: "approved", date: "28 Mar 2026", icon: "🌾", credits: 12, blockHash: "0x4f8a1b2c3d", gasUsed: "0.0032 MATIC", ipfs: "QmX9fYz2aB..." },
  { id: 2, name: "Organic Compost Pit",         status: "pending",  date: "30 Mar 2026", icon: "♻️", credits: 8,  blockHash: "0x7c5d9e1f2a", gasUsed: "—",          ipfs: "Pending..."  },
  { id: 3, name: "Drip Irrigation Setup",       status: "pending",  date: "31 Mar 2026", icon: "💧", credits: 15, blockHash: "0x2e3f4a5b6c", gasUsed: "—",          ipfs: "Pending..."  },
  { id: 4, name: "Tree Plantation Row A",       status: "approved", date: "15 Mar 2026", icon: "🌳", credits: 20, blockHash: "0x9d0e1f2a3b", gasUsed: "0.0028 MATIC", ipfs: "QmY8eXz1bC..." },
  { id: 5, name: "Solar Pump System",           status: "rejected", date: "10 Mar 2026", icon: "☀️", credits: 0,  blockHash: "0x1b2c3d4e5f", gasUsed: "0.0018 MATIC", ipfs: "QmZ7dWy0aC..." },
  { id: 6, name: "Biochar Application Field 3", status: "approved", date: "5 Mar 2026",  icon: "🔥", credits: 9,  blockHash: "0x6a7b8c9d0e", gasUsed: "0.0041 MATIC", ipfs: "QmA6cVx9bD..." },
];

const MARKET_PRICES = [
  { day: "Mon", price: 38.2 }, { day: "Tue", price: 41.5 }, { day: "Wed", price: 39.8 },
  { day: "Thu", price: 44.1 }, { day: "Fri", price: 42.3 }, { day: "Sat", price: 46.0 },
  { day: "Sun", price: 44.8 },
];

// ─── Sub-pages ────────────────────────────────────────────────────────────────

function DashboardPage({ user, walletId, copyWalletId, regenerateWallet, showToast, mediaFiles, uploading, uploadFiles, stats, fileInputRef }) {
  const credits = user?.credits ?? 68;
  const earnings = (credits * 44.8).toLocaleString("en-IN");
  const shortWallet = walletId ? walletId.slice(0, 18) + "..." + walletId.slice(-6) : "—";
  const [mintStep, setMintStep] = useState(0); // 0=idle,1=uploading,2=hashing,3=minted
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    uploadFiles(e.dataTransfer.files);
    setMintStep(1);
    setTimeout(() => setMintStep(2), 2000);
    setTimeout(() => { setMintStep(3); showToast("🎉 Credits minted successfully!"); }, 4500);
    setTimeout(() => setMintStep(0), 7000);
  };

  const handleBrowse = (files) => {
    uploadFiles(files);
    setMintStep(1);
    setTimeout(() => setMintStep(2), 2000);
    setTimeout(() => { setMintStep(3); showToast("🎉 Credits minted successfully!"); }, 4500);
    setTimeout(() => setMintStep(0), 7000);
  };

  const mintSteps = [
    { label: "Proof Uploaded", icon: "📤" },
    { label: "Data Anchored", icon: "⛓️", detail: "IPFS hashing..." },
    { label: "Credit Minted", icon: "💎", detail: "On Polygon" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <p className="text-xs font-mono-code tracking-widest mb-1" style={{ color: "rgba(0,242,255,0.5)" }}>
            {new Date().toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long", year:"numeric" }).toUpperCase()}
          </p>
          <h1 className="text-3xl font-black">
            Hello, <span style={{ background: "linear-gradient(135deg,#00f2ff,#39d98a)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>{user?.username}</span> 👋
          </h1>
          <p className="text-sm mt-1" style={{ color: "rgba(226,232,240,0.4)" }}>Your farm is in the top 5% for carbon offset this month</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl font-mono-code text-xs"
          style={{ background: "rgba(57,217,138,0.08)", border: "1px solid rgba(57,217,138,0.2)", color: "#39d98a" }}>
          <span className="w-2 h-2 rounded-full animate-pulse-glow" style={{ background: "#39d98a", boxShadow: "0 0 8px #39d98a" }} />
          Node Synced · Polygon Mainnet
        </div>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon="💎" label="Carbon Credits" value={credits} sub="GRN Tokens" accent="#00f2ff"
          tooltip="Carbon Credits (GRN) are tokens earned by verified sustainable farming practices" />
        <StatCard icon="₹" label="INR Earnings" value={`₹${earnings}`} sub="Withdrawable" accent="#39d98a"
          tooltip="Estimated INR value of your carbon credits at current market rate" />
        <StatCard icon="🌍" label="CO₂ Offset" value={`${(credits * 0.85).toFixed(1)}t`} sub="This season" accent="#a78bfa" />
        <StatCard icon="📊" label="Rank" value="#247" sub="Top 5% farmers" accent="#fbbf24" />
      </div>

      {/* Three columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* Left — Wallet */}
        <div className="lg:col-span-3 rounded-2xl p-5 space-y-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base">🔐</span>
            <span className="text-sm font-bold">Wallet</span>
            <Tooltip text="Your unique blockchain wallet address used to receive carbon credits and payments">
              <span className="w-4 h-4 rounded-full flex items-center justify-center cursor-help text-xs ml-auto"
                style={{ background: "rgba(255,255,255,0.05)", color: "rgba(226,232,240,0.3)", fontSize:"10px" }}>?</span>
            </Tooltip>
          </div>
          <div className="rounded-xl p-3" style={{ background: "rgba(0,242,255,0.04)", border: "1px solid rgba(0,242,255,0.12)" }}>
            <p className="font-mono-code text-xs break-all leading-relaxed" style={{ color: "rgba(0,242,255,0.8)" }}>{shortWallet}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => { copyWalletId(); showToast("Wallet ID copied! 📋"); }}
              className="py-2 rounded-lg text-xs font-semibold transition-all hover:-translate-y-0.5"
              style={{ background: "rgba(0,242,255,0.08)", border: "1px solid rgba(0,242,255,0.2)", color: "#00f2ff" }}>
              📋 Copy
            </button>
            <button onClick={() => { regenerateWallet(); showToast("New wallet generated 🔄"); }}
              className="py-2 rounded-lg text-xs font-semibold transition-all hover:-translate-y-0.5"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(226,232,240,0.6)" }}>
              🔄 New
            </button>
          </div>

          {/* Node status */}
          <div className="border-t pt-4" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "rgba(226,232,240,0.3)" }}>Node Status</p>
            {[
              { label: "Network", val: "Polygon", ok: true },
              { label: "Sync", val: "100%", ok: true },
              { label: "Gas", val: "32 Gwei", ok: true },
            ].map((r, i) => (
              <div key={i} className="flex items-center justify-between py-1.5">
                <span className="text-xs" style={{ color: "rgba(226,232,240,0.4)" }}>{r.label}</span>
                <span className="text-xs font-semibold font-mono-code" style={{ color: r.ok ? "#39d98a" : "#f87171" }}>{r.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Center — Minting */}
        <div className="lg:col-span-6 rounded-2xl p-5 space-y-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base">Mint Credits</h3>
              <p className="text-xs mt-0.5" style={{ color: "rgba(226,232,240,0.4)" }}>Upload farm proof to earn GRN tokens</p>
            </div>
            <Tooltip text="Minting converts your verified farm photos into blockchain-secured carbon credit tokens">
              <span className="w-5 h-5 rounded-full flex items-center justify-center cursor-help text-xs"
                style={{ background: "rgba(255,255,255,0.05)", color: "rgba(226,232,240,0.3)", fontSize:"10px" }}>?</span>
            </Tooltip>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="relative rounded-2xl p-8 text-center cursor-pointer transition-all overflow-hidden"
            style={{
              background: dragging ? "rgba(0,242,255,0.07)" : "rgba(255,255,255,0.02)",
              border: `2px dashed ${dragging ? "rgba(0,242,255,0.6)" : "rgba(255,255,255,0.1)"}`,
              boxShadow: dragging ? "0 0 20px rgba(0,242,255,0.15)" : "none",
            }}>
            <div className="text-4xl mb-2">📷</div>
            <p className="font-semibold text-sm mb-1">Drag & drop farm photos here</p>
            <p className="text-xs" style={{ color: "rgba(226,232,240,0.3)" }}>or click to browse · JPG, PNG, MP4 · Max 50MB</p>
            <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple hidden
              onChange={(e) => { handleBrowse(e.target.files); e.target.value = ""; }} />
          </div>

          {/* Upload progress */}
          {uploading.length > 0 && (
            <div className="space-y-2">
              {uploading.map((u) => (
                <div key={u.id} className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="truncate font-mono-code" style={{ color: "rgba(226,232,240,0.6)" }}>{u.name}</span>
                    <span style={{ color: "#00f2ff" }}>{u.progress}%</span>
                  </div>
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                    <div className="h-full rounded-full transition-all duration-300" style={{ width: `${u.progress}%`, background: "linear-gradient(90deg,#00f2ff,#39d98a)" }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Timeline */}
          {mintStep > 0 && (
            <div className="rounded-xl p-4" style={{ background: "rgba(0,242,255,0.04)", border: "1px solid rgba(0,242,255,0.12)" }}>
              <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "rgba(0,242,255,0.6)" }}>Minting Pipeline</p>
              <div className="flex items-center gap-0">
                {mintSteps.map((step, i) => {
                  const done = mintStep > i + 1;
                  const active = mintStep === i + 1;
                  return (
                    <div key={i} className="flex items-center flex-1">
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm transition-all"
                          style={{
                            background: done ? "rgba(57,217,138,0.2)" : active ? "rgba(0,242,255,0.2)" : "rgba(255,255,255,0.04)",
                            border: `1px solid ${done ? "#39d98a" : active ? "#00f2ff" : "rgba(255,255,255,0.08)"}`,
                            boxShadow: active ? "0 0 12px rgba(0,242,255,0.4)" : done ? "0 0 8px rgba(57,217,138,0.3)" : "none",
                          }}>
                          {done ? "✓" : step.icon}
                        </div>
                        <span className="text-xs text-center leading-tight" style={{ color: done ? "#39d98a" : active ? "#00f2ff" : "rgba(226,232,240,0.3)" }}>
                          {step.label}
                        </span>
                      </div>
                      {i < mintSteps.length - 1 && (
                        <div className="flex-1 h-px mx-2" style={{ background: done ? "rgba(57,217,138,0.4)" : "rgba(255,255,255,0.06)" }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right — Analytics */}
        <div className="lg:col-span-3 space-y-4">
          {/* Earnings */}
          <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "rgba(226,232,240,0.35)" }}>Earnings</p>
            <p className="text-3xl font-black" style={{ color: "#39d98a" }}>₹{earnings}</p>
            <p className="text-xs mt-1 font-mono-code" style={{ color: "rgba(226,232,240,0.3)" }}>{credits} GRN × ₹44.8</p>
            <button className="w-full mt-4 py-2.5 rounded-xl text-xs font-bold transition-all hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg,rgba(57,217,138,0.15),rgba(57,217,138,0.08))", border: "1px solid rgba(57,217,138,0.3)", color: "#39d98a" }}>
              Withdraw to Bank →
            </button>
          </div>

          {/* Carbon Score */}
          <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "rgba(226,232,240,0.35)" }}>Carbon Score</p>
            <div className="flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-24 h-24">
                <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                <circle cx="50" cy="50" r="38" fill="none" stroke="url(#cg)" strokeWidth="8"
                  strokeLinecap="round" strokeDasharray="239" strokeDashoffset="60" transform="rotate(-90 50 50)" />
                <defs>
                  <linearGradient id="cg" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#00f2ff" />
                    <stop offset="100%" stopColor="#39d98a" />
                  </linearGradient>
                </defs>
                <text x="50" y="46" textAnchor="middle" fill="#e2e8f0" fontSize="14" fontWeight="900" fontFamily="Outfit">75</text>
                <text x="50" y="58" textAnchor="middle" fill="rgba(226,232,240,0.35)" fontSize="7" fontFamily="Outfit">/100</text>
              </svg>
            </div>
            <p className="text-center text-xs mt-2" style={{ color: "#39d98a" }}>Top 5% of Farmers 🏆</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <h3 className="font-bold text-sm mb-4">Recent Activity</h3>
        <div className="space-y-2">
          {MOCK_ACTIVITY.slice(0, 4).map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl transition-all hover:bg-white/[0.02]"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <span className="text-xl shrink-0">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.name}</p>
                <p className="text-xs font-mono-code mt-0.5" style={{ color: "rgba(226,232,240,0.3)" }}>{item.date}</p>
              </div>
              {item.credits > 0 && (
                <span className="text-xs font-bold font-mono-code" style={{ color: "#00f2ff" }}>+{item.credits} GRN</span>
              )}
              <Badge status={item.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Farm Assets ──────────────────────────────────────────────────────────────
function FarmAssetsPage({ mediaFiles, uploading, uploadFiles, deleteMedia, stats, fileInputRef, showToast }) {
  const [view, setView] = useState("grid");
  const [filter, setFilter] = useState("all");
  const [lightbox, setLightbox] = useState(null);
  const [dragging, setDragging] = useState(false);

  const filtered = filter === "all" ? mediaFiles : mediaFiles.filter((m) => m.type === filter);

  const mockPlots = [
    { id:"p1", name:"North Block — Rice", area:"2.3 ha", health:88, sensors:3, img:"🌾", status:"approved" },
    { id:"p2", name:"East Field — Wheat",  area:"1.7 ha", health:72, sensors:2, img:"🌿", status:"pending"  },
    { id:"p3", name:"Compost Zone A",      area:"0.5 ha", health:95, sensors:1, img:"♻️", status:"approved" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black">Farm Assets</h2>
          <p className="text-sm mt-1" style={{ color: "rgba(226,232,240,0.4)" }}>Manage your land plots and upload evidence</p>
        </div>
        <div className="flex gap-2">
          {["grid","list"].map((v) => (
            <button key={v} onClick={() => setView(v)}
              className="px-4 py-2 rounded-lg text-xs font-semibold transition-all capitalize"
              style={view===v ? { background:"rgba(0,242,255,0.12)", border:"1px solid rgba(0,242,255,0.3)", color:"#00f2ff" }
                             : { background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", color:"rgba(226,232,240,0.4)" }}>
              {v === "grid" ? "⊞ Grid" : "☰ List"}
            </button>
          ))}
        </div>
      </div>

      {/* Plot cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {mockPlots.map((plot) => (
          <div key={plot.id} className="rounded-2xl p-5 transition-all hover:-translate-y-0.5"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                {plot.img}
              </div>
              <Badge status={plot.status} />
            </div>
            <h4 className="font-bold text-sm mb-0.5">{plot.name}</h4>
            <p className="text-xs mb-4" style={{ color: "rgba(226,232,240,0.4)" }}>{plot.area} · {plot.sensors} IoT sensors</p>
            {/* Health gauge */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span style={{ color: "rgba(226,232,240,0.4)" }}>Health Score</span>
                <span style={{ color: plot.health > 80 ? "#39d98a" : "#fbbf24" }}>{plot.health}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div className="h-full rounded-full transition-all" style={{ width:`${plot.health}%`, background: plot.health>80 ? "linear-gradient(90deg,#39d98a,#00f2ff)" : "linear-gradient(90deg,#fbbf24,#f97316)" }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upload zone */}
      <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <h3 className="font-bold text-sm mb-4">Media Library <span className="font-mono-code text-xs ml-2" style={{ color:"rgba(226,232,240,0.3)" }}>{stats.photos} photos · {stats.videos} videos · {stats.storage}</span></h3>

        <div onDragOver={(e)=>{e.preventDefault();setDragging(true)}} onDragLeave={()=>setDragging(false)}
          onDrop={(e)=>{e.preventDefault();setDragging(false);uploadFiles(e.dataTransfer.files)}}
          onClick={() => fileInputRef.current?.click()}
          className="rounded-2xl p-6 text-center cursor-pointer transition-all mb-4"
          style={{ border: `2px dashed ${dragging?"rgba(0,242,255,0.5)":"rgba(255,255,255,0.08)"}`, background: dragging?"rgba(0,242,255,0.05)":"transparent" }}>
          <p className="text-3xl mb-2">☁️</p>
          <p className="text-sm font-semibold">Drag & drop or click to upload</p>
          <p className="text-xs mt-1" style={{ color:"rgba(226,232,240,0.3)" }}>Images & videos up to 50MB</p>
          <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple hidden onChange={(e)=>{uploadFiles(e.target.files);e.target.value="";}} />
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-4">
          {["all","image","video"].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all capitalize"
              style={filter===f ? { background:"rgba(0,242,255,0.1)", border:"1px solid rgba(0,242,255,0.3)", color:"#00f2ff" }
                                : { background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", color:"rgba(226,232,240,0.4)" }}>
              {f==="all"?"All":f==="image"?"📷 Photos":"🎬 Videos"}
            </button>
          ))}
        </div>

        {uploading.length > 0 && (
          <div className="space-y-2 mb-4">
            {uploading.map((u) => (
              <div key={u.id} className="rounded-xl p-3 flex items-center gap-3" style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)" }}>
                <span className="text-sm">📤</span>
                <span className="flex-1 truncate text-xs font-mono-code" style={{ color:"rgba(226,232,240,0.5)" }}>{u.name}</span>
                <div className="w-24 h-1 rounded-full overflow-hidden" style={{ background:"rgba(255,255,255,0.06)" }}>
                  <div className="h-full rounded-full" style={{ width:`${u.progress}%`, background:"linear-gradient(90deg,#00f2ff,#39d98a)" }} />
                </div>
                <span className="text-xs font-mono-code" style={{ color:"#00f2ff" }}>{u.progress}%</span>
              </div>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-12" style={{ color:"rgba(226,232,240,0.2)" }}>
            <p className="text-4xl mb-2">🗂️</p>
            <p className="text-sm">No media uploaded yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filtered.map((media) => (
              <div key={media.id} className="group relative rounded-xl overflow-hidden cursor-pointer transition-all hover:-translate-y-0.5"
                style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", aspectRatio:"1" }}
                onClick={() => setLightbox(media)}>
                {media.type === "image" ? (
                  <img src={media.url} alt={media.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl">🎬</div>
                )}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  style={{ background:"rgba(0,0,0,0.5)" }}>
                  <span className="text-xl">🔍</span>
                </div>
                <div className="absolute top-1 left-1 text-xs px-1.5 py-0.5 rounded font-mono-code"
                  style={{ background:"rgba(0,0,0,0.7)", color:"rgba(57,217,138,0.9)", fontSize:"9px" }}>
                  ✓ AI Verified
                </div>
                <button onClick={(e)=>{e.stopPropagation();deleteMedia(media.id);}}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs hidden group-hover:flex"
                  style={{ background:"rgba(239,68,68,0.8)", color:"white" }}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {lightbox && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center" style={{ background:"rgba(7,11,18,0.95)", backdropFilter:"blur(12px)" }}
          onClick={(e)=>{ if(e.target===e.currentTarget) setLightbox(null); }}>
          <button onClick={()=>setLightbox(null)} className="absolute top-5 right-7 text-2xl" style={{ color:"rgba(226,232,240,0.5)" }}>✕</button>
          <div className="relative max-w-3xl w-full px-4">
            {lightbox.type==="image"
              ? <img src={lightbox.url} alt={lightbox.name} className="w-full rounded-2xl object-contain max-h-[75vh]" />
              : <video src={lightbox.url} controls autoPlay className="w-full rounded-2xl max-h-[75vh]" />
            }
            <div className="mt-3 rounded-xl p-4 font-mono-code text-xs space-y-1"
              style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)" }}>
              <div className="flex gap-4 flex-wrap">
                <span style={{ color:"rgba(0,242,255,0.7)" }}>📍 {lightbox.gps}</span>
                <span style={{ color:"rgba(226,232,240,0.4)" }}>⏱ {new Date(lightbox.timestamp).toLocaleString()}</span>
              </div>
              <div><span style={{ color:"rgba(226,232,240,0.3)" }}>IPFS: </span><span style={{ color:"rgba(57,217,138,0.8)" }}>{lightbox.ipfsHash}</span></div>
              <div><span style={{ color:"rgba(226,232,240,0.3)" }}>Block: </span><span style={{ color:"rgba(0,242,255,0.8)" }}>{lightbox.blockHash}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Market ───────────────────────────────────────────────────────────────────
function MarketPage({ user, showToast }) {
  const credits = user?.credits ?? 68;
  const [tradeTab, setTradeTab] = useState("sell");
  const [amount, setAmount] = useState("");
  const currentPrice = 44.8;
  const inrValue = amount ? (parseFloat(amount) * currentPrice).toFixed(2) : "0.00";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black">Carbon Market</h2>
        <p className="text-sm mt-1" style={{ color:"rgba(226,232,240,0.4)" }}>Trade your GRN tokens for INR or crypto</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Chart */}
        <div className="lg:col-span-2 rounded-2xl p-5" style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-mono-code" style={{ color:"rgba(226,232,240,0.4)" }}>GRN / INR</p>
              <p className="text-3xl font-black" style={{ color:"#39d98a" }}>₹{currentPrice}</p>
              <p className="text-xs font-mono-code" style={{ color:"#39d98a" }}>▲ +8.3% this week</p>
            </div>
            <div className="text-right text-xs font-mono-code" style={{ color:"rgba(226,232,240,0.3)" }}>
              <p>24h Vol: ₹48,230</p>
              <p>Market Cap: ₹2.8Cr</p>
            </div>
          </div>

          {/* Simple bar chart */}
          <div className="flex items-end gap-2 h-32">
            {MARKET_PRICES.map((d, i) => {
              const pct = ((d.price - 36) / (48 - 36)) * 100;
              const isToday = i === 5;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="w-full rounded-t-lg transition-all"
                    style={{ height:`${pct}%`, background: isToday ? "linear-gradient(180deg,#00f2ff,#39d98a)" : "rgba(255,255,255,0.08)", boxShadow: isToday ? "0 0 12px rgba(0,242,255,0.3)" : "none" }} />
                  <span className="text-xs font-mono-code" style={{ color:"rgba(226,232,240,0.3)", fontSize:"10px" }}>{d.day}</span>
                </div>
              );
            })}
          </div>

          {/* Tx Ledger */}
          <div className="mt-5 border-t pt-4" style={{ borderColor:"rgba(255,255,255,0.06)" }}>
            <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color:"rgba(226,232,240,0.3)" }}>Transaction Ledger</p>
            {[
              { hash:"0x4f8a1b2c...", type:"Sell", amount:"12 GRN", inr:"₹537.60", time:"2m ago", status:"confirmed" },
              { hash:"0x9d0e1f2a...", type:"Mint", amount:"20 GRN", inr:"—",        time:"1h ago", status:"confirmed" },
              { hash:"0x2e3f4a5b...", type:"Sell", amount:"8 GRN",  inr:"₹358.40", time:"3h ago", status:"pending"   },
            ].map((tx, i) => (
              <div key={i} className="flex items-center gap-3 py-2.5 text-xs font-mono-code" style={{ borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                <span style={{ color:"rgba(0,242,255,0.6)" }}>{tx.hash}</span>
                <span className="px-2 py-0.5 rounded font-semibold" style={{ background:"rgba(255,255,255,0.04)", color:"rgba(226,232,240,0.5)", fontSize:"10px" }}>{tx.type}</span>
                <span style={{ color:"rgba(226,232,240,0.7)" }}>{tx.amount}</span>
                <span style={{ color:"#39d98a" }}>{tx.inr}</span>
                <span className="ml-auto" style={{ color:"rgba(226,232,240,0.3)" }}>{tx.time}</span>
                <span style={{ color: tx.status==="confirmed"?"#39d98a":"#fbbf24" }}>
                  {tx.status==="confirmed"?"●":"◉"} {tx.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Trade widget */}
        <div className="rounded-2xl p-5 space-y-4" style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)" }}>
          <h3 className="font-bold text-sm">Quick Trade</h3>
          <div className="flex rounded-xl overflow-hidden" style={{ border:"1px solid rgba(255,255,255,0.08)" }}>
            {["sell","withdraw"].map((t) => (
              <button key={t} onClick={() => setTradeTab(t)}
                className="flex-1 py-2.5 text-xs font-semibold capitalize transition-all"
                style={tradeTab===t ? { background:"rgba(0,242,255,0.12)", color:"#00f2ff" } : { color:"rgba(226,232,240,0.35)" }}>
                {t==="sell"?"Sell Credits":"Withdraw"}
              </button>
            ))}
          </div>

          <div>
            <label className="text-xs font-semibold tracking-widest uppercase mb-1.5 block" style={{ color:"rgba(0,242,255,0.6)" }}>
              {tradeTab==="sell"?"Credits to Sell (GRN)":"Amount (INR)"}
            </label>
            <input type="number" value={amount} onChange={e=>setAmount(e.target.value)}
              placeholder={tradeTab==="sell"?"e.g. 10":"e.g. 500"}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none font-mono-code"
              style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", color:"#e2e8f0" }} />
          </div>

          {tradeTab==="sell" && amount && (
            <div className="rounded-xl p-3" style={{ background:"rgba(57,217,138,0.06)", border:"1px solid rgba(57,217,138,0.15)" }}>
              <div className="flex justify-between text-xs">
                <span style={{ color:"rgba(226,232,240,0.5)" }}>You receive</span>
                <span className="font-bold" style={{ color:"#39d98a" }}>₹{inrValue}</span>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span style={{ color:"rgba(226,232,240,0.5)" }}>Fee (1.5%)</span>
                <span className="font-mono-code" style={{ color:"rgba(226,232,240,0.4)" }}>₹{(parseFloat(inrValue)*0.015||0).toFixed(2)}</span>
              </div>
            </div>
          )}

          <p className="text-xs font-mono-code" style={{ color:"rgba(226,232,240,0.35)" }}>
            Balance: <span style={{ color:"#00f2ff" }}>{credits} GRN</span>
          </p>

          <button onClick={() => { showToast("🚀 Trade submitted to blockchain!"); setAmount(""); }}
            className="w-full py-3.5 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5"
            style={{ background:"linear-gradient(135deg,#00c6d7,#00f2ff)", color:"#070b12", boxShadow:"0 0 20px rgba(0,242,255,0.3)" }}>
            ⚡ Execute Trade
          </button>

          {/* Price alert */}
          <div className="border-t pt-4" style={{ borderColor:"rgba(255,255,255,0.06)" }}>
            <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color:"rgba(226,232,240,0.3)" }}>Price Alert</p>
            <div className="flex gap-2">
              <input type="number" placeholder="Target ₹/GRN"
                className="flex-1 px-3 py-2 rounded-lg text-xs outline-none font-mono-code"
                style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", color:"#e2e8f0" }} />
              <button className="px-3 py-2 rounded-lg text-xs font-semibold"
                style={{ background:"rgba(251,191,36,0.1)", border:"1px solid rgba(251,191,36,0.25)", color:"#fbbf24" }}>
                Set
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── History ──────────────────────────────────────────────────────────────────
function HistoryPage({ showToast }) {
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black">Audit Trail</h2>
        <p className="text-sm mt-1" style={{ color:"rgba(226,232,240,0.4)" }}>Full blockchain-verified activity history</p>
      </div>

      <div className="space-y-3">
        {MOCK_ACTIVITY.map((item, i) => (
          <div key={item.id} className="rounded-2xl overflow-hidden transition-all"
            style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)" }}>
            <button className="w-full flex items-center gap-4 p-4 text-left"
              onClick={() => setExpanded(expanded===item.id ? null : item.id)}>
              <span className="text-xl shrink-0">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{item.name}</p>
                <p className="text-xs font-mono-code mt-0.5" style={{ color:"rgba(226,232,240,0.3)" }}>{item.date}</p>
              </div>
              {item.credits > 0 && (
                <span className="text-xs font-bold font-mono-code" style={{ color:"#00f2ff" }}>+{item.credits} GRN</span>
              )}
              <Badge status={item.status} />
              <span className="text-xs" style={{ color:"rgba(226,232,240,0.3)" }}>{expanded===item.id?"▲":"▼"}</span>
            </button>

            {expanded === item.id && (
              <div className="px-4 pb-4 border-t pt-4 space-y-3" style={{ borderColor:"rgba(255,255,255,0.06)" }}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono-code text-xs">
                  {[
                    { label:"Block Hash",  val:item.blockHash },
                    { label:"Gas Used",    val:item.gasUsed   },
                    { label:"IPFS Hash",   val:item.ipfs      },
                  ].map((r) => (
                    <div key={r.label} className="rounded-xl p-3" style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)" }}>
                      <p className="text-xs mb-1 tracking-widest uppercase" style={{ color:"rgba(226,232,240,0.3)", fontSize:"9px" }}>{r.label}</p>
                      <p className="break-all" style={{ color:"rgba(0,242,255,0.8)" }}>{r.val}</p>
                    </div>
                  ))}
                </div>
                {item.status === "approved" && (
                  <button onClick={() => showToast("📄 Certificate downloaded!")}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold transition-all hover:-translate-y-0.5"
                    style={{ background:"rgba(57,217,138,0.1)", border:"1px solid rgba(57,217,138,0.3)", color:"#39d98a" }}>
                    ⬇ Download Certificate (PDF + QR)
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Security ─────────────────────────────────────────────────────────────────
function SecurityPage({ walletId, showToast }) {
  const [revealed, setRevealed] = useState(false);
  const mockSeedPhrase = "solar wheat river ledger carbon green mint yield farm block chain trust";
  const [showSeed, setShowSeed] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black">Security Center</h2>
        <p className="text-sm mt-1" style={{ color:"rgba(226,232,240,0.4)" }}>Wallet management & access control</p>
      </div>

      {/* Shield */}
      <div className="rounded-2xl p-8 text-center" style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)" }}>
        <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-3 animate-pulse-glow"
          style={{ background:"linear-gradient(135deg,rgba(57,217,138,0.12),rgba(0,242,255,0.12))", border:"1px solid rgba(57,217,138,0.3)" }}>
          🛡️
        </div>
        <p className="font-bold">Security Score</p>
        <p className="text-4xl font-black my-2" style={{ color:"#39d98a" }}>8.5 / 10</p>
        <p className="text-sm" style={{ color:"rgba(226,232,240,0.4)" }}>Enable 2FA to reach perfect score</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Wallet Management */}
        <div className="rounded-2xl p-5 space-y-4" style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)" }}>
          <h3 className="font-bold text-sm">Wallet Management</h3>
          <div>
            <p className="text-xs mb-1 tracking-widest uppercase" style={{ color:"rgba(226,232,240,0.35)", fontSize:"10px" }}>Wallet Address</p>
            <p className="font-mono-code text-xs break-all" style={{ color:"rgba(0,242,255,0.7)" }}>{walletId}</p>
          </div>
          <div>
            <p className="text-xs mb-2 tracking-widest uppercase" style={{ color:"rgba(239,68,68,0.7)", fontSize:"10px" }}>⚠ Private Key</p>
            <div className="rounded-xl p-3 relative overflow-hidden" style={{ background:"rgba(239,68,68,0.06)", border:"1px solid rgba(239,68,68,0.2)" }}>
              <p className="font-mono-code text-xs" style={{ color: revealed ? "rgba(0,242,255,0.8)" : "transparent", textShadow: revealed ? "none" : "0 0 8px rgba(226,232,240,0.8)", filter: revealed ? "none" : "blur(4px)" }}>
                0x4a7c36f8e2d1b9c5a3e7f4d2b8a6c1e9f3d7b5a2
              </p>
              {!revealed && <div className="absolute inset-0 flex items-center justify-center">
                <button onClick={() => { setRevealed(true); showToast("⚠️ Keep this secret!"); }}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold"
                  style={{ background:"rgba(239,68,68,0.15)", border:"1px solid rgba(239,68,68,0.3)", color:"#f87171" }}>
                  🔓 Reveal Key
                </button>
              </div>}
            </div>
          </div>
        </div>

        {/* Device History */}
        <div className="rounded-2xl p-5" style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)" }}>
          <h3 className="font-bold text-sm mb-4">Device History</h3>
          {[
            { device:"Chrome · Windows", ip:"103.215.42.x", time:"Now · India", active:true },
            { device:"Safari · iPhone",  ip:"49.37.x.x",   time:"2 days ago · India", active:false },
            { device:"Firefox · Linux",  ip:"182.x.x.x",   time:"1 week ago · India", active:false },
          ].map((d, i) => (
            <div key={i} className="flex items-center gap-3 py-3" style={{ borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
              <span className="text-base">💻</span>
              <div className="flex-1">
                <p className="text-xs font-semibold">{d.device}</p>
                <p className="text-xs font-mono-code mt-0.5" style={{ color:"rgba(226,232,240,0.35)" }}>{d.ip} · {d.time}</p>
              </div>
              {d.active
                ? <span className="text-xs font-semibold" style={{ color:"#39d98a" }}>● Active</span>
                : <button className="text-xs" style={{ color:"rgba(239,68,68,0.6)" }}>Revoke</button>}
            </div>
          ))}
        </div>

        {/* 2FA */}
        <div className="rounded-2xl p-5" style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(251,191,36,0.15)" }}>
          <h3 className="font-bold text-sm mb-1">Two-Factor Auth</h3>
          <p className="text-xs mb-4" style={{ color:"rgba(226,232,240,0.4)" }}>Add an extra layer of security</p>
          <div className="flex items-center justify-between p-3 rounded-xl" style={{ background:"rgba(251,191,36,0.06)", border:"1px solid rgba(251,191,36,0.15)" }}>
            <span className="text-sm">⚠️ 2FA not enabled</span>
            <button onClick={() => showToast("2FA setup coming soon!")}
              className="px-4 py-1.5 rounded-lg text-xs font-bold"
              style={{ background:"rgba(251,191,36,0.15)", border:"1px solid rgba(251,191,36,0.3)", color:"#fbbf24" }}>
              Enable
            </button>
          </div>
        </div>

        {/* Recovery */}
        <div className="rounded-2xl p-5" style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)" }}>
          <h3 className="font-bold text-sm mb-1">Recovery Phrase</h3>
          <p className="text-xs mb-4" style={{ color:"rgba(239,68,68,0.7)" }}>⚠ Never share this with anyone</p>
          {!showSeed ? (
            <button onClick={() => setShowSeed(true)}
              className="w-full py-2.5 rounded-xl text-xs font-semibold"
              style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)", color:"#f87171" }}>
              🔐 Reveal 12-Word Phrase
            </button>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {mockSeedPhrase.split(" ").map((word, i) => (
                <div key={i} className="rounded-lg px-2 py-1.5 text-center"
                  style={{ background:"rgba(239,68,68,0.06)", border:"1px solid rgba(239,68,68,0.15)" }}>
                  <span className="text-xs font-mono-code" style={{ color:"rgba(226,232,240,0.35)", fontSize:"9px" }}>{i+1}.</span>
                  <span className="block text-xs font-semibold font-mono-code" style={{ color:"#f87171" }}>{word}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Gallery ──────────────────────────────────────────────────────────────────
function GalleryPage({ mediaFiles, showToast }) {
  const [lightbox, setLightbox] = useState(null);

  if (mediaFiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-5xl mb-4">🖼️</p>
        <h2 className="text-xl font-bold mb-2">Gallery is empty</h2>
        <p style={{ color:"rgba(226,232,240,0.4)", fontSize:"14px" }}>Upload farm photos in Farm Assets to see them here</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black">Proof Gallery</h2>
        <p className="text-sm mt-1" style={{ color:"rgba(226,232,240,0.4)" }}>All verified farm evidence, blockchain-anchored</p>
      </div>

      <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
        {mediaFiles.map((media) => (
          <div key={media.id} className="break-inside-avoid group relative rounded-2xl overflow-hidden cursor-pointer transition-all hover:-translate-y-0.5"
            style={{ border:"1px solid rgba(255,255,255,0.07)" }}
            onClick={() => setLightbox(media)}>
            {media.type === "image"
              ? <img src={media.url} alt={media.name} className="w-full object-cover" />
              : <div className="h-40 flex items-center justify-center text-4xl" style={{ background:"rgba(255,255,255,0.04)" }}>🎬</div>
            }
            <div className="absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ background:"rgba(57,217,138,0.2)", border:"1px solid rgba(57,217,138,0.3)", color:"#39d98a", fontSize:"9px" }}>
              ✓ AI VERIFIED
            </div>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3"
              style={{ background:"linear-gradient(transparent,rgba(7,11,18,0.9))" }}>
              <p className="font-mono-code text-xs truncate" style={{ color:"rgba(0,242,255,0.8)" }}>📍 {media.gps}</p>
              <p className="font-mono-code text-xs" style={{ color:"rgba(226,232,240,0.4)", fontSize:"9px" }}>{new Date(media.timestamp).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      {lightbox && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center" style={{ background:"rgba(7,11,18,0.96)", backdropFilter:"blur(16px)" }}
          onClick={(e) => { if(e.target===e.currentTarget) setLightbox(null); }}>
          <button onClick={() => setLightbox(null)} className="absolute top-5 right-7 text-2xl" style={{ color:"rgba(226,232,240,0.5)" }}>✕</button>
          <div className="max-w-3xl w-full px-4">
            {lightbox.type === "image"
              ? <img src={lightbox.url} alt={lightbox.name} className="w-full rounded-2xl object-contain max-h-[70vh]" />
              : <video src={lightbox.url} controls autoPlay className="w-full rounded-2xl max-h-[70vh]" />
            }
            <div className="mt-3 p-4 rounded-xl space-y-2 font-mono-code text-xs"
              style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)" }}>
              <div className="flex flex-wrap gap-4">
                <span style={{ color:"rgba(0,242,255,0.7)" }}>📍 {lightbox.gps}</span>
                <span style={{ color:"rgba(226,232,240,0.4)" }}>⏱ {new Date(lightbox.timestamp).toLocaleString()}</span>
              </div>
              <p><span style={{ color:"rgba(226,232,240,0.3)" }}>IPFS: </span><span style={{ color:"rgba(57,217,138,0.8)" }}>{lightbox.ipfsHash}</span></p>
              <p><span style={{ color:"rgba(226,232,240,0.3)" }}>Block: </span><span style={{ color:"rgba(0,242,255,0.8)" }}>{lightbox.blockHash}</span></p>
              <button onClick={() => showToast("✅ Verified on-chain!")}
                className="px-4 py-1.5 rounded-lg font-semibold"
                style={{ background:"rgba(0,242,255,0.1)", border:"1px solid rgba(0,242,255,0.25)", color:"#00f2ff" }}>
                ◆ Verify On-Chain
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main AdminDashboard ───────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id:"dashboard",  icon:"⊞",  label:"Dashboard"   },
  { id:"assets",     icon:"🌾", label:"Farm Assets"  },
  { id:"market",     icon:"📈", label:"Market"       },
  { id:"history",    icon:"📋", label:"History"      },
  { id:"security",   icon:"🛡️", label:"Security"     },
  { id:"gallery",    icon:"🖼️", label:"Gallery"      },
];

export default function AdminDashboard({ user, onLogout }) {
  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState("");
  const fileInputRef = useRef(null);

  const { walletId, regenerateWallet, copyWalletId, mediaFiles, uploading, uploadFiles, deleteMedia, stats } = useWallet(user);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const initials = (name) => (name || "?").slice(0, 2).toUpperCase();
  const shortWallet = walletId ? walletId.slice(0, 8) + "..." + walletId.slice(-4) : "—";

  const pageProps = { user, walletId, copyWalletId, regenerateWallet, showToast, mediaFiles, uploading, uploadFiles, deleteMedia, stats, fileInputRef };

  return (
    <div className="flex min-h-screen" style={{ background:"#070b12" }}>

      {/* ── SIDEBAR ── */}
      <aside className={`fixed top-0 left-0 h-full w-56 flex flex-col z-50 transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
        style={{ background:"rgba(255,255,255,0.025)", borderRight:"1px solid rgba(255,255,255,0.06)", backdropFilter:"blur(20px)" }}>

        {/* Logo */}
        <div className="p-5 pb-0">
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
              style={{ background:"linear-gradient(135deg,rgba(0,242,255,0.2),rgba(57,217,138,0.2))", border:"1px solid rgba(0,242,255,0.25)" }}>
              🌿
            </div>
            <span className="font-black text-base tracking-wide" style={{ background:"linear-gradient(135deg,#00f2ff,#39d98a)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
              CarbonX
            </span>
          </div>

          {/* Nav */}
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <button key={item.id} onClick={() => { setPage(item.id); setSidebarOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left group"
                style={page===item.id
                  ? { background:"rgba(0,242,255,0.08)", border:"1px solid rgba(0,242,255,0.18)", color:"#00f2ff" }
                  : { border:"1px solid transparent", color:"rgba(226,232,240,0.4)" }}
                onMouseEnter={e => { if(page!==item.id) e.currentTarget.style.color="rgba(226,232,240,0.8)"; }}
                onMouseLeave={e => { if(page!==item.id) e.currentTarget.style.color="rgba(226,232,240,0.4)"; }}>
                <span className="text-base shrink-0">{item.icon}</span>
                <span>{item.label}</span>
                {page===item.id && <span className="ml-auto w-1 h-4 rounded-full" style={{ background:"#00f2ff", boxShadow:"0 0 8px #00f2ff" }} />}
              </button>
            ))}
          </nav>
        </div>

        {/* User card */}
        <div className="mt-auto p-5">
          <div className="rounded-xl p-3" style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                style={{ background:"linear-gradient(135deg,#00c6d7,#39d98a)", color:"#070b12" }}>
                {initials(user?.username)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate">{user?.username}</p>
                <p className="font-mono-code text-xs truncate" style={{ color:"rgba(226,232,240,0.3)", fontSize:"9px" }}>{shortWallet}</p>
              </div>
            </div>
            <button onClick={onLogout} className="w-full mt-3 py-2 rounded-lg text-xs font-semibold transition-all"
              style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.15)", color:"#f87171" }}>
              ⏻ Disconnect
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* ── MAIN ── */}
      <div className="flex-1 md:ml-56 flex flex-col min-h-screen">

        {/* Floating top nav */}
        <div className="sticky top-4 z-30 px-4 md:px-6">
          <div className="nav-pill rounded-2xl px-5 py-3 flex items-center justify-between"
            style={{ boxShadow:"0 4px 30px rgba(0,0,0,0.5)" }}>
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="md:hidden text-lg" style={{ color:"rgba(226,232,240,0.6)" }}>☰</button>
              <div>
                <p className="text-xs font-mono-code" style={{ color:"rgba(0,242,255,0.5)" }}>
                  {NAV_ITEMS.find(n=>n.id===page)?.icon} CarbonX
                </p>
                <p className="text-sm font-bold capitalize">{NAV_ITEMS.find(n=>n.id===page)?.label}</p>
              </div>
            </div>

            {/* Center links - desktop */}
            <div className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.slice(0,4).map((item) => (
                <button key={item.id} onClick={() => setPage(item.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={page===item.id ? { color:"#00f2ff" } : { color:"rgba(226,232,240,0.35)" }}>
                  {item.label}
                </button>
              ))}
            </div>

            {/* Right */}
            <div className="flex items-center gap-3">
              <div className="relative cursor-pointer text-lg">
                🔔
                <span className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full" style={{ background:"#00f2ff", boxShadow:"0 0 6px #00f2ff" }} />
              </div>
              <button className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:-translate-y-0.5"
                style={{ background:"linear-gradient(135deg,#00c6d7,#00f2ff)", color:"#070b12", boxShadow:"0 0 16px rgba(0,242,255,0.3)" }}>
                ⬡ Mint Credits
              </button>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black cursor-pointer"
                style={{ background:"linear-gradient(135deg,#00c6d7,#39d98a)", color:"#070b12" }}>
                {initials(user?.username)}
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 px-4 md:px-8 py-6 max-w-6xl w-full mx-auto">
          {page === "dashboard" && <DashboardPage {...pageProps} />}
          {page === "assets"    && <FarmAssetsPage {...pageProps} />}
          {page === "market"    && <MarketPage {...pageProps} />}
          {page === "history"   && <HistoryPage {...pageProps} />}
          {page === "security"  && <SecurityPage walletId={walletId} showToast={showToast} />}
          {page === "gallery"   && <GalleryPage mediaFiles={mediaFiles} showToast={showToast} />}
        </main>
      </div>

      {/* ── TOAST ── */}
      <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[999] px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 font-mono-code
        ${toast ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}
        style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(0,242,255,0.3)", color:"#e2e8f0", backdropFilter:"blur(16px)", boxShadow:"0 0 20px rgba(0,242,255,0.2)" }}>
        {toast}
      </div>

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple hidden
        onChange={(e) => { uploadFiles(e.target.files); e.target.value = ""; }} />
    </div>
  );
}