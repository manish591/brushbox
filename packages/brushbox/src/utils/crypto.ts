export function createStringId(): string {
  return Date.now().toString(20) + Math.round(Math.random() * 100);
}