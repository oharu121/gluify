import { describe, it, expect } from 'vitest';
import { gluify } from '../src/Gluify';

describe('Utility Methods', () => {
  describe('Array Utilities', () => {
    describe('.map()', () => {
      it('should map over array elements', () => {
        const result = gluify(() => [1, 2, 3])
          .map(x => x * 2)
          .run();

        expect(result).toEqual([2, 4, 6]);
      });

      it('should provide index to mapper function', () => {
        const result = gluify(() => ['a', 'b', 'c'])
          .map((x, i) => `${x}${i}`)
          .run();

        expect(result).toEqual(['a0', 'b1', 'c2']);
      });
    });

    describe('.filter()', () => {
      it('should filter array elements', () => {
        const result = gluify(() => [1, 2, 3, 4, 5])
          .filter(x => x > 2)
          .run();

        expect(result).toEqual([3, 4, 5]);
      });

      it('should provide index to predicate', () => {
        const result = gluify(() => ['a', 'b', 'c', 'd'])
          .filter((_, i) => i % 2 === 0)
          .run();

        expect(result).toEqual(['a', 'c']);
      });
    });

    describe('.reduce()', () => {
      it('should reduce array to single value', () => {
        const result = gluify(() => [1, 2, 3, 4])
          .reduce((sum, x) => sum + x, 0)
          .run();

        expect(result).toBe(10);
      });

      it('should reduce to different type', () => {
        const result = gluify(() => [1, 2, 3])
          .reduce((obj, x, i) => ({ ...obj, [i]: x }), {} as Record<number, number>)
          .run();

        expect(result).toEqual({ 0: 1, 1: 2, 2: 3 });
      });
    });

    describe('.find()', () => {
      it('should find first matching element', () => {
        const result = gluify(() => [1, 2, 3, 4, 5])
          .find(x => x > 2)
          .run();

        expect(result).toBe(3);
      });

      it('should return undefined if not found', () => {
        const result = gluify(() => [1, 2, 3])
          .find(x => x > 10)
          .run();

        expect(result).toBeUndefined();
      });
    });

    describe('.some()', () => {
      it('should return true if some elements match', () => {
        const result = gluify(() => [1, 2, 3, 4, 5])
          .some(x => x > 3)
          .run();

        expect(result).toBe(true);
      });

      it('should return false if no elements match', () => {
        const result = gluify(() => [1, 2, 3])
          .some(x => x > 10)
          .run();

        expect(result).toBe(false);
      });
    });

    describe('.every()', () => {
      it('should return true if all elements match', () => {
        const result = gluify(() => [2, 4, 6, 8])
          .every(x => x % 2 === 0)
          .run();

        expect(result).toBe(true);
      });

      it('should return false if any element does not match', () => {
        const result = gluify(() => [2, 4, 5, 8])
          .every(x => x % 2 === 0)
          .run();

        expect(result).toBe(false);
      });
    });

    describe('.take()', () => {
      it('should take first n elements', () => {
        const result = gluify(() => [1, 2, 3, 4, 5])
          .take(3)
          .run();

        expect(result).toEqual([1, 2, 3]);
      });

      it('should handle n greater than array length', () => {
        const result = gluify(() => [1, 2])
          .take(5)
          .run();

        expect(result).toEqual([1, 2]);
      });
    });

    describe('.skip()', () => {
      it('should skip first n elements', () => {
        const result = gluify(() => [1, 2, 3, 4, 5])
          .skip(2)
          .run();

        expect(result).toEqual([3, 4, 5]);
      });

      it('should handle n greater than array length', () => {
        const result = gluify(() => [1, 2])
          .skip(5)
          .run();

        expect(result).toEqual([]);
      });
    });

    describe('.sort()', () => {
      it('should sort array with default comparison', () => {
        const result = gluify(() => [3, 1, 4, 1, 5, 9])
          .sort()
          .run();

        expect(result).toEqual([1, 1, 3, 4, 5, 9]);
      });

      it('should sort with custom comparator', () => {
        const result = gluify(() => [3, 1, 4, 1, 5, 9])
          .sort((a, b) => b - a)
          .run();

        expect(result).toEqual([9, 5, 4, 3, 1, 1]);
      });

      it('should not mutate original array', () => {
        const original = [3, 1, 2];
        const result = gluify(() => original)
          .sort()
          .run();

        expect(original).toEqual([3, 1, 2]);
        expect(result).toEqual([1, 2, 3]);
      });
    });

    describe('.reverse()', () => {
      it('should reverse array', () => {
        const result = gluify(() => [1, 2, 3, 4, 5])
          .reverse()
          .run();

        expect(result).toEqual([5, 4, 3, 2, 1]);
      });

      it('should not mutate original array', () => {
        const original = [1, 2, 3];
        const result = gluify(() => original)
          .reverse()
          .run();

        expect(original).toEqual([1, 2, 3]);
        expect(result).toEqual([3, 2, 1]);
      });
    });

    describe('.flat()', () => {
      it('should flatten array one level', () => {
        const result = gluify(() => [[1, 2], [3, 4], [5]])
          .flat()
          .run();

        expect(result).toEqual([1, 2, 3, 4, 5]);
      });

      it('should only flatten one level', () => {
        const result = gluify(() => [[1, [2]], [3, [4]]])
          .flat()
          .run();

        expect(result).toEqual([1, [2], 3, [4]]);
      });
    });

    describe('.unique()', () => {
      it('should remove duplicate values', () => {
        const result = gluify(() => [1, 2, 2, 3, 3, 3, 4])
          .unique()
          .run();

        expect(result).toEqual([1, 2, 3, 4]);
      });

      it('should work with strings', () => {
        const result = gluify(() => ['a', 'b', 'a', 'c', 'b'])
          .unique()
          .run();

        expect(result).toEqual(['a', 'b', 'c']);
      });
    });
  });

  describe('Object Utilities', () => {
    describe('.pick()', () => {
      it('should pick specified keys', () => {
        const result = gluify(() => ({ a: 1, b: 2, c: 3 }))
          .pick('a', 'c')
          .run();

        expect(result).toEqual({ a: 1, c: 3 });
      });

      it('should ignore non-existent keys', () => {
        const result = gluify(() => ({ a: 1, b: 2 }))
          .pick('a', 'c' as any)
          .run();

        expect(result).toEqual({ a: 1 });
      });
    });

    describe('.omit()', () => {
      it('should omit specified keys', () => {
        const result = gluify(() => ({ a: 1, b: 2, c: 3 }))
          .omit('b')
          .run();

        expect(result).toEqual({ a: 1, c: 3 });
      });

      it('should handle multiple keys', () => {
        const result = gluify(() => ({ a: 1, b: 2, c: 3, d: 4 }))
          .omit('b', 'd')
          .run();

        expect(result).toEqual({ a: 1, c: 3 });
      });
    });

    describe('.keys()', () => {
      it('should get object keys', () => {
        const result = gluify(() => ({ a: 1, b: 2, c: 3 }))
          .keys()
          .run();

        expect(result).toEqual(['a', 'b', 'c']);
      });
    });

    describe('.values()', () => {
      it('should get object values', () => {
        const result = gluify(() => ({ a: 1, b: 2, c: 3 }))
          .values()
          .run();

        expect(result).toEqual([1, 2, 3]);
      });
    });

    describe('.entries()', () => {
      it('should get object entries', () => {
        const result = gluify(() => ({ a: 1, b: 2 }))
          .entries()
          .run();

        expect(result).toEqual([['a', 1], ['b', 2]]);
      });
    });

    describe('.merge()', () => {
      it('should merge objects', () => {
        const result = gluify(() => ({ a: 1, b: 2 }))
          .merge({ c: 3, d: 4 })
          .run();

        expect(result).toEqual({ a: 1, b: 2, c: 3, d: 4 });
      });

      it('should override existing keys', () => {
        const result = gluify(() => ({ a: 1, b: 2 }))
          .merge({ b: 99, c: 3 })
          .run();

        expect(result).toEqual({ a: 1, b: 99, c: 3 });
      });
    });
  });

  describe('String Utilities', () => {
    describe('.trim()', () => {
      it('should trim whitespace', () => {
        const result = gluify(() => '  hello  ')
          .trim()
          .run();

        expect(result).toBe('hello');
      });
    });

    describe('.split()', () => {
      it('should split string by separator', () => {
        const result = gluify(() => 'a,b,c')
          .split(',')
          .run();

        expect(result).toEqual(['a', 'b', 'c']);
      });

      it('should split with regex', () => {
        const result = gluify(() => 'a1b2c3')
          .split(/\d/)
          .run();

        expect(result).toEqual(['a', 'b', 'c', '']);
      });
    });

    describe('.join()', () => {
      it('should join array into string', () => {
        const result = gluify(() => ['a', 'b', 'c'])
          .join('-')
          .run();

        expect(result).toBe('a-b-c');
      });

      it('should use default separator', () => {
        const result = gluify(() => ['a', 'b', 'c'])
          .join()
          .run();

        expect(result).toBe('a,b,c');
      });
    });

    describe('.replace()', () => {
      it('should replace first occurrence', () => {
        const result = gluify(() => 'hello world')
          .replace('o', '0')
          .run();

        expect(result).toBe('hell0 world');
      });

      it('should replace with regex', () => {
        const result = gluify(() => 'hello world')
          .replace(/o/g, '0')
          .run();

        expect(result).toBe('hell0 w0rld');
      });
    });

    describe('.toUpperCase()', () => {
      it('should convert to uppercase', () => {
        const result = gluify(() => 'hello')
          .toUpperCase()
          .run();

        expect(result).toBe('HELLO');
      });
    });

    describe('.toLowerCase()', () => {
      it('should convert to lowercase', () => {
        const result = gluify(() => 'HELLO')
          .toLowerCase()
          .run();

        expect(result).toBe('hello');
      });
    });
  });

  describe('General Utilities', () => {
    describe('.defaultTo()', () => {
      it('should use default for null', () => {
        const result = gluify(() => null)
          .defaultTo(42)
          .run();

        expect(result).toBe(42);
      });

      it('should use default for undefined', () => {
        const result = gluify(() => undefined)
          .defaultTo(42)
          .run();

        expect(result).toBe(42);
      });

      it('should not use default for falsy values', () => {
        const result = gluify(() => 0)
          .defaultTo(42)
          .run();

        expect(result).toBe(0);
      });
    });

    describe('.isNil()', () => {
      it('should return true for null', () => {
        const result = gluify(() => null)
          .isNil()
          .run();

        expect(result).toBe(true);
      });

      it('should return true for undefined', () => {
        const result = gluify(() => undefined)
          .isNil()
          .run();

        expect(result).toBe(true);
      });

      it('should return false for other values', () => {
        expect(gluify(() => 0).isNil().run()).toBe(false);
        expect(gluify(() => '').isNil().run()).toBe(false);
        expect(gluify(() => false).isNil().run()).toBe(false);
      });
    });

    describe('.clone()', () => {
      it('should clone array', () => {
        const original = [1, 2, 3];
        const result = gluify(() => original)
          .clone()
          .run();

        expect(result).toEqual([1, 2, 3]);
        expect(result).not.toBe(original);
      });

      it('should clone object', () => {
        const original = { a: 1, b: 2 };
        const result = gluify(() => original)
          .clone()
          .run();

        expect(result).toEqual({ a: 1, b: 2 });
        expect(result).not.toBe(original);
      });

      it('should return primitives as-is', () => {
        expect(gluify(() => 42).clone().run()).toBe(42);
        expect(gluify(() => 'hello').clone().run()).toBe('hello');
      });
    });
  });

  describe('Chained Utility Methods', () => {
    it('should chain array operations', () => {
      const result = gluify(() => [1, 2, 3, 4, 5, 6])
        .filter(x => x > 2)
        .map(x => x * 2)
        .take(2)
        .run();

      expect(result).toEqual([6, 8]);
    });

    it('should chain object and array operations', () => {
      const result = gluify(() => ({ a: 1, b: 2, c: 3 }))
        .values()
        .filter(x => x > 1)
        .map(x => x * 10)
        .run();

      expect(result).toEqual([20, 30]);
    });

    it('should chain string operations', () => {
      const result = gluify(() => '  hello world  ')
        .trim()
        .split(' ')
        .map(s => s.toUpperCase())
        .join('-')
        .run();

      expect(result).toBe('HELLO-WORLD');
    });
  });
});
