"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export default function PersonalStory() {
  return (
    <section className="py-16 bg-white">
      <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="md:w-1/3 flex-shrink-0"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-[4/5]">
              <Image
                src="/howard-field.jpg"
                alt="Howard Chatman working on a fire alarm panel"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 400px"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="md:w-2/3"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0D1B2A] mb-5">
              Why I Started This Company
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              I started Chatman Security &amp; Fire in 2009 because I kept seeing the same thing — building
              owners getting hit with fire marshal violations and not knowing who to call or what the
              codes actually required. Most contractors install what&apos;s on a drawing and move on. I help
              you understand what your building actually needs, build the system to code, and make sure
              it passes inspection the first time.
            </p>
            <p className="text-gray-700 leading-relaxed">
              I&apos;m not a sales rep who hands you off to a crew you never meet. I&apos;m the one who shows up,
              designs the system, and stays on the job until it&apos;s done right.
            </p>
            <Link
              href="/about"
              className="inline-block mt-5 text-[#E85D04] font-semibold hover:underline"
            >
              Learn more about us →
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
