import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { BannerImage } from "@shared/schema";

export type PageKey = "parent-form" | "nanny-form" | "contact" | "prestations-page" | "payment-page";

export function useBannerImage(pageKey: PageKey, fallbackImage: string) {
  const [loadedImage, setLoadedImage] = useState<string>(fallbackImage);
  const [isPreloading, setIsPreloading] = useState(false);

  const { data: banner } = useQuery<BannerImage>({
    queryKey: [`/api/banners/${pageKey}`],
    retry: false,
    throwOnError: false,
  });

  useEffect(() => {
    if (!banner?.imageUrl || isPreloading) return;

    const version = banner.version || 0;
    const bannerUrl = `${banner.imageUrl}?v=${version}`;

    // If it's the same as current, no need to preload
    if (bannerUrl === loadedImage) return;

    // Preload the image before displaying it
    setIsPreloading(true);
    const img = new Image();
    
    img.onload = () => {
      // Image fully loaded, now we can display it
      setLoadedImage(bannerUrl);
      setIsPreloading(false);
    };
    
    img.onerror = () => {
      // If loading fails, keep the fallback
      setIsPreloading(false);
    };
    
    img.src = bannerUrl;
  }, [banner, loadedImage, isPreloading]);

  return loadedImage;
}
