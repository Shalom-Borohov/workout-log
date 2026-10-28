export function counter(prefix = 'n'): () => string {
  let next = 0

  return () => `${prefix}${++next}`
}
