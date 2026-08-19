import React, { useEffect, useState } from "react";
import { getUsers, addClothForWash } from "../utils/indexedDB";
import { useNavigate } from "react-router-dom";
import { Snackbar } from "@mui/material";

const categoryIcons = { Tops: "👕", Bottoms: "👖", Traditional: "🥻", Accessories: "🧣", Footwear: "👟", HomeLinen: "🛏️" };

const Home = ({ clothesdetail }) => {
  const [clothes, setClothes] = useState([]);
  const [selectedClothes, setSelectedClothes] = useState([]);
  const [washDate, setWashDate] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { loadClothes(); }, []);

  const loadClothes = async () => {
    const users = await getUsers();
    if (users.length > 0) setClothes(users[0].userCloth || []);
    else navigate("/user-manager");
    setWashDate(new Date().toISOString().split("T")[0]);
  };

  const handleCheckboxChange = id => setSelectedClothes(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleAddToWash = async () => {
    if (!selectedClothes.length) return alert("Please select at least one cloth to wash.");
    if (!washDate) return alert("Please select a wash date.");
    const selectedClothData = clothes.filter(cloth => selectedClothes.includes(cloth.id));
    await addClothForWash({ date: washDate, clothes: selectedClothData });
    setSelectedClothes([]);
    setOpen(true);
  };

  const changeCount = (id, count, delta) => {
    const next = Math.max(1, count + delta);
    setClothes(prev => prev.map(cloth => cloth.id === id ? { ...cloth, ClothCount: next } : cloth));
  };

  const categories = Object.keys(clothesdetail);
  const totalItems = clothes.reduce((sum, cloth) => sum + (cloth.ClothCount || 0), 0);

  return (
    <div className="space-y-7 pb-20 md:pb-0">
      <section className="rounded-3xl bg-gradient-to-r from-cyan-600 to-blue-700 p-6 sm:p-8 text-white shadow-xl shadow-cyan-900/10">
        <div className="max-w-3xl">
          <p className="text-sm font-medium text-cyan-100">WELCOME TO WASHERMAN</p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">Ready for a fresh wardrobe?</h2>
          <p className="mt-3 text-cyan-50 max-w-xl">Select the clothes you want to wash, choose a date, and keep your laundry organized in one place.</p>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur"><p className="text-xs text-cyan-100">Clothing types</p><p className="text-2xl font-bold">{clothes.length}</p></div>
          <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur"><p className="text-xs text-cyan-100">Total pieces</p><p className="text-2xl font-bold">{totalItems}</p></div>
          <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur"><p className="text-xs text-cyan-100">Selected</p><p className="text-2xl font-bold">{selectedClothes.length}</p></div>
        </div>
      </section>

      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {categories.map(category => (
          <button key={category} onClick={() => setSelectedCategory(selectedCategory === category ? "" : category)} className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${selectedCategory === category ? "border-cyan-400 bg-cyan-50" : "border-slate-200 bg-white"}`}>
            <span className="text-2xl">{categoryIcons[category] || "👚"}</span>
            <p className="mt-3 text-sm font-semibold text-slate-800">{category}</p>
            <p className="text-xs text-slate-400">{clothes.filter(c => c.category === category).length} items</p>
          </button>
        ))}
      </section>

      <section className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div><h3 className="text-xl font-bold text-slate-900">Choose clothes for wash</h3><p className="text-sm text-slate-500 mt-1">Select items and adjust their quantity.</p></div>
          <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-200">
            <option value="">All categories</option>{categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {clothes.length > 0 ? (
          <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {clothes.filter(c => !selectedCategory || c.category === selectedCategory).map(cloth => {
              const selected = selectedClothes.includes(cloth.id);
              return (
                <div key={cloth.id} className={`rounded-2xl border p-4 transition ${selected ? "border-cyan-400 bg-cyan-50/60" : "border-slate-200 bg-white hover:border-slate-300"}`}>
                  <div className="flex items-start gap-3">
                    <input type="checkbox" checked={selected} onChange={() => handleCheckboxChange(cloth.id)} className="mt-1 h-5 w-5 accent-cyan-600" />
                    <div className="min-w-0 flex-1"><p className="font-semibold text-slate-800 truncate">{cloth.name}</p><p className="text-sm text-slate-500">{cloth.type}</p></div>
                    <span className="text-lg">{categoryIcons[cloth.category] || "👕"}</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 p-2">
                    <span className="text-xs font-medium text-slate-500">Quantity</span>
                    <div className="flex items-center gap-3"><button onClick={() => changeCount(cloth.id, cloth.ClothCount || 1, -1)} className="h-8 w-8 rounded-lg bg-white border text-slate-600 hover:bg-slate-100">−</button><span className="w-5 text-center font-semibold">{cloth.ClothCount || 1}</span><button onClick={() => changeCount(cloth.id, cloth.ClothCount || 1, 1)} className="h-8 w-8 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700">+</button></div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : <div className="p-10 text-center"><div className="text-4xl">👕</div><p className="mt-3 font-semibold text-slate-700">No clothes added yet</p><p className="text-sm text-slate-500 mt-1">Add your first clothing item from My Clothes.</p><button onClick={() => navigate("/user-manager")} className="mt-4 rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700">Add clothes</button></div>}

        <div className="hidden md:block p-5 sm:p-6 bg-slate-50 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div><p className="text-sm font-semibold text-slate-800">Wash date</p><p className="text-xs text-slate-500">When should these clothes be washed?</p></div>
            <div className="flex flex-col sm:flex-row gap-3"><input type="date" value={washDate} onChange={e => setWashDate(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-200" /><button onClick={handleAddToWash} className="rounded-xl bg-slate-900 px-5 py-2.5 font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50" disabled={!selectedClothes.length}>🧺 Add to wash</button></div>
          </div>
        </div>
      </section>

      <div className="md:hidden fixed bottom-4 right-4 z-40 w-[min(300px,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-xl shadow-slate-900/15 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-700">Wash date</p>
            <input type="date" value={washDate} onChange={e => setWashDate(e.target.value)} className="mt-1 w-full min-w-0 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-cyan-200" />
          </div>
          <button onClick={handleAddToWash} disabled={!selectedClothes.length} className="mt-4 shrink-0 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40">🧺 Add</button>
        </div>
      </div>

      <Snackbar anchorOrigin={{ vertical: "top", horizontal: "center" }} open={open} onClose={() => setOpen(false)} message="Clothes added to wash successfully!" autoHideDuration={2000} />
    </div>
  );
};

export default Home;
