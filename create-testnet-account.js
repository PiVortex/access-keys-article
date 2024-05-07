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

async function create_testnet_account(creatorAccountId, newAccountId) {
    const nearConnection = await connect(connectionConfig); // Connect to NEAR

    // Connect to account that will sign the create account transaction
    const creatorAccount = await nearConnection.account(creatorAccountId);

    const newKeyPair = KeyPair.fromRandom('ed25519'); // Create key pair
    const publicKey = newKeyPair.publicKey.toString();

    // Add key to keystore
    await myKeyStore.setKey(connectionConfig.networkId, newAccountId, newKeyPair);

    // Create account function call
    return await creatorAccount.functionCall({
      contractId: "testnet",
      methodName: "create_account",
      args: {
        new_account_id: newAccountId,
        new_public_key: publicKey,
      },
    });
};

create_testnet_account("pivortex.testnet", "mynewaccount.testnet");
