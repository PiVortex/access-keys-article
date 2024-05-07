const { connect, KeyPair, keyStores } = require('near-api-js');
const { key_pair } = require('near-api-js/lib/utils');

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

async function rotate_key(accountId, oldPublicKey) {
    const nearConnection = await connect(connectionConfig); // Connect to NEAR

    // Connect to account that will sign the create account transaction
    const account = await nearConnection.account(accountId);

    const newKeyPair = KeyPair.fromRandom('ed25519'); // Create key pair
    const newPublicKey = newKeyPair.publicKey.toString();
    const newPrivateKey = newKeyPair.toString();

    await account.addKey(newPublicKey); // Add key to account

    // Print new key pair to console
    console.log("Public key", newPublicKey);
    console.log("Private key", newPrivateKey);

    // Check if new key exists
    const keys = await account.getAccessKeys();
    const exists = keys.some(key => key.public_key === newPublicKey);
    
    // If new key exists delete old key
    if (exists) {
        await account.deleteKey(oldPublicKey);
    }

};

rotate_key("pivortex.testnet", "ed25519:EFS8r2KZ4bAeksSub6F6cbeftVMvaTAbzTAGvTJuqins");