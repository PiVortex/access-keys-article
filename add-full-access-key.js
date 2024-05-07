const { connect, KeyPair, keyStores } = require('near-api-js');

const homedir = require("os").homedir();
const CREDENTIALS_DIR = ".near-credentials";
const credentialsPath = require("path").join(homedir, CREDENTIALS_DIR); // Path of where to store keys
const myKeyStore = new keyStores.UnencryptedFileSystemKeyStore(credentialsPath); // Store keys on device

// Set up connection object
const connectionConfig = {
  networkId: "testnet",
  keyStore: myKeyStore, 
  nodeUrl: "https://rpc.testnet.near.org",
  walletUrl: "https://testnet.mynearwallet.com/",
  helperUrl: "https://helper.testnet.near.org",
  explorerUrl: "https://testnet.nearblocks.io",
};

async function create_full_access_key(accountId) {
    const nearConnection = await connect(connectionConfig); // Connect to NEAR

    // Connect to account
    const account = await nearConnection.account(accountId);

    const newKeyPair = KeyPair.fromRandom('ed25519'); // Create key pair
    const publicKey = newKeyPair.publicKey.toString();
    const privateKey = newKeyPair.toString();

    await account.addKey(publicKey); // Add key to account

    // Print new key pair to console
    console.log("Public key", publicKey);
    console.log("Private key", privateKey);
};

create_full_access_key("pivortex.testnet");