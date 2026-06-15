"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth";
import { LogOut, LayoutDashboard, Link2, User as UserIcon } from "lucide-react";

export default function Topbar() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
    <header className="w-full mx-auto border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl z-50 fixed top-0">
      <div className="w-3/4 mx-auto px-6 py-4 flex items-center justify-between ">
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
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 focus:outline-none"
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" className="w-8 h-8 rounded-full border border-slate-700 hover:opacity-80 transition-opacity" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-900/50 border border-indigo-500/30 flex items-center justify-center text-indigo-300 hover:bg-indigo-900/80 transition-colors">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
              </button>
              
              {isDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200">
                    <div className="px-4 py-3 border-b border-slate-800">
                      <p className="text-sm font-medium text-white truncate">{user.displayName || 'User'}</p>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    </div>
                    <Link 
                      href="/dashboard" 
                      onClick={() => setIsDropdownOpen(false)}
                      className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-2 border-b border-slate-800"
                    >
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Link>
                    <button 
                      onClick={() => {
                        setIsDropdownOpen(false);
                        handleSignOut();
                      }} 
                      className="w-full text-left px-4 py-3 text-sm text-rose-400 hover:bg-slate-800 transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
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
      </div>
    </header>
  );
}
