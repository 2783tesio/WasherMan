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

function Sidebar({ user, onLogout, darkMode, toggleDarkMode }) {
  const location = useLocation();
  return (
    <aside className="hidden md:flex w-64 shrink-0 min-h-screen flex-col border-r border-slate-200/70 dark:border-white/10 bg-white/75 dark:bg-slate-950/85 backdrop-blur-2xl text-slate-900 dark:text-white">
      <div className="px-6 py-6 border-b border-slate-200/70 dark:border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-cyan-500 flex items-center justify-center text-xl shadow-lg shadow-cyan-500/20">🧺</div>
          <div><h1 className="text-lg font-bold">WasherMan</h1><p className="text-xs text-slate-500 dark:text-slate-400">Laundry Manager</p></div>
        </div>
      </div>
      <nav className="p-4 space-y-1.5 flex-1">
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Workspace</p>
        {navItems.map(item => { const active = location.pathname === item.to; return <Link key={item.to} to={item.to} className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition ${active ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20" : "text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-white/5"}`}><span className="w-6 text-center">{item.icon}</span>{item.label}</Link>; })}
      </nav>
      <div className="p-4 space-y-3">
        <button onClick={toggleDarkMode} className="w-full flex items-center justify-between rounded-xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 px-3 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition"><span>{darkMode ? "☀️ Light mode" : "🌙 Dark mode"}</span><span className="text-xs text-slate-400">{darkMode ? "ON" : "OFF"}</span></button>
        <div className="rounded-2xl bg-slate-100/80 dark:bg-white/5 p-4 border border-slate-200/70 dark:border-white/10"><p className="text-xs text-slate-400">Signed in as</p><p className="mt-1 text-sm font-semibold truncate">{user?.user_metadata?.username || user?.email?.split("@")[0]}</p><button onClick={onLogout} className="mt-3 text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline">Logout</button></div>
      </div>
    </aside>
  );
}

function MobileNav({ user, onLogout, darkMode, toggleDarkMode }) {
  const location = useLocation();
  return <nav className="md:hidden sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-2xl border-b border-slate-200/70 dark:border-white/10 px-3 py-2 flex gap-2 overflow-x-auto"><div className="shrink-0 px-3 py-2 rounded-lg bg-slate-100 dark:bg-white/10 text-sm font-semibold text-slate-700 dark:text-slate-200">👤 {user?.user_metadata?.username || "User"}</div>{navItems.map(item => <Link key={item.to} to={item.to} className={`shrink-0 px-3 py-2 rounded-lg text-sm font-semibold ${location.pathname === item.to ? "bg-cyan-500 text-white" : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"}`}>{item.icon} {item.label}</Link>)}<button onClick={toggleDarkMode} className="shrink-0 px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-300">{darkMode ? "☀️" : "🌙"}</button><button onClick={onLogout} className="shrink-0 px-3 py-2 rounded-lg text-sm text-red-600 dark:text-red-400">Logout</button></nav>;
}

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("washerman-theme") === "dark");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("washerman-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => listener.subscription.unsubscribe();
  }, []);

  const logout = async () => { await supabase.auth.signOut(); };
  const toggleDarkMode = () => setDarkMode(value => !value);
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400">Loading...</div>;
  if (!session) return <Auth onAuthenticated={(user) => setSession({ user })} />;

  const LoadCloth = {
    Tops: [{ id: 1, type: "T-Shirt" }, { id: 2, type: "Shirt" }, { id: 3, type: "Sweater" }, { id: 4, type: "Hoodie" }, { id: 5, type: "Jacket" }, { id: 6, type: "Blazer" }],
    Bottoms: [{ id: 7, type: "Jeans" }, { id: 8, type: "Shorts" }, { id: 9, type: "Trouser" }, { id: 10, type: "Pant" }],
    Traditional: [{ id: 11, type: "Saree" }, { id: 12, type: "Kurta" }, { id: 13, type: "Lehenga" }, { id: 14, type: "Anarkali" }, { id: 15, type: "Kurti" }],
    Accessories: [{ id: 18, type: "Scarf" }, { id: 47, type: "Towel" }],
    Footwear: [{ id: 23, type: "Shoes" }, { id: 24, type: "Slippers" }, { id: 25, type: "Sandals" }, { id: 26, type: "Boots" }],
    HomeLinen: [{ id: 48, type: "Bed Linen" }, { id: 51, type: "Cushion Cover" }, { id: 52, type: "Blanket" }, { id: 53, type: "Quilt" }, { id: 54, type: "Pillow" }, { id: 55, type: "Mattress" }]
  };

  return <Router><div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300"><Sidebar user={session.user} onLogout={logout} darkMode={darkMode} toggleDarkMode={toggleDarkMode} /><main className="min-w-0 flex-1 bg-gradient-to-br from-slate-50 via-white to-cyan-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-cyan-950/20 transition-colors duration-300"><MobileNav user={session.user} onLogout={logout} darkMode={darkMode} toggleDarkMode={toggleDarkMode} /><header className="hidden md:flex h-16 bg-white/55 dark:bg-slate-950/45 backdrop-blur-xl border-b border-slate-200/70 dark:border-white/10 items-center justify-between px-8 sticky top-0 z-30"><div><p className="text-xs text-slate-400">Laundry workspace</p><p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Manage your wardrobe with ease</p></div><div className="text-sm font-semibold text-slate-600 dark:text-slate-300">👤 {session.user?.user_metadata?.username || "User"}</div></header><div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto"><Routes><Route path="/" element={<Home clothesdetail={LoadCloth} />} /><Route path="/user-manager" element={<UserManager clothesdetail={LoadCloth} />} /><Route path="/wash" element={<GivenClothForWash />} /></Routes></div></main></div></Router>;
}

export default App;
