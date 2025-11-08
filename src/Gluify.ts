// Gluify.ts

// Define a generic type for a function that takes a value and returns a new value
type PipeFunction<T, U, Args extends any[]> = (value: T, ...args: Args) => U;

// Internal operation type
type Operation = (value: any) => any;

class Gluify<T> {
  private operations: Operation[];
  private initialValue: any;
  private isLazy: boolean;
  private lazyInitializer: (() => any) | null;

  constructor(initialValue: any, operations: Operation[] = [], isLazy: boolean = false, lazyInitializer: (() => any) | null = null) {
    this.initialValue = initialValue;
    this.operations = operations;
    this.isLazy = isLazy;
    this.lazyInitializer = lazyInitializer;
  }

  // Helper method to create a new Gluify with the same lazy state
  private createNext<U>(newOperations: Operation[]): Gluify<U> {
    return new Gluify<U>(this.initialValue, newOperations, this.isLazy, this.lazyInitializer);
  }

  // The pipe method is generic:
  // - `U` is the type of the output of the function `fn`
  // - `Args` is a tuple type for any additional arguments passed to `pipe`
  pipe<U, Args extends any[]>(
    fn: PipeFunction<T, U, Args>,
    ...args: Args
  ): Gluify<U> {
    // Don't execute, just store the operation
    const operation: Operation = (value: T) => fn(value, ...args);
    return this.createNext<U>([...this.operations, operation]);
  }

  // Synchronous execution - for pure sync chains
  value(): T {
    let result: any;

    // Scan for error handler first
    let errorHandler: ((error: Error) => any) | null = null;
    for (const op of this.operations) {
      if ((op as any).__isErrorHandler) {
        errorHandler = (op as any).__handler;
      }
    }

    try {
      // Execute lazy initializer if needed
      result = this.isLazy && this.lazyInitializer
        ? this.lazyInitializer()
        : this.initialValue;

      for (const op of this.operations) {
        // Skip error handlers during execution
        if (!(op as any).__isErrorHandler) {
          result = op(result);
        }
      }
    } catch (error) {
      if (errorHandler) {
        return errorHandler(error as Error);
      }
      throw error;
    }

    return result;
  }

  // Asynchronous execution - handles both sync and async functions
  async valueAsync(): Promise<Awaited<T>> {
    let result: any;

    // Scan for error handler first
    let errorHandler: ((error: Error) => any) | null = null;
    for (const op of this.operations) {
      if ((op as any).__isErrorHandler) {
        errorHandler = (op as any).__handler;
      }
    }

    try {
      // Execute lazy initializer if needed
      result = this.isLazy && this.lazyInitializer
        ? await this.lazyInitializer()
        : this.initialValue;

      for (const op of this.operations) {
        // Skip error handlers during execution
        if (!(op as any).__isErrorHandler) {
          result = await op(result);
        }
      }
    } catch (error) {
      if (errorHandler) {
        return await errorHandler(error as Error);
      }
      throw error;
    }

    return result;
  }

  tap(fn: (value: T) => void): Gluify<T> {
    // Store tap operation without changing the value
    const operation: Operation = (value: T) => {
      fn(value);
      return value; // Return unchanged value
    };
    return this.createNext<T>([...this.operations, operation]);
  }

  // Catch errors and provide a fallback value or recovery function
  catch<U>(handler: (error: Error) => U): Gluify<T | U> {
    const operation: Operation = (value: any) => {
      // This is a marker operation that the execution methods will use
      return value;
    };
    // Mark this operation as an error handler
    (operation as any).__isErrorHandler = true;
    (operation as any).__handler = handler;
    return this.createNext<T | U>([...this.operations, operation]);
  }

  // Recover from errors with a fallback value
  recover(fallbackValue: T): Gluify<T> {
    return this.catch(() => fallbackValue);
  }

  // Conditional execution - only run fn if predicate is true
  when(predicate: (value: T) => boolean, fn: (value: T) => T): Gluify<T> {
    const operation: Operation = (value: T) => {
      if (predicate(value)) {
        return fn(value);
      }
      return value;
    };
    return this.createNext<T>([...this.operations, operation]);
  }

  // ============================================
  // Array Utilities
  // ============================================

  // Map over array elements
  map<U>(fn: T extends any[] ? (item: T[number], index: number) => U : never): Gluify<U[]> {
    const operation: Operation = (arr: any[]) => arr.map(fn as any);
    return this.createNext<U[]>([...this.operations, operation]);
  }

  // Filter array elements
  filter(predicate: T extends any[] ? (item: T[number], index: number) => boolean : never): Gluify<T> {
    const operation: Operation = (arr: any[]) => arr.filter(predicate as any);
    return this.createNext<T>([...this.operations, operation]);
  }

  // Reduce array to a single value
  reduce<U>(
    fn: T extends any[] ? (acc: U, item: T[number], index: number) => U : never,
    initialValue: U
  ): Gluify<U> {
    const operation: Operation = (arr: any[]) => arr.reduce(fn as any, initialValue);
    return this.createNext<U>([...this.operations, operation]);
  }

  // Find first element matching predicate
  find(predicate: T extends any[] ? (item: T[number], index: number) => boolean : never): Gluify<T extends any[] ? T[number] | undefined : never> {
    const operation: Operation = (arr: any[]) => arr.find(predicate as any);
    return this.createNext([...this.operations, operation]);
  }

  // Check if some elements match predicate
  some(predicate: T extends any[] ? (item: T[number], index: number) => boolean : never): Gluify<boolean> {
    const operation: Operation = (arr: any[]) => arr.some(predicate as any);
    return this.createNext<boolean>([...this.operations, operation]);
  }

