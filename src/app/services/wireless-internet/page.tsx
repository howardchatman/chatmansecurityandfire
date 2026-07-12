import type { Metadata } from "next";
import WirelessContent from "./_content";

export const metadata: Metadata = {
  title: "Commercial WiFi & Wireless Internet Installation Houston TX | Business Networks",
  description:
    "Commercial wireless internet and WiFi installation in Houston and across Texas. Business-grade access points, wireless site surveys, point-to-point links, and managed networks for offices, warehouses, and multi-building sites. (832) 859-7009",
  keywords: [
    "commercial WiFi installation Houston",
    "business wireless internet Houston TX",
    "wireless access point installation Texas",
    "WiFi site survey Houston",
    "point to point wireless Texas",
    "commercial network installation Houston",
    "warehouse WiFi contractor",
  ],
  alternates: { canonical: "/services/wireless-internet" },
  openGraph: {
    title: "Commercial WiFi & Wireless Internet | Chatman Security & Fire",
    description:
      "Business-grade wireless internet and WiFi installation for offices, warehouses, and multi-building sites across Houston and Texas.",
    url: "https://chatmansecurityandfire.com/services/wireless-internet",
  },
};

export default function WirelessInternetPage() {
  return <WirelessContent />;
}
