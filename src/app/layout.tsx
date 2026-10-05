import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import LocalBusinessSchema from "@/components/LocalBusinessSchema";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Chatman Security & Fire | Houston Commercial Fire Protection & Compliance",
    template: "%s | Chatman Security & Fire",
  },
  description:
    "Houston's trusted commercial fire protection company since 2009. Fire alarm systems, sprinklers, extinguishers, fire marshal compliance, and Brinks security. Licensed & insured. 24/7 dispatch. (346) 852-5540.",
  metadataBase: new URL("https://www.chatmansecurityandfire.com"),
  alternates: {
    types: { "application/rss+xml": "https://www.chatmansecurityandfire.com/rss.xml" },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.chatmansecurityandfire.com",
    siteName: "Chatman Security & Fire",
    title: "Chatman Security & Fire | Houston Commercial Fire Protection & Compliance",
    description:
      "Houston's trusted commercial fire protection company since 2009. Fire alarms, sprinklers, extinguishers, fire marshal compliance, and Brinks security. (346) 852-5540.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Chatman Security & Fire" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Chatman Security & Fire | Houston Commercial Fire Protection",
    description: "Houston's trusted commercial fire protection company since 2009. (346) 852-5540.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/logo_only.png", sizes: "any" },
      { url: "/logo_only.png", sizes: "32x32", type: "image/png" },
      { url: "/logo_only.png", sizes: "192x192", type: "image/png" },
      { url: "/logo_only.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/logo_only.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {/* Business identity for search engines and AI assistants, on every page. */}
        <LocalBusinessSchema />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
