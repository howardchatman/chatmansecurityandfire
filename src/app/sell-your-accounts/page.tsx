import type { Metadata } from "next";
import SellAccountsContent from "./_content";

export const metadata: Metadata = {
  title: "Sell Your Fire & Security Accounts | Chatman Security & Fire Acquires RMR",
  description:
    "Retiring or exiting? Chatman Security & Fire buys fire alarm, monitoring, inspection, and security accounts in Houston and across Texas. Fair RMR multiples, fast close, and your customers stay in good hands. Direct buyer — no broker.",
  keywords: [
    "sell alarm accounts",
    "sell fire alarm accounts Houston",
    "buy RMR accounts Texas",
    "sell security monitoring accounts",
    "alarm account acquisition",
    "sell fire inspection accounts",
    "alarm company exit Houston",
  ],
  alternates: { canonical: "/sell-your-accounts" },
  openGraph: {
    title: "Sell Your Fire & Security Accounts | Chatman Security & Fire",
    description:
      "A direct, local buyer for your fire alarm, monitoring, inspection, and security accounts. Fair RMR multiples, fast close, customers cared for.",
    url: "https://www.chatmansecurityandfire.com/sell-your-accounts",
  },
};

export default function SellYourAccountsPage() {
  return <SellAccountsContent />;
}
