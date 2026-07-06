"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Phone, ArrowRight } from "lucide-react";

const HEADLINE_LINE_1 = "Failed inspection?";
const HEADLINE_LINE_2 = "We fix it.";

const stats = [
  { value: "Since 2009", label: "Serving Houston" },
  { value: "Commercial", label: "Specialists" },
  { value: "24/7", label: "Dispatch" },
  { value: "Licensed", label: "& Insured" },
];

function AnimatedWords({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  return (
    <span className={className}>
      {text.split(" ").map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: delay + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="inline-block mr-[0.25em]"
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Parallax: background drifts slower than scroll; text fades as you leave
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 0.6], ["0%", "-10%"]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[92vh] flex flex-col justify-center overflow-hidden bg-[#0D1B2A]"
    >
      {/* Cinematic background — slow Ken Burns zoom + scroll parallax */}
      <motion.div style={{ y: bgY }} className="absolute inset-0">
        <motion.div
          initial={{ scale: 1.12 }}
          animate={{ scale: 1 }}
          transition={{ duration: 14, ease: "linear" }}
          className="absolute inset-0"
        >
          <Image
            src="/hero-sprinkler-dark.png"
            alt="Commercial fire sprinkler head releasing mist"
            fill
            className="object-cover object-[30%_center] -scale-x-100"
            priority
            sizes="100vw"
          />
        </motion.div>
        {/* Legibility gradients: dark from left for text, dark at bottom to blend into page */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0D1B2A] via-[#0D1B2A]/75 to-[#0D1B2A]/20" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0D1B2A] to-transparent" />
      </motion.div>

      {/* Content */}
      <motion.div
        style={{ opacity: textOpacity, y: textY }}
        className="container-custom mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-28 pb-16"
      >
        <div className="max-w-3xl">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.1 }}
            className="text-orange-500 font-semibold tracking-[0.25em] uppercase text-sm mb-6"
          >
            Houston Commercial Fire Protection
          </motion.p>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.05] mb-8">
            <AnimatedWords text={HEADLINE_LINE_1} delay={0.3} />
            <br />
            <AnimatedWords text={HEADLINE_LINE_2} delay={0.65} className="text-orange-500" />
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.1 }}
            className="text-xl text-gray-300 mb-10 max-w-xl"
          >
            Fast corrections. Clear communication. Reinspection-ready.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.3 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link
              href="/start"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-full transition-all shadow-lg shadow-orange-600/30"
            >
              Start Service Request
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="tel:+18328597009"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/25 hover:border-white/60 hover:bg-white/5 text-white font-semibold rounded-full transition-all"
            >
              <Phone className="w-5 h-5" />
              (832) 859-7009
            </a>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats strip — staggered reveal on scroll into view */}
      <div className="relative z-10 border-t border-white/10 mt-auto">
        <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.value}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.15 * i }}
              >
                <p className="text-xl md:text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
