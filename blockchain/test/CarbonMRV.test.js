const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CarbonMRV", function () {
  let carbonMRV;
  let owner, farmer, verifier;

  beforeEach(async function () {
    [owner, farmer, verifier] = await ethers.getSigners();
    const CarbonMRV = await ethers.getContractFactory("CarbonMRV");
    carbonMRV = await CarbonMRV.deploy();
    await carbonMRV.waitForDeployment();
  });

  // ─── logVerification ───────────────────────────────────────────────────────

  describe("logVerification", function () {
    it("should log a verification entry and emit event", async function () {
      await expect(
        carbonMRV.logVerification(farmer.address, "QmTestCID123", 85, true)
      ).to.emit(carbonMRV, "VerificationLogged");
    });

    it("should store the submission correctly", async function () {
      await carbonMRV.logVerification(farmer.address, "QmTestCID456", 72, false);

      const submission = await carbonMRV.getSubmission(0); // IDs start at 0
      expect(submission.farmer).to.equal(farmer.address);
      expect(submission.ipfsCID).to.equal("QmTestCID456");
      expect(submission.confidenceScore).to.equal(72);
      expect(submission.approved).to.equal(false);
    });

    it("should increment submission IDs correctly", async function () {
      await carbonMRV.logVerification(farmer.address, "QmCID1", 80, true);
      await carbonMRV.logVerification(farmer.address, "QmCID2", 90, true);

      const sub0 = await carbonMRV.getSubmission(0);
      const sub1 = await carbonMRV.getSubmission(1);

      expect(sub0.ipfsCID).to.equal("QmCID1");
      expect(sub1.ipfsCID).to.equal("QmCID2");
    });

    it("should only allow owner to call logVerification", async function () {
      await expect(
        carbonMRV.connect(farmer).logVerification(farmer.address, "QmCID", 80, true)
      ).to.be.revertedWith("Not authorized");
    });
  });

  // ─── mintCredit ────────────────────────────────────────────────────────────

  describe("mintCredit", function () {
    it("should mint credits to farmer and increase balance", async function () {
      await carbonMRV.logVerification(farmer.address, "QmTestCID", 85, true); // id=0
      await carbonMRV.mintCredit(farmer.address, 10, 0);

      const balance = await carbonMRV.getBalance(farmer.address);
      expect(balance).to.equal(10);
    });

    it("should emit CreditMinted event", async function () {
      await carbonMRV.logVerification(farmer.address, "QmTestCID", 85, true); // id=0

      await expect(carbonMRV.mintCredit(farmer.address, 5, 0))
        .to.emit(carbonMRV, "CreditMinted")
        .withArgs(farmer.address, 5, 0);
    });

    it("should accumulate balance on multiple mints", async function () {
      await carbonMRV.logVerification(farmer.address, "QmCID1", 85, true); // id=0
      await carbonMRV.logVerification(farmer.address, "QmCID2", 90, true); // id=1

      await carbonMRV.mintCredit(farmer.address, 10, 0);
      await carbonMRV.mintCredit(farmer.address, 5, 1);

      const balance = await carbonMRV.getBalance(farmer.address);
      expect(balance).to.equal(15);
    });

    it("should revert if submission is not approved", async function () {
      await carbonMRV.logVerification(farmer.address, "QmTestCID", 40, false); // id=0

      await expect(
        carbonMRV.mintCredit(farmer.address, 10, 0)
      ).to.be.revertedWith("Submission not approved");
    });

    it("should revert if farmer address mismatches", async function () {
      await carbonMRV.logVerification(farmer.address, "QmTestCID", 85, true); // id=0

      await expect(
        carbonMRV.mintCredit(verifier.address, 10, 0)
      ).to.be.revertedWith("Farmer mismatch");
    });

    it("should only allow owner to mint", async function () {
      await carbonMRV.logVerification(farmer.address, "QmTestCID", 85, true); // id=0

      await expect(
        carbonMRV.connect(farmer).mintCredit(farmer.address, 10, 0)
      ).to.be.revertedWith("Not authorized");
    });
  });

  // ─── grantAccess ───────────────────────────────────────────────────────────

  describe("grantAccess", function () {
    it("should allow farmer to grant access to a verifier", async function () {
      await carbonMRV.logVerification(farmer.address, "QmTestCID", 85, true); // id=0

      await expect(
        carbonMRV.connect(farmer).grantAccess(0, verifier.address)
      ).to.not.be.reverted;
    });

    it("should emit AccessGranted event", async function () {
      await carbonMRV.logVerification(farmer.address, "QmTestCID", 85, true); // id=0

      await expect(carbonMRV.connect(farmer).grantAccess(0, verifier.address))
        .to.emit(carbonMRV, "AccessGranted")
        .withArgs(0, verifier.address);
    });

    it("should revert if non-farmer calls grantAccess", async function () {
      await carbonMRV.logVerification(farmer.address, "QmTestCID", 85, true); // id=0

      await expect(
        carbonMRV.connect(verifier).grantAccess(0, verifier.address)
      ).to.be.revertedWith("Not your submission");
    });
  });

  // ─── getBalance ───────────────────────────────────────────────────────────

  describe("getBalance", function () {
    it("should return 0 for a new farmer", async function () {
      const balance = await carbonMRV.getBalance(farmer.address);
      expect(balance).to.equal(0);
    });

    it("should return correct balance after minting", async function () {
      await carbonMRV.logVerification(farmer.address, "QmCID", 88, true); // id=0
      await carbonMRV.mintCredit(farmer.address, 25, 0);

      const balance = await carbonMRV.getBalance(farmer.address);
      expect(balance).to.equal(25);
    });
  });

  // ─── getSubmission ─────────────────────────────────────────────────────────

  describe("getSubmission", function () {
    it("should return empty struct for non-existent submission", async function () {
      // Contract does NOT revert — returns empty struct with zero values
      const submission = await carbonMRV.getSubmission(999);
      expect(submission.farmer).to.equal(ethers.ZeroAddress);
      expect(submission.ipfsCID).to.equal("");
    });

    it("should return correct submission data", async function () {
      await carbonMRV.logVerification(farmer.address, "QmFullTest", 91, true); // id=0
      const submission = await carbonMRV.getSubmission(0);

      expect(submission.farmer).to.equal(farmer.address);
      expect(submission.ipfsCID).to.equal("QmFullTest");
      expect(submission.confidenceScore).to.equal(91);
      expect(submission.approved).to.equal(true);
    });
  });
});