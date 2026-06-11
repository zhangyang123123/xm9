import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatQty(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return Number(n.toFixed(2)).toString();
}

export function generateId(): string {
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
