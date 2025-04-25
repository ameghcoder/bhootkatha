// src/lib/rate-limiter.ts
const MAX_GENERATIONS_PER_DAY = 15;
const COUNT_STORAGE_KEY = 'bhootkatha_generation_count';
const DATE_STORAGE_KEY = 'bhootkatha_last_generation_date';

/**
 * Gets the current date in YYYY-MM-DD format.
 */
function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Retrieves the current generation count and last generation date from localStorage.
 * Resets the count if the date is not today.
 */
function getGenerationStatus(): { count: number; date: string } {
  const storedCount = localStorage.getItem(COUNT_STORAGE_KEY);
  const storedDate = localStorage.getItem(DATE_STORAGE_KEY);
  const today = getTodayDateString();

  let count = 0;

  if (storedDate === today && storedCount) {
    count = parseInt(storedCount, 10) || 0;
  } else {
    // Reset if date is different or count is missing/invalid
    localStorage.setItem(COUNT_STORAGE_KEY, '0');
    localStorage.setItem(DATE_STORAGE_KEY, today);
  }

  return { count, date: today };
}

/**
 * Checks if the user can generate another story based on the daily limit.
 * @returns boolean - True if generation is allowed, false otherwise.
 */
export function canGenerateStory(): boolean {
   // Check if localStorage is available (runs only on client-side)
   if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    // Allow generation during SSR or if localStorage is unavailable
    return true;
   }
  const { count } = getGenerationStatus();
  return count < MAX_GENERATIONS_PER_DAY;
}

/**
 * Increments the generation count for the current user for today in localStorage.
 */
export function incrementGenerationCount(): void {
   // Check if localStorage is available
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return;
  }

  const { count, date } = getGenerationStatus(); // Ensure date is current
  const newCount = count + 1;
  localStorage.setItem(COUNT_STORAGE_KEY, newCount.toString());
  // Ensure the date is also updated in case this is the first generation of the day
  localStorage.setItem(DATE_STORAGE_KEY, date);
}

/**
 * Gets the remaining generations allowed for today.
 * @returns number - The number of remaining generations.
 */
export function getRemainingGenerations(): number {
    // Check if localStorage is available
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
        return MAX_GENERATIONS_PER_DAY; // Assume full quota if no localStorage
    }
    const { count } = getGenerationStatus();
    return Math.max(0, MAX_GENERATIONS_PER_DAY - count);
}
