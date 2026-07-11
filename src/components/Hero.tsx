"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { ChevronDown, Phone, ArrowRight } from "lucide-react";

const stats = [
  { value: "Since 2009", label: "Serving Houston" },
  { value: "New Construction", label: "& Retrofits" },
  { value: "24/7", label: "Dispatch" },
  { value: "Licensed", label: "& Insured" },
];

export default function Hero() {
  const pinRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = useState(0);

  // Scroll progress across the tall pin container (0 at top, 1 once fully scrolled past)
  const { scrollYProgress } = useScroll({
    target: pinRef,
    offset: ["start start", "end end"],
  });
  const scrollHintOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onLoaded = () => setDuration(video.duration || 0);
    if (video.readyState >= 1) onLoaded();
    video.addEventListener("loadedmetadata", onLoaded);
    return () => video.removeEventListener("loadedmetadata", onLoaded);
  }, []);

  useEffect(() => {
    if (!duration) return;
    return scrollYProgress.on("change", (progress) => {
      const video = videoRef.current;
      if (!video) return;
      const targetTime = Math.min(duration - 0.05, Math.max(0, progress * duration));
      if (Math.abs(video.currentTime - targetTime) > 0.02) {
        video.currentTime = targetTime;
      }
    });
  }, [duration, scrollYProgress]);

  return (
    <>
      {/* Pinned scroll-scrubbed video: scrolling drives the sprinkler activation */}
      <div ref={pinRef} className="relative h-[220vh]">
        <div className="sticky top-0 h-screen overflow-hidden bg-[#0D1B2A]">
          <video
            ref={videoRef}
            muted
            playsInline
            preload="auto"
            poster="/hero-activation-poster.jpg"
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/hero-scrub.mp4" type="video/mp4" />
          </video>
          {/* Blend the bottom of the video into the section below */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0D1B2A] to-transparent" />

          <motion.div
            style={{ opacity: scrollHintOpacity }}
            className="absolute bottom-10 inset-x-0 flex flex-col items-center gap-1.5 text-white/70"
          >
            <span className="text-xs uppercase tracking-[0.2em]">Scroll</span>
            <ChevronDown className="w-5 h-5 animate-bounce" />
          </motion.div>
        </div>
      </div>

      {/* Message below the picture */}
      <section className="relative bg-[#0D1B2A]">
        <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-16">
          <div className="max-w-3xl">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-orange-500 font-semibold tracking-[0.25em] uppercase text-sm mb-5"
            >
              Houston Life Safety &amp; Connectivity Infrastructure
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.08] mb-6"
            >
              Working hard to be the <span className="text-orange-500">Best in Infrastructure &amp; Life Safety.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="text-xl text-gray-300 mb-9 max-w-xl"
            >
              Fire alarm, sprinkler, security, fiber optics, and wireless —
              one low-voltage partner for life safety and connectivity across
              your entire building.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                href="/start"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-full transition-all shadow-lg shadow-orange-600/30"
              >
                Request a Bid
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
        </div>

        {/* Stats strip */}
        <div className="border-t border-white/10">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.value}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 * i }}
                >
                  <p className="text-xl md:text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
