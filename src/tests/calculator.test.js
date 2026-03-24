const test = require('node:test');
const assert = require('node:assert/strict');

const calculator = require('../calculator');

test('ask() resolves the provided input', async () => {
  const rl = {
    question(question, callback) {
      callback('answer');
    },
  };

  await assert.doesNotReject(async () => {
    const result = await calculator.ask(rl, 'Enter a value: ');
    assert.equal(result, 'answer');
  });
});

test('parseNumber() parses valid numeric input', () => {
  assert.equal(calculator.parseNumber('42', 'Number'), 42);
  assert.equal(calculator.parseNumber(' 3.5 ', 'Number'), 3.5);
});

test('parseNumber() rejects invalid numeric input', () => {
  assert.throws(() => calculator.parseNumber('not-a-number', 'Number'), {
    message: 'Number must be a valid number.',
  });
});

test('normalizeOperation() trims and lowercases operations', () => {
  assert.equal(calculator.normalizeOperation(' + '), '+');
  assert.equal(calculator.normalizeOperation('DIVIDE'), 'divide');
});

test('calculate() performs the supported basic operations', () => {
  const cases = [
    ['2', '+', '3', 5],
    ['10', '-', '4', 6],
    ['45', '*', '2', 90],
    ['20', '/', '5', 4],
    ['7', 'add', '8', 15],
    ['12', 'subtract', '5', 7],
    ['6', 'multiply', '7', 42],
    ['18', 'divide', '3', 6],
  ];

  for (const [left, operation, right, expected] of cases) {
    assert.equal(calculator.calculate(left, operation, right), expected);
  }
});

test('calculate() rejects division by zero', () => {
  assert.throws(() => calculator.calculate('20', '/', '0'), {
    message: 'Division by zero is not allowed.',
  });
  assert.throws(() => calculator.calculate('20', 'divide', '0'), {
    message: 'Division by zero is not allowed.',
  });
});

test('calculate() rejects unsupported operations', () => {
  assert.throws(() => calculator.calculate('1', '%', '2'), {
    message: 'Operation must be one of: +, -, *, /, add, subtract, multiply, divide.',
  });
});

test('runFromArguments() returns false without CLI args', () => {
  const originalArgv = process.argv;
  process.argv = ['node', 'calculator.js'];

  try {
    assert.equal(calculator.runFromArguments(), false);
  } finally {
    process.argv = originalArgv;
  }
});

test('runFromArguments() prints a result for valid CLI args', () => {
  const originalArgv = process.argv;
  const originalLog = console.log;
  const logs = [];

  process.argv = ['node', 'calculator.js', '9', '-', '4'];
  console.log = (message) => {
    logs.push(message);
  };

  try {
    assert.equal(calculator.runFromArguments(), true);
    assert.deepEqual(logs, ['Result: 5']);
  } finally {
    process.argv = originalArgv;
    console.log = originalLog;
  }
});

test('runFromArguments() throws for the wrong CLI argument count', () => {
  const originalArgv = process.argv;
  process.argv = ['node', 'calculator.js', '1', '+'];

  try {
    assert.throws(() => calculator.runFromArguments(), {
      message: 'Usage: node src/calculator.js <number> <operation> <number>',
    });
  } finally {
    process.argv = originalArgv;
  }
});
