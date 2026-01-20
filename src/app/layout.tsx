import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AIVAChat from "@/components/AIVAChat";

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
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </div>
        <AIVAChat />
      </body>
    </html>
  );
}
