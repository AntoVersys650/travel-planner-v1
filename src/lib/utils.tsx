import { twMerge } from 'tailwind-merge';
import { clsx, ClassValue } from 'clsx';

/**
 * Utility function to combine and conditionally apply CSS classes.
 * It uses clsx and tailwind-merge under the hood.
 */
export function cn(...inputs: ClassValue[]): string {
    return twMerge(clsx(inputs));
}
