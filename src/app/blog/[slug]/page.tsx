import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Phone } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LeadCaptureForm from "@/components/LeadCaptureForm";
import BlogBody from "@/components/blog/BlogBody";
import { blogPosts, getPost, postUrl } from "@/lib/blog-posts";
import { SITE_URL } from "@/lib/site-services";

// Every post is prerendered; an unknown slug is a 404, not a runtime lookup.
export const dynamicParams = false;

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: postUrl(post),
      publishedTime: post.date,
    },
  };
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "America/Chicago" });

// JSON-LD goes inside a <script>; escape "<" so no string can close the tag.
const jsonLd = (data: unknown) => ({ __html: JSON.stringify(data).replace(/</g, "\\u003c") });

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const post = getPost((await params).slug);
  if (!post) notFound();

  const url = postUrl(post);
  const article = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    url,
    mainEntityOfPage: url,
    articleSection: post.category,
    inLanguage: "en-US",
    author: { "@type": "Organization", "@id": `${SITE_URL}/#business`, name: "Chatman Security & Fire" },
    publisher: { "@id": `${SITE_URL}/#business` },
  };
  const faq = post.faqs?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: post.faqs.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      }
    : null;

  const more = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(article)} />
      {faq && <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(faq)} />}
      <Navbar />
      <main className="pt-20 bg-white">
        <section className="bg-[#0D1B2A] py-14">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <Link href="/blog" className="inline-flex items-center gap-2 text-white/70 hover:text-orange-400 mb-6 transition-colors text-sm">
              <ArrowLeft className="w-4 h-4" />
              All articles
            </Link>
            <p className="text-orange-400 text-xs font-semibold uppercase tracking-[0.2em] mb-3">{post.category}</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-4">{post.title}</h1>
            <p className="text-gray-400 text-sm flex flex-wrap items-center gap-x-4 gap-y-1">
              <span>{fmtDate(post.date)}</span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {post.readMinutes} min read
              </span>
            </p>
          </div>
        </section>

        <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
          <BlogBody blocks={post.body} />

          {post.faqs?.length ? (
            <section className="mt-12 border-t border-gray-200 pt-10">
              <h2 className="text-2xl font-bold text-[#0D1B2A] mb-6">Frequently asked questions</h2>
              <div className="space-y-6">
                {post.faqs.map((f) => (
                  <div key={f.question}>
                    <h3 className="font-semibold text-[#0D1B2A] mb-1.5">{f.question}</h3>
                    <p className="text-gray-700 leading-relaxed">{f.answer}</p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <div className="mt-12 rounded-2xl bg-gray-50 border border-gray-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="font-semibold text-[#0D1B2A]">Need help with this at your building?</p>
            <a
              href="tel:+13468525540"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#E85D04] hover:bg-orange-700 text-white font-semibold rounded-xl text-sm transition-colors"
            >
              <Phone className="w-4 h-4" />
              Call (346) 852-5540
            </a>
          </div>
        </article>

        {more.length > 0 && (
          <section className="bg-gray-50 py-12">
            <div className="max-w-5xl mx-auto px-4 sm:px-6">
              <h2 className="text-xl font-bold text-[#0D1B2A] mb-6">More from the blog</h2>
              <div className="grid gap-5 md:grid-cols-3">
                {more.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/blog/${p.slug}`}
                    className="block bg-white rounded-2xl border border-gray-200 p-5 hover:border-orange-300 hover:shadow-sm transition"
                  >
                    <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide mb-2">{p.category}</p>
                    <h3 className="font-semibold text-[#0D1B2A] leading-snug">{p.title}</h3>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <LeadCaptureForm
          variant="inline"
          heading="Talk to a licensed fire protection contractor"
          subtext="Tell us what's going on at your building. We'll get back to you within one business day."
        />
      </main>
      <Footer />
    </>
  );
}
