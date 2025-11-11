// @ts-nocheck
// test-utilities.ts
import { gluify } from "../src/Gluify";

console.log('=== Utility Methods Examples ===\n');

// ============================================
// Array Utilities
// ============================================
console.log('--- Array Utilities ---\n');

console.log('Example 1: map, filter, sort');
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const result1 = gluify(() => numbers)
  .filter(n => n % 2 === 0)           // [2, 4, 6, 8, 10]
  .map(n => n * 2)                     // [4, 8, 12, 16, 20]
  .sort((a, b) => b - a)               // [20, 16, 12, 8, 4]
  .run();

console.log('  Filtered, mapped, sorted:', result1);
console.log('');

console.log('Example 2: reduce, take, unique');
const result2 = gluify(() => [1, 2, 2, 3, 3, 3, 4, 5])
  .unique()                             // [1, 2, 3, 4, 5]
  .take(3)                              // [1, 2, 3]
  .reduce((sum, n) => sum + n, 0)      // 6
  .run();

console.log('  Unique, take 3, sum:', result2);
console.log('');

console.log('Example 3: find, some, every');
const users = [
  { name: 'Alice', age: 25, active: true },
  { name: 'Bob', age: 30, active: false },
  { name: 'Charlie', age: 35, active: true }
];

const foundUser = gluify(() => users)
  .find(u => u.age > 28)
  .run();

const hasActiveUsers = gluify(() => users)
  .some(u => u.active)
  .run();

const allActive = gluify(() => users)
  .every(u => u.active)
  .run();

console.log('  Found user:', foundUser?.name);
console.log('  Has active users:', hasActiveUsers);
console.log('  All active:', allActive);
console.log('');

console.log('Example 4: flat, reverse, skip');
const nested = [[1, 2], [3, 4], [5, 6]];
const result4 = gluify(() => nested)
  .flat()                               // [1, 2, 3, 4, 5, 6]
  .reverse()                            // [6, 5, 4, 3, 2, 1]
  .skip(2)                              // [4, 3, 2, 1]
  .run();

console.log('  Flattened, reversed, skipped 2:', result4);
console.log('');

// ============================================
// Object Utilities
// ============================================
console.log('--- Object Utilities ---\n');

console.log('Example 5: pick, omit');
const user = {
  id: 1,
  name: 'Alice',
  email: 'alice@example.com',
  password: 'secret123',
  age: 25
};

const publicUser = gluify(() => user)
  .omit('password')
  .run();

const basicInfo = gluify(() => user)
  .pick('name', 'email')
  .run();

console.log('  Public user:', publicUser);
console.log('  Basic info:', basicInfo);
console.log('');

console.log('Example 6: keys, values, entries');
const config = { host: 'localhost', port: 3000, ssl: true };

const configKeys = gluify(() => config)
  .keys()
  .run();

const configValues = gluify(() => config)
  .values()
  .run();

const configEntries = gluify(() => config)
  .entries()
  .run();

console.log('  Keys:', configKeys);
console.log('  Values:', configValues);
console.log('  Entries:', configEntries);
console.log('');

console.log('Example 7: merge');
const defaults = { theme: 'light', lang: 'en' };
const userPrefs = { theme: 'dark' };

const finalPrefs = gluify(() => defaults)
  .merge(userPrefs)
  .run();

console.log('  Merged preferences:', finalPrefs);
console.log('');

// ============================================
// String Utilities
// ============================================
console.log('--- String Utilities ---\n');

console.log('Example 8: trim, toUpperCase, replace');
const result8 = gluify(() => '  hello world  ')
  .trim()
  .toUpperCase()
  .replace('WORLD', 'GLUIFY')
  .run();

console.log('  Transformed string:', result8);
console.log('');

console.log('Example 9: split, map, join');
const result9 = gluify(() => 'apple,banana,cherry')
  .split(',')
  .map(fruit => fruit.toUpperCase())
  .join(' | ')
  .run();

console.log('  Split, mapped, joined:', result9);
console.log('');

console.log('Example 10: String to array pipeline');
const words = gluify(() => 'The Quick Brown Fox')
  .toLowerCase()
  .split(' ')
  .filter(word => word.length > 3)
  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
  .join(', ')
  .run();

console.log('  Processed words:', words);
console.log('');

// ============================================
// General Utilities
// ============================================
console.log('--- General Utilities ---\n');

console.log('Example 11: defaultTo');
const result11a = gluify(() => null)
  .defaultTo('fallback value')
  .run();

const result11b = gluify(() => 'actual value')
  .defaultTo('fallback value')
  .run();

console.log('  Null with default:', result11a);
console.log('  Value with default:', result11b);
console.log('');

console.log('Example 12: isNil');
const isNull = gluify(() => null)
  .isNil()
  .run();

const isNotNull = gluify(() => 'value')
  .isNil()
  .run();

console.log('  null is nil:', isNull);
console.log('  "value" is nil:', isNotNull);
console.log('');

console.log('Example 13: clone');
const original = { name: 'Alice', scores: [1, 2, 3] };
const cloned = gluify(() => original)
  .clone()
  .pipe(obj => {
    obj.name = 'Bob';
    return obj;
  })
  .run();

console.log('  Original:', original.name);
console.log('  Cloned and modified:', cloned.name);
console.log('');

// ============================================
// Real-World Combined Example
// ============================================
console.log('--- Real-World Example: Data Processing Pipeline ---\n');

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  inStock: boolean;
}

const products: Product[] = [
  { id: 1, name: 'Laptop', price: 999, category: 'Electronics', inStock: true },
  { id: 2, name: 'Mouse', price: 25, category: 'Electronics', inStock: true },
  { id: 3, name: 'Desk', price: 299, category: 'Furniture', inStock: false },
  { id: 4, name: 'Chair', price: 199, category: 'Furniture', inStock: true },
  { id: 5, name: 'Monitor', price: 399, category: 'Electronics', inStock: true }
];

const summary = gluify(() => products)
  .filter(p => p.inStock)                          // Only in-stock items
  .filter(p => p.category === 'Electronics')       // Only electronics
  .map(p => ({ name: p.name, price: p.price }))   // Simplify
  .sort((a, b) => b.price - a.price)              // Most expensive first
  .take(2)                                         // Top 2
  .map(p => `${p.name} ($${p.price})`)            // Format
  .join(', ')                                      // Combine
  .run();

console.log('Top 2 in-stock electronics:', summary);
console.log('');

// ============================================
// Async + Utilities Example
// ============================================
console.log('--- Async + Utilities Example ---\n');

const asyncUtilExample = async () => {
  const fetchData = async () => ['  apple  ', '  BANANA  ', '  Cherry  '];

  const result = await gluify(fetchData)
    .map(item => item.trim())
    .map(item => item.toLowerCase())
    .map(item => item.charAt(0).toUpperCase() + item.slice(1))
    .sort()
    .join(' -> ')
    .runAsync();

  console.log('  Async processed:', result);
};

asyncUtilExample().then(() => console.log(''));

console.log('=== All utility examples completed! ===');
