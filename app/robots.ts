import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // The dashboard holds enquiry records with personal contact details, and
        // the deployment index is internal.
        disallow: ["/*/dashboard", "/*/dashboard/", "/site/", "/api/", "/*/thank-you"],
      },
    ],
  };
}
