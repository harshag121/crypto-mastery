/*
Assignment #2
What if I ask you that the input string should start with 100xdevs? How would the code change?

Solution: This program modifies the previous brute-force approach. It ensures that the input string always starts with the prefix "100xdevs" and then appends a random string. It then searches for a SHA-256 hash of this combined string that starts with a target prefix (e.g., "00000").
*/

const crypto = require('crypto');

function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

function bruteForceHash(targetPrefix) {
    let attempts = 0;
    const startTime = Date.now(); // Start timing
    const inputPrefix = "100xdevs";
    
    while (true) {
        // Generate a random suffix and combine it with the required prefix
        const randomSuffix = generateRandomString(10); // You can adjust the length
        const input = inputPrefix + randomSuffix;
        
        // Create hash
        const hash = crypto.createHash('sha256');
        const hashResult = hash.update(input).digest('hex');
        
        attempts++;
        
        // Check if hash starts with target prefix
        if (hashResult.startsWith(targetPrefix)) {
            const endTime = Date.now();
            const totalTime = (endTime - startTime) / 1000; // Convert to seconds
            
            console.log(`Success! Found after ${attempts} attempts:`);
            console.log(`Input: ${input}`);
            console.log(`Hash: ${hashResult}`);
            console.log(`Time taken: ${totalTime.toFixed(2)} seconds`);
            console.log(`Rate: ${(attempts / totalTime).toFixed(0)} attempts per second`);
            return { input, hash: hashResult, attempts, timeSeconds: totalTime };
        }
        
        // Print progress every 10000 attempts
        if (attempts % 10000 === 0) {
            const currentTime = Date.now();
            const elapsedTime = (currentTime - startTime) / 1000;
            const rate = attempts / elapsedTime;
            console.log(`Attempt ${attempts}: ${input} -> ${hashResult} | Time: ${elapsedTime.toFixed(1)}s | Rate: ${rate.toFixed(0)} attempts/s`);
        }
    }
}

// Brute force to find a hash starting with "00000" for an input starting with "100xdevs"
console.log("Starting brute force search for hash starting with '00000'...");
bruteForceHash("00000");
