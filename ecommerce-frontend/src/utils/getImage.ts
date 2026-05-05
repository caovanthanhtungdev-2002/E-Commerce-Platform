export const getImageSrc = (imageUrl?: string) => {
  const BASE_URL = "http://localhost:8080";

  if (!imageUrl) return "https://picsum.photos/80";

  return imageUrl.startsWith("http")
    ? imageUrl
    : BASE_URL + imageUrl;
};