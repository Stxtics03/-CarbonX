# 🌿 CarbonX — MRV Carbon Credit Platform

---

##  🔗  Project Links

🎥 Demo Video | [https://drive.google.com/file/d/1ghOpESsIZMJ5dx5kZwNEqL6hZWI6ietp/view?usp=sharing](#) 

📊 Presentation (PPT) | https://docs.google.com/presentation/d/1_2cBuN0rAdd36r0gvoUJA65-po6VGU5C/edit?usp=sharing&ouid=100983011210667868654&rtpof=true&sd=true
---

## 📌 The Problem

All scale types of farmers in India practice sustainable agriculture every day — reduced tilling, crop rotation, organic methods — but they earn nothing from it. Carbon markets exist to reward exactly this behavior, but traditional MRV (Measurement, Reporting, and Verification) systems are:

- **Too expensive** — verification costs $50–$200 per farmer
- **Too slow** — credits take months to arrive
- **Too manual** — designed for large industrial farms, not smallholders
- **Untrustworthy** — no audit trail, data can be falsified

The result: millions of Indian farmers are locked out of a market that was built for them.

---

## 💡 Our Solution

**CarbonX** is a web-based MRV platform that combines AI-powered verification with blockchain-secured credit issuance to make carbon markets accessible, fast, and trustworthy for smallholder farmers.

```
Farmer submits crop data + receipt
            ↓
   AI pipeline verifies it
   (OCR + Anomaly Detection + Regional Check)
            ↓
   Confidence score calculated
            ↓
   Smart contract mints carbon credits
   directly to farmer's blockchain wallet
            ↓
   Immutable audit trail logged on-chain
```

**Verification cost drops from $50–200 → under $5. Credits arrive in minutes, not months.**

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│           FRONTEND  (React + Vite + Tailwind)   │
│   MetaMask Login · Submission Form · Dashboard  │
└────────────────────┬────────────────────────────┘
                     ↓ POST /submit
┌─────────────────────────────────────────────────┐
│           BACKEND  (Python FastAPI)             │
│  OCR → Anomaly Detection → Regional Check       │
│  Historical Check → Confidence Score            │
│  Carbon Calculator (IPCC Tier 1 factors)        │
└────────────────────┬────────────────────────────┘
                     ↓ web3.py
┌─────────────────────────────────────────────────┐
│         BLOCKCHAIN  (Solidity + Hardhat)        │
│  logVerification() → immutable on-chain record  │
│  mintCredit()      → tokens to farmer wallet    │
│  grantAccess()     → verifier permissions       │
│  Deployed on Sepolia Testnet via Alchemy        │
└─────────────────────────────────────────────────┘
```

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, ethers.js |
| Backend | Python 3.14, FastAPI, web3.py, pytesseract, scikit-learn |
| Blockchain | Solidity 0.8.20, Hardhat, Sepolia Testnet, Alchemy RPC |
| Database | PostgreSQL (regional yields + submissions) |
| Storage | IPFS (encrypted farmer receipts) |
| Identity | MetaMask wallet — no username or password |
| ML Model | Isolation Forest (anomaly detection) |
| Data Source | ICRISAT VDSA district-level yield database |

---

## 🔑 Key Features

- **MetaMask wallet login** — farmer's wallet address is their identity, zero central credential store
- **OCR receipt scanning** — pytesseract extracts crop type, quantity, and region automatically
- **ML anomaly detection** — Isolation Forest + 5 rule-based flags catch fraudulent submissions
- **Regional cross-check** — submitted yields compared against ICRISAT district averages
- **Historical cross-check** — flags sudden spikes vs farmer's own past submissions
- **Confidence scoring** — `(OCR × 0.3) + (Regional × 0.4) + (Historical × 0.3)`
- **Carbon calculation** — IPCC Tier 1 emission factors for 30+ Indian crops
- **On-chain credit minting** — Solidity smart contract issues tokens directly to farmer wallet
- **Immutable audit trail** — every verification event permanently logged as blockchain event
- **Live market dashboard** — farmers can track, trade, and withdraw their GRN credits

---

## 📊 Confidence Scoring System

| Score | Decision | Action |
|-------|----------|--------|
| ≥ 80 | Auto-approved | Credits minted instantly to wallet |
| 50–79 | Manual review | Sent to admin dashboard for human check |
| < 50 | Rejected | Submission flagged, no credits issued |

---

## 🔗 Smart Contract

**Contract:** `CarbonMRV.sol`
**Network:** Sepolia Testnet
**Address:** `0x8048A2c7Bed2292326498D8e3539B2aB16A4f2d5`

| Function | Description |
|----------|-------------|
| `logVerification()` | Records AI verification result permanently on-chain |
| `mintCredit()` | Mints carbon credit tokens to farmer's wallet |
| `grantAccess()` | Farmer grants verifier access to encrypted submission |
| `getBalance()` | Returns farmer's current carbon credit balance |
| `getSubmission()` | Fetches any submission record by ID |

---

## 📁 Project Structure

```
team-old_monkz/
├── frontend/                   # React + Vite + Tailwind (Bhanu)
│   └── src/
│       ├── components/
│       │   ├── WalletConnect.jsx
│       │   ├── SubmissionForm.jsx
│       │   ├── CreditWallet.jsx
│       │   └── AdminDashboard.jsx
│       └── hooks/
│           └── useWallet.js
│
├── backend/                    # Python FastAPI (Yatish)
│   ├── main.py
│   ├── app/
│   │   ├── routes/
│   │   │   ├── submit.py
│   │   │   └── verify.py
│   │   └── services/
│   │       ├── ocr.py
│   │       ├── anomaly.py
│   │       ├── regional_check.py
│   │       ├── historical_check.py
│   │       ├── carbon_calc.py
│   │       └── blockchain_service.py
│   └── data/
│       └── regional_yields.csv
│
└── blockchain/                 # Solidity + Hardhat (Shrestha)
    ├── contracts/
    │   └── CarbonMRV.sol
    ├── scripts/
    │   ├── deploy.js
    │   └── interact.js
    └── test/
        └── CarbonMRV.test.js
```

---

## 🚀 Running Locally

### Prerequisites
- Node.js v18+
- Python 3.10+
- PostgreSQL
- MetaMask browser extension
- Tesseract OCR installed

### 1. Clone the repo
```bash
git clone https://github.com/AdvayaBGSCET/team-old_monkz.git
cd team-old_monkz
```

### 2. Blockchain
```bash
cd blockchain
npm install
cp .env.example .env
# Fill in SEPOLIA_RPC_URL, PRIVATE_KEY, CONTRACT_ADDRESS
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
```

### 3. Backend
```bash
cd backend
python -m pip install -r requirements.txt
cp .env.example .env
# Fill in DATABASE_URL, SEPOLIA_RPC_URL, PRIVATE_KEY, CONTRACT_ADDRESS
python -m uvicorn main:app --reload
# Runs at http://127.0.0.1:8000
```

### 4. Frontend
```bash
cd frontend
npm install
cp .env.example .env
# Fill in VITE_BACKEND_URL, VITE_CONTRACT_ADDRESS
npm run dev
# Runs at http://localhost:5173
```

---

## 🌍 Impact

| Metric | Traditional MRV | CarbonX |
|--------|----------------|---------|
| Verification cost | $50–$200 per farmer | < $5 per farmer |
| Credit delivery time | 3–6 months | Minutes |
| Fraud prevention | Manual checks | AI + blockchain |
| Audit trail | Paper records | Immutable on-chain |
| Farmer access | Large farms only | Any smartphone |


---

## 👥 Team — Old Monkz

| Member | Role | Responsibility |
|--------|------|---------------|
| **Shrestha** | Blockchain Lead | Solidity contract, Hardhat, deployment, web3 integration |
| **Yatish** | Backend Lead | FastAPI, AI/ML pipeline, OCR, carbon calculator |
| **Bhanu** | Frontend Lead | React, Tailwind, MetaMask connect, dashboard UI |

---



---

<p align="center">Made with 🌿 by Team Old Monkz · BGSCET · 2026</p>
