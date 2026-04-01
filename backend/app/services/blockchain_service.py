"""
blockchain_service.py
Connects Python FastAPI backend to the deployed CarbonMRV smart contract
on Sepolia testnet via web3.py.
"""

import json
import os
from pathlib import Path

from web3 import Web3
from web3.middleware import ExtraDataToPOAMiddleware
from dotenv import load_dotenv

load_dotenv()

SEPOLIA_RPC_URL  = os.getenv("SEPOLIA_RPC_URL")
PRIVATE_KEY      = os.getenv("PRIVATE_KEY")
CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS", "0x8048A2c7Bed2292326498D8e3539B2aB16A4f2d5")

w3 = Web3(Web3.HTTPProvider(SEPOLIA_RPC_URL))
w3.middleware_onion.inject(ExtraDataToPOAMiddleware, layer=0)

account = w3.eth.account.from_key(PRIVATE_KEY)

ABI_PATH = Path(__file__).resolve().parents[3] / \
    "blockchain" / "artifacts" / "contracts" / "CarbonMRV.sol" / "CarbonMRV.json"

with open(ABI_PATH) as f:
    abi = json.load(f)["abi"]

contract = w3.eth.contract(
    address=Web3.to_checksum_address(CONTRACT_ADDRESS),
    abi=abi
)

def _send_tx(fn):
    tx = fn.build_transaction({
        "from":     account.address,
        "nonce":    w3.eth.get_transaction_count(account.address),
        "gas":      300_000,
        "gasPrice": w3.eth.gas_price,
    })
    signed  = w3.eth.account.sign_transaction(tx, PRIVATE_KEY)
    tx_hash = w3.eth.send_raw_transaction(signed.rawTransaction)
    return w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)

def log_verification(farmer_address, ipfs_cid, confidence_score, approved):
    fn      = contract.functions.logVerification(
        Web3.to_checksum_address(farmer_address), ipfs_cid, confidence_score, approved
    )
    receipt = _send_tx(fn)
    logs    = contract.events.VerificationLogged().process_receipt(receipt)
    sub_id  = logs[0]["args"]["submissionId"] if logs else None
    return {
        "tx_hash":       receipt.transactionHash.hex(),
        "submission_id": sub_id,
        "status":        "success" if receipt.status == 1 else "failed",
    }

def mint_credit(farmer_address, amount, submission_id):
    fn      = contract.functions.mintCredit(
        Web3.to_checksum_address(farmer_address), amount, submission_id
    )
    receipt = _send_tx(fn)
    return {
        "tx_hash":     receipt.transactionHash.hex(),
        "new_balance": get_balance(farmer_address),
        "status":      "success" if receipt.status == 1 else "failed",
    }

def grant_access(submission_id, verifier_address):
    fn      = contract.functions.grantAccess(
        submission_id, Web3.to_checksum_address(verifier_address)
    )
    receipt = _send_tx(fn)
    return {
        "tx_hash": receipt.transactionHash.hex(),
        "status":  "success" if receipt.status == 1 else "failed",
    }

def get_balance(farmer_address):
    return contract.functions.getBalance(
        Web3.to_checksum_address(farmer_address)
    ).call()

def get_submission(submission_id):
    data = contract.functions.getSubmission(submission_id).call()
    return {
        "farmer_address":   data[0],
        "ipfs_cid":         data[1],
        "confidence_score": data[2],
        "approved":         data[3],
    }