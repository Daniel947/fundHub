require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

module.exports = {
    solidity: {
        compilers: [
            {
                version: "0.8.19",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            },
            {
                version: "0.4.17",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            },
        ],
    },
    networks: {
        sonicTestnet: {
            url: "https://rpc.blaze.soniclabs.com",
            accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
        },
        sepolia: {
            url: "https://rpc.ankr.com/eth_sepolia",
            accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
        },
    },
    paths: {
        sources: "./src/contracts",
        tests: "./test",
        cache: "./cache",
        artifacts: "./artifacts"
    },
};
