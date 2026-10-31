import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes, letting later ones win (e.g. a `className` prop over defaults). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
