import type { Metadata } from "next";
import ContactContent from "./_content";

export const metadata: Metadata = {
  title: "Contact Us — Houston Fire Protection & Security",
  description:
    "Get in touch with Chatman Security & Fire. Failed an inspection or have fire safety questions? Call or text (346) 852-5540, email, or send a message — we respond fast.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return <ContactContent />;
}
