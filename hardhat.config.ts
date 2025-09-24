import { HardhatUserConfig } from "hardhat/config";

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x59c6995e998f97a5a0044966f0945380ea5a89ce3ed16c0d" +
  "f5a7e6a12b3b6e36d2e3a3b0e"; // dummy when using localhost

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: { optimizer: { enabled: true, runs: 200 } },
  },
  networks: {
    localhost: { url: process.env.RPC_URL || "http://127.0.0.1:8545" },
  },
  etherscan: { apiKey: process.env.ETHERSCAN_API_KEY || "" },
};

export default config;


