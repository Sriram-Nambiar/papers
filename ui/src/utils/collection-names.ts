/**
 * Resolve the display label for a collection id/name that has no translated
 * label of its own (e.g. a raw Project Gutenberg LCC shelf code), falling
 * back to the value itself when no `collections.<value>` translation exists.
 */
export function getCollectionLabel(
  value: string,
  translate: (key: string, defaultValue: string) => string
): string {
  return translate(`collections.${value}`, value)
}
