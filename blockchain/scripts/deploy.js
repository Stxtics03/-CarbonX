const hre = require("hardhat");

async function main() {
  console.log("Deploying CarbonMRV contract...");

  const CarbonMRV = await hre.ethers.getContractFactory("CarbonMRV");
  const contract = await CarbonMRV.deploy();

  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("CarbonMRV deployed to:", address);
  console.log("Save this address — you will need it for backend and frontend!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});