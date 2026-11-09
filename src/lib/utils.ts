/** Joins class names, skipping empty values (a light stand-in for clsx). */
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}
