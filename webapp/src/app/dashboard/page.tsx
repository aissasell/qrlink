"use client";

import React, { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, query, where, getDocs, orderBy, doc, deleteDoc } from "firebase/firestore";
import Link from "next/link";
import { Link2, ArrowLeft, Loader2, MousePointerClick, ArrowRight, Check, Copy, Trash2, QrCode } from "lucide-react";
import QRCode from "react-qr-code";
import QRCodeLib from "qrcode";

interface LinkDoc {
  id: string;
  originalUrl: string;
  clicks: number;
  createdAt?: any;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [links, setLinks] = useState<LinkDoc[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchLinks(currentUser.uid);
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchLinks = async (uid: string) => {
    try {
      const q = query(
        collection(db, "links"),
        where("userId", "==", uid),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      const fetchedLinks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as LinkDoc[];
      setLinks(fetchedLinks);
    } catch (err) {
      console.error("Error fetching links:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !user) return;

    setIsCreating(true);
    setShortUrl("");
    
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
      setUrl("");
      
      fetchLinks(user.uid);
    } catch (error) {
      console.error(error);
      alert("An error occurred while shortening the link.");
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = () => {
    if (shortUrl) {
      navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDelete = async (linkId: string) => {
    if (!user) return;
    if (!confirm("Are you sure you want to delete this link?")) return;
    
    try {
      await deleteDoc(doc(db, "links", linkId));
      setLinks((prev) => prev.filter((link) => link.id !== linkId));
    } catch (error) {
      console.error("Error deleting link:", error);
      alert("Failed to delete the link.");
    }
  };

  const handleDownloadQR = async (linkId: string) => {
    try {
      const host = window.location.origin;
      const urlToEncode = `${host}/${linkId}`;
      const dataUrl = await QRCodeLib.toDataURL(urlToEncode, {
        width: 1024,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `qr-${linkId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error generating QR code:", err);
      alert("Failed to generate QR code.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 p-4">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-slate-400 mb-8">Please sign in from the home page to view your dashboard.</p>
        <Link href="/" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors">
          Go Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 selection:bg-indigo-500/30 font-sans relative">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Your Dashboard</h1>
            <p className="text-slate-400">Manage your shortened links</p>
          </div>
        </div>

        {/* Form section */}
        <div className="bg-slate-900/60 backdrop-blur-3xl border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative mb-12">
          <form onSubmit={handleShorten} className="relative flex flex-col gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Link2 className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type="url"
                required
                placeholder="Paste your long URL here to shorten..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-600"
              />
            </div>
            <button
              type="submit"
              disabled={isCreating || !url}
              className="group relative w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-2xl text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all overflow-hidden"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-600 to-fuchsia-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative flex items-center gap-2">
                {isCreating ? "Generating..." : "Generate Short Link"}
                {!isCreating && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
              </span>
            </button>
          </form>

          {shortUrl && (
            <div className="mt-8 pt-8 border-t border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider text-center">
                Your Link is Ready
              </h2>
              
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="p-4 bg-white rounded-2xl shadow-xl shrink-0">
                  <QRCode
                    value={shortUrl}
                    size={120}
                    style={{ height: "auto", maxWidth: "100%", width: "120px" }}
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

        {links.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/50 border border-slate-800 rounded-3xl">
            <Link2 className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <h2 className="text-xl font-medium mb-2">No links found</h2>
            <p className="text-slate-400 mb-6">You haven't shortened any links yet.</p>
            <Link href="/" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors">
              Create a Link
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {links.map((link) => (
              <div key={link.id} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition-colors">
                <div className="overflow-hidden">
                  <a href={`/${link.id}`} target="_blank" rel="noreferrer" className="text-indigo-400 font-semibold text-lg hover:underline block truncate">
                    /{link.id}
                  </a>
                  <p className="text-slate-400 text-sm truncate mt-1">{link.originalUrl}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center gap-2 bg-slate-950 py-2 px-4 rounded-xl border border-slate-800">
                    <MousePointerClick className="w-4 h-4 text-slate-400" />
                    <span className="font-medium">{link.clicks} clicks</span>
                  </div>
                  <button 
                    onClick={() => handleDownloadQR(link.id)}
                    className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-400/10 hover:cursor-pointer rounded-xl transition-colors shrink-0"
                    title="Download QR Code"
                  >
                    <QrCode className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(link.id)}
                    className="p-2 hover:cursor-pointer text-red-600 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-colors"
                    title="Delete link"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