  // Check if all elements match predicate
  every(predicate: T extends any[] ? (item: T[number], index: number) => boolean : never): Gluify<boolean> {
    const operation: Operation = (arr: any[]) => arr.every(predicate as any);
    return this.createNext<boolean>([...this.operations, operation]);
  }

  // Get first n elements
  take(n: T extends any[] ? number : never): Gluify<T> {
    const operation: Operation = (arr: any[]) => arr.slice(0, n as number);
    return this.createNext<T>([...this.operations, operation]);
  }

  // Skip first n elements
  skip(n: T extends any[] ? number : never): Gluify<T> {
    const operation: Operation = (arr: any[]) => arr.slice(n as number);
    return this.createNext<T>([...this.operations, operation]);
  }

  // Sort array
  sort(compareFn?: T extends any[] ? (a: T[number], b: T[number]) => number : never): Gluify<T> {
    const operation: Operation = (arr: any[]) => [...arr].sort(compareFn as any);
    return this.createNext<T>([...this.operations, operation]);
  }

  // Reverse array
  reverse(): Gluify<T extends any[] ? T : never> {
    const operation: Operation = (arr: any[]) => [...arr].reverse();
    return this.createNext([...this.operations, operation]);
  }

  // Flatten array one level
  flat(): Gluify<T extends any[] ? any[] : never> {
    const operation: Operation = (arr: any[]) => arr.flat();
    return this.createNext([...this.operations, operation]);
  }

  // Get unique elements
  unique(): Gluify<T extends any[] ? T : never> {
    const operation: Operation = (arr: any[]) => Array.from(new Set(arr));
    return this.createNext([...this.operations, operation]);
  }

  // ============================================
  // Object Utilities
  // ============================================

  // Pick specific keys from object
  pick<K extends keyof T>(...keys: K[]): Gluify<Pick<T, K>> {
    const operation: Operation = (obj: any) => {
      const result: any = {};
      for (const key of keys) {
        if (key in obj) {
          result[key] = obj[key];
        }
      }
      return result;
    };
    return this.createNext([...this.operations, operation]);
  }

  // Omit specific keys from object
  omit<K extends keyof T>(...keys: K[]): Gluify<Omit<T, K>> {
    const operation: Operation = (obj: any) => {
      const result = { ...obj };
      for (const key of keys) {
        delete result[key];
      }
      return result;
    };
    return this.createNext([...this.operations, operation]);
  }

  // Get object keys
  keys(): Gluify<T extends object ? (keyof T)[] : never> {
    const operation: Operation = (obj: any) => Object.keys(obj);
    return this.createNext([...this.operations, operation]);
  }

  // Get object values
  values(): Gluify<T extends object ? T[keyof T][] : never> {
    const operation: Operation = (obj: any) => Object.values(obj);
    return this.createNext([...this.operations, operation]);
  }

  // Get object entries
  entries(): Gluify<T extends object ? [keyof T, T[keyof T]][] : never> {
    const operation: Operation = (obj: any) => Object.entries(obj);
    return this.createNext([...this.operations, operation]);
  }

  // Merge objects
  merge<U>(other: U): Gluify<T & U> {
    const operation: Operation = (obj: any) => ({ ...obj, ...other });
    return this.createNext([...this.operations, operation]);
  }

  // ============================================
  // String Utilities
  // ============================================

  // Trim whitespace
  trim(): Gluify<T extends string ? string : never> {
    const operation: Operation = (str: string) => str.trim();
    return this.createNext([...this.operations, operation]);
  }

  // Split string
  split(separator: T extends string ? string | RegExp : never): Gluify<string[]> {
    const operation: Operation = (str: string) => str.split(separator as any);
    return this.createNext([...this.operations, operation]);
  }

  // Join array into string
  join(separator?: T extends any[] ? string : never): Gluify<string> {
    const operation: Operation = (arr: any[]) => arr.join(separator as any);
    return this.createNext([...this.operations, operation]);
  }

  // Replace in string
  replace(
    searchValue: T extends string ? string | RegExp : never,
    replaceValue: string
  ): Gluify<T extends string ? string : never> {
    const operation: Operation = (str: string) => str.replace(searchValue as any, replaceValue);
    return this.createNext([...this.operations, operation]);
  }

  // Convert to uppercase
  toUpperCase(): Gluify<T extends string ? string : never> {
    const operation: Operation = (str: string) => str.toUpperCase();
    return this.createNext([...this.operations, operation]);
  }

  // Convert to lowercase
  toLowerCase(): Gluify<T extends string ? string : never> {
    const operation: Operation = (str: string) => str.toLowerCase();
    return this.createNext([...this.operations, operation]);
  }

  // ============================================
  // General Utilities
  // ============================================

  // Provide default value if null/undefined
  defaultTo<U>(defaultValue: U): Gluify<NonNullable<T> | U> {
    const operation: Operation = (value: any) => value ?? defaultValue;
    return this.createNext([...this.operations, operation]);
  }

  // Check if value is null or undefined
  isNil(): Gluify<boolean> {
    const operation: Operation = (value: any) => value == null;
    return this.createNext([...this.operations, operation]);
  }

  // Clone value (shallow)
  clone(): Gluify<T> {
    const operation: Operation = (value: any) => {
      if (Array.isArray(value)) return [...value];
      if (typeof value === 'object' && value !== null) return { ...value };
      return value;
    };
    return this.createNext([...this.operations, operation]);
  }
}

// Global helper function to start the chain
function gluify<T, Args extends any[]>(
  fn: (...args: Args) => T, // Initial function can take any arguments and return T
  ...args: Args
): Gluify<T> {
  // Store the function and arguments to be executed lazily
  const lazyInitializer = () => fn(...args);
  return new Gluify<T>(undefined, [], true, lazyInitializer);
}

export { gluify, Gluify, PipeFunction };
