#!/usr/bin/env node
'use strict';

const math = require('./math.min.js');
const fs = require('fs');

if (process.argv.length < 3) {
    console.log("Error: not enough arguments.");
    process.exit();
}

let fileContents = getFileContents(process.argv[2]);
console.log('File contents:', fileContents);

const inputData = [0.0, 0.707, 1, 0.707, 0, -0.707, -1, -0.707];
const result = dft(inputData);
console.log(result);

function getFileContents(fileName) {
    try {
        return fs.readFileSync(fileName, 'utf8');
    } catch (err) {
        console.log('Error reading file,', fileName);
        process.exit();
    }
}

function dft(data) {
    const frequencies = [];
    const N = data.length;
    // Can't measure frequencies above Nyquist Limit, N / 2
    const nyquistLimit = Math.floor(N/2);

    for (let i = 0; i < nyquistLimit; i++) {
        const sample = data[i];
        const frequency = calcFreqBin(data, sample, N, i);

        // Double frequency since we only calculated for half the samples
        const nyquistModifiedFrequency = math.multiply(frequency, 2);
        // Get magnitude of frequency amplitude via pythagorean theorem
        const magnitude = math.sqrt(math.add(math.square(nyquistModifiedFrequency.re), math.square(nyquistModifiedFrequency.im)));
        // Average by dividing by number of samples
        const amplitude = math.divide(magnitude, N);
        // Calculate phase angle by taking arctan of frequency plotten on complex plane
        const phaseAngleArg = math.divide(nyquistModifiedFrequency.im, nyquistModifiedFrequency.re);
        const phaseAngle = Math.atan(phaseAngleArg) * 180/Math.PI;

        frequencies.push({
            'frequency': frequency,
            'amplitude': amplitude,
            'phaseAngle': phaseAngle
        });
    }

    return frequencies;
}

function calcFreqBin(data, sample, N, k) {
    let sum = math.complex(0, 0);
    data.forEach((xSubN, index) => {
        const innerArg = -k * index * 2*Math.PI / N;
        const cosElement = Math.cos(innerArg);
        const sinElement = Math.sin(innerArg);
        const complex = math.complex(cosElement, sinElement);
          
        const final = math.multiply(xSubN, complex);
        sum = math.add(sum, final);
    });
    
    sum.re = round(sum.re);
    sum.im = round(sum.im);
    return sum;
}

function round(num) {
    return Math.round(num * 100) / 100
}
