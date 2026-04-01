// src/App.jsx
import './index.css';
import { useState } from "react";
import WalletConnect from "./components/WalletConnect";
import SubmissionForm from "./components/SubmissionForm";
import AdminDashboard from "./components/AdminDashboard";

// Pages: "landing" | "register" | "dashboard"
export default function App() {
  const [page, setPage] = useState("landing");
  const [user, setUser] = useState(null);

  const handleRegistered = (userData) => {
    setUser(userData);
    setPage("dashboard");
  };

  return (
    <div className="min-h-screen bg-[#050508] text-white font-sans">
      {page === "landing" && (
        <WalletConnect onGetStarted={() => setPage("register")} />
      )}
      {page === "register" && (
        <SubmissionForm
          onRegistered={handleRegistered}
          onBack={() => setPage("landing")}
        />
      )}
      {page === "dashboard" && (
        <AdminDashboard
          user={user}
          onLogout={() => { setUser(null); setPage("landing"); }}
        />
      )}
    </div>
  );
}