"use client";

import React, { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import Link from "next/link";
import { Link2, ArrowLeft, Loader2, MousePointerClick } from "lucide-react";

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
        <div className="flex items-center gap-4 mb-12">
          <Link href="/" className="p-3 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Your Dashboard</h1>
            <p className="text-slate-400">Manage your shortened links</p>
          </div>
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
                <div className="flex items-center gap-2 bg-slate-950 py-2 px-4 rounded-xl border border-slate-800 shrink-0">
                  <MousePointerClick className="w-4 h-4 text-slate-400" />
                  <span className="font-medium">{link.clicks} clicks</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
