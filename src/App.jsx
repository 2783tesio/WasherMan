import { useEffect, useState } from "react";
import { HashRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import UserManager from "./components/UserManager";
import Home from "./components/Home";
import GivenClothForWash from "./components/GivenClothForWash";
import Auth from "./components/Auth";
import { supabase } from "./lib/supabase";

const navItems = [
  { to: "/", label: "Dashboard", icon: "⌂" },
  { to: "/user-manager", label: "My Clothes", icon: "👕" },
  { to: "/wash", label: "Laundry History", icon: "🧺" }
];

function Sidebar({ user, onLogout }) {
  const location = useLocation();
  return (
    <aside className="hidden md:flex w-64 shrink-0 bg-slate-950 text-white min-h-screen flex-col">
      <div className="px-6 py-7 border-b border-slate-800"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-cyan-500 flex items-center justify-center text-xl">🧺</div><div><h1 className="text-lg font-bold">WasherMan</h1><p className="text-xs text-slate-400">Laundry Manager</p></div></div></div>
      <nav className="p-4 space-y-2 flex-1"><p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Workspace</p>{navItems.map(item => { const active = location.pathname === item.to; return <Link key={item.to} to={item.to} className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition ${active ? "bg-cyan-500 text-white" : "text-slate-300 hover:bg-slate-900 hover:text-white"}`}><span className="w-6 text-center">{item.icon}</span>{item.label}</Link>; })}</nav>
      <div className="p-4"><div className="rounded-2xl bg-slate-900 p-4 border border-slate-800"><p className="text-xs text-slate-400">Signed in as</p><p className="mt-1 text-sm font-semibold truncate">{user?.user_metadata?.username || user?.email?.split("@")[0]}</p><button onClick={onLogout} className="mt-3 text-xs text-cyan-400 hover:text-cyan-300">Logout</button></div></div>
    </aside>
  );
}

function MobileNav({ user, onLogout }) {
  const location = useLocation();
  return <nav className="md:hidden sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 px-3 py-2 flex gap-2 overflow-x-auto"><div className="shrink-0 px-3 py-2 rounded-lg bg-slate-100 text-sm font-semibold">👤 {user?.user_metadata?.username || "User"}</div>{navItems.map(item => <Link key={item.to} to={item.to} className={`shrink-0 px-3 py-2 rounded-lg text-sm font-medium ${location.pathname === item.to ? "bg-cyan-500 text-white" : "text-slate-600 hover:bg-slate-100"}`}>{item.icon} {item.label}</Link>)}<button onClick={onLogout} className="shrink-0 px-3 py-2 rounded-lg text-sm text-red-600">Logout</button></nav>;
}

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => listener.subscription.unsubscribe();
  }, []);

  const logout = async () => { await supabase.auth.signOut(); };
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">Loading...</div>;
  if (!session) return <Auth onAuthenticated={(user) => setSession({ user })} />;

  const LoadCloth = {
    Tops: [{ id: 1, type: "T-Shirt" }, { id: 2, type: "Shirt" }, { id: 3, type: "Sweater" }, { id: 4, type: "Hoodie" }, { id: 5, type: "Jacket" }, { id: 6, type: "Blazer" }],
    Bottoms: [{ id: 7, type: "Jeans" }, { id: 8, type: "Shorts" }, { id: 9, type: "Trouser" }, { id: 10, type: "Pant" }],
    Traditional: [{ id: 11, type: "Saree" }, { id: 12, type: "Kurta" }, { id: 13, type: "Lehenga" }, { id: 14, type: "Anarkali" }, { id: 15, type: "Kurti" }],
    Accessories: [{ id: 18, type: "Scarf" }, { id: 47, type: "Towel" }],
    Footwear: [{ id: 23, type: "Shoes" }, { id: 24, type: "Slippers" }, { id: 25, type: "Sandals" }, { id: 26, type: "Boots" }],
    HomeLinen: [{ id: 48, type: "Bed Linen" }, { id: 51, type: "Cushion Cover" }, { id: 52, type: "Blanket" }, { id: 53, type: "Quilt" }, { id: 54, type: "Pillow" }, { id: 55, type: "Mattress" }]
  };

  return <Router><div className="min-h-screen bg-slate-50 flex"><Sidebar user={session.user} onLogout={logout} /><main className="min-w-0 flex-1"><MobileNav user={session.user} onLogout={logout} /><header className="hidden md:flex h-16 bg-white border-b border-slate-200 items-center justify-between px-8"><div><p className="text-xs text-slate-400">Laundry workspace</p><p className="text-sm font-semibold text-slate-800">Manage your wardrobe with ease</p></div><div className="text-sm font-semibold text-slate-600">👤 {session.user?.user_metadata?.username || "User"}</div></header><div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto"><Routes><Route path="/" element={<Home clothesdetail={LoadCloth} />} /><Route path="/user-manager" element={<UserManager clothesdetail={LoadCloth} />} /><Route path="/wash" element={<GivenClothForWash />} /></Routes></div></main></div></Router>;
}

export default App;
