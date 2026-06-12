"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { LogOut, LayoutDashboard, Link2 } from "lucide-react";

export default function Topbar() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
  };

  return (
    <header className="w-full px-6 py-4 flex items-center justify-between border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl z-50 fixed top-0">
      <Link href="/" className="flex items-center gap-2 group">
        <div className="p-2 bg-indigo-500/10 rounded-xl group-hover:bg-indigo-500/20 transition-colors">
          <Link2 className="w-5 h-5 text-indigo-400" />
        </div>
        <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          QRLink
        </span>
      </Link>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <Link href="/dashboard" className="px-4 py-2 bg-slate-800/50 hover:bg-slate-700 border border-slate-700 rounded-xl text-sm transition-colors flex items-center gap-2 text-slate-200">
              <LayoutDashboard className="w-4 h-4" /> <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <div className="hidden sm:flex items-center gap-3 ml-2 border-l border-slate-800 pl-6">
              {user.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="w-8 h-8 rounded-full border border-slate-700" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-900/50 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold text-sm">
                  {user.email?.[0].toUpperCase() || 'U'}
                </div>
              )}
            </div>
            <button onClick={handleSignOut} className="p-2 sm:px-4 sm:py-2 bg-slate-800/50 hover:bg-slate-700 border border-slate-700 rounded-xl text-sm transition-colors flex items-center gap-2 text-rose-400">
              <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Sign Out</span>
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link href="/register" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 border border-indigo-500 rounded-xl text-sm font-medium transition-colors text-white shadow-lg shadow-indigo-500/20">
              Register
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
