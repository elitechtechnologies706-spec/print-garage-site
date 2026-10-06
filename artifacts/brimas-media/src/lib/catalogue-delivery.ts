import activeImages from './image-library/active-images.json' with { type: 'json' };
import { imageDimensions, imageVariants } from './image-dimensions.ts';
import { resolveImageSource } from './image-source.ts';

type ActiveImage = {
  id: string;
  alt: string;
  provenance: string;
  width: number;
  height: number;
  url: string;
  variants: { url: string; width: number; height: number }[];
};
const bindings: Record<string, ActiveImage> = activeImages;

// A local logical URL remains the stable key. Only verified bindings can switch.
export function catalogueDelivery(source: string, base: string, cloudEnabled: boolean, failed = false) {
  const asset = cloudEnabled && !failed ? bindings[source] : undefined;
  if (asset) {
    return {
      src: asset.url,
      alt: asset.alt,
      width: asset.width,
      height: asset.height,
      cloudinaryId: asset.id,
      srcSet: [...asset.variants.map((variant) => `${variant.url} ${variant.width}w`),
        `${asset.url} ${asset.width}w`].join(', '),
    };
  }
  // An error must return to real local files, not another external CDN.
  const localBase = failed ? '' : base;
  const dimensions = imageDimensions[source];
  const variants = imageVariants[source];
  return {
    src: resolveImageSource(source, localBase),
    alt: undefined,
    width: dimensions?.width,
    height: dimensions?.height,
    cloudinaryId: undefined,
    srcSet: variants && dimensions
      ? [...variants.map((variant) => `${resolveImageSource(variant.src, localBase)} ${variant.width}w`),
        `${resolveImageSource(source, localBase)} ${dimensions.width}w`].join(', ')
      : undefined,
  };
}