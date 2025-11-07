import type { Area } from "react-easy-crop";

interface CropOptions {
  width?: number;
  height?: number;
  mimeType?: "image/jpeg" | "image/png" | "image/webp";
  quality?: number;
}

function createImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = src;
  });
}

export async function getCroppedImageBlob(
  imageSrc: string,
  pixelCrop: Area,
  { width, height, mimeType = "image/jpeg", quality = 0.9 }: CropOptions = {},
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Impossible d'obtenir le contexte du canvas");
  }

  const targetWidth = width ?? pixelCrop.width;
  const targetHeight = height ?? pixelCrop.height;

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  context.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    targetWidth,
    targetHeight,
  );

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Le canvas est vide"));
          return;
        }
        resolve(blob);
      },
      mimeType,
      quality,
    );
  });
}
