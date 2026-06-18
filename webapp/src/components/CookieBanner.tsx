"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if the user has already accepted the banner
    const consent = localStorage.getItem("qrlink_cookie_consent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("qrlink_cookie_consent", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-800 p-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-slate-300">
          We use cookies to ensure you get the best experience on our website, securely manage your sessions, and analyze usage. By clicking "Accept", you agree to our use of cookies as described in our{" "}
          <Link href="/privacy" className="text-emerald-400 hover:text-emerald-300 underline">
            Privacy Policy
          </Link>.
        </div>
        <button
          onClick={acceptCookies}
          className="whitespace-nowrap px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Accept Cookies
        </button>
      </div>
    </div>
  );
}
