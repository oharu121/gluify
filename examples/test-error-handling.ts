// @ts-nocheck
// test-error-handling.ts
import { gluify } from '../src/Gluify';

console.log('=== Error Handling Examples ===\n');

// ============================================
// Example 1: Basic catch() usage
// ============================================
console.log('Example 1: Basic catch() - Handling API errors');

const fetchUserWithError = (_id: string) => {
  throw new Error('User not found');
};

const result1 = gluify(fetchUserWithError, 'user-123')
  .pipe((user: any) => user.name)
  .catch(error => {
    console.log('  Caught error:', error.message);
    return { id: 'unknown', name: 'Guest User' };
  })
  .pipe(user => user.name)
  .run();

console.log('  Result:', result1); // "Guest User"
console.log('');

// ============================================
// Example 2: recover() with fallback value
// ============================================
console.log('Example 2: recover() - Simple fallback');

const parseJSON = (jsonString: string) => {
  return JSON.parse(jsonString); // This will throw if invalid
};

const result2 = gluify(parseJSON, 'invalid json {{{')
  .recover({ error: true, message: 'Invalid JSON' })
  .pipe(obj => obj.message || 'Success')
  .run();

console.log('  Result:', result2); // "Invalid JSON"
console.log('');

// ============================================
// Example 3: Async error handling
// ============================================
console.log('Example 3: Async error handling');

const asyncExample = async () => {
  const fetchData = async () => {
    throw new Error('Network timeout');
  };

  const result = await gluify(fetchData)
    .pipe(async (data: any) => data.value)
    .catch(error => {
      console.log('  Caught async error:', error.message);
      return { value: 'fallback data' };
    })
    .pipe((data: any) => data.value)
    .runAsync();

  console.log('  Result:', result); // "fallback data"
};

asyncExample().then(() => console.log(''));

// ============================================
// Example 4: when() - Conditional execution
// ============================================
console.log('Example 4: when() - Conditional execution');

const result4 = gluify(Math.sqrt, 16)
  .pipe(x => x * 2)  // 8
  .when(
    x => x > 5,
    x => x * 10     // Only executes if x > 5
  )
  .pipe(x => x + 1)
  .run();

console.log('  Result with condition true:', result4); // 81

const result4b = gluify(Math.sqrt, 4)
  .pipe(x => x * 2)  // 4
  .when(
    x => x > 5,
    x => x * 10     // Skipped because 4 is not > 5
  )
  .pipe(x => x + 1)
  .run();

console.log('  Result with condition false:', result4b); // 5
console.log('');

// ============================================
// Example 5: Real-world - API with fallback
// ============================================
console.log('Example 5: Real-world API pipeline with error handling');

const realWorldExample = async () => {
  const fetchUsers = async () => {
    // Simulate API failure
    throw new Error('API is down');
  };

  const filterActive = (users: any[]) => users.filter(u => u.active);
  const mapToNames = (users: any[]) => users.map(u => u.name);

  const result = await gluify(fetchUsers)
    .pipe(filterActive)
    .pipe(mapToNames)
    .catch(_error => {
      console.log('  API failed, using cached data');
      return ['Alice', 'Bob']; // Fallback to cached data
    })
    .pipe(names => names.join(', '))
    .runAsync();

  console.log('  Final result:', result); // "Alice, Bob"
};

realWorldExample().then(() => console.log(''));

// ============================================
// Example 6: Chaining multiple error handlers
// ============================================
console.log('Example 6: Multiple operations with error recovery');

const result6 = gluify(() => 10)
  .pipe(x => x / 0)  // Infinity
  .pipe(x => {
    if (!isFinite(x)) throw new Error('Invalid number');
    return x;
  })
  .catch(error => {
    console.log('  Recovered from:', error.message);
    return 100; // Fallback to 100
  })
  .pipe(x => x + 50)
  .run();

console.log('  Result:', result6); // 150
console.log('');

// ============================================
// Example 7: when() for validation
// ============================================
console.log('Example 7: when() for data validation');

interface User {
  name: string;
  age: number;
  verified?: boolean;
}

const result7 = gluify((): User => ({ name: 'Alice', age: 25 }))
  .when(
    user => user.age >= 18,
    user => ({ ...user, verified: true })
  )
  .pipe(user => `${user.name} (${user.verified ? 'Verified' : 'Unverified'})`)
  .run();

console.log('  Result:', result7); // "Alice (Verified)"
console.log('');

console.log('=== All error handling examples completed! ===');
