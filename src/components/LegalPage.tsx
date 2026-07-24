import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function LegalPage({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="pt-20 bg-gray-50 min-h-screen">
        {/* Header */}
        <section className="bg-[#0D1B2A] py-14">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white">{title}</h1>
            <p className="text-gray-400 mt-2 text-sm">Last Updated: {lastUpdated}</p>
          </div>
        </section>

        {/* Body */}
        <section className="py-12">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-10 legal-prose">
              {children}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
