// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CarbonMRV {

    address public owner;

    struct Submission {
        address farmer;
        string ipfsCID;
        uint256 confidenceScore;
        uint256 carbonCredits;
        bool approved;
        uint256 timestamp;
    }

    mapping(address => uint256) public creditBalance;
    mapping(uint256 => Submission) public submissions;
    uint256 public submissionCount;

    event VerificationLogged(
        uint256 indexed submissionId,
        address indexed farmer,
        uint256 confidenceScore,
        bool approved,
        uint256 timestamp
    );

    event CreditMinted(
        address indexed farmer,
        uint256 amount,
        uint256 submissionId
    );

    event AccessGranted(
        uint256 indexed submissionId,
        address indexed verifier
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function logVerification(
        address farmer,
        string memory ipfsCID,
        uint256 confidenceScore,
        bool approved
    ) external onlyOwner returns (uint256) {
        uint256 id = submissionCount++;
        submissions[id] = Submission({
            farmer: farmer,
            ipfsCID: ipfsCID,
            confidenceScore: confidenceScore,
            carbonCredits: 0,
            approved: approved,
            timestamp: block.timestamp
        });

        emit VerificationLogged(id, farmer, confidenceScore, approved, block.timestamp);
        return id;
    }

    function mintCredit(
        address farmer,
        uint256 amount,
        uint256 submissionId
    ) external onlyOwner {
        require(submissions[submissionId].approved, "Submission not approved");
        require(submissions[submissionId].farmer == farmer, "Farmer mismatch");

        creditBalance[farmer] += amount;
        submissions[submissionId].carbonCredits = amount;

        emit CreditMinted(farmer, amount, submissionId);
    }

    function grantAccess(
        uint256 submissionId,
        address verifier
    ) external {
        require(submissions[submissionId].farmer == msg.sender, "Not your submission");
        emit AccessGranted(submissionId, verifier);
    }

    function getBalance(address farmer) external view returns (uint256) {
        return creditBalance[farmer];
    }

    function getSubmission(uint256 id) external view returns (Submission memory) {
        return submissions[id];
    }
}