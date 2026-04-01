// src/components/CreditWallet.jsx
// Wallet ID display card — used inside AdminDashboard

export default function CreditWallet({ walletId, username, createdAt, onCopy, onRegenerate, showToast }) {
  const handleCopy = () => {
    onCopy();
    showToast("Wallet ID copied! 📋");
  };

  const handleRegen = () => {
    onRegenerate();
    showToast("New Wallet ID generated! 🔄");
  };

  const date = createdAt
    ? new Date(createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "—";

  return (
    <div className="relative rounded-2xl p-8 overflow-hidden border border-amber-400/25 shadow-[0_0_40px_rgba(245,166,35,0.07)]"
      style={{ background: "linear-gradient(135deg,#111130,#0d1a28)" }}>

      {/* Dot pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Ccircle cx='20' cy='20' r='1' fill='rgba(245,166,35,0.07)'/%3E%3C/svg%3E")`,
          backgroundSize: "40px 40px"
        }} />

      {/* Glow orb */}
      <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-amber-400/5 blur-3xl pointer-events-none" />

      {/* Top row */}
      <div className="relative z-10 flex justify-between items-center mb-6">
        <span className="text-amber-400 text-[10px] tracking-[3px] font-mono bg-amber-400/10 border border-amber-400/25 px-3 py-1.5 rounded-full">
          WALLET ID
        </span>
        <span className="text-gray-600 text-xs font-mono">MetaMesh Network</span>
      </div>

      {/* Wallet ID */}
      <div className="relative z-10 font-mono text-sm md:text-base text-white tracking-widest break-all leading-relaxed mb-5"
        style={{ textShadow: "0 0 20px rgba(245,166,35,0.25)" }}>
        {walletId}
      </div>

      {/* Actions */}
      <div className="relative z-10 flex gap-3 mb-6">
        <button onClick={handleCopy}
          className="bg-white/5 border border-white/8 text-white text-xs px-4 py-2 rounded-md hover:bg-amber-400/15 hover:border-amber-400/50 hover:text-amber-400 transition-all">
          📋 Copy
        </button>
        <button onClick={handleRegen}
          className="bg-white/5 border border-white/8 text-white text-xs px-4 py-2 rounded-md hover:bg-amber-400/15 hover:border-amber-400/50 hover:text-amber-400 transition-all">
          🔄 New ID
        </button>
      </div>

      {/* Bottom info */}
      <div className="relative z-10 flex justify-between items-center text-xs font-mono text-gray-600 border-t border-white/5 pt-4">
        <span>@{username}</span>
        <span>Created {date}</span>
      </div>
    </div>
  );
}