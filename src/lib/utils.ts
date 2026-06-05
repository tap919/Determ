export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

export function getCurrentTime() {
  const now = new Date();
  return now.toTimeString().split(' ')[0] + '.' + now.getMilliseconds().toString().padStart(3, '0');
}
