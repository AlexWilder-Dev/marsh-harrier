import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "The Marsh Harrier",
    short_name: "Marsh Harrier",
    description: "A beer fan's haven in Cowley, Oxford",
    start_url: "/",
    display: "standalone",
    background_color: "#F5F0E6",
    theme_color: "#7E8A4A",
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  };
}
