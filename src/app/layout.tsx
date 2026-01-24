import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Chatman Security & Fire | Professional Security & Fire Alarm Solutions",
  description:
    "Chatman Security and Fire provides comprehensive security and fire alarm solutions for residential and commercial properties. 24/7 monitoring, professional installation, and smart home integration.",
  keywords: [
    "Chatman Security",
    "security systems",
    "fire alarm",
    "home security",
    "business security",
    "alarm monitoring",
    "smart home",
  ],
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
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
