/*
Assignment #1
What if I ask you the following question — Give me an input string that outputs a SHA-256 
hash that starts with 000e. How will you do it?

A. You will have to brute force until you find a value that starts with 000e
B. Node.js code

Solution: This program uses brute force to find an input string that produces a SHA-256 hash 
starting with the specified prefix (00000 in this case).
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
    
    while (true) {
        // Generate a random string
        const input = generateRandomString(10); // You can adjust the length
        
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

// Brute force to find a string that produces a hash starting with "00000"
console.log("Starting brute force search for hash starting with '00000'...");
bruteForceHash("00000");
