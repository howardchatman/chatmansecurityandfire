"use client";

import Link from "next/link";

// A small markdown renderer for assistant replies.
//
// The old widget printed the model's markdown as raw text, so answers arrived
// full of literal ** and #. Rather than pull in a full markdown library for
// chat bubbles, this handles the four things the assistant actually emits:
// headings, bullets, bold, and links to admin pages.
//
// Deliberately not a general markdown parser. Anything it doesn't recognise
// falls through as plain text, which is the right failure for a chat bubble.

/** **bold**, `code`, and [text](/admin/path) inside a line. */
function inline(text: string, keyPrefix: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const pattern = /\*\*(.+?)\*\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)|(https?:\/\/\S+|\/admin\/[\w/-]+)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;

  while ((m = pattern.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const key = `${keyPrefix}-${i++}`;

    if (m[1] !== undefined) {
      out.push(
        <strong key={key} className="font-semibold text-gray-900">
          {m[1]}
        </strong>
      );
    } else if (m[2] !== undefined) {
      out.push(
        <code key={key} className="px-1 py-0.5 rounded bg-gray-100 text-[11px] font-mono">
          {m[2]}
        </code>
      );
    } else if (m[3] !== undefined && m[4] !== undefined) {
      out.push(<Anchor key={key} href={m[4]} label={m[3]} />);
    } else if (m[5] !== undefined) {
      out.push(<Anchor key={key} href={m[5]} label={m[5]} />);
    }
    last = pattern.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function Anchor({ href, label }: { href: string; label: string }) {
  const internal = href.startsWith("/");
  const cls = "text-orange-600 hover:text-orange-700 underline underline-offset-2";
  return internal ? (
    <Link href={href} className={cls}>
      {label}
    </Link>
  ) : (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
      {label}
    </a>
  );
}

export default function AssistantMarkdown({ content }: { content: string }) {
  const lines = content.split("\n");
  const blocks: React.ReactNode[] = [];
  let bullets: string[] = [];

  const flush = () => {
    if (!bullets.length) return;
    blocks.push(
      <ul key={`ul-${blocks.length}`} className="space-y-1 my-1.5 ml-1">
        {bullets.map((b, i) => (
          <li key={i} className="flex gap-1.5">
            <span className="text-orange-500 leading-5 shrink-0">•</span>
            <span className="flex-1">{inline(b, `li-${blocks.length}-${i}`)}</span>
          </li>
        ))}
      </ul>
    );
    bullets = [];
  };

  lines.forEach((raw, i) => {
    const line = raw.trimEnd();
    const bullet = line.match(/^\s*[-*•]\s+(.*)$/);
    const numbered = line.match(/^\s*\d+[.)]\s+(.*)$/);
    const heading = line.match(/^#{1,4}\s+(.*)$/);

    if (bullet || numbered) {
      bullets.push((bullet?.[1] ?? numbered?.[1] ?? "").trim());
      return;
    }
    flush();

    if (!line.trim()) return;

    if (heading) {
      blocks.push(
        <p key={i} className="font-semibold text-gray-900 mt-2 first:mt-0">
          {inline(heading[1], `h-${i}`)}
        </p>
      );
      return;
    }
    blocks.push(
      <p key={i} className="my-1 first:mt-0 last:mb-0">
        {inline(line, `p-${i}`)}
      </p>
    );
  });
  flush();

  return <div className="text-sm leading-relaxed">{blocks}</div>;
}
