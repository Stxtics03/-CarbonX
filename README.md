# MRV Carbon Credit Platform

A blockchain-powered platform for smallholder farmers in India to earn carbon credits through verified crop data submission.

## How it works

Farmers submit crop data and a receipt → AI verifies it → Smart contract mints carbon credits directly to the farmer's blockchain wallet.

## Stack

- **Frontend** — React + Vite + Tailwind CSS + ethers.js + MetaMask
- **Backend** — Python FastAPI + web3.py + PostgreSQL
- **Blockchain** — Solidity 0.8.20 + Hardhat + Sepolia testnet

## Project Structure

```
team-old_monkz/
├── blockchain/     → Smart contract, tests, deployment scripts
├── backend/        → FastAPI server, AI verification pipeline
└── frontend/       → React app, wallet connection, farmer dashboard
```

## Smart Contract

Deployed on Sepolia testnet at `0x8048A2c7Bed2292326498D8e3539B2aB16A4f2d5`

Functions: `logVerification`, `mintCredit`, `grantAccess`, `getBalance`, `getSubmission`

## Backend API

| Endpoint | Method | Description |
|---|---|---|
| `/submit` | POST | Submit crop data + receipt for verification |
| `/balance/:address` | GET | Get farmer's carbon credit balance |
| `/submission/:id` | GET | Fetch a submission record |
| `/health` | GET | Health check |

## AI Verification Pipeline

Confidence score = `(OCR × 0.3) + (regional × 0.4) + (historical × 0.3)`

- **≥ 80** → Auto approved, credits minted
- **50–79** → Manual review
- **< 50** → Rejected

## Setup

### Blockchain
```bash
cd blockchain
npm install
npx hardhat test
npx hardhat run scripts/deploy.js --network sepolia
```

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

Each folder needs a `.env` file. See `.env.example` in each directory.



## Hackathon

**BGSCET Hackathon** — Domain: Blockchain

> AI guarantees accuracy. Blockchain guarantees honesty. Neither works without the other.
