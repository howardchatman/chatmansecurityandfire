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
    sitemap: "https://chatmansecurityandfire.com/sitemap.xml",
  };
}
