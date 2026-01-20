import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Security Platform | Professional Security & Fire Alarm Solutions",
  description:
    "Comprehensive security and fire alarm solutions for residential and commercial properties. 24/7 monitoring, professional installation, and smart home integration.",
  keywords: [
    "security systems",
    "fire alarm",
    "home security",
    "business security",
    "alarm monitoring",
    "smart home",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
