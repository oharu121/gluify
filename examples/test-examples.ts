// @ts-nocheck
// test-examples.ts
import { gluify } from "../src/Gluify";

// ============================================
// Example 1: Pure Synchronous Chain
// ============================================
const syncExample = () => {
  const result = gluify(Math.sqrt, 16)
    .pipe(x => x * 2)
    .pipe(Math.floor)
    .tap(x => console.log('Debug:', x))
    .pipe(x => x + 10)
    .value();

  console.log('Sync result:', result); // 18
};

// ============================================
// Example 2: Pure Async Chain
// ============================================
const asyncExample = async () => {
  // Simulated async functions
  const fetchUser = async (id: string) => ({ id, name: 'John Doe', age: 30 });
  const enrichUser = async (user: any) => ({ ...user, email: 'john@example.com' });
  const validateUser = async (user: any) => ({ ...user, validated: true });

  const result = await gluify(fetchUser, 'user-123')
    .pipe(enrichUser)
    .pipe(validateUser)
    .tap(user => console.log('Processing user:', user.name))
    .valueAsync();

  console.log('Async result:', result);
};

// ============================================
// Example 3: Mixed Sync + Async (The Magic!)
// ============================================
const mixedExample = async () => {
  const fetchData = async () => '  hello world  ';
  const toUpperCase = (str: string) => str.toUpperCase();
  const trim = (str: string) => str.trim();
  const addExclamation = async (str: string) => str + '!';

  const result = await gluify(fetchData)
    .pipe(trim)           // sync
    .pipe(toUpperCase)    // sync
    .pipe(addExclamation) // async
    .tap(str => console.log('Final string:', str))
    .valueAsync();

  console.log('Mixed result:', result); // "HELLO WORLD!"
};

// ============================================
// Example 4: Real-world API pipeline
// ============================================
const realWorldExample = async () => {
  // Simulated API calls
  const fetchUsers = async () => [
    { id: 1, name: 'Alice', active: true },
    { id: 2, name: 'Bob', active: false },
    { id: 3, name: 'Charlie', active: true }
  ];

  const filterActive = (users: any[]) => users.filter(u => u.active);
  const mapToNames = (users: any[]) => users.map(u => u.name);
  const saveToDatabase = async (names: string[]) => {
    // Simulated save
    return { saved: names.length, names };
  };

  const result = await gluify(fetchUsers)
    .pipe(filterActive)
    .tap(users => console.log(`Found ${users.length} active users`))
    .pipe(mapToNames)
    .pipe(saveToDatabase)
    .valueAsync();

  console.log('Saved:', result);
};

// ============================================
// Example 5: With additional arguments
// ============================================
const argsExample = () => {
  const multiply = (x: number, factor: number) => x * factor;
  const add = (x: number, amount: number) => x + amount;

  const result = gluify(Math.sqrt, 25)
    .pipe(multiply, 3)    // 5 * 3 = 15
    .pipe(add, 10)        // 15 + 10 = 25
    .value();

  console.log('With args:', result); // 25
};

// Run examples
console.log('=== Running Gluify Examples ===\n');

syncExample();
console.log('');

argsExample();
console.log('');

asyncExample().then(() => {
  console.log('');
  mixedExample().then(() => {
    console.log('');
    realWorldExample();
  });
});
