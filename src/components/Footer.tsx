"use client";

import Link from "next/link";
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Linkedin,
  Instagram,
} from "lucide-react";

const footerLinks = {
  services: [
    { name: "Fire Marshal Compliance", href: "/services/fire-marshal-compliance" },
    { name: "Fire Alarm Systems", href: "/services/fire-alarm" },
    { name: "Fire Sprinkler Systems", href: "/services/fire-sprinkler" },
    { name: "Fire Extinguishers", href: "/services/fire-extinguishers" },
    { name: "Emergency Lighting", href: "/services/emergency-lighting" },
    { name: "Fire Lane Markings", href: "/services/fire-lane-marking" },
  ],
  company: [
    { name: "About Us", href: "/about" },
    { name: "Our Team", href: "/about/team" },
    { name: "Service Areas", href: "/service-areas" },
  ],
  support: [
    { name: "Contact Us", href: "/contact" },
    { name: "Request Service", href: "/contact" },
    { name: "24/7 Dispatch", href: "tel:+18324301826" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
  ],
};

const socialLinks = [
  { name: "Facebook", icon: Facebook, href: "#" },
  { name: "LinkedIn", icon: Linkedin, href: "#" },
  { name: "Instagram", icon: Instagram, href: "#" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-950">
      {/* Disclaimer */}
      <div className="bg-neutral-900 border-b border-neutral-800">
        <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-xs text-neutral-500 text-center max-w-4xl mx-auto">
            <strong className="text-neutral-400">Disclaimer:</strong> Final compliance requirements are determined by the Authority Having Jurisdiction (AHJ).
            We help you interpret deficiencies and complete corrective work aligned to applicable codes and local requirements.
          </p>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12">
          {/* Brand & Contact */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <img src="/logo_full.png" alt="Chatman Security and Fire" className="h-12 w-auto" />
            </Link>

            <p className="text-neutral-400 mb-6 max-w-sm">
              Built from the field — alarms, suppression, service, inspections, and real-world
              problem-solving for commercial properties across Houston since 2009.
            </p>

            <div className="space-y-3">
              <a
                href="tel:+18324301826"
                className="flex items-center gap-3 text-neutral-400 hover:text-white transition-colors"
              >
                <Phone className="w-5 h-5 text-orange-500" />
                <span>24/7 Service Dispatch</span>
              </a>
              <a
                href="mailto:info@chatmansecurity.com"
                className="flex items-center gap-3 text-neutral-400 hover:text-white transition-colors"
              >
                <Mail className="w-5 h-5 text-orange-500" />
                <span>info@chatmansecurity.com</span>
              </a>
              <div className="flex items-start gap-3 text-neutral-400">
                <MapPin className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <span>
                  Houston, TX
                  <br />
                  & Surrounding Areas
                </span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold mb-4">Services</h3>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-neutral-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-neutral-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-neutral-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-neutral-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-neutral-800">
        <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-neutral-400 text-sm">
              &copy; {currentYear} Chatman Security and Fire. All rights reserved.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>

            {/* Certifications */}
            <div className="flex items-center gap-4 text-sm text-neutral-500">
              <span>Licensed</span>
              <span>•</span>
              <span>Commercial Specialists</span>
              <span>•</span>
              <span>Since 2009</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
