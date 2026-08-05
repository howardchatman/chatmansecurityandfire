/* eslint-disable @next/next/no-img-element */

// The logo for standalone screens that sit outside the main site chrome —
// enrollment, time clock, login, thank-you pages.
//
// On dark backgrounds the wide logo is inverted to solid white rather than
// swapping in a second asset: the mark's interior is opaque white, so dropping
// it straight onto navy would show as a white block. This matches how the time
// clock screen already renders it.

interface BrandHeaderProps {
  /** Dark backgrounds invert the logo to white. */
  onDark?: boolean;
  /** Tailwind height class for the logo, e.g. "h-12". */
  size?: string;
  className?: string;
}

export default function BrandHeader({
  onDark = false,
  size = "h-12",
  className = "",
}: BrandHeaderProps) {
  return (
    <img
      src="/csf_wide_logo.png"
      alt="Chatman Security & Fire"
      className={`${size} w-auto ${onDark ? "brightness-0 invert" : ""} ${className}`}
    />
  );
}
