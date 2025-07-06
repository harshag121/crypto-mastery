/*
Assignment #3: Mining with Increasing Difficulty

Description:
In real-world blockchain systems, the difficulty of mining adjusts over time. This program simulates that by starting with a low difficulty (finding a hash with one leading zero) and increasing the difficulty each time a solution is found.

- It begins by searching for a hash starting with "0".
- After finding a solution, it increases the required prefix to "00", then "000", and so on.
- The input string must start with "100xdevs", followed by a nonce.
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

function findHashWithIncreasingDifficulty() {
    let difficulty = 1;
    const inputPrefix = "100xdevs";

    while (true) {
        const targetPrefix = '0'.repeat(difficulty);
        console.log(`\nSearching for a hash starting with "${targetPrefix}"...`);

        let attempts = 0;
        const startTime = Date.now();

        while (true) {
            const randomSuffix = generateRandomString(10);
            const input = inputPrefix + randomSuffix;
            const hash = crypto.createHash('sha256').update(input).digest('hex');
            attempts++;

            if (hash.startsWith(targetPrefix)) {
                const endTime = Date.now();
                const totalTime = (endTime - startTime) / 1000;
                console.log(`Success! Found after ${attempts} attempts.`);
                console.log(`Input: ${input}`);
                console.log(`Hash: ${hash}`);
                console.log(`Time taken: ${totalTime.toFixed(2)} seconds.`);
                console.log(`Rate: ${(attempts / totalTime).toFixed(0)} attempts per second`);
                break; // Exit inner loop to increase difficulty
            }

            if (attempts % 200000 === 0) { // Log progress less frequently for faster execution
                console.log(`${attempts} attempts...`);
            }
        }

        difficulty++;
    }
}

findHashWithIncreasingDifficulty();
