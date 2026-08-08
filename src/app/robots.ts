import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/portal/", "/tech/", "/district-portal/"],
      },
    ],
    // www, matching the canonical host and the sitemap's own URLs.
    sitemap: "https://www.chatmansecurityandfire.com/sitemap.xml",
  };
}
