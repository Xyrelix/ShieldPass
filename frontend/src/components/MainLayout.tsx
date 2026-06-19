import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import BackgroundShader from "./BackgroundShader";
import LightRays from "./LightRays";
import GlowOrbs from "./GlowOrbs";

interface MainLayoutProps {
  children: React.ReactNode;
  walletComponent?: React.ReactNode;
}

export default function MainLayout({
  children,
  walletComponent,
}: MainLayoutProps) {
  const location = useLocation();
  const currentPath = location.pathname;
  const isActive = (path: string) => currentPath === path;

  return (
    <div className="min-h-screen flex flex-col relative font-sans">
      {/* Renders the pristine WebGL interactive neural vortex backdrop */}
      <BackgroundShader />
      
      {/* Renders the background/foreground LightRays and GlowOrbs requested by the user */}
      <GlowOrbs />
      <LightRays />

      {/* EVER-PRESENT PINNED TOP HEADER - Restored Nav Bar */}
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] as any }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 bg-transparent"
      >
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="flex items-center gap-3 font-display text-xl font-bold tracking-tight hover:opacity-80 transition-opacity group"
          >
            <div className="relative w-8 h-8 rounded-lg flex items-center justify-center border border-white/20 overflow-hidden bg-white/5 backdrop-blur-md">
              <svg
                className="w-4 h-4 text-white relative z-10 group-hover:scale-110 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <span className="geist-heading text-lg">
              ShieldPass<span className="opacity-50">.zk</span>
            </span>
          </Link>

          {/* Restored Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-mono tracking-wider">
            <Link
              to="/marketplace"
              className={`flex items-center gap-2 transition-all duration-300 ${isActive("/marketplace") ? "opacity-100 font-semibold" : "opacity-60 hover:opacity-100"}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              Marketplace
            </Link>
            <Link
              to="/dashboard"
              className={`flex items-center gap-2 transition-all duration-300 ${isActive("/dashboard") ? "opacity-100 font-semibold" : "opacity-60 hover:opacity-100"}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Dashboard
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {walletComponent && <div className="z-10">{walletComponent}</div>}
        </div>
      </motion.header>

      {/* PRIMARY RENDER BLOCK */}
      <motion.main
        key={currentPath}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.4, 0.25, 1] as any }}
        className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-12 pt-28 relative z-10"
      >
        {children}
      </motion.main>
    </div>
  );
}
