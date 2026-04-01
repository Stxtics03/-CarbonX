// src/components/AdminDashboard.jsx
import { useState, useRef, useCallback } from "react";
import CreditWallet from "./CreditWallet";
import { useWallet } from "../hooks/useWallet";

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export default function AdminDashboard({ user, onLogout }) {
  const [activeSection, setActiveSection] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [lightbox, setLightbox] = useState(null);
  const [toast, setToast] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef(null);

  const {
    walletId, regenerateWallet, copyWalletId,
    mediaFiles, uploading, uploadFiles, deleteMedia, stats,
  } = useWallet(user);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const handleCopy = () => { copyWalletId(); showToast("Wallet ID copied! 📋"); };
  const handleRegen = () => { regenerateWallet(); showToast("New Wallet ID generated! 🔄"); };

  const handleFiles = useCallback((files) => {
    const valid = [...files].filter((f) => {
      if (!f.type.startsWith("image/") && !f.type.startsWith("video/")) return false;
      if (f.size > 52428800) { showToast(`${f.name} exceeds 50MB`); return false; }
      return true;
    });
    uploadFiles(valid);
  }, [uploadFiles]);

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const filtered = filter === "all" ? mediaFiles : mediaFiles.filter((m) => m.type === filter);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const navItems = [
    { id: "overview", icon: "🏠", label: "Overview" },
    { id: "media", icon: "📁", label: "My Media" },
    { id: "security", icon: "🔐", label: "Security" },
    { id: "settings", icon: "⚙️", label: "Settings" },
  ];

  const initials = (name) => (name || "?").slice(0, 2).toUpperCase();

  return (
    <div className="flex min-h-screen bg-[#080810]" style={{ fontFamily: "'Syne','IBM Plex Mono',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap');`}</style>

      {/* SIDEBAR */}
      <aside className={`fixed top-0 left-0 h-full w-60 bg-[#0d0d1c] border-r border-white/5 flex flex-col p-5 z-50 transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>

        <div className="flex items-center gap-2 text-amber-400 tracking-widest text-sm font-mono font-bold mb-12">
          <span className="text-2xl">⬡</span> MetaMesh
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map((item) => (
            <button key={item.id}
              onClick={() => { setActiveSection(item.id); setSidebarOpen(false); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all text-left
                ${activeSection === item.id
                  ? "bg-amber-400/12 text-amber-400"
                  : "text-gray-600 hover:text-white hover:bg-white/4"}`}>
              <span className="text-base">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2 p-3 bg-white/3 border border-white/6 rounded-xl">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-teal-400 flex items-center justify-center text-xs font-black text-[#080810] shrink-0">
            {initials(user?.username)}
          </div>
          <div className="flex-1 min-w-0">
            <span className="block text-xs font-bold text-white truncate">{user?.username}</span>
            <span className="text-xs text-green-400">● Active</span>
          </div>
          <button onClick={onLogout} className="text-gray-600 hover:text-red-400 transition-colors text-sm" title="Logout">⏻</button>
        </div>
      </aside>

      {/* Sidebar overlay mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* MAIN */}
      <div className="flex-1 md:ml-60 flex flex-col min-h-screen">

        {/* TOPBAR */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 md:px-9 py-5 border-b border-white/5 bg-[#080810]/85 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden text-white text-xl">☰</button>
            <span className="font-bold text-white text-base capitalize">{activeSection === "overview" ? "Overview" : navItems.find((n) => n.id === activeSection)?.label}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative text-xl cursor-pointer">🔔<span className="absolute top-0 right-0 w-2 h-2 bg-amber-400 rounded-full" /></div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-teal-400 flex items-center justify-center text-xs font-black text-[#080810] cursor-pointer">
              {initials(user?.username)}
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 p-6 md:p-9 max-w-5xl w-full mx-auto">

          {/* ── OVERVIEW ── */}
          {activeSection === "overview" && (
            <div className="space-y-8">
              {/* Welcome */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-2">
                <div>
                  <p className="text-gray-500 text-sm mb-1">{greeting} 👋</p>
                  <h1 className="text-4xl font-black text-white">{user?.username}</h1>
                </div>
                <div className="text-gray-600 text-xs font-mono text-right leading-relaxed">
                  {now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}<br />
                  {now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>

              {/* Wallet Card */}
              <CreditWallet
                walletId={walletId}
                username={user?.username}
                createdAt={user?.createdAt}
                onCopy={copyWalletId}
                onRegenerate={regenerateWallet}
                showToast={showToast}
              />

              {/* Stat Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: "📸", val: stats.photos, label: "Photos" },
                  { icon: "🎬", val: stats.videos, label: "Videos" },
                  { icon: "💾", val: stats.storage, label: "Storage Used" },
                  { icon: "🔒", val: "100%", label: "Encrypted" },
                ].map((s, i) => (
                  <div key={i} className="bg-[#111122] border border-white/6 rounded-xl p-5 flex items-center gap-4 hover:border-amber-400/40 hover:-translate-y-1 transition-all duration-200">
                    <span className="text-3xl">{s.icon}</span>
                    <div>
                      <span className="block text-xl font-black text-white">{s.val}</span>
                      <span className="text-gray-600 text-xs">{s.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── MEDIA VAULT ── */}
          {activeSection === "media" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-white mb-1">My Media Vault</h2>
                <p className="text-gray-500 text-sm">Upload and manage your encrypted photos & videos.</p>
              </div>

              {/* Upload Zone */}
              <div
                className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all
                  ${dragging ? "border-amber-400 bg-amber-400/8 shadow-[0_0_20px_rgba(245,166,35,0.12)]" : "border-amber-900/25 bg-amber-400/4 hover:border-amber-400/40"}`}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}>
                <div className="text-5xl mb-3">☁️</div>
                <p className="font-bold text-white mb-2">Drag & Drop Files Here</p>
                <p className="text-gray-500 text-xs mb-5">Supports JPG, PNG, GIF, MP4, MOV, WebM · Max 50MB each</p>
                <button type="button"
                  className="bg-amber-400 text-[#080810] font-bold text-sm px-6 py-2.5 rounded-md hover:bg-amber-300 hover:shadow-[0_0_20px_rgba(245,166,35,0.3)] transition-all"
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                  Browse Files
                </button>
                <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple hidden onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }} />
              </div>

              {/* Upload Progress */}
              {uploading.length > 0 && (
                <div className="space-y-2">
                  {uploading.map((u) => (
                    <div key={u.id} className="bg-[#111122] border border-white/5 rounded-lg px-4 py-3 flex items-center gap-3 text-sm">
                      <span>📤</span>
                      <span className="flex-1 truncate text-white text-xs">{u.name}</span>
                      <div className="w-28 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${u.progress}%` }} />
                      </div>
                      <span className="text-gray-500 text-xs w-10 text-right">{u.progress}%</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Filter */}
              <div className="flex gap-2">
                {["all", "image", "video"].map((f) => (
                  <button key={f} onClick={() => setFilter(f)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all capitalize
                      ${filter === f ? "bg-amber-400/12 border-amber-400/50 text-amber-400" : "bg-white/3 border-white/6 text-gray-500 hover:text-white"}`}>
                    {f === "all" ? "All" : f === "image" ? "Photos" : "Videos"}
                  </button>
                ))}
              </div>

              {/* Media Grid */}
              {filtered.length === 0 ? (
                <div className="text-center py-16 text-gray-600">
                  <span className="text-5xl block mb-3">🗂️</span>
                  <p>No media yet. Upload your first file!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {filtered.map((media) => (
                    <div key={media.id} className="group relative bg-[#111122] border border-white/5 rounded-xl overflow-hidden cursor-pointer hover:border-amber-400/40 hover:scale-[1.02] transition-all"
                      onClick={() => setLightbox(media)}>
                      {media.type === "image" ? (
                        <img src={media.url} alt={media.name} className="w-full aspect-square object-cover" />
                      ) : (
                        <div className="w-full aspect-square bg-[#0a0a1a] flex items-center justify-center text-4xl">🎬</div>
                      )}
                      <div className="absolute inset-0 bg-amber-400/15 opacity-0 group-hover:opacity-100 flex items-center justify-center text-2xl transition-opacity">
                        {media.type === "image" ? "🔍" : "▶"}
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); deleteMedia(media.id); }}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500/80 text-white text-xs hidden group-hover:flex items-center justify-center hover:bg-red-500 transition-all">
                        ✕
                      </button>
                      <div className="p-2 border-t border-white/5">
                        <p className="text-xs text-gray-500 truncate">{media.name}</p>
                        <p className="text-[10px] text-gray-700 font-mono mt-0.5">{media.sizeLabel}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── SECURITY ── */}
          {activeSection === "security" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-white mb-1">Security</h2>
                <p className="text-gray-500 text-sm">Your wallet's protection status.</p>
              </div>
              <div className="space-y-4">
                {[
                  { icon: "✅", title: "End-to-End Encryption", desc: "All media encrypted with AES-256.", ok: true },
                  { icon: "✅", title: "Unique Wallet ID", desc: "Cryptographically generated, non-repeatable.", ok: true },
                  { icon: "⚠️", title: "2FA Not Enabled", desc: "Enable two-factor authentication for extra protection.", ok: false },
                  { icon: "✅", title: "Secure Session", desc: "Your session expires after 24 hours automatically.", ok: true },
                ].map((item, i) => (
                  <div key={i} className={`bg-[#111122] border rounded-xl p-5 flex items-start gap-4 ${item.ok ? "border-white/6" : "border-yellow-500/20"}`}>
                    <span className="text-2xl shrink-0">{item.icon}</span>
                    <div>
                      <strong className="block text-sm text-white mb-1">{item.title}</strong>
                      <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── SETTINGS ── */}
          {activeSection === "settings" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-white mb-1">Settings</h2>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Display Name", val: user?.username },
                  { label: "Mobile Number", val: user?.mobile },
                  { label: "Theme", val: "Dark (Default)" },
                ].map((row, i) => (
                  <div key={i} className="bg-[#111122] border border-white/6 rounded-xl px-6 py-4 flex items-center justify-between">
                    <div>
                      <strong className="block text-sm text-white mb-1">{row.label}</strong>
                      <p className="text-gray-500 text-xs">{row.val}</p>
                    </div>
                    <button className="bg-white/4 border border-white/8 text-white text-xs px-4 py-2 rounded-lg hover:bg-amber-400/12 hover:border-amber-400/40 hover:text-amber-400 transition-all">Edit</button>
                  </div>
                ))}
                <div className="bg-[#111122] border border-red-500/15 rounded-xl px-6 py-4 flex items-center justify-between">
                  <div>
                    <strong className="block text-sm text-white mb-1">Delete Wallet</strong>
                    <p className="text-gray-500 text-xs">Permanently remove your wallet and all data.</p>
                  </div>
                  <button className="bg-white/4 border border-red-500/20 text-red-400 text-xs px-4 py-2 rounded-lg hover:bg-red-500/10 transition-all">Delete</button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* LIGHTBOX */}
      {lightbox && (
        <div className="fixed inset-0 z-[500] bg-[#080810]/95 flex items-center justify-center backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setLightbox(null); }}>
          <button onClick={() => setLightbox(null)} className="absolute top-5 right-7 text-gray-500 hover:text-white text-2xl transition-colors">✕</button>
          {lightbox.type === "image" ? (
            <img src={lightbox.url} alt={lightbox.name} className="max-w-[90vw] max-h-[85vh] rounded-xl object-contain" />
          ) : (
            <video src={lightbox.url} controls autoPlay className="max-w-[90vw] max-h-[85vh] rounded-xl" />
          )}
        </div>
      )}

      {/* TOAST */}
      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[999] bg-[#111122] border border-amber-400/50 text-amber-400 text-sm font-mono px-6 py-3 rounded-lg shadow-xl transition-all duration-300
        ${toast ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
        {toast}
      </div>
    </div>
  );
}