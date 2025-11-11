import { describe, it, expect, vi } from 'vitest';
import { gluify } from '../src/Gluify';

describe('Core Functionality', () => {
  describe('gluify() initialization', () => {
    it('should create a pipeline with initial function', () => {
      const result = gluify(() => 42).run();
      expect(result).toBe(42);
    });

    it('should pass arguments to initial function', () => {
      const result = gluify(Math.sqrt, 16).run();
      expect(result).toBe(4);
    });

    it('should accept multiple arguments', () => {
      const add = (a: number, b: number) => a + b;
      const result = gluify(add, 5, 3).run();
      expect(result).toBe(8);
    });
  });

  describe('.pipe()', () => {
    it('should chain operations', () => {
      const result = gluify(() => 5)
        .pipe(x => x * 2)
        .pipe(x => x + 10)
        .run();

      expect(result).toBe(20);
    });

    it('should pass additional arguments to piped function', () => {
      const multiply = (x: number, factor: number) => x * factor;
      const result = gluify(() => 5)
        .pipe(multiply, 3)
        .run();

      expect(result).toBe(15);
    });

    it('should handle multiple arguments in pipe', () => {
      const sum = (x: number, a: number, b: number) => x + a + b;
      const result = gluify(() => 10)
        .pipe(sum, 5, 3)
        .run();

      expect(result).toBe(18);
    });

    it('should maintain type safety through chain', () => {
      const result = gluify(() => [1, 2, 3])
        .map(x => x * 2)
        .filter(x => x > 2)
        .reduce((sum, x) => sum + x, 0)
        .run();

      expect(result).toBe(10); // 4 + 6 = 10
    });
  });

  describe('.run()', () => {
    it('should execute synchronous pipeline', () => {
      const result = gluify(() => 'hello')
        .pipe(s => s.toUpperCase())
        .run();

      expect(result).toBe('HELLO');
    });

    it('should execute pipeline only when run() is called', () => {
      const fn = vi.fn(() => 42);
      const pipeline = gluify(fn).pipe(x => x * 2);

      expect(fn).not.toHaveBeenCalled();

      pipeline.run();
      expect(fn).toHaveBeenCalledOnce();
    });

    it('should re-execute on multiple run() calls', () => {
      let counter = 0;
      const pipeline = gluify(() => ++counter);

      expect(pipeline.run()).toBe(1);
      expect(pipeline.run()).toBe(2);
      expect(pipeline.run()).toBe(3);
    });
  });

  describe('.runAsync()', () => {
    it('should execute async pipeline', async () => {
      const result = await gluify(async () => 'hello')
        .pipe(s => s.toUpperCase())
        .runAsync();

      expect(result).toBe('HELLO');
    });

    it('should handle mixed sync/async operations', async () => {
      const asyncFn = async (x: number) => x * 2;
      const result = await gluify(() => 5)
        .pipe(asyncFn)
        .pipe(x => x + 10)
        .runAsync();

      expect(result).toBe(20);
    });

    it('should execute only when runAsync() is called', async () => {
      const fn = vi.fn(async () => 42);
      const pipeline = gluify(fn);

      expect(fn).not.toHaveBeenCalled();

      await pipeline.runAsync();
      expect(fn).toHaveBeenCalledOnce();
    });
  });

  describe('.tap()', () => {
    it('should execute side effect without changing value', () => {
      const sideEffect = vi.fn();
      const result = gluify(() => 42)
        .tap(sideEffect)
        .pipe(x => x * 2)
        .run();

      expect(sideEffect).toHaveBeenCalledWith(42);
      expect(result).toBe(84);
    });

    it('should not affect pipeline value', () => {
      const result = gluify(() => 10)
        .tap(x => x * 100) // Return value ignored
        .run();

      expect(result).toBe(10);
    });

    it('should be executed at correct position in chain', () => {
      const calls: number[] = [];

      gluify(() => 1)
        .pipe(x => x + 1)
        .tap(x => calls.push(x))
        .pipe(x => x + 1)
        .tap(x => calls.push(x))
        .run();

      expect(calls).toEqual([2, 3]);
    });
  });

  describe('Lazy Evaluation', () => {
    it('should not execute until run() is called', () => {
      const fn = vi.fn(() => 42);
      const pipeline = gluify(fn)
        .pipe(x => x * 2)
        .pipe(x => x + 10);

      expect(fn).not.toHaveBeenCalled();

      const result = pipeline.run();
      expect(fn).toHaveBeenCalledOnce();
      expect(result).toBe(94);
    });

    it('should allow building chains dynamically', () => {
      let pipeline = gluify(() => 10);

      const shouldDouble = true;
      if (shouldDouble) {
        pipeline = pipeline.pipe(x => x * 2);
      }

      pipeline = pipeline.pipe(x => x + 5);

      expect(pipeline.run()).toBe(25); // (10 * 2) + 5
    });

    it('should not execute operations during chain building', () => {
      const ops = {
        double: vi.fn((x: number) => x * 2),
        add: vi.fn((x: number) => x + 10),
      };

      gluify(() => 5)
        .pipe(ops.double)
        .pipe(ops.add);

      expect(ops.double).not.toHaveBeenCalled();
      expect(ops.add).not.toHaveBeenCalled();
    });
  });
});
