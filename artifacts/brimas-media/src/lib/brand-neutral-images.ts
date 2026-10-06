import activeImages from './image-library/active-images.json' with { type: 'json' };

// Use the existing reviewed metadata, not a new image audit or media migration.
// Unreviewed images and images described as carrying third-party marks stay hidden.
export function isNeutralDescription(description?: string | null) {
  return Boolean(description) && !/\b(?:brand(?:ed|ing)?|logos?|initials|clients?|partners?)\b|Peacock artwork/i.test(description!);
}

export function isNeutralProductImage(source: string) {
  const asset = activeImages[source as keyof typeof activeImages];
  return Boolean(asset) && isNeutralDescription(asset.alt);
}
