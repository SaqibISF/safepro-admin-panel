import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getNameFallback(name: string) {
  if (!name || typeof name !== "string") return "";

  const words = name.trim().split(/\s+/);

  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  } else if (words.length === 1) {
    const word = words[0];
    if (word.length === 1) return word[0].toUpperCase();
    return `${word[0]}${word[word.length - 1]}`.toUpperCase();
  }

  return "";
}
