import { API_BASE_URL } from "./axios";

export const FALLBACK_PRODUCT_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23192038'/%3E%3Ccircle cx='200' cy='200' r='120' fill='none' stroke='%23d4a55d' stroke-width='2' opacity='0.3'/%3E%3Cpath d='M160 210l25-30 30 35 25-25 35 45H125z' fill='%23d4a55d' opacity='0.4'/%3E%3Ctext x='50%25' y='75%25' dominant-baseline='middle' text-anchor='middle' fill='%23d4a55d' font-family='sans-serif' font-size='16' letter-spacing='2'%3ESHADOW MONARCH%3C/text%3E%3C/svg%3E";

export const getProductImageUrl = (imagePath) => {
  if (!imagePath) return FALLBACK_PRODUCT_IMAGE;
  if (
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://") ||
    imagePath.startsWith("data:")
  ) {
    return imagePath;
  }
  const base = (API_BASE_URL || "").replace(/\/api$/, "");
  const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  return `${base}${cleanPath}`;
};

export const handleImageError = (e) => {
  if (e?.currentTarget) {
    e.currentTarget.onerror = null;
    e.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
  }
};
