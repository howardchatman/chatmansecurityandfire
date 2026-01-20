"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Menu,
  X,
  Phone,
  ChevronDown,
  Home,
  Building2,
  Flame,
  Camera,
  Bell,
  Smartphone,
  User,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import SignInModal from "./SignInModal";

const services = [
  {
    name: "Residential Security",
    description: "Protect your home and family",
    href: "/services/residential",
    icon: Home,
  },
  {
    name: "Commercial Security",
    description: "Secure your business assets",
    href: "/services/commercial",
    icon: Building2,
  },
  {
    name: "Fire Alarm Systems",
    description: "Early detection and response",
    href: "/services/fire-alarm",
    icon: Flame,
  },
  {
    name: "Video Surveillance",
    description: "24/7 monitoring solutions",
    href: "/services/surveillance",
    icon: Camera,
  },
  {
    name: "Smart Home Integration",
    description: "Connected home automation",
    href: "/services/smart-home",
    icon: Smartphone,
  },
  {
    name: "24/7 Monitoring",
    description: "Professional monitoring center",
    href: "/services/monitoring",
    icon: Bell,
  },
];

const navigation = [
  { name: "Home", href: "/" },
  { name: "Services", href: "/services", hasDropdown: true },
  { name: "Products", href: "/products" },
  { name: "Pricing", href: "/pricing" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setIsUserMenuOpen(false);
    router.push("/");
  };

  const handleDashboardClick = () => {
    setIsUserMenuOpen(false);
    if (user?.role === "admin") {
      router.push("/admin/dashboard");
    } else {
      router.push("/portal/dashboard");
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white shadow-md"
            : "bg-white/90 backdrop-blur-sm"
        }`}
      >
        <nav className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="relative bg-gradient-to-br from-red-500 to-red-700 p-2.5 rounded-xl shadow-lg shadow-red-500/20">
                  <Shield className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <span className="text-xl font-bold text-gray-900">Security</span>
                <span className="text-xl font-bold text-red-600">Platform</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navigation.map((item) =>
                item.hasDropdown ? (
                  <div
                    key={item.name}
                    className="relative"
                    onMouseEnter={() => setIsServicesOpen(true)}
                    onMouseLeave={() => setIsServicesOpen(false)}
                  >
                    <button className="flex items-center gap-1 px-4 py-2 text-gray-700 hover:text-red-600 font-medium transition-colors">
                      {item.name}
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          isServicesOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {isServicesOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 pt-2"
                        >
                          <div className="w-80 bg-white border border-gray-100 rounded-2xl shadow-xl p-2">
                            {services.map((service) => (
                              <Link
                                key={service.name}
                                href={service.href}
                                className="flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                              >
                                <div className="p-2 bg-red-50 rounded-lg group-hover:bg-red-100 transition-colors">
                                  <service.icon className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {service.name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {service.description}
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="px-4 py-2 text-gray-700 hover:text-red-600 font-medium transition-colors"
                  >
                    {item.name}
                  </Link>
                )
              )}
            </div>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-4">
              <a
                href="tel:+18005551234"
                className="flex items-center gap-2 text-gray-700 hover:text-red-600 transition-colors"
              >
                <div className="p-2 bg-red-50 rounded-full">
                  <Phone className="w-4 h-4 text-red-600" />
                </div>
                <span className="text-sm font-semibold">1-800-555-1234</span>
              </a>

              {/* User Menu or Sign In Button */}
              {user ? (
                <div
                  className="relative"
                  onMouseEnter={() => setIsUserMenuOpen(true)}
                  onMouseLeave={() => setIsUserMenuOpen(false)}
                >
                  <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
                    <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </button>

                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full right-0 pt-2"
                      >
                        <div className="w-56 bg-white border border-gray-100 rounded-xl shadow-xl p-2">
                          <div className="px-3 py-2 border-b border-gray-100 mb-2">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {user.name || user.email}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {user.email}
                            </p>
                            {user.role === "admin" && (
                              <span className="inline-block mt-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded">
                                Admin
                              </span>
                            )}
                          </div>
                          <button
                            onClick={handleDashboardClick}
                            className="flex items-center gap-3 w-full px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left"
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              {user.role === "admin" ? "Admin Dashboard" : "My Dashboard"}
                            </span>
                          </button>
                          <button
                            onClick={handleSignOut}
                            className="flex items-center gap-3 w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
                          >
                            <LogOut className="w-4 h-4" />
                            <span className="text-sm font-medium">Sign Out</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button
                  onClick={() => setIsSignInOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold rounded-full transition-colors"
                >
                  <User className="w-4 h-4" />
                  Sign In
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-700 hover:text-red-600"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="lg:hidden border-t border-gray-100 overflow-hidden bg-white"
              >
                <div className="py-4 space-y-1">
                  {navigation.map((item) => (
                    <div key={item.name}>
                      {item.hasDropdown ? (
                        <div>
                          <button
                            onClick={() => setIsServicesOpen(!isServicesOpen)}
                            className="flex items-center justify-between w-full px-4 py-3 text-gray-700 hover:text-red-600 hover:bg-gray-50 rounded-lg transition-colors font-medium"
                          >
                            {item.name}
                            <ChevronDown
                              className={`w-4 h-4 transition-transform ${
                                isServicesOpen ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                          <AnimatePresence>
                            {isServicesOpen && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="pl-4 space-y-1"
                              >
                                {services.map((service) => (
                                  <Link
                                    key={service.name}
                                    href={service.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-gray-50 rounded-lg transition-colors"
                                  >
                                    <service.icon className="w-4 h-4 text-red-500" />
                                    {service.name}
                                  </Link>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ) : (
                        <Link
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block px-4 py-3 text-gray-700 hover:text-red-600 hover:bg-gray-50 rounded-lg transition-colors font-medium"
                        >
                          {item.name}
                        </Link>
                      )}
                    </div>
                  ))}

                  <div className="pt-4 px-4 space-y-3 border-t border-gray-100 mt-4">
                    <a
                      href="tel:+18005551234"
                      className="flex items-center gap-2 text-gray-700 hover:text-red-600 transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      <span className="font-semibold">1-800-555-1234</span>
                    </a>

                    {user ? (
                      <>
                        <div className="flex items-center gap-3 py-2">
                          <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium">
                              {user.email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {user.name || user.email}
                            </p>
                            {user.role === "admin" && (
                              <span className="text-xs text-red-600 font-medium">
                                Admin
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            handleDashboardClick();
                          }}
                          className="block w-full text-center px-5 py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold rounded-full transition-colors"
                        >
                          {user.role === "admin" ? "Admin Dashboard" : "My Dashboard"}
                        </button>
                        <button
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            handleSignOut();
                          }}
                          className="block w-full text-center px-5 py-3 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-full transition-colors"
                        >
                          Sign Out
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            setIsSignInOpen(true);
                          }}
                          className="block w-full text-center px-5 py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold rounded-full transition-colors"
                        >
                          Sign In
                        </button>
                        <Link
                          href="/contact"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block w-full text-center px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full transition-colors"
                        >
                          Get Free Quote
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </header>

      {/* Sign In Modal */}
      <SignInModal isOpen={isSignInOpen} onClose={() => setIsSignInOpen(false)} />
    </>
  );
}
