# The role of asymmetric cryptography in blockchain networks

##  Brief introduction to cryptography 

Symmetric encryption - where the encryptor and decryptor share a common key - has been used for thousands of years, from the Caesar Cypher to its use in the Enigma machine. While methods have increased in security throughout time, leading to the one-time pad, which is considered to be unbreakable, symmetric encryption possesses a fundamental flaw: the encryption key has to be shared with the receiver, making it prone to interception.

Towards the end of the 20th century, asymmetric encryption was developed to address this issue. This scheme uses a key pair rather than a single key, known as private and public keys. If Alice wants to send a secret message to Bob, then she will encrypt the raw message using Bob’s public key; once Bob receives the message, he then decrypts with his private key, meaning only he can know the contents of the message as his private key, by name, is kept private. No transferring of keys is needed. While a public key can be derived from a private key, it would take time scales longer than the age of the universe to do the reverse, making the scheme secure.

Blockchain leverages asymmetric cryptography to produce digital signatures. When sending a transaction on a blockchain, a sender needs to prove that it is really them who is sending the transaction. For this, a somewhat reverse process to asymmetric encryption is used. The sender signs the transaction with their own private key, which can then be verified using the sender’s public key.

## Deriving a keypair from a seed phrase 

Since private keys have poor readability, we can instead generate a seed phrase, a random list of 12 or 24 words representing a private key. We then use the seed phrase to derive a private and public key. It is worth noting that multiple public keys can be derived from a private key. The code below shows how one can easily create a NEAR seed phrase in node.js. 

```javascript
const { generateSeedPhrase } = require('near-seed-phrase');

// Create an object that has a random seedphrase from which a key pair is derived
let seedPhrase = generateSeedPhrase(); 
console.log(seedPhrase)
```


## NEAR account model 
The most well-known smart contract blockchain, Ethereum, has a user account model in which accounts are tied to a single key pair (though several Ethereum Improvement Proposals look to change this). NEAR opts for a different approach whereby user accounts can have multiple key pairs that can be swapped in and out and offer different levels of access. 

We can do this all with [near-api-js](https://docs.near.org/tools/near-api-js/quick-reference) a javascript library for interacting with the NEAR blockchain.

## Account creation 

First, let’s create a NEAR account and a key using a different method. For this, you will initially need a NEAR account and have the keys stored on your device. Do this using [near-cli-rs](https://docs.near.org/tools/near-cli-rs), type near, then go to account > create_account > sponsor-by-faucet-service > input account id in format <name>.testnet > cehck this doesn’t exist > autogenerate-new-keypair > save-to-legacy-keychain > testnet > create.

```javascript
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
```

We can view whether the transaction was successful by finding the creator account on [the explorer](https://testnet.nearblocks.io/) and looking at the most recent transaction.

## Adding access keys

As mentioned previously, keys can offer different levels of access. The first type is a full access key, which gives complete control over the account and should never be shared. 

```javascript
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
```


The other type of key, namely function call access keys, allow the holder only to call specific smart contracts and methods. Say you interact with an application that requires you to sign many transactions, such as a video game that leverages a blockchain reward system. When connecting an account to the app, a function call access key can be granted to the application, meaning they can sign transactions (that don’t involve depositing tokens) on your behalf so the game isn’t interrupted by your wallet asking for authorisation. Consider another example: suppose you have an account you use for social media and hire a social media intern. You want to allow them to make posts and comment on other posts, but you don’t want them to change your account settings. You can give the intern a function call access to the social media application that is restricted to specific permissions. This example can be seen below. 

```javascript
async function create_function_access_key(accountId) {
    const nearConnection = await connect(connectionConfig); // Connect to NEAR

    // Connect to account
    const account = await nearConnection.account(accountId);

    const newKeyPair = KeyPair.fromRandom('ed25519'); // Create key pair
    const publicKey = newKeyPair.publicKey.toString();
    const privateKey = newKeyPair.toString();

    await account.addKey(
        publicKey,
        "socialmedia.testnet", // Contract that the key can call
        ["post_image", "post_comment"], // Methods on the contract that this key can call
    );

    // Print new key pair to console
    console.log("Public key", publicKey);
    console.log("Private key", privateKey);
};

create_function_access_key("pivortex.testnet");
```
## Rotating keys 

NEAR accounts can rotate their access keys. If you accidentally leaked your private key, instead of abandoning your account altogether and transferring all your assets, you can simply delete the exposed keypair from the account and replace it with a new one. Another interesting possibility this allows is if, in the future, quantum computers were to break EDDSA (the key derivation algorithm NEAR uses), then NEAR accounts could swap their keys to a new algorithm that hasn’t been broken.

```javascript
async function rotate_key(accountId, oldPublicKey) {
    const nearConnection = await connect(connectionConfig); // Connect to NEAR

    // Connect to account
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
    
    // If the new key exists, delete the old key
    if (exists) {
        await account.deleteKey(oldPublicKey);
    }

};

rotate_key("pivortex.testnet", "ed25519:EFS8r2KZ4bAeksSub6F6cbeftVMvaTAbzTAGvTJuqins");
```
  

Please note that the code examples are only snippets and require additional code to work. The complete examples can be found [here](https://github.com/PiVortex/access-keys-article).  
