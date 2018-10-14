const fs = require('fs');

const samples = Number(process.argv[2] || 8);
const incremement = 2 * Math.PI / samples;
const outputFile = process.argv[3] || 'samples.dat';
let output = '';

for (let i = 0; i < samples; i++) {
    const sample = round(Math.sin(i * incremement));
    output += i < samples - 1 ? sample + '\n' : sample;
}

fs.writeFileSync(outputFile, output);
console.log(`Samples written to ${outputFile}`);

function round(num) {
    return Math.round(num * 1000000) / 1000000;
}