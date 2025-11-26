// Gluify.ts

// Define a generic type for a function that takes a value and returns a new value
type PipeFunction<T, U, Args extends unknown[]> = (value: T, ...args: Args) => U;

// Internal operation type
type Operation = (value: unknown) => unknown;

// Internal type for error handler operations
interface ErrorHandlerOperation extends Operation {
  __isErrorHandler: true;
  __handler: (error: Error) => unknown;
}

class Gluify<T> {
  private operations: Operation[];
  private initialValue: unknown;
  private isLazy: boolean;
  private lazyInitializer: (() => unknown) | null;

  constructor(initialValue: unknown, operations: Operation[] = [], isLazy: boolean = false, lazyInitializer: (() => unknown) | null = null) {
    this.initialValue = initialValue;
    this.operations = operations;
    this.isLazy = isLazy;
    this.lazyInitializer = lazyInitializer;
  }

  // Helper method to create a new Gluify with the same lazy state
  private createNext<U>(newOperations: Operation[]): Gluify<U> {
    return new Gluify<U>(this.initialValue, newOperations, this.isLazy, this.lazyInitializer);
  }

  // Type guard for error handler operations
  private isErrorHandler(op: Operation): op is ErrorHandlerOperation {
    return (op as ErrorHandlerOperation).__isErrorHandler === true;
  }

  // The pipe method is generic:
  // - `U` is the type of the output of the function `fn`
  // - `Args` is a tuple type for any additional arguments passed to `pipe`
  pipe<U, Args extends unknown[]>(
    fn: PipeFunction<T, U, Args>,
    ...args: Args
  ): Gluify<U> {
    // Don't execute, just store the operation
    const operation: Operation = (value: unknown) => fn(value as T, ...args);
    return this.createNext<U>([...this.operations, operation]);
  }

  // Async pipe - awaits promises before piping to handle async functions in the chain
  // If the current value is a Promise, await it first, then apply the function
  pipeAsync<U, Args extends unknown[]>(
    fn: PipeFunction<Awaited<T>, U, Args>,
    ...args: Args
  ): Gluify<U> {
    const operation: Operation = async (value: unknown) => {
      // If value is a Promise, await it first
      const resolvedValue = value instanceof Promise ? await value : value;
      return fn(resolvedValue as Awaited<T>, ...args);
    };
    return this.createNext<U>([...this.operations, operation]);
  }

  // Synchronous execution - for pure sync chains
  run(): T {
    let result: unknown;
    let error: Error | null = null;

    // Execute lazy initializer if needed
    try {
      result = this.isLazy && this.lazyInitializer
        ? this.lazyInitializer()
        : this.initialValue;
    } catch (e) {
      error = e as Error;
    }

    // Execute operations in sequence
    for (const op of this.operations) {
      if (error) {
        // If there's an error, look for error handler
        if (this.isErrorHandler(op)) {
          try {
            result = op.__handler(error);
            error = null; // Error handled, continue with pipeline
          } catch (e) {
            error = e as Error; // Error in handler, continue looking for next handler
          }
        }
        // Skip non-error-handler operations when there's an error
      } else {
        // No error, execute normal operations
        if (this.isErrorHandler(op)) {
          // Skip error handlers when there's no error
          continue;
        }
        try {
          result = op(result);
        } catch (e) {
          error = e as Error;
        }
      }
    }

    // If there's still an error at the end, throw it
    if (error) {
      throw error;
    }

    return result as T;
  }

  // Asynchronous execution - handles both sync and async functions
  async runAsync(): Promise<Awaited<T>> {
    let result: unknown;
    let error: Error | null = null;

    // Execute lazy initializer if needed
    try {
      result = this.isLazy && this.lazyInitializer
        ? await this.lazyInitializer()
        : this.initialValue;
    } catch (e) {
      error = e as Error;
    }

    // Execute operations in sequence
    for (const op of this.operations) {
      if (error) {
        // If there's an error, look for error handler
        if (this.isErrorHandler(op)) {
          try {
            result = await op.__handler(error);
            error = null; // Error handled, continue with pipeline
          } catch (e) {
            error = e as Error; // Error in handler, continue looking for next handler
          }
        }
        // Skip non-error-handler operations when there's an error
      } else {
        // No error, execute normal operations
        if (this.isErrorHandler(op)) {
          // Skip error handlers when there's no error
          continue;
        }
        try {
          result = await op(result);
        } catch (e) {
          error = e as Error;
        }
      }
    }

    // If there's still an error at the end, throw it
    if (error) {
      throw error;
    }

    return result as Awaited<T>;
  }

