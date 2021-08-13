require('dotenv').config();
const HDWalletProvider = require('@truffle/hdwallet-provider');
const privateKeys = process.env.PRIVATE_KEYS || "";
const fs = require('fs');
const mnemonic = fs.readFileSync(".secret").toString().trim();


module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*"
    },
    matic: {
      provider: () => new HDWalletProvider(mnemonic, `https://rpc-mumbai.matic.today`),
      network_id: 80001,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true
    },

    rinkeby: {
      provider: function() {
        return new HDWalletProvider(
          privateKeys.split(','), // Array of account private keys
          `https://rinkeby.infura.io/v3/${process.env.INFURA_API_KEY}`// Url to an Ethereum Node
        )
      },
      gas: 5000000,
      gasPrice: 25000000000,
      network_id: 4
    },

    bsc_testnet: {
      provider: () => new HDWalletProvider(
        privateKeys.split(','),
        `https://data-seed-prebsc-1-s1.binance.org:8545`
      ),
      network_id: 97,
      skipDryRun: true
    },

    bsc_mainnet: {
      provider: () => new HDWalletProvider(
        privateKeys.split(','),
        `https://bsc-dataseed1.binance.org`
      ),
      network_id: 56,
      skipDryRun: true
    }
  },
  
  compilers: {
    solc: {
      version: "0.8.2"
    }
  }
};
