# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-11-11

### Breaking Changes

#### Renamed Execution Methods for Clarity
- ❌ `.value()` → ✅ `.run()` - More intuitive "run the pipeline" semantics
- ❌ `.valueAsync()` → ✅ `.runAsync()` - Consistent async suffix pattern

**Migration**: Simple find-replace in your codebase.

```typescript
// Before (v1.0.0):
const result = pipeline.value();
const asyncResult = await pipeline.valueAsync();

// After (v2.0.0):
const result = pipeline.run();
const asyncResult = await pipeline.runAsync();
```

### Added

#### `.pipeAsync()` Method
New method for handling Promises in the pipeline chain. When a function returns a Promise, `.pipeAsync()` automatically awaits it before passing the resolved value to your transform function.

```typescript
// Use case: Initial function returns Promise<User>
await gluify(fetchUser, userId)
  .pipeAsync(user => user.profile)  // Awaits Promise, receives User (not Promise<User>)
  .pipe(profile => profile.name)     // Regular pipe for sync operations
  .runAsync();
```

**Why?** Without `.pipeAsync()`, you'd receive `Promise<T>` instead of `T`, causing type errors and confusion.

#### Improved IDE Import Experience
- Created hand-written `index.js` and `index.d.ts` at package root
- Updated `package.json` entry points to remove `dist/` prefix
- Added modern `exports` field for better module resolution

**Result**: When typing "gluify" in IDE autocomplete, you now see clean `import { gluify } from "gluify"` instead of `@node_modules/gluify/dist/Gluify`.

### Changed

- Updated all examples to use new `.run()` / `.runAsync()` API
- Improved API consistency with unified `Async` suffix pattern:
  - `.pipe()` / `.pipeAsync()` (piping methods)
  - `.run()` / `.runAsync()` (execution methods)

### Design Decisions

**Why keep sync/async separate instead of forcing everything async?**
- ✅ Lower barrier to entry for beginners (no async concepts needed for simple chains)
- ✅ Progressive complexity disclosure (learn sync first, then async)
- ✅ Performance transparency (clear which operations have overhead)
- ✅ Follows Node.js patterns (`fs.readFileSync()` vs `fs.promises.readFile()`)

**Why `pipeAsync()` instead of `awaitPipe()` or `.then()`?**
- ✅ Consistent with `runAsync()` naming pattern
- ✅ Better discoverability (type "pipe" or "async" in autocomplete)
- ✅ Follows JavaScript convention: `await` = keyword, `Async` = function suffix

---

## [1.0.0] - 2025-11-08

### Added
- Initial release of Gluify
- Core `gluify()` function for starting pipelines
- `.pipe()` method for chaining operations
- `.value()` for synchronous execution
- `.valueAsync()` for asynchronous execution
- Lazy evaluation - operations stored until `.value()` called
- Error handling methods: `.catch()`, `.recover()`, `.when()`
- Array utilities: `map`, `filter`, `reduce`, `find`, `some`, `every`, `take`, `skip`, `sort`, `reverse`, `flat`, `unique`
- Object utilities: `pick`, `omit`, `keys`, `values`, `entries`, `merge`
- String utilities: `trim`, `split`, `join`, `replace`, `toUpperCase`, `toLowerCase`
- General utilities: `defaultTo`, `isNil`, `clone`
- Full TypeScript type safety with generics and conditional types
- Zero dependencies
- Comprehensive examples in `examples/` folder

### Features
- ✅ Lazy evaluation
- ✅ Async/await support
- ✅ Error handling
- ✅ 27+ built-in utility methods
- ✅ Type-safe method chaining
- ✅ Compatible with Node.js 14+

## [Unreleased]

### Planned
- Additional utility methods (groupBy, sortBy, etc.)
- Performance optimizations
- More comprehensive documentation
- Video tutorials

---

## Version History

- **2.0.0** - API improvements: Renamed execution methods, added `pipeAsync()`, improved IDE imports
- **1.0.0** - Initial release with core features and 27+ utility methods
