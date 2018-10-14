#!/usr/bin/env node
'use strict';

const math = require('mathjs');
const fs = require('fs');

function parseFile(fileName) {
    try {
        const fileContents = fs.readFileSync(fileName, 'utf8');
        return fileContents.split('\n').map(num => Number(num));
    } catch (err) {
        console.error('Error reading file,', fileName);
        process.exit();
    }
}

function dft(data, samplingFrequency) {
    const frequencies = [];
    const N = data.length;
    // Can't measure frequencies above Nyquist Limit, samplingFrequency / 2
    const nyquistLimit = Math.floor(samplingFrequency/2);

    for (let i = 0; i < nyquistLimit; i++) {
        const sample = data[i];
        const frequency = calcFreqBin(data, sample, N, i);

        // Double frequency since we only calculated for half the samples
        const nyquistModifiedFrequency = math.multiply(frequency, 2);
        // Get magnitude of frequency amplitude via pythagorean theorem
        const magnitude = math.sqrt(
            math.add(
                math.square(nyquistModifiedFrequency.re),
                math.square(nyquistModifiedFrequency.im)
            )
        );
        // Average by dividing by number of samples
        const amplitude = math.divide(magnitude, N);
        // Calculate phase angle by taking arctan of frequency plotten on complex plane
        const phaseAngleArg = math.divide(nyquistModifiedFrequency.im, nyquistModifiedFrequency.re);
        const phaseAngle = Math.atan(phaseAngleArg) * 180/Math.PI;

        frequencies.push({
            'frequency': i,
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
    return Math.round(num * 100) / 100;
}

function writeResultsToFile(resultObject) {
    let outputString = '';
    resultObject.forEach(result => {
        outputString += `Frequency:${result.frequency}\t\tAmplitude:${result.amplitude}\t\tPhase Angle:${result.phaseAngle}\n`
    });
    fs.writeFileSync('output.dat', outputString);
    console.log('Results written to output.dat');
}

if (process.argv.length < 4) {
    console.error("Error: not enough arguments.");
    process.exit();
}

const inputData = parseFile(process.argv[2]);
console.log('Input file contents:', inputData);
// const inputData = [0.0, 0.707, 1, 0.707, 0, -0.707, -1, -0.707];

const samplingFrequency = Number(process.argv[3]);
if (!samplingFrequency) {
    console.error('Invalid sampling frequency:', samplingFrequency);
    process.exit();
}

const result = dft(inputData, samplingFrequency);
console.log(result);

writeResultsToFile(result);
