const API_KEY_STORAGE_KEY = "bhootkatha_user_api_key";

export function getUserApiKey(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(API_KEY_STORAGE_KEY);
}

export function setUserApiKey(apiKey: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
}

export function removeUserApiKey(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(API_KEY_STORAGE_KEY);
}

export function isUsingCustomApiKey(): boolean {
  return getUserApiKey() !== null;
}
