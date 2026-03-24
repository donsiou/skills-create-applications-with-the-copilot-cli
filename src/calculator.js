#!/usr/bin/env node

'use strict';

const readline = require('readline');

const operations = {
  // Supported operations: addition, subtraction, multiplication, and division.
  add: (a, b) => a + b,
  '+': (a, b) => a + b,
  subtract: (a, b) => a - b,
  '-': (a, b) => a - b,
  multiply: (a, b) => a * b,
  '*': (a, b) => a * b,
  divide: (a, b) => a / b,
  '/': (a, b) => a / b,
};

function ask(rl, question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

function parseNumber(value, label) {
  const number = Number(value);
  if (Number.isNaN(number)) {
    throw new Error(`${label} must be a valid number.`);
  }
  return number;
}

function normalizeOperation(value) {
  return String(value).trim().toLowerCase();
}

function calculate(leftInput, operationInput, rightInput) {
  const left = parseNumber(leftInput, 'The first number');
  const right = parseNumber(rightInput, 'The second number');
  const operation = normalizeOperation(operationInput);
  const calculateOperation = operations[operation];

  if (!calculateOperation) {
    throw new Error('Operation must be one of: +, -, *, /, add, subtract, multiply, divide.');
  }

  if ((operation === '/' || operation === 'divide') && right === 0) {
    throw new Error('Division by zero is not allowed.');
  }

  return calculateOperation(left, right);
}

function runFromArguments() {
  const cliArguments = process.argv.slice(2);

  if (cliArguments.length === 0) {
    return false;
  }

  if (cliArguments.length !== 3) {
    throw new Error('Usage: node src/calculator.js <number> <operation> <number>');
  }

  const result = calculate(cliArguments[0], cliArguments[1], cliArguments[2]);
  console.log(`Result: ${result}`);
  return true;
}

async function main() {
  let rl;

  try {
    if (runFromArguments()) {
      return;
    }

    rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    const first = await ask(rl, 'Enter the first number: ');
    const operationInput = await ask(rl, 'Choose an operation (+, -, *, /): ');
    const second = await ask(rl, 'Enter the second number: ');

    const result = calculate(first, operationInput, second);
    console.log(`Result: ${result}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
  } finally {
    if (rl) {
      rl.close();
    }
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  ask,
  calculate,
  normalizeOperation,
  parseNumber,
  runFromArguments,
};
