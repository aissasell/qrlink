"use client";

import React, { useState } from "react";
import QRCode from "react-qr-code";
import { Link2, QrCode, Copy, Check, ArrowRight } from "lucide-react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setIsLoading(true);
    
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://us-central1-qrlink-b845b.cloudfunctions.net";
      const response = await fetch(`${baseUrl}/shorten`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-indigo-500/30 font-sans relative overflow-hidden">
      
      {/* Background gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-fuchsia-600/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />

      <main className="w-full max-w-xl z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-500/10 rounded-2xl mb-4 border border-indigo-500/20 backdrop-blur-xl">
            <QrCode className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent mb-4">
            Shorten & Share
          </h1>
          <p className="text-slate-400 text-lg max-w-md mx-auto">
            Create compact links and beautiful QR codes instantly.
          </p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-2xl border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl">
          <form onSubmit={handleShorten} className="flex flex-col gap-4">
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
      </main>
      
      <footer className="absolute bottom-6 text-slate-500 text-sm">
        Powered by Firebase & Next.js
      </footer>
    </div>
  );
}
