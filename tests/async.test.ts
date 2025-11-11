import { describe, it, expect, vi } from 'vitest';
import { gluify } from '../src/Gluify';

describe('Async Functionality', () => {
  describe('.pipeAsync()', () => {
    it('should await Promise before applying function', async () => {
      const asyncFn = async () => ({ value: 42 });

      const result = await gluify(asyncFn)
        .pipeAsync(obj => obj.value)
        .runAsync();

      expect(result).toBe(42);
    });

    it('should resolve Promise from initial function', async () => {
      interface User {
        id: number;
        name: string;
      }

      const fetchUser = async (id: number): Promise<User> => ({
        id,
        name: 'John Doe',
      });

      const result = await gluify(fetchUser, 1)
        .pipeAsync(user => user.name)
        .runAsync();

      expect(result).toBe('John Doe');
    });

    it('should handle multiple pipeAsync in chain', async () => {
      const fetchUser = async () => ({ profile: Promise.resolve({ name: 'Alice' }) });

      const result = await gluify(fetchUser)
        .pipeAsync(user => user.profile)
        .pipeAsync(profile => profile.name)
        .runAsync();

      expect(result).toBe('Alice');
    });

    it('should work with regular pipe after pipeAsync', async () => {
      const result = await gluify(async () => 'hello')
        .pipeAsync(s => s.toUpperCase())
        .pipe(s => s + '!')
        .runAsync();

      expect(result).toBe('HELLO!');
    });

    it('should handle non-Promise values gracefully', async () => {
      const result = await gluify(() => 42)
        .pipeAsync(x => x * 2)
        .runAsync();

      expect(result).toBe(84);
    });

    it('should pass additional arguments', async () => {
      const multiply = (x: number, factor: number) => x * factor;

      const result = await gluify(async () => 5)
        .pipeAsync(multiply, 3)
        .runAsync();

      expect(result).toBe(15);
    });
  });

  describe('Mixed Sync/Async Chains', () => {
    it('should handle sync → async → sync', async () => {
      const syncFn = (x: number) => x + 1;
      const asyncFn = async (x: number) => x * 2;

      const result = await gluify(() => 5)
        .pipe(syncFn)          // 6
        .pipe(asyncFn)         // Promise<12>
        .pipeAsync(x => x + 3) // 15
        .runAsync();

      expect(result).toBe(15);
    });

    it('should handle async → sync → async', async () => {
      const asyncFn1 = async (x: number) => x * 2;
      const syncFn = (x: number) => x + 10;
      const asyncFn2 = async (x: number) => x / 2;

      const result = await gluify(() => 5)
        .pipe(asyncFn1)        // Promise<10>
        .pipeAsync(syncFn)     // 20
        .pipe(asyncFn2)        // Promise<10>
        .pipeAsync(x => x)     // 10
        .runAsync();

      expect(result).toBe(10);
    });
  });

  describe('Real-world Async Scenarios', () => {
    it('should handle API-like async operations', async () => {
      interface User {
        id: number;
        name: string;
        email: string;
      }

      const fetchUser = async (id: number): Promise<User> => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({ id, name: 'John', email: 'john@example.com' });
          }, 10);
        });
      };

      const result = await gluify(fetchUser, 1)
        .pipeAsync(user => user.email)
        .pipe(email => email.toUpperCase())
        .runAsync();

      expect(result).toBe('JOHN@EXAMPLE.COM');
    });

    it('should handle chained async operations', async () => {
      const fetchUser = async (id: number) => ({ id, posts: Promise.resolve([1, 2, 3]) });

      const result = await gluify(fetchUser, 1)
        .pipeAsync(user => user.posts)
        .pipeAsync(posts => posts.length)
        .runAsync();

      expect(result).toBe(3);
    });

    it('should handle file path extraction use case', async () => {
      interface FileInfo {
        id: string;
        path_collection: {
          entries: Array<{ id: string; name: string }>;
        };
      }

      const getFileInfo = async (id: string): Promise<FileInfo> => ({
        id,
        path_collection: {
          entries: [
            { id: '0', name: 'root' },
            { id: '1', name: 'folder1' },
            { id: '2', name: 'folder2' },
          ],
        },
      });

      const result = await gluify(getFileInfo, 'file123')
        .pipeAsync(fileInfo => fileInfo.path_collection.entries.slice(1))
        .pipe(entries => entries.map(e => e.name))
        .pipe(names => names.join('/'))
        .runAsync();

      expect(result).toBe('folder1/folder2');
    });
  });

  describe('Performance & Execution', () => {
    it('should not await if value is not a Promise', async () => {
      const fn = vi.fn((x: number) => x * 2);

      const result = await gluify(() => 5)
        .pipeAsync(fn)
        .runAsync();

      expect(fn).toHaveBeenCalledWith(5);
      expect(result).toBe(10);
    });

    it('should execute pipeAsync operations in order', async () => {
      const order: number[] = [];

      await gluify(async () => 1)
        .pipeAsync(x => { order.push(1); return x; })
        .pipeAsync(x => { order.push(2); return x; })
        .pipeAsync(x => { order.push(3); return x; })
        .runAsync();

      expect(order).toEqual([1, 2, 3]);
    });
  });

  describe('Edge Cases', () => {
    it('should handle Promise that resolves to undefined', async () => {
      const result = await gluify(async () => undefined)
        .pipeAsync(x => x ?? 'fallback')
        .runAsync();

      expect(result).toBe('fallback');
    });

    it('should handle Promise that resolves to null', async () => {
      const result = await gluify(async () => null)
        .pipeAsync(x => x ?? 'fallback')
        .runAsync();

      expect(result).toBe('fallback');
    });

    it('should handle nested Promises', async () => {
      const result = await gluify(async () => Promise.resolve(42))
        .pipeAsync(x => x)
        .runAsync();

      expect(result).toBe(42);
    });
  });
});
