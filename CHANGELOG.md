# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

- **1.0.0** - Initial release with core features and 27+ utility methods
