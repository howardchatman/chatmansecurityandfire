"use client";

import Link from "next/link";
import {
  Shield,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
} from "lucide-react";

const footerLinks = {
  services: [
    { name: "Residential Security", href: "/services/residential" },
    { name: "Commercial Security", href: "/services/commercial" },
    { name: "Fire Alarm Systems", href: "/services/fire-alarm" },
    { name: "Video Surveillance", href: "/services/surveillance" },
    { name: "Smart Home Integration", href: "/services/smart-home" },
    { name: "24/7 Monitoring", href: "/services/monitoring" },
  ],
  company: [
    { name: "About Us", href: "/about" },
    { name: "Our Team", href: "/about/team" },
    { name: "Careers", href: "/careers" },
    { name: "News & Blog", href: "/blog" },
    { name: "Testimonials", href: "/testimonials" },
  ],
  support: [
    { name: "Contact Us", href: "/contact" },
    { name: "Customer Portal", href: "/portal" },
    { name: "Service Request", href: "/portal/tickets/new" },
    { name: "FAQs", href: "/faq" },
    { name: "System Status", href: "/status" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Cookie Policy", href: "/cookies" },
    { name: "Licensing", href: "/licensing" },
  ],
};

const socialLinks = [
  { name: "Facebook", icon: Facebook, href: "#" },
  { name: "Twitter", icon: Twitter, href: "#" },
  { name: "LinkedIn", icon: Linkedin, href: "#" },
  { name: "Instagram", icon: Instagram, href: "#" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-950">
      {/* Main Footer */}
      <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12">
          {/* Brand & Contact */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-red-500 to-red-700 p-2.5 rounded-xl">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-white">Security</span>
                <span className="text-xl font-bold text-red-500">
                  Platform
                </span>
              </div>
            </Link>

            <p className="text-neutral-400 mb-6 max-w-sm">
              Professional security and fire alarm solutions protecting homes
              and businesses since 2010. Licensed, insured, and trusted by
              thousands.
            </p>

            <div className="space-y-3">
              <a
                href="tel:+18005551234"
                className="flex items-center gap-3 text-neutral-400 hover:text-white transition-colors"
              >
                <Phone className="w-5 h-5 text-red-500" />
                <span>1-800-555-1234</span>
              </a>
              <a
                href="mailto:info@securityplatform.com"
                className="flex items-center gap-3 text-neutral-400 hover:text-white transition-colors"
              >
                <Mail className="w-5 h-5 text-red-500" />
                <span>info@securityplatform.com</span>
              </a>
              <div className="flex items-start gap-3 text-neutral-400">
                <MapPin className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span>
                  123 Security Blvd, Suite 100
                  <br />
                  Houston, TX 77001
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
                    className="text-neutral-400 hover:text-white transition-colors"
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
                    className="text-neutral-400 hover:text-white transition-colors"
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
                    className="text-neutral-400 hover:text-white transition-colors"
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
                    className="text-neutral-400 hover:text-white transition-colors"
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
              &copy; {currentYear} Security Platform. All rights reserved.
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
              <span>Licensed & Insured</span>
              <span>•</span>
              <span>UL Listed</span>
              <span>•</span>
              <span>5-Star Rated</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
