import { useEffect, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { BANNER_QUERY_KEY, type BannerPage, type BannerResponse } from "@/lib/banners";

export function useBannerImage(page: BannerPage, defaultImage: string) {
  const { data: banners } = useQuery<BannerResponse>({
    queryKey: [BANNER_QUERY_KEY],
  });

  const [heroImage, setHeroImage] = useState(defaultImage);
  const stableDefault = useMemo(() => defaultImage, [defaultImage]);

  useEffect(() => {
    const url = banners?.[page];
    if (typeof url === "string" && url.length > 0) {
      setHeroImage(url);
    } else {
      setHeroImage(stableDefault);
    }
  }, [banners, page, stableDefault]);

  return { heroImage, setHeroImage, banners };
}
