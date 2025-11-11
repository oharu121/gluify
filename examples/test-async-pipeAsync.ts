// Test pipeAsync - handling async functions in chains
import { gluify } from '../src/Gluify';

// Simulate async API calls
async function fetchUser(id: number): Promise<{ id: number; name: string; email: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ id, name: 'John Doe', email: 'john@example.com' });
    }, 100);
  });
}

async function fetchUserPosts(userId: number): Promise<{ userId: number; posts: string[] }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ userId, posts: ['Post 1', 'Post 2', 'Post 3'] });
    }, 100);
  });
}

async function runExamples() {
  console.log('=== pipeAsync Examples ===\n');

  // Example 1: Basic pipeAsync usage
  console.log('Example 1: Basic pipeAsync with async function');
  const result1 = await gluify(fetchUser, 1)
  .pipeAsync((user) => {
    console.log('User received:', user.name);
    return user.email;
  })
  .pipe((email) => email.toUpperCase())
  .runAsync();
console.log('Final result:', result1);
console.log('Expected: JOHN@EXAMPLE.COM\n');

// Example 2: Multiple pipeAsync in chain
console.log('Example 2: Multiple pipeAsync calls');
const result2 = await gluify(fetchUser, 2)
  .pipeAsync((user) => {
    console.log('Got user:', user.name);
    return fetchUserPosts(user.id); // Returns another Promise
  })
  .pipeAsync((posts) => {
    console.log('Got posts:', posts.posts.length);
    return posts.posts;
  })
  .pipe((posts) => posts.length)
  .runAsync();
console.log('Final result:', result2);
console.log('Expected: 3\n');

// Example 3: Mix pipeAsync and regular pipe
console.log('Example 3: Mixing pipeAsync and pipe');
const result3 = await gluify(fetchUser, 3)
  .pipeAsync((user) => user.name)
  .pipe((name) => name.split(' '))
  .pipe((parts) => parts[0])
  .pipe((firstName) => firstName.toLowerCase())
  .runAsync();
console.log('Final result:', result3);
console.log('Expected: john\n');

// Example 4: Your actual use case - file info example
interface FileInfo {
  id: string;
  name: string;
  path_collection: {
    total_count: number;
    entries: Array<{ id: string; name: string }>;
  };
}

async function getFileInfo(id: string): Promise<FileInfo> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id,
        name: 'document.txt',
        path_collection: {
          total_count: 3,
          entries: [
            { id: '0', name: 'root' },
            { id: '1', name: 'folder1' },
            { id: '2', name: 'folder2' },
          ],
        },
      });
    }, 100);
  });
}

console.log('Example 4: File path extraction (your use case)');
const result4 = await gluify(getFileInfo, 'file123')
  .pipeAsync((fileInfo) => fileInfo.path_collection.entries.slice(1))
  .pipe((entries) => entries.map((e) => e.name))
  .pipe((names) => names.join('/'))
  .runAsync();
console.log('Final result:', result4);
console.log('Expected: folder1/folder2\n');

// Example 5: Error handling with pipeAsync
console.log('Example 5: Error handling with pipeAsync');
async function riskyOperation(): Promise<number> {
  throw new Error('Something went wrong!');
}

const result5 = await gluify(riskyOperation)
  .pipeAsync((value) => value * 2)
  .catch((error) => {
    console.log('Caught error:', error.message);
    return -1;
  })
  .runAsync();
console.log('Final result:', result5);
console.log('Expected: -1\n');

  console.log('=== All pipeAsync tests completed ===');
}

runExamples().catch(console.error);
