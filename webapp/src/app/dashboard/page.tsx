"use client";

import React, { useEffect, useState, useRef } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, query, where, getDocs, orderBy, doc, deleteDoc } from "firebase/firestore";
import { Link2, Loader2, MousePointerClick, ArrowRight, Check, Copy, Trash2, QrCode, BarChart3, TrendingUp, Search, ChevronLeft, ChevronRight } from "lucide-react";
import QRCode from "react-qr-code";
import QRCodeLib from "qrcode";
import { useRouter } from "next/navigation";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface LinkDoc {
  id: string;
  originalUrl: string;
  clicks: number;
  createdAt?: any;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [links, setLinks] = useState<LinkDoc[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Search & Pagination state
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchLinks(currentUser.uid);
      } else {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const inputRef = useRef<HTMLInputElement>(null);

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
    return null;
  }

  const filteredLinks = links.filter((link) => {
    const term = searchTerm.toLowerCase();
    return link.originalUrl.toLowerCase().includes(term) || link.id.toLowerCase().includes(term);
  });

  const totalPages = Math.ceil(filteredLinks.length / itemsPerPage);
  const paginatedLinks = filteredLinks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
                ref={inputRef}
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

        {links.length > 0 && (
          <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-indigo-400" />
              Analytics Overview
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 relative overflow-hidden group hover:border-slate-700 transition-colors">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <p className="text-slate-400 text-sm font-medium mb-2 relative z-10">Total Links</p>
                <p className="text-4xl font-bold relative z-10">{links.length}</p>
              </div>
              <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 relative overflow-hidden group hover:border-slate-700 transition-colors">
                <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <p className="text-slate-400 text-sm font-medium mb-2 relative z-10">Total Clicks</p>
                <div className="flex items-center gap-3 relative z-10">
                  <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-400">
                    {links.reduce((sum, link) => sum + link.clicks, 0)}
                  </p>
                  <TrendingUp className="w-6 h-6 text-indigo-400/50" />
                </div>
              </div>
              <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 relative overflow-hidden group hover:border-slate-700 transition-colors">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <p className="text-slate-400 text-sm font-medium mb-2 relative z-10">Avg Clicks / Link</p>
                <p className="text-4xl font-bold text-slate-300 relative z-10">
                  {links.length > 0 ? (links.reduce((sum, link) => sum + link.clicks, 0) / links.length).toFixed(1) : 0}
                </p>
              </div>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 pb-2 h-[350px] flex flex-col hover:border-slate-700 transition-colors">
              <h3 className="text-sm font-medium text-slate-400 mb-6 uppercase tracking-wider">Top Performing Links</h3>
              <div className="flex-1 min-h-0 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[...links].sort((a, b) => b.clicks - a.clicks).slice(0, 5).map(l => ({ name: `/${l.id}`, clicks: l.clicks, url: l.originalUrl }))} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip 
                      cursor={{ fill: '#1e293b', radius: 4 }}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '16px', color: '#f8fafc', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)' }}
                      labelStyle={{ color: '#818cf8', fontWeight: 'bold', marginBottom: '8px' }}
                      itemStyle={{ color: '#e2e8f0', fontWeight: '500' }}
                    />
                    <Bar dataKey="clicks" fill="url(#colorClicks)" radius={[6, 6, 0, 0]} maxBarSize={60}>
                      <defs>
                        <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#818cf8" stopOpacity={1}/>
                          <stop offset="100%" stopColor="#4f46e5" stopOpacity={1}/>
                        </linearGradient>
                      </defs>
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {links.length > 0 && (
          <div className="mb-6 relative group animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search links by URL or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/60 backdrop-blur-xl border border-slate-800 text-white rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-600 shadow-xl"
            />
          </div>
        )}

        {links.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/50 border border-slate-800 rounded-3xl">
            <Link2 className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <h2 className="text-xl font-medium mb-2">No links found</h2>
            <p className="text-slate-400 mb-6">You haven't shortened any links yet.</p>
            <button 
              onClick={() => inputRef.current?.focus()}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 hover:cursor-pointer rounded-xl transition-colors"
            >
              Create a Link
            </button>
          </div>
        ) : filteredLinks.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/50 border border-slate-800 rounded-3xl animate-in fade-in">
            <Search className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <h2 className="text-xl font-medium mb-2">No results</h2>
            <p className="text-slate-400">No links matched your search "{searchTerm}".</p>
          </div>
        ) : (
          <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
            {paginatedLinks.map((link) => (
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
                  <a
                    href={`/dashboard/${link.id}`}
                    className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-xl transition-colors shrink-0"
                    title="View Detailed Analytics"
                  >
                    <BarChart3 className="w-5 h-5" />
                  </a>
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

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 bg-slate-900/30 p-4 rounded-2xl border border-slate-800">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:hover:bg-slate-800 hover:cursor-pointer rounded-xl transition-colors text-sm font-medium"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <span className="text-slate-400 text-sm">
                  Page <span className="text-white font-medium">{currentPage}</span> of <span className="text-white font-medium">{totalPages}</span>
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:hover:bg-slate-800 hover:cursor-pointer rounded-xl transition-colors text-sm font-medium"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
