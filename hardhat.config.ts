import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "hardhat-contract-sizer"
import "dotenv/config";

const config: HardhatUserConfig = {
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: false,
    strict: true,
  },
  networks: {
    // sepolia: {
    //   url: process.env.SEPOLIA_ENDPOINT || "",
    //   accounts: [process.env.ACCOUNT || ""],
    //   blockGasLimit: 100000000429720,
    // },
    polygon: {
      url: process.env.POLYGON_ENDPOINT || "",
      accounts: [`0x${process.env.PRIVATE_KEY}` || ""]
    },
    hardhat: {
      // forking: {
      //   url: process.env.MAINNET_ENDPOINT || "",
      // }
    }
  },
  solidity: {
    compilers: [
      {
        version: "0.8.23",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      }
    ],
  },
  mocha: {
    timeout: 40000,
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS ? true : false,
  },
  etherscan: {
    apiKey: {
      polygon: process.env.ETHERSCAN_API || "",
    },
  },
};

export default config;

