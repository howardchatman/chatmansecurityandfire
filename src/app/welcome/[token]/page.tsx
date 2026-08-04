import type { Metadata } from "next";
import WelcomeContent from "./_content";

export const metadata: Metadata = {
  title: "Set Up Your Login",
  robots: { index: false, follow: false },
};

export default async function WelcomePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <WelcomeContent token={token} />;
}
