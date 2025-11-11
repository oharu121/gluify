import { describe, it, expect, vi } from 'vitest';
import { gluify } from '../src/Gluify';

describe('Error Handling', () => {
  describe('.catch()', () => {
    it('should catch errors in sync pipeline', () => {
      const throwError = () => {
        throw new Error('Test error');
      };

      const result = gluify(throwError)
        .pipe(x => x)
        .catch(error => 'fallback')
        .run();

      expect(result).toBe('fallback');
    });

    it('should catch errors in async pipeline', async () => {
      const throwError = async () => {
        throw new Error('Async error');
      };

      const result = await gluify(throwError)
        .catch(error => 'fallback')
        .runAsync();

      expect(result).toBe('fallback');
    });

    it('should pass error to handler', () => {
      const errorHandler = vi.fn(error => 'handled');

      gluify(() => {
        throw new Error('Test');
      })
        .catch(errorHandler)
        .run();

      expect(errorHandler).toHaveBeenCalled();
      expect(errorHandler.mock.calls[0][0]).toBeInstanceOf(Error);
      expect(errorHandler.mock.calls[0][0].message).toBe('Test');
    });

    it('should allow recovery with transformation', () => {
      const result = gluify(() => {
        throw new Error('Failed');
      })
        .catch(error => ({ error: true, message: error.message }))
        .run();

      expect(result).toEqual({ error: true, message: 'Failed' });
    });

    it('should catch errors from piped operations', () => {
      const result = gluify(() => 42)
        .pipe(() => {
          throw new Error('Pipe error');
        })
        .catch(() => 'recovered')
        .run();

      expect(result).toBe('recovered');
    });

    it('should not catch errors if no error occurs', () => {
      const errorHandler = vi.fn();

      const result = gluify(() => 42)
        .pipe(x => x * 2)
        .catch(errorHandler)
        .run();

      expect(errorHandler).not.toHaveBeenCalled();
      expect(result).toBe(84);
    });

    it('should allow continuing pipeline after catch', () => {
      const result = gluify(() => {
        throw new Error('Error');
      })
        .catch(() => 10)
        .pipe(x => x * 2)
        .run();

      expect(result).toBe(20);
    });
  });

  describe('.recover()', () => {
    it('should provide fallback value on error', () => {
      const result = gluify(() => {
        throw new Error('Error');
      })
        .recover(42)
        .run();

      expect(result).toBe(42);
    });

    it('should work with async pipelines', async () => {
      const result = await gluify(async () => {
        throw new Error('Async error');
      })
        .recover('fallback')
        .runAsync();

      expect(result).toBe('fallback');
    });

    it('should not use fallback if no error', () => {
      const result = gluify(() => 100)
        .recover(42)
        .run();

      expect(result).toBe(100);
    });
  });

  describe('.when()', () => {
    it('should execute function when predicate is true', () => {
      const result = gluify(() => 10)
        .when(x => x > 5, x => x * 2)
        .run();

      expect(result).toBe(20);
    });

    it('should skip function when predicate is false', () => {
      const result = gluify(() => 3)
        .when(x => x > 5, x => x * 2)
        .run();

      expect(result).toBe(3);
    });

    it('should work with complex predicates', () => {
      interface User {
        age: number;
        name: string;
      }

      const result = gluify((): User => ({ age: 25, name: 'Alice' }))
        .when(
          user => user.age >= 18,
          user => ({ ...user, name: user.name + ' (Adult)' })
        )
        .run();

      expect(result.name).toBe('Alice (Adult)');
    });

    it('should chain multiple when conditions', () => {
      const result = gluify(() => 10)
        .when(x => x > 5, x => x * 2)   // true: 20
        .when(x => x > 15, x => x + 5)  // true: 25
        .when(x => x > 30, x => x * 3)  // false: 25
        .run();

      expect(result).toBe(25);
    });
  });

  describe('Error Propagation', () => {
    it('should propagate errors if not caught', () => {
      expect(() => {
        gluify(() => {
          throw new Error('Uncaught');
        }).run();
      }).toThrow('Uncaught');
    });

    it('should propagate async errors if not caught', async () => {
      await expect(
        gluify(async () => {
          throw new Error('Async uncaught');
        }).runAsync()
      ).rejects.toThrow('Async uncaught');
    });

    it('should stop execution on error', () => {
      const fn = vi.fn();

      try {
        gluify(() => {
          throw new Error('Stop');
        })
          .pipe(fn)
          .run();
      } catch (e) {
        // Expected
      }

      expect(fn).not.toHaveBeenCalled();
    });
  });

  describe('Real-world Error Scenarios', () => {
    it('should handle JSON parse errors', () => {
      const parseJSON = (str: string) => JSON.parse(str);

      const result = gluify(parseJSON, 'invalid json {{{')
        .catch(() => ({ error: true }))
        .run();

      expect(result).toEqual({ error: true });
    });

    it('should handle API failures with fallback', async () => {
      const fetchUser = async (id: number) => {
        throw new Error('Network error');
      };

      const result = await gluify(fetchUser, 1)
        .catch(() => ({ id: 0, name: 'Guest' }))
        .pipeAsync(user => user.name)
        .runAsync();

      expect(result).toBe('Guest');
    });

    it('should validate and recover from invalid data', () => {
      const result = gluify(() => 'not a number')
        .pipe(str => {
          const num = parseInt(str);
          if (isNaN(num)) throw new Error('Invalid number');
          return num;
        })
        .recover(0)
        .run();

      expect(result).toBe(0);
    });
  });

  describe('Multiple Error Handlers', () => {
    it('should use the first catch in chain', () => {
      const handler1 = vi.fn(() => 'first');
      const handler2 = vi.fn(() => 'second');

      const result = gluify(() => {
        throw new Error('Error');
      })
        .catch(handler1)
        .catch(handler2)
        .run();

      expect(handler1).toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
      expect(result).toBe('first');
    });

    it('should catch errors from catch handler', () => {
      const result = gluify(() => {
        throw new Error('First error');
      })
        .catch(() => {
          throw new Error('Second error');
        })
        .catch(() => 'final fallback')
        .run();

      expect(result).toBe('final fallback');
    });
  });
});
