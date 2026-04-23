import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge tailwind classes
 * It handles conditional classes and resolves conflicts correctly.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
