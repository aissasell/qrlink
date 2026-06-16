import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Topbar from "@/components/Topbar";
import CookieBanner from "@/components/CookieBanner";
import Link from "next/link";
import { Link2 } from "lucide-react";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QRLink | Make your links shorter and share them easily",
  description: "QRLink is a free tool that allows you to create and share QR codes for any URL.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-950">
        <Topbar />
        <div className="pt-[72px] flex-1 flex flex-col">
          {children}
        </div>

        <footer className="w-full mt-auto relative overflow-hidden">
          {/* Subtle gradient separator */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-700 to-transparent absolute top-0" />
          
          <div className="w-full bg-slate-900/50 backdrop-blur-md pt-12 pb-8">
            <div className="max-w-7xl mx-auto px-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                {/* Brand */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2 group">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Link2 className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                      QRLink
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                    The fastest way to shorten links and generate beautiful QR codes for your audience.
                  </p>
                </div>

                {/* Resources */}
                <div className="flex flex-col gap-4 md:items-center">
                  <div>
                    <h3 className="text-slate-200 font-semibold mb-4">Resources</h3>
                    <div className="flex flex-col gap-3 text-sm text-slate-400">
                      <Link href="/dashboard" className="hover:text-indigo-400 transition-colors">Dashboard</Link>
                      <Link href="/profile" className="hover:text-indigo-400 transition-colors">Account</Link>
                    </div>
                  </div>
                </div>

                {/* Legal & Support */}
                <div className="flex flex-col gap-4 md:items-end">
                  <div>
                    <h3 className="text-slate-200 font-semibold mb-4">Support & Legal</h3>
                    <div className="flex flex-col gap-3 text-sm text-slate-400">
                      <Link href="/contact" className="hover:text-indigo-400 transition-colors">Contact Us</Link>
                      <Link href="/terms" className="hover:text-indigo-400 transition-colors">Terms of Service</Link>
                      <Link href="/privacy" className="hover:text-indigo-400 transition-colors">Privacy Policy</Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Copyright */}
              <div className="pt-8 border-t border-slate-800/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                <p className="text-slate-500 text-sm">
                  © {new Date().getFullYear()} QRLink. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </footer>

        <CookieBanner />
      </body>
    </html>
  );
}
