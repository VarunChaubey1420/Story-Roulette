/**
 * Cryptographically secure random selection with fallback
 */

export function getRandomIndex(length: number): number {
  if (length <= 0) return 0;
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return array[0] % length;
  }
  return Math.floor(Math.random() * length);
}

export function pickRandom<T>(items: T[], exclude?: T): T {
  if (!items || items.length === 0) {
    throw new Error('Cannot pick from empty array');
  }
  if (items.length === 1) return items[0];

  const pool = exclude !== undefined ? items.filter(i => i !== exclude) : items;
  const effectivePool = pool.length > 0 ? pool : items;
  const index = getRandomIndex(effectivePool.length);
  return effectivePool[index];
}

export function shuffleArray<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = getRandomIndex(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
