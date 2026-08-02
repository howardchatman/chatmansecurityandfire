import type { Metadata } from "next";
import ReviewContent from "./_content";

export const metadata: Metadata = {
  title: "Leave a Review | Chatman Security & Fire",
  description:
    "Thank you for choosing Chatman Security & Fire. Share your experience — your review helps our small Houston business.",
  robots: { index: false, follow: true },
};

export default function ReviewPage() {
  return <ReviewContent />;
}
