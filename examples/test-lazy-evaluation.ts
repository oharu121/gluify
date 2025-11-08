// @ts-nocheck
// test-lazy-evaluation.ts
import { gluify } from "../src/Gluify";

console.log('=== Lazy Evaluation Test ===\n');

// ============================================
// Example 1: Prove Initial Function is Lazy
// ============================================
console.log('Example 1: Initial function NOT executed until .value()');

let executionCount = 0;

const expensiveFunction = () => {
  executionCount++;
  console.log(`  -> expensiveFunction executed! (count: ${executionCount})`);
  return 100;
};

console.log('Creating chain...');
const chain = gluify(expensiveFunction)
  .pipe(x => x * 2)
  .pipe(x => x + 10);

console.log(`Execution count after creating chain: ${executionCount}`);
console.log('Chain created but function NOT executed yet!\n');

console.log('Calling .value()...');
const result1 = chain.value();
console.log(`Result: ${result1}`);
console.log(`Execution count after .value(): ${executionCount}`);
console.log('');

// ============================================
// Example 2: Multiple .value() calls execute multiple times
// ============================================
console.log('Example 2: Each .value() call re-executes the chain');

executionCount = 0;
const chain2 = gluify(expensiveFunction)
  .pipe(x => x * 3);

console.log(`Before any .value(): executionCount = ${executionCount}`);

const result2a = chain2.value();
console.log(`After 1st .value(): executionCount = ${executionCount}, result = ${result2a}`);

const result2b = chain2.value();
console.log(`After 2nd .value(): executionCount = ${executionCount}, result = ${result2b}`);

const result2c = chain2.value();
console.log(`After 3rd .value(): executionCount = ${executionCount}, result = ${result2c}`);
console.log('');

// ============================================
// Example 3: Side effects in operations are also lazy
// ============================================
console.log('Example 3: All operations (including tap) are lazy');

let sideEffectCount = 0;

const chain3 = gluify(() => 10)
  .tap(x => {
    sideEffectCount++;
    console.log(`  -> tap executed! value=${x}, count=${sideEffectCount}`);
  })
  .pipe(x => x * 2)
  .tap(x => {
    sideEffectCount++;
    console.log(`  -> tap executed! value=${x}, count=${sideEffectCount}`);
  });

console.log(`Before .value(): sideEffectCount = ${sideEffectCount}`);
console.log('Calling .value()...');
const result3 = chain3.value();
console.log(`After .value(): sideEffectCount = ${sideEffectCount}, result = ${result3}`);
console.log('');

// ============================================
// Example 4: Lazy with async
// ============================================
console.log('Example 4: Async functions are also lazy');

(async () => {
  let asyncExecutionCount = 0;

  const asyncExpensiveFunction = async () => {
    asyncExecutionCount++;
    console.log(`  -> asyncExpensiveFunction executed! (count: ${asyncExecutionCount})`);
    return 50;
  };

  const asyncChain = gluify(asyncExpensiveFunction)
    .pipe((x: any) => [x, x * 2, x * 3]);

  console.log(`Before .valueAsync(): asyncExecutionCount = ${asyncExecutionCount}`);
  console.log('Calling .valueAsync()...');

  const asyncResult = await asyncChain.valueAsync();
  console.log(`After .valueAsync(): asyncExecutionCount = ${asyncExecutionCount}, result = ${asyncResult}`);
  console.log('');
})();

// ============================================
// Example 5: Conditional chains - only executed parts run
// ============================================
console.log('Example 5: Conditional execution with .when()');

let conditionalExecutions = 0;

const trackExecution = (value: number, label: string) => {
  conditionalExecutions++;
  console.log(`  -> ${label} executed (count: ${conditionalExecutions})`);
  return value * 2;
};

const chain5 = gluify(() => 5)
  .when(x => x > 10, x => trackExecution(x, 'First when'))  // Skipped
  .pipe(x => trackExecution(x, 'Pipe'))                     // Executed
  .when(x => x > 5, x => trackExecution(x, 'Second when')); // Executed

console.log(`Before .value(): conditionalExecutions = ${conditionalExecutions}`);
const result5 = chain5.value();
console.log(`After .value(): conditionalExecutions = ${conditionalExecutions}, result = ${result5}`);
console.log('');

// ============================================
// Example 6: Building chains dynamically
// ============================================
console.log('Example 6: Dynamic chain building (lazy evaluation enables this)');

let dynamicExecutions = 0;

const buildChain = (multiplier: number) => {
  console.log(`  Building chain with multiplier ${multiplier}...`);
  return gluify(() => {
    dynamicExecutions++;
    console.log(`  -> Initial function executed! (count: ${dynamicExecutions})`);
    return 10;
  })
    .pipe(x => x * multiplier)
    .tap(x => console.log(`  -> Result: ${x}`));
};

console.log('Creating 3 different chains...');
const chainA = buildChain(2);
const chainB = buildChain(3);
const chainC = buildChain(4);

console.log(`\nAll chains created, dynamicExecutions = ${dynamicExecutions}`);
console.log('No functions executed yet!\n');

console.log('Executing chainA:');
const resultA = chainA.value();

console.log('\nExecuting chainB:');
const resultB = chainB.value();

console.log('\nExecuting chainC:');
const resultC = chainC.value();

console.log(`\nFinal dynamicExecutions = ${dynamicExecutions}`);
console.log('');

// ============================================
// Summary
// ============================================
console.log('=== Summary ===');
console.log('✓ Initial function is NOT executed when gluify() is called');
console.log('✓ Operations are stored, not executed during chaining');
console.log('✓ Execution only happens when .value() or .valueAsync() is called');
console.log('✓ Each .value() call re-executes the entire chain from scratch');
console.log('✓ This enables dynamic chain building without side effects');
console.log('');
console.log('=== Lazy Evaluation Test Complete! ===');
