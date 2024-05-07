const { generateSeedPhrase } = require('near-seed-phrase');

// Create an object that has a random seedphrase from which a key pair is derived
let seedPhrase = generateSeedPhrase(); 
console.log(seedPhrase)