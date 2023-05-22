/**
 * Returns the last part of an url pathname or undefined.
 */
export function getSlug(path: string): string | undefined {
  return path
    .split('/')
    .filter((x) => x)
    .reverse()[0]
}
