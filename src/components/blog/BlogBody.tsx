import Link from "next/link";
import type { ReactNode } from "react";
import type { BlogBlock } from "@/lib/blog-posts";

const linkClass = "text-orange-600 font-medium underline underline-offset-2 hover:text-orange-700";

// **bold** and [text](href) inside a block's text. Rendered as React nodes, so
// post content can never inject HTML.
function inline(text: string): ReactNode[] {
  const pattern = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  const out: ReactNode[] = [];
  let last = 0;
  let key = 0;
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1] !== undefined) {
      out.push(
        <strong key={key++} className="font-semibold text-gray-900">
          {m[1]}
        </strong>
      );
    } else {
      const href = m[3];
      out.push(
        href.startsWith("/") ? (
          <Link key={key++} href={href} className={linkClass}>
            {m[2]}
          </Link>
        ) : (
          <a key={key++} href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
            {m[2]}
          </a>
        )
      );
    }
    last = pattern.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export default function BlogBody({ blocks }: { blocks: BlogBlock[] }) {
  return (
    <div className="text-gray-700 text-[17px] leading-relaxed">
      {blocks.map((b, i) => {
        switch (b.type) {
          case "h2":
            return (
              <h2 key={i} className="text-2xl font-bold text-[#0D1B2A] mt-10 mb-4">
                {inline(b.text)}
              </h2>
            );
          case "h3":
            return (
              <h3 key={i} className="text-lg font-semibold text-[#0D1B2A] mt-6 mb-2">
                {inline(b.text)}
              </h3>
            );
          case "ul":
            return (
              <ul key={i} className="list-disc pl-6 space-y-2 mb-5">
                {b.items.map((item, j) => (
                  <li key={j}>{inline(item)}</li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={i} className="list-decimal pl-6 space-y-2 mb-5">
                {b.items.map((item, j) => (
                  <li key={j}>{inline(item)}</li>
                ))}
              </ol>
            );
          case "callout":
            return (
              <div key={i} className="my-6 border-l-4 border-[#E85D04] bg-orange-50 rounded-r-xl px-5 py-4 text-gray-800">
                {inline(b.text)}
              </div>
            );
          default:
            return (
              <p key={i} className="mb-5">
                {inline(b.text)}
              </p>
            );
        }
      })}
    </div>
  );
}
