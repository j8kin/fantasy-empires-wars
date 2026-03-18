import { getAllLandImages } from './getLandImg';
import { getAllAvatarImages } from './getAvatarImg';

import CelticPatternVertical from './border/CelticPatternVertical.png';
import CelticPatternCorner from './border/CelticPatternCorner.png';
import ButtonImg from './buttons/Button.png';
import ManaVialImg from './mana/mana-vial.png';

const preloadImage = (url: string): Promise<void> =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve(); // don't block on error, just continue
    img.src = url;
  });

export const preloadGameImages = async (onProgress?: (loaded: number, total: number) => void): Promise<void[]> => {
  const allImages: string[] = [
    ...getAllLandImages(),
    ...getAllAvatarImages(),
    CelticPatternVertical,
    CelticPatternCorner,
    ButtonImg,
    ManaVialImg,
  ];

  let loaded = 0;
  const total = allImages.length;

  return Promise.all(
    allImages.map((url) =>
      preloadImage(url).then(() => {
        loaded++;
        onProgress?.(loaded, total);
      })
    )
  );
};
