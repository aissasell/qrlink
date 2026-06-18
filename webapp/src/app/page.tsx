"use client";

import React, { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import { Link2, QrCode, Copy, Check, ArrowRight, Zap, Shield, BarChart3 } from "lucide-react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import Link from "next/link";
import Image from "next/image";
import logo from "@/app/logo.png";
import { useRouter } from "next/navigation";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    if (!user) {
      router.push("/login");
      return;
    }

    setIsLoading(true);
    
    try {
      const token = await user.getIdToken();
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://us-central1-qrlink-b845b.cloudfunctions.net";
      const response = await fetch(`${baseUrl}/shorten`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ url })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to shorten");
      
      const host = window.location.origin;
      setShortUrl(`${host}/${data.id}`);
    } catch (error) {
      console.error(error);
      alert("An error occurred while shortening the link.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (shortUrl) {
      navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex-1 text-slate-100 flex flex-col selection:bg-indigo-500/30 font-sans relative overflow-x-hidden">
      
      {/* Background gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-fuchsia-600/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />

      <main className="w-full max-w-6xl mx-auto px-6 py-20 flex flex-col items-center z-10">
        
        {/* Hero Section */}
        <div className="text-center mb-16 max-w-3xl">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-500/10 rounded-2xl mb-6 border border-indigo-500/20 backdrop-blur-xl">
            <Image src={logo} alt="Logo" className="w-12 h-12 rounded" />
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent mb-6">
            The Ultimate Link <br className="hidden md:block"/> Management Tool
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Create compact, brandable links and beautiful QR codes instantly. Track every click, manage your links in one place, and elevate your marketing.
          </p>
          {!user && (
            <div className="flex items-center justify-center gap-4">
              <Link href="/register" className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-bold text-lg transition-all shadow-[0_0_40px_rgba(79,70,229,0.3)] hover:shadow-[0_0_60px_rgba(79,70,229,0.5)]">
                Get Started for Free
              </Link>
            </div>
          )}
        </div>

        {/* Shortener Tool */}
        <div className="w-full max-w-2xl bg-slate-900/60 backdrop-blur-3xl border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-[26px] blur opacity-20 pointer-events-none" />
          <form onSubmit={handleShorten} className="relative flex flex-col gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Link2 className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type="url"
                required
                placeholder="Paste your long URL here..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-600"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !url}
              className="group relative w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-2xl text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all overflow-hidden"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-600 to-fuchsia-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative flex items-center gap-2">
                {isLoading ? "Generating..." : "Generate Short Link"}
                {!isLoading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
              </span>
            </button>
          </form>

          {shortUrl && (
            <div className="mt-8 pt-8 border-t border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider text-center">
                Your Link is Ready
              </h2>
              
              <div className="flex flex-col items-center gap-6">
                <div className="p-4 bg-white rounded-2xl shadow-xl transform hover:scale-105 transition-transform">
                  <QRCode
                    value={shortUrl}
                    size={200}
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    viewBox={`0 0 256 256`}
                  />
                </div>

                <div className="w-full relative group">
                  <input
                    type="text"
                    readOnly
                    value={shortUrl}
                    className="w-full bg-slate-950/50 border border-slate-700 text-indigo-300 rounded-xl pl-4 pr-12 py-3 focus:outline-none font-medium truncate"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="absolute inset-y-0 right-1 my-1 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center justify-center transition-colors"
                    title="Copy to clipboard"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="mt-32 grid md:grid-cols-3 gap-8 w-full max-w-5xl">
          <div className="bg-slate-900/40 border border-slate-800/50 p-8 rounded-3xl backdrop-blur-sm">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/20">
              <Zap className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Lightning Fast</h3>
            <p className="text-slate-400 leading-relaxed">
              Generate links and QR codes instantly. Built on a globally distributed, high-performance edge network.
            </p>
          </div>
          <div className="bg-slate-900/40 border border-slate-800/50 p-8 rounded-3xl backdrop-blur-sm">
            <div className="w-12 h-12 bg-fuchsia-500/10 rounded-2xl flex items-center justify-center mb-6 border border-fuchsia-500/20">
              <Shield className="w-6 h-6 text-fuchsia-400" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Secure & Reliable</h3>
            <p className="text-slate-400 leading-relaxed">
              Your data is protected with enterprise-grade security, ensuring 99.99% uptime for your critical links.
            </p>
          </div>
          <div className="bg-slate-900/40 border border-slate-800/50 p-8 rounded-3xl backdrop-blur-sm">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20">
              <BarChart3 className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Advanced Analytics</h3>
            <p className="text-slate-400 leading-relaxed">
              Track every click with real-time statistics. Understand your audience and optimize your campaigns.
            </p>
          </div>
        </div>

      </main>
    </div>
  );
}