  tap(fn: (value: T) => void): Gluify<T> {
    // Store tap operation without changing the value
    const operation: Operation = (value: unknown) => {
      fn(value as T);
      return value; // Return unchanged value
    };
    return this.createNext<T>([...this.operations, operation]);
  }

  // Catch errors and provide a fallback value or recovery function
  catch<U>(handler: (error: Error) => U): Gluify<T | U> {
    const operation = ((value: unknown) => {
      // This is a marker operation that the execution methods will use
      return value;
    }) as ErrorHandlerOperation;
    // Mark this operation as an error handler
    operation.__isErrorHandler = true;
    operation.__handler = handler;
    return this.createNext<T | U>([...this.operations, operation]);
  }

  // Recover from errors with a fallback value
  recover(fallbackValue: T): Gluify<T> {
    return this.catch(() => fallbackValue);
  }

  // Conditional execution - only run fn if predicate is true
  when(predicate: (value: T) => boolean, fn: (value: T) => T): Gluify<T> {
    const operation: Operation = (value: unknown) => {
      if (predicate(value as T)) {
        return fn(value as T);
      }
      return value;
    };
    return this.createNext<T>([...this.operations, operation]);
  }

  // ============================================
  // Array Utilities
  // ============================================

  // Map over array elements
  map<U>(fn: T extends unknown[] ? (item: T[number], index: number) => U : never): Gluify<U[]> {
    const operation: Operation = (arr: unknown) => (arr as unknown[]).map(fn as (item: unknown, index: number) => U);
    return this.createNext<U[]>([...this.operations, operation]);
  }

  // Filter array elements
  filter(predicate: T extends unknown[] ? (item: T[number], index: number) => boolean : never): Gluify<T> {
    const operation: Operation = (arr: unknown) => (arr as unknown[]).filter(predicate as (item: unknown, index: number) => boolean);
    return this.createNext<T>([...this.operations, operation]);
  }

  // Reduce array to a single value
  reduce<U>(
    fn: T extends unknown[] ? (acc: U, item: T[number], index: number) => U : never,
    initialValue: U
  ): Gluify<U> {
    const operation: Operation = (arr: unknown) => (arr as unknown[]).reduce(fn as (acc: U, item: unknown, index: number) => U, initialValue);
    return this.createNext<U>([...this.operations, operation]);
  }

  // Find first element matching predicate
  find(predicate: T extends unknown[] ? (item: T[number], index: number) => boolean : never): Gluify<T extends unknown[] ? T[number] | undefined : never> {
    const operation: Operation = (arr: unknown) => (arr as unknown[]).find(predicate as (item: unknown, index: number) => boolean);
    return this.createNext([...this.operations, operation]);
  }

  // Check if some elements match predicate
  some(predicate: T extends unknown[] ? (item: T[number], index: number) => boolean : never): Gluify<boolean> {
    const operation: Operation = (arr: unknown) => (arr as unknown[]).some(predicate as (item: unknown, index: number) => boolean);
    return this.createNext<boolean>([...this.operations, operation]);
  }

  // Check if all elements match predicate
  every(predicate: T extends unknown[] ? (item: T[number], index: number) => boolean : never): Gluify<boolean> {
    const operation: Operation = (arr: unknown) => (arr as unknown[]).every(predicate as (item: unknown, index: number) => boolean);
    return this.createNext<boolean>([...this.operations, operation]);
  }

  // Get first n elements
  take(n: T extends unknown[] ? number : never): Gluify<T> {
    const operation: Operation = (arr: unknown) => (arr as unknown[]).slice(0, n as number);
    return this.createNext<T>([...this.operations, operation]);
  }

  // Skip first n elements
  skip(n: T extends unknown[] ? number : never): Gluify<T> {
    const operation: Operation = (arr: unknown) => (arr as unknown[]).slice(n as number);
    return this.createNext<T>([...this.operations, operation]);
  }

  // Sort array
  sort(compareFn?: T extends unknown[] ? (a: T[number], b: T[number]) => number : never): Gluify<T> {
    const operation: Operation = (arr: unknown) => [...(arr as unknown[])].sort(compareFn as ((a: unknown, b: unknown) => number) | undefined);
    return this.createNext<T>([...this.operations, operation]);
  }

  // Reverse array
  reverse(): Gluify<T extends unknown[] ? T : never> {
    const operation: Operation = (arr: unknown) => [...(arr as unknown[])].reverse();
    return this.createNext([...this.operations, operation]);
  }

  // Flatten array one level
  flat(): Gluify<T extends unknown[] ? unknown[] : never> {
    const operation: Operation = (arr: unknown) => (arr as unknown[]).flat();
    return this.createNext([...this.operations, operation]);
  }

