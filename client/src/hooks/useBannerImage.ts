import { useQuery } from "@tanstack/react-query";
import type { BannerImage } from "@shared/schema";

export function useBannerImage(pageKey: "parent-form" | "nanny-form" | "contact", fallbackImage: string) {
  const { data: banner } = useQuery<BannerImage>({
    queryKey: [`/api/banners/${pageKey}`],
    retry: false,
    // Don't throw on 404 - banner might not exist yet
    throwOnError: false,
  });

  // Return banner image URL with version for cache-busting
  if (banner?.imageUrl) {
    const version = banner.version || 0;
    return `${banner.imageUrl}?v=${version}`;
  }
  
  return fallbackImage;
}
