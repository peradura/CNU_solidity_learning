import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    kairos: {
      url: "https://public-en-kairos.node.kaia.io",
      accounts: [PRIVATE_KEY],
      chainId: 1001,
      gasPrice: 25000000000,
    },
  },
};

export default config;
