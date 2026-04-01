import { useState } from "react";

export default function SubmissionForm({ onRegistered, onBack }) {
  const [loading, setLoading] = useState(false);

  const handleMetaMask = async () => {
    try {
      setLoading(true);

      if (!window.ethereum) {
        alert("MetaMask not detected. Please install it.");
        return;
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const walletAddress = accounts[0];

      const userData = {
        username: "Farmer_" + walletAddress.slice(2, 7),
        walletId: walletAddress,
        createdAt: new Date().toISOString(),
        metaMask: true,
      };

      onRegistered(userData);

    } catch (err) {
      console.error(err);
      alert("MetaMask connection failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-10"
      style={{
        background:
          "radial-gradient(ellipse at 30% 20%, rgba(0,242,255,0.06) 0%, transparent 55%), radial-gradient(ellipse at 70% 80%, rgba(57,217,138,0.05) 0%, transparent 55%), #070b12"
      }}>

      {/* Background Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,242,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,242,255,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px"
        }}
      />

      <div className="w-full max-w-md relative z-10">
        
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm mb-8"
          style={{ color: "rgba(0,242,255,0.6)" }}
        >
          ← Back to Home
        </button>

        {/* Card */}
        <div
          className="rounded-3xl p-8"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(20px)"
          }}
        >

          {/* Header */}
          <div className="text-center mb-8">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
              style={{
                background:
                  "linear-gradient(135deg, rgba(0,242,255,0.12), rgba(57,217,138,0.12))",
                border: "1px solid rgba(0,242,255,0.25)"
              }}
            >
              🌱
            </div>

            <h1 className="text-2xl font-black mb-1.5">
              Connect Wallet
            </h1>

            <p className="text-sm text-gray-400">
              Join farmers earning carbon credits
            </p>
          </div>

          {/* MetaMask Button */}
          <button
            onClick={handleMetaMask}
            disabled={loading}
            className="w-full py-4 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, #00c6d7, #00f2ff)",
              color: "#070b12",
              boxShadow: "0 0 24px rgba(0,242,255,0.3)"
            }}
          >
            {loading ? "Connecting..." : "Connect Wallet →"}
          </button>

          {/* Footer */}
          <p className="text-center text-xs mt-6 text-gray-500">
            🔒 Secure · Non-custodial
          </p>
        </div>
      </div>
    </div>
  );
}