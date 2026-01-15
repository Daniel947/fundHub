require("dotenv").config();
const hre = require("hardhat");

async function main() {
    console.log("Checking Hardhat environment...");

    const pk = process.env.PRIVATE_KEY;
    if (!pk) {
        console.error("ERROR: PRIVATE_KEY is missing in .env");
    } else {
        console.log("PRIVATE_KEY is present (length: " + pk.length + ")");

        try {
            const [signer] = await hre.ethers.getSigners();
            console.log("Signer address:", await signer.getAddress());
            const balance = await hre.ethers.provider.getBalance(signer.address);
            console.log("Balance:", hre.ethers.formatEther(balance), "ETH");
        } catch (err) {
            console.error("Failed to get signer or balance:", err.message);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
