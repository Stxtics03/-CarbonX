// src/components/WalletConnect.jsx
import { useEffect, useRef, useState } from "react";

export default function WalletConnect({ onGetStarted }) {
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupDismissed, setPopupDismissed] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);
  const [countersStarted, setCountersStarted] = useState(false);
  const [counts, setCounts] = useState({ wallets: 0, uptime: 0, countries: 0 });
  const triggerRef = useRef(null);
  const statsRef = useRef(null);
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  // Particle Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const mkParticle = () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.4 + 0.3,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      alpha: Math.random() * 0.45 + 0.1,
      color: Math.random() > 0.65 ? "#f5a623" : "#00e5ff",
    });

    const init = () => { particles = Array.from({ length: 100 }, mkParticle); };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x = (p.x + p.vx + canvas.width) % canvas.width;
        p.y = (p.y + p.vy + canvas.height) % canvas.height;
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      // connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 100) {
            ctx.save();
            ctx.globalAlpha = ((100 - d) / 100) * 0.1;
            ctx.strokeStyle = "#f5a623";
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
            ctx.restore();
          }
        }
      }
      animRef.current = requestAnimationFrame(draw);
    };

    resize();
    init();
    draw();
    window.addEventListener("resize", () => { resize(); init(); });
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  // Navbar scroll
  useEffect(() => {
    const handler = () => setNavScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Scroll popup
  useEffect(() => {
    if (!triggerRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !popupDismissed) {
          setTimeout(() => setPopupVisible(true), 400);
        }
      },
      { threshold: 0.4 }
    );
    obs.observe(triggerRef.current);
    return () => obs.disconnect();
  }, [popupDismissed]);

  // Counter animation
  useEffect(() => {
    if (!statsRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !countersStarted) {
          setCountersStarted(true);
          animateCounter("wallets", 2400000, 2000);
          animateCounter("uptime", 99, 1500);
          animateCounter("countries", 180, 1800);
        }
      },
      { threshold: 0.5 }
    );
    obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, [countersStarted]);

  const animateCounter = (key, target, dur) => {
    const steps = 60;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      const val = Math.min(Math.round((target / steps) * step), target);
      setCounts((prev) => ({ ...prev, [key]: val }));
      if (step >= steps) clearInterval(interval);
    }, dur / steps);
  };

  const dismissPopup = () => {
    setPopupVisible(false);
    setPopupDismissed(true);
  };

  const features = [
    { icon: "🔑", title: "Zero-Knowledge Auth", desc: "Your keys, your wallet. No central authority controls your identity." },
    { icon: "📸", title: "Media Vault", desc: "Upload photos and videos encrypted directly to your wallet profile." },
    { icon: "🌐", title: "Unique Wallet ID", desc: "Every wallet gets a globally unique cryptographic identifier." },
    { icon: "⚡", title: "Instant Access", desc: "Sub-second login with mobile number + password authentication." },
  ];

  return (
    <div className="relative overflow-x-hidden" style={{ fontFamily: "'Orbitron', 'Rajdhani', sans-serif" }}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;600&display=swap');
        @keyframes bounceArrow { 0%,100%{transform:rotate(45deg) translateY(0)} 50%{transform:rotate(45deg) translateY(8px)} }
        @keyframes glitch1 { 0%,90%,100%{transform:translate(0)} 92%{transform:translate(-3px,1px)} 95%{transform:translate(3px,-1px)} }
        @keyframes glitch2 { 0%,88%,100%{transform:translate(0)} 90%{transform:translate(3px,-2px)} 93%{transform:translate(-3px,1px)} }
        @keyframes spinRing { to{transform:translate(-50%,-50%) rotate(360deg)} }
        @keyframes floatOrb { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-20px)} }
        .glitch::before,.glitch::after{content:attr(data-text);position:absolute;left:0;top:0;width:100%;height:100%}
        .glitch::before{color:#f5a623;animation:glitch1 3s infinite;clip-path:polygon(0 0,100% 0,100% 35%,0 35%);opacity:.7}
        .glitch::after{color:#00e5ff;animation:glitch2 3s infinite;clip-path:polygon(0 65%,100% 65%,100% 100%,0 100%);opacity:.5}
        .ring1{animation:spinRing 12s linear infinite;border-style:dashed}
        .ring2{animation:spinRing 8s linear infinite reverse}
        .ring3{animation:spinRing 5s linear infinite}
        .orb-float{animation:floatOrb 6s ease-in-out infinite}
      `}</style>

      {/* Particle Canvas */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 opacity-35" />

      {/* NAV */}
      <nav className={`fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-8 md:px-16 py-5 transition-all duration-300 ${navScrolled ? "bg-[#050508]/95 border-b border-amber-900/20" : "bg-gradient-to-b from-[#050508]/90 to-transparent"}`}>
        <div className="flex items-center gap-2 text-amber-400 font-bold text-lg tracking-widest" style={{ fontFamily: "'Orbitron',monospace" }}>
          <span className="text-2xl">⬡</span> MetaMesh
        </div>
        <div className="flex items-center gap-8">
          <a href="#features" className="text-gray-500 hover:text-white text-sm tracking-widest uppercase transition-colors hidden md:block">Features</a>
          <a href="#stats" className="text-gray-500 hover:text-white text-sm tracking-widest uppercase transition-colors hidden md:block">Stats</a>
          <button onClick={onGetStarted} className="bg-amber-400 text-[#050508] px-5 py-2 text-sm font-bold tracking-wider rounded hover:bg-amber-300 hover:shadow-[0_0_20px_rgba(245,166,35,0.4)] transition-all">
            Launch App
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden z-10">
        {/* Grid bg */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "linear-gradient(rgba(245,166,35,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(245,166,35,0.04) 1px,transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%,black 30%,transparent 100%)"
        }} />
        {/* Orbs */}
        <div className="absolute top-10 -left-20 w-96 h-96 rounded-full bg-amber-400/5 blur-3xl orb-float pointer-events-none" />
        <div className="absolute bottom-20 right-0 w-72 h-72 rounded-full bg-cyan-400/4 blur-3xl pointer-events-none" style={{ animationDelay: "2s" }} />

        <div className="relative z-10 text-center max-w-4xl px-8">
          <div className="inline-block bg-amber-400/10 border border-amber-700/40 text-amber-400 text-xs tracking-widest px-5 py-2 rounded-full mb-8" style={{ fontFamily: "'Orbitron',monospace" }}>
            🔐 Web3 Identity Layer
          </div>
          <div className="flex flex-col gap-1 mb-6">
            <span className="text-gray-500 tracking-[0.5em] text-xs md:text-sm" style={{ fontFamily: "'Orbitron',monospace" }}>WELCOME TO</span>
            <h1 className="text-6xl md:text-9xl font-black leading-none" style={{ fontFamily: "'Orbitron',monospace" }}>
              META<em className="not-italic text-amber-400" style={{ textShadow: "0 0 40px rgba(245,166,35,0.5)" }}>MESH</em>
            </h1>
            <span className="text-gray-500 tracking-[0.4em] text-xs" style={{ fontFamily: "'Orbitron',monospace" }}>YOUR SOVEREIGN WALLET</span>
          </div>
          <p className="text-gray-400 text-base md:text-lg leading-relaxed max-w-xl mx-auto mb-12" style={{ fontFamily: "'Rajdhani',sans-serif" }}>
            Own your digital identity. Store assets, media, and memories — cryptographically sealed, forever yours.
          </p>
          <div className="flex flex-col items-center gap-3 text-gray-600 text-xs tracking-widest uppercase" style={{ fontFamily: "'Rajdhani',sans-serif" }}>
            <span>Scroll to begin</span>
            <div className="border-r-2 border-b-2 border-amber-400 w-4 h-4" style={{ animation: "bounceArrow 1.5s infinite" }} />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="relative z-10 max-w-6xl mx-auto px-8 py-24">
        <div className="text-amber-400 text-xs tracking-[4px] mb-12 font-mono">// CORE FEATURES</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div key={i} className="bg-[#0f0f1a] border border-amber-900/20 rounded-lg p-8 hover:-translate-y-2 hover:border-amber-400/60 hover:shadow-[0_0_30px_rgba(245,166,35,0.08)] transition-all duration-300 group">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-white font-bold text-sm tracking-wide mb-2" style={{ fontFamily: "'Orbitron',monospace" }}>{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed" style={{ fontFamily: "'Rajdhani',sans-serif" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* STATS */}
      <section id="stats" ref={statsRef} className="relative z-10 flex flex-col md:flex-row items-center justify-center py-16 border-y border-amber-900/15"
        style={{ background: "linear-gradient(135deg,rgba(245,166,35,0.04),rgba(0,229,255,0.02))" }}>
        {[
          { val: counts.wallets >= 1000000 ? (counts.wallets / 1000000).toFixed(1) + "M+" : counts.wallets + "+", label: "Wallets Created" },
          { val: counts.uptime + "%", label: "Uptime" },
          { val: counts.countries + "+", label: "Countries" },
        ].map((s, i) => (
          <div key={i} className="flex items-center">
            <div className="text-center px-12 py-6">
              <span className="block text-4xl md:text-5xl font-black text-amber-400" style={{ fontFamily: "'Orbitron',monospace" }}>{s.val}</span>
              <span className="text-gray-500 text-xs tracking-widest uppercase mt-2 block" style={{ fontFamily: "'Rajdhani',sans-serif" }}>{s.label}</span>
            </div>
            {i < 2 && <div className="hidden md:block w-px h-16 bg-amber-900/20" />}
          </div>
        ))}
      </section>

      {/* TRIGGER ZONE */}
      <section ref={triggerRef} className="relative z-10 h-[60vh] flex items-center justify-center text-center px-8">
        <div>
          <div className="glitch relative text-2xl md:text-4xl font-black tracking-wider text-white" data-text="READY TO OWN YOUR IDENTITY?" style={{ fontFamily: "'Orbitron',monospace" }}>
            READY TO OWN YOUR IDENTITY?
          </div>
          <p className="text-gray-600 tracking-widest text-sm mt-4" style={{ fontFamily: "'Rajdhani',sans-serif" }}>Your decentralized future starts with one wallet.</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 text-center py-12 border-t border-amber-900/15 text-gray-600 text-sm">
        <div className="flex items-center justify-center gap-2 text-amber-400 mb-2" style={{ fontFamily: "'Orbitron',monospace" }}>
          <span>⬡</span> MetaMesh
        </div>
        © 2025 MetaMesh Protocol. All rights reserved.
      </footer>

      {/* POPUP OVERLAY */}
      <div className={`fixed inset-0 z-[1000] flex items-center justify-center transition-all duration-500 ${popupVisible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        style={{ background: "rgba(5,5,8,0.85)", backdropFilter: "blur(8px)" }}
        onClick={(e) => { if (e.target === e.currentTarget) dismissPopup(); }}>
        <div className={`relative bg-[#0f0f1a] border border-amber-400/60 rounded-xl p-10 md:p-14 max-w-md w-[90%] text-center transition-all duration-500 overflow-hidden
          ${popupVisible ? "scale-100 translate-y-0" : "scale-90 translate-y-10"}
          shadow-[0_0_60px_rgba(245,166,35,0.2)]`}>
          {/* Hex bg pattern */}
          <div className="absolute inset-0 opacity-30 pointer-events-none" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cpolygon points='30,5 55,18 55,42 30,55 5,42 5,18' fill='none' stroke='rgba(245,166,35,0.08)' stroke-width='1'/%3E%3C/svg%3E")`,
            backgroundSize: "60px 60px"
          }} />
          <button onClick={dismissPopup} className="absolute top-4 right-5 text-gray-600 hover:text-white text-lg transition-colors z-10">✕</button>
          <div className="text-5xl text-amber-400 mb-4 relative z-10">⬡</div>
          <h2 className="text-2xl font-black text-white mb-3 relative z-10" style={{ fontFamily: "'Orbitron',monospace" }}>Create Your Wallet</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-6 relative z-10" style={{ fontFamily: "'Rajdhani',sans-serif" }}>
            Join 2.4 million users securing their digital world with MetaMesh.
          </p>
          <ul className="text-left text-gray-400 text-sm space-y-2 mb-8 relative z-10" style={{ fontFamily: "'Rajdhani',sans-serif" }}>
            {["Unique Wallet ID generated instantly", "Upload & encrypt personal media", "Mobile-first secure login"].map((b, i) => (
              <li key={i}>✔ {b}</li>
            ))}
          </ul>
          <button onClick={() => { dismissPopup(); onGetStarted(); }}
            className="relative z-10 w-full bg-amber-400 text-[#050508] font-black py-4 rounded tracking-widest text-sm hover:bg-amber-300 hover:shadow-[0_0_30px_rgba(245,166,35,0.5)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3"
            style={{ fontFamily: "'Orbitron',monospace" }}>
            Initialize Wallet <span>→</span>
          </button>
          <p className="text-gray-600 text-xs mt-4 relative z-10">
            Already have a wallet?{" "}
            <button onClick={() => { dismissPopup(); onGetStarted(); }} className="text-amber-400 hover:underline">Sign in</button>
          </p>
        </div>
      </div>
    </div>
  );
}