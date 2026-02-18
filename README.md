# Gluify

[![npm version](https://badge.fury.io/js/gluify.svg)](https://badge.fury.io/js/gluify)
![License](https://img.shields.io/npm/l/gluify)
![Types](https://img.shields.io/npm/types/gluify)
![NPM Downloads](https://img.shields.io/npm/dw/gluify)
![Last Commit](https://img.shields.io/github/last-commit/oharu121/gluify)
![Coverage](https://codecov.io/gh/oharu121/gluify/branch/main/graph/badge.svg)
![CI Status](https://github.com/oharu121/gluify/actions/workflows/ci.yml/badge.svg)
![GitHub Stars](https://img.shields.io/github/stars/oharu121/gluify?style=social)

A type-safe pipeline library for TypeScript that glues functions from different libraries together.

## Why Gluify?

JavaScript lacks native pipe operators (like R's `|>` or PowerShell's `|`). While TC39's F# pipeline proposal is in the works, Gluify provides a production-ready solution **today** for creating type-safe, composable data pipelines.

Unlike Lodash (which only chains its own methods) or Ramda (which requires curried functions), **Gluify lets you chain ANY functions** from different libraries together.

## Features

✅ **Lazy Evaluation** - Nothing executes until `.run()` or `.runAsync()`
✅ **Async Support** - Mix sync/async functions freely with `.pipeAsync()`, single `await` at end
✅ **Error Handling** - Built-in `.catch()`, `.recover()`, `.when()` for robust pipelines
✅ **27+ Utility Methods** - Built-in, type-safe, no separate imports
✅ **Type Safety** - Full TypeScript generics, conditional types
✅ **Clean API** - Single import, intuitive chaining
✅ **Zero Dependencies** - Lightweight and fast

## Installation

```bash
npm install gluify
# or
pnpm add gluify
```

## Quick Start

```typescript
import { gluify } from 'gluify';

// Basic pipeline
const result = gluify(() => [1, 2, 3, 4, 5])
  .filter(n => n % 2 === 0)
  .map(n => n * 2)
  .reduce((sum, n) => sum + n, 0)
  .run();  // 12

// Async pipeline
const user = await gluify(fetchUser, userId)
  .pipe(validateUser)
  .pipe(enrichProfile)
  .catch(error => defaultUser)
  .runAsync();

// String processing
const result = gluify(() => '  hello world  ')
  .trim()
  .toUpperCase()
  .replace('WORLD', 'GLUIFY')
  .run();  // "HELLO GLUIFY"
```

## Core Concepts

### 1. Lazy Evaluation

Operations are stored and only executed when you call `.run()` or `.runAsync()`:

```typescript
const chain = gluify(expensiveFunction)
  .pipe(operation1)
  .pipe(operation2);  // Nothing executed yet!

const result = chain.run();  // NOW it executes
```

### 2. Type-Safe Chaining

TypeScript knows which methods are available based on the current type:

```typescript
gluify(() => [1, 2, 3])
  .map(n => n * 2)      // ✅ Available - T is array
  .filter(n => n > 2)   // ✅ Available - still array
  .trim()               // ❌ Error - trim only for strings
```

### 3. Async Made Easy

No more nested `await` or `.then()` chains. Use `.pipeAsync()` to handle Promises in the chain:

```typescript
// Before (painful)
const data = await fetchData(id);
const processed = await processData(data);
const validated = await validate(processed);

// After (clean) - pipeAsync awaits Promises automatically
const result = await gluify(fetchData, id)
  .pipeAsync(data => processData(data))  // Awaits fetchData result
  .pipeAsync(processed => validate(processed))  // Awaits processData result
  .runAsync();
```

## API Reference

### Core Methods

#### `gluify(fn, ...args)`
Start a pipeline with an initial function and arguments.

```typescript
gluify(() => 42)
gluify(Math.sqrt, 16)
gluify(fetchUser, userId)
```

#### `.pipe(fn, ...args)`
Add any function to the pipeline.

```typescript
.pipe(x => x * 2)
.pipe(myFunction)
.pipe(add, 10)  // Additional args
```

#### `.pipeAsync(fn, ...args)`
Async pipe - awaits Promises before applying the function. Use this when the previous operation returns a Promise and you need the resolved value.

```typescript
// When initial function returns Promise<User>
await gluify(fetchUser, userId)
  .pipeAsync(user => user.profile)  // Awaits Promise, receives User
  .pipe(profile => profile.name)     // Regular pipe for sync transform
  .runAsync();
```

#### `.run()`
Execute the pipeline synchronously and return the result.

```typescript
const result = gluify(() => 5)
  .pipe(x => x * 2)
  .run();  // 10
```

#### `.runAsync()`
Execute the pipeline asynchronously (handles both sync and async functions).

```typescript
const result = await gluify(asyncFn)
  .pipeAsync(resolvedValue => transform(resolvedValue))
  .pipe(syncFn)
  .runAsync();
```

#### `.tap(fn)`
Execute a side effect without changing the value (useful for logging).

```typescript
gluify(() => 42)
  .tap(x => console.log('Debug:', x))
  .pipe(x => x * 2)
  .run();  // Logs: "Debug: 42", returns 84
```

### Error Handling

#### `.catch(handler)`
Catch errors and provide recovery logic.

```typescript
gluify(mightFail)
  .pipe(processData)
  .catch(error => ({ fallback: 'data' }))
  .run();
```

#### `.recover(fallbackValue)`
Simple fallback value on error.

```typescript
gluify(parseJSON, invalidJSON)
  .recover({ error: true })
  .run();
```

#### `.when(predicate, fn)`
Conditionally execute a function.

```typescript
gluify(() => user)
  .when(u => u.age >= 18, markAsAdult)
  .run();
```

### Array Utilities

- `map(fn)` - Transform each element
- `filter(predicate)` - Keep elements matching predicate
- `reduce(fn, initial)` - Reduce to single value
- `find(predicate)` - Find first matching element
- `some(predicate)` - Check if any element matches
- `every(predicate)` - Check if all elements match
- `take(n)` - Get first n elements
- `skip(n)` - Skip first n elements
- `sort(compareFn?)` - Sort array
- `reverse()` - Reverse array
- `flat()` - Flatten one level
- `unique()` - Get unique elements

### Object Utilities

- `pick(...keys)` - Select specific keys
- `omit(...keys)` - Exclude specific keys
- `keys()` - Get object keys
- `values()` - Get object values
- `entries()` - Get key-value pairs
- `merge(other)` - Merge with another object

### String Utilities

- `trim()` - Remove whitespace
- `split(separator)` - Split into array
- `join(separator?)` - Join array into string
- `replace(search, replace)` - Replace substring
- `toUpperCase()` - Convert to uppercase
- `toLowerCase()` - Convert to lowercase

### General Utilities

- `defaultTo(fallback)` - Provide default for null/undefined
- `isNil()` - Check if null or undefined
- `clone()` - Shallow clone

## Real-World Examples

### Data Processing Pipeline

```typescript
interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  inStock: boolean;
}

const topProducts = gluify(() => products)
  .filter(p => p.inStock)
  .filter(p => p.category === 'Electronics')
  .map(p => ({ name: p.name, price: p.price }))
  .sort((a, b) => b.price - a.price)
  .take(10)
  .map(p => `${p.name} ($${p.price})`)
  .join(', ')
  .run();
```

### API Error Handling

```typescript
const userData = await gluify(fetchUser, userId)
  .catch(error => {
    console.error('Fetch failed:', error);
    return getCachedUser(userId);
  })
  .pipe(enrichUserData)
  .when(user => user.needsValidation, validateUser)
  .runAsync();
```

### String Processing

```typescript
const processedText = gluify(() => 'apple,banana,cherry')
  .split(',')
  .map(fruit => fruit.trim())
  .map(fruit => fruit.toUpperCase())
  .filter(fruit => fruit.length > 5)
  .join(' | ')
  .run();  // "BANANA | CHERRY"
```

## Limitations

**Piping to non-first arguments:** Gluify always pipes to the first argument. For other positions, use a lambda:

```typescript
// ❌ Not supported
.pipe(add, 10)  // Where does piped value go?

// ✅ Use a lambda instead
.pipe(x => add(10, x))  // Clear and explicit
```

This keeps the library simple, type-safe, and easy to understand.

## Why Not Lodash or Ramda?

| Feature | Gluify | Lodash | Ramda |
|---------|--------|--------|-------|
| Chain any function | ✅ | ❌ (only Lodash methods) | ⚠️ (requires currying) |
| Lazy evaluation | ✅ | ✅ | ❌ |
| Built-in async support | ✅ | ❌ | ❌ |
| Type safety | ✅ | ⚠️ (limited) | ⚠️ (complex) |
| Error handling | ✅ | ❌ | ❌ |
| Zero dependencies | ✅ | ❌ | ❌ |

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © [oharu121](https://github.com/oharu121)

## Links

- [npm package](https://www.npmjs.com/package/gluify)
- [GitHub repository](https://github.com/oharu121/gluify)
- [Issues](https://github.com/oharu121/gluify/issues)