  // Get unique elements
  unique(): Gluify<T extends unknown[] ? T : never> {
    const operation: Operation = (arr: unknown) => Array.from(new Set(arr as unknown[]));
    return this.createNext([...this.operations, operation]);
  }

  // ============================================
  // Object Utilities
  // ============================================

  // Pick specific keys from object
  pick<K extends keyof T>(...keys: K[]): Gluify<Pick<T, K>> {
    const operation: Operation = (obj: unknown) => {
      const source = obj as Record<string, unknown>;
      const result: Record<string, unknown> = {};
      for (const key of keys) {
        if ((key as string) in source) {
          result[key as string] = source[key as string];
        }
      }
      return result;
    };
    return this.createNext([...this.operations, operation]);
  }

  // Omit specific keys from object
  omit<K extends keyof T>(...keys: K[]): Gluify<Omit<T, K>> {
    const operation: Operation = (obj: unknown) => {
      const result = { ...(obj as Record<string, unknown>) };
      for (const key of keys) {
        delete result[key as string];
      }
      return result;
    };
    return this.createNext([...this.operations, operation]);
  }

  // Get object keys
  keys(): Gluify<T extends object ? (keyof T)[] : never> {
    const operation: Operation = (obj: unknown) => Object.keys(obj as object);
    return this.createNext([...this.operations, operation]);
  }

  // Get object values
  values(): Gluify<T extends object ? T[keyof T][] : never> {
    const operation: Operation = (obj: unknown) => Object.values(obj as object);
    return this.createNext([...this.operations, operation]);
  }

  // Get object entries
  entries(): Gluify<T extends object ? [keyof T, T[keyof T]][] : never> {
    const operation: Operation = (obj: unknown) => Object.entries(obj as object);
    return this.createNext([...this.operations, operation]);
  }

  // Merge objects
  merge<U>(other: U): Gluify<T & U> {
    const operation: Operation = (obj: unknown) => ({ ...(obj as object), ...other });
    return this.createNext([...this.operations, operation]);
  }

  // ============================================
  // String Utilities
  // ============================================

  // Trim whitespace
  trim(): Gluify<T extends string ? string : never> {
    const operation: Operation = (str: unknown) => (str as string).trim();
    return this.createNext([...this.operations, operation]);
  }

  // Split string
  split(separator: T extends string ? string | RegExp : never): Gluify<string[]> {
    const operation: Operation = (str: unknown) => (str as string).split(separator as string | RegExp);
    return this.createNext([...this.operations, operation]);
  }

  // Join array into string
  join(separator?: T extends unknown[] ? string : never): Gluify<string> {
    const operation: Operation = (arr: unknown) => (arr as unknown[]).join(separator);
    return this.createNext([...this.operations, operation]);
  }

  // Replace in string
  replace(
    searchValue: T extends string ? string | RegExp : never,
    replaceValue: string
  ): Gluify<T extends string ? string : never> {
    const operation: Operation = (str: unknown) => (str as string).replace(searchValue as string | RegExp, replaceValue);
    return this.createNext([...this.operations, operation]);
  }

  // Convert to uppercase
  toUpperCase(): Gluify<T extends string ? string : never> {
    const operation: Operation = (str: unknown) => (str as string).toUpperCase();
    return this.createNext([...this.operations, operation]);
  }

  // Convert to lowercase
  toLowerCase(): Gluify<T extends string ? string : never> {
    const operation: Operation = (str: unknown) => (str as string).toLowerCase();
    return this.createNext([...this.operations, operation]);
  }

  // ============================================
  // General Utilities
  // ============================================

  // Provide default value if null/undefined
  defaultTo<U>(defaultValue: U): Gluify<NonNullable<T> | U> {
    const operation: Operation = (value: unknown) => value ?? defaultValue;
    return this.createNext([...this.operations, operation]);
  }

  // Check if value is null or undefined
  isNil(): Gluify<boolean> {
    const operation: Operation = (value: unknown) => value == null;
    return this.createNext([...this.operations, operation]);
  }

  // Clone value (shallow)
  clone(): Gluify<T> {
    const operation: Operation = (value: unknown) => {
      if (Array.isArray(value)) return [...value];
      if (typeof value === 'object' && value !== null) return { ...value };
      return value;
    };
    return this.createNext([...this.operations, operation]);
  }
}

// Global helper function to start the chain
function gluify<T, Args extends unknown[]>(
  fn: (...args: Args) => T, // Initial function can take any arguments and return T
  ...args: Args
): Gluify<T> {
  // Store the function and arguments to be executed lazily
  const lazyInitializer = () => fn(...args);
  return new Gluify<T>(undefined, [], true, lazyInitializer);
}

export { gluify, Gluify, PipeFunction };
