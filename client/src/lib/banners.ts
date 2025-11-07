export const BANNER_QUERY_KEY = "/api/banners" as const;

export type BannerPage = "parent-form" | "nanny-form" | "contact";

export type BannerResponse = Partial<Record<BannerPage, string | null>>;
