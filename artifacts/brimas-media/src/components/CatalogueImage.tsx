import { useEffect, useRef, useState, useSyncExternalStore, type ComponentPropsWithoutRef } from 'react';
import { catalogueDelivery } from '../lib/catalogue-delivery';

declare global {
  interface Window {
    PRINT_GARAGE_IMAGE_CDN_BASE?: string;
    PRINT_GARAGE_CLOUDINARY_ENABLED?: boolean;
  }
}

const subscribe = (listener: () => void) => {
  window.addEventListener('print-garage:media-config', listener);
  return () => window.removeEventListener('print-garage:media-config', listener);
};
const snapshot = () => window.PRINT_GARAGE_IMAGE_CDN_BASE ?? '';
const serverSnapshot = () => '';
const cloudSnapshot = () => window.PRINT_GARAGE_CLOUDINARY_ENABLED !== false;
const serverCloudSnapshot = () => true;

// Generic CDN prefixes remain runtime-only. Verified Cloudinary bindings are
// preferred in prerendered HTML as well as the initial hydration render.
export const useImageBase = () => useSyncExternalStore(subscribe, snapshot, serverSnapshot);

type Props = Omit<ComponentPropsWithoutRef<'img'>, 'src' | 'alt'> & { src: string; alt: string };

export function CatalogueImage({ src, alt, width, height, srcSet, sizes, onError, ...props }: Props) {
  const base = useImageBase();
  const enabled = useSyncExternalStore(subscribe, cloudSnapshot, serverCloudSnapshot);
  const [failedSource, setFailedSource] = useState<string>();
  const imageRef = useRef<HTMLImageElement>(null);
  const delivery = catalogueDelivery(src, base, enabled && !srcSet, failedSource === src);
  useEffect(() => {
    // A prerendered remote image can fail before React attaches onError.
    const image = imageRef.current;
    if (delivery.cloudinaryId && image?.complete && image.naturalWidth === 0) {
      setFailedSource(src);
    }
  }, [src, delivery.src, delivery.cloudinaryId]);
  const actualWidth = delivery.cloudinaryId ? delivery.width : width ?? delivery.width;
  const actualHeight = delivery.cloudinaryId ? delivery.height : height ?? delivery.height;
  if (!actualWidth || !actualHeight) {
    throw new Error(`Register intrinsic image dimensions before using ${src}.`);
  }
  const responsive = srcSet ?? delivery.srcSet;
  return (
    <img
      {...props}
      ref={imageRef}
      src={delivery.src}
      alt={delivery.alt ?? alt}
      width={actualWidth}
      height={actualHeight}
      data-cloudinary-asset={delivery.cloudinaryId}
      srcSet={responsive}
      sizes={sizes ?? (responsive ? '(max-width: 700px) calc(100vw - 36px), (max-width: 1100px) 45vw, 30vw' : undefined)}
      onError={(event) => {
        if (delivery.cloudinaryId) setFailedSource(src);
        onError?.(event);
      }}
    />
  );
}