"use client";

import React, { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, doc, getDoc, getDocs, query, orderBy, where } from "firebase/firestore";
import { ArrowLeft, Loader2, Link2, MousePointerClick, TrendingUp, MonitorSmartphone, Globe, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

interface ClickDoc {
  id: string;
  timestamp: any;
  device: string;
  browser: string;
  country: string;
}

const COLORS = ['#818cf8', '#4f46e5', '#38bdf8', '#0ea5e9', '#f472b6', '#db2777'];

export default function LinkAnalyticsPage({ params }: { params: Promise<{ linkId: string }> }) {
  const [linkId, setLinkId] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [linkInfo, setLinkInfo] = useState<any>(null);
  const [clicks, setClicks] = useState<ClickDoc[]>([]);

  useEffect(() => {
    params.then(p => setLinkId(p.linkId));
  }, [params]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && linkId) {
        fetchAnalytics(currentUser.uid, linkId);
      }
    });
    return () => unsubscribe();
  }, [linkId]);

  const fetchAnalytics = async (uid: string, linkId: string) => {
    try {
      const docRef = doc(db, "links", linkId);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists() || docSnap.data().userId !== uid) {
        setLinkInfo(null);
        setLoading(false);
        return;
      }
      setLinkInfo({ id: docSnap.id, ...docSnap.data() });

      const clicksRef = collection(docRef, "clicks");
      const q = query(clicksRef, orderBy("timestamp", "asc"));
      const snapshot = await getDocs(q);
      
      const fetchedClicks = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as ClickDoc[];
      
      setClicks(fetchedClicks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !linkId) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!linkInfo) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
        <div className="max-w-4xl mx-auto text-center py-20 bg-slate-900/50 border border-slate-800 rounded-3xl">
          <Link2 className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <h2 className="text-xl font-medium mb-2">Link Not Found</h2>
          <Link href="/dashboard" className="text-indigo-400 hover:underline">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  // Aggregate data for charts
  const clicksByDate = clicks.reduce((acc: any, click) => {
    if (!click.timestamp) return acc;
    const dateStr = click.timestamp.toDate().toLocaleDateString();
    acc[dateStr] = (acc[dateStr] || 0) + 1;
    return acc;
  }, {});
  const dateData = Object.keys(clicksByDate).map(date => ({ date, clicks: clicksByDate[date] }));

  const deviceDataMap = clicks.reduce((acc: any, click) => {
    const dev = click.device || "Unknown";
    acc[dev] = (acc[dev] || 0) + 1;
    return acc;
  }, {});
  const deviceData = Object.keys(deviceDataMap).map(name => ({ name, value: deviceDataMap[name] }));

  const countryDataMap = clicks.reduce((acc: any, click) => {
    const country = click.country || "Unknown";
    acc[country] = (acc[country] || 0) + 1;
    return acc;
  }, {});
  const countryData = Object.keys(countryDataMap).map(name => ({ name, clicks: countryDataMap[name] })).sort((a,b)=>b.clicks - a.clicks).slice(0, 5);

  const browserDataMap = clicks.reduce((acc: any, click) => {
    const browser = click.browser || "Unknown";
    acc[browser] = (acc[browser] || 0) + 1;
    return acc;
  }, {});
  const browserData = Object.keys(browserDataMap).map(name => ({ name, value: browserDataMap[name] }));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 font-sans relative">
      <div className="max-w-6xl mx-auto relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="p-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-300" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Analytics for /{linkInfo.id}</h1>
            <a href={linkInfo.originalUrl} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">
              {linkInfo.originalUrl}
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 lg:col-span-2 shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 relative z-10">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              Clicks Over Time
            </h3>
            <div className="h-[300px] relative z-10">
              {dateData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dateData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#f8fafc' }} />
                    <Line type="monotone" dataKey="clicks" stroke="#818cf8" strokeWidth={3} dot={{ r: 4, fill: '#818cf8', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#4f46e5' }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500">No time series data available</div>
              )}
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/5 to-transparent pointer-events-none" />
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 relative z-10">
              <MonitorSmartphone className="w-5 h-5 text-fuchsia-400" />
              Devices
            </h3>
            <div className="h-[250px] relative z-10">
              {deviceData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={deviceData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {deviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#f8fafc' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500">No device data available</div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 relative z-10">
              <Globe className="w-5 h-5 text-emerald-400" />
              Top Locations
            </h3>
            <div className="h-[300px] relative z-10">
              {countryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={countryData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                    <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{ fill: '#1e293b' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#f8fafc' }} />
                    <Bar dataKey="clicks" fill="#10b981" radius={[0, 4, 4, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500">No location data available</div>
              )}
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-transparent pointer-events-none" />
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 relative z-10">
              <LayoutDashboard className="w-5 h-5 text-sky-400" />
              Browsers
            </h3>
            <div className="h-[300px] relative z-10">
              {browserData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={browserData} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {browserData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#f8fafc' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500">No browser data available</div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
