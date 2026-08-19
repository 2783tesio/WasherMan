import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

const categoryIcons = {
  Tops: "👕",
  Bottoms: "👖",
  Traditional: "🥻",
  Accessories: "🧣",
  Footwear: "👟",
  HomeLinen: "🛏️"
};

const UserManager = ({ clothesdetail }) => {
  const [authUser, setAuthUser] = useState(null);
  const [userRecord, setUserRecord] = useState(null);
  const [clothes, setClothes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCloth, setSelectedCloth] = useState("");
  const [clothName, setClothName] = useState("");
  const [selectedSeeCategory, setSelectedSeeCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const categories = Object.keys(clothesdetail || {});

  useEffect(() => {
    loadMyClothes();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      loadMyClothes();
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const loadMyClothes = async () => {
    setLoading(true);
    setError("");

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) {
        setAuthUser(null);
        setUserRecord(null);
        setClothes([]);
        return;
      }

      setAuthUser(user);

      // profiles has been removed. The application username now lives in users.user_name.
      const { data: washerUser, error: userError } = await supabase
        .from("users")
        .select("id, user_name")
        .eq("auth_user_id", user.id)
        .single();

      if (userError) throw userError;
      setUserRecord(washerUser);

      const { data: clothesData, error: clothesError } = await supabase
        .from("clothes")
        .select("id, name, type, category, cloth_count, created_at")
        .eq("user_id", washerUser.id)
        .order("created_at", { ascending: false });

      if (clothesError) throw clothesError;
      setClothes(clothesData || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load your clothes.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCloth = async () => {
    if (!selectedCloth || !clothName.trim() || !selectedCategory || !authUser) {
      setError("Please select a category, type and item name.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      let washerUser = userRecord;

      if (!washerUser) {
        const { data, error: userError } = await supabase
          .from("users")
          .select("id, user_name")
          .eq("auth_user_id", authUser.id)
          .single();

        if (userError) throw userError;
        washerUser = data;
        setUserRecord(data);
      }

      const { error: insertError } = await supabase.from("clothes").insert({
        user_id: washerUser.id,
        name: clothName.trim(),
        type: selectedCloth,
        category: selectedCategory,
        cloth_count: 1
      });

      if (insertError) throw insertError;

      setClothName("");
      setSelectedCloth("");
      await loadMyClothes();
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to add the clothing item.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCloth = async (id) => {
    if (!window.confirm("Delete this clothing item?")) return;

    setError("");
    try {
      const { error: deleteError } = await supabase.from("clothes").delete().eq("id", id);
      if (deleteError) throw deleteError;
      setClothes(prev => prev.filter(cloth => cloth.id !== id));
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to delete the clothing item.");
    }
  };

  const visibleClothes = useMemo(
    () => clothes.filter(c => !selectedSeeCategory || c.category === selectedSeeCategory),
    [clothes, selectedSeeCategory]
  );

  const username = userRecord?.user_name || authUser?.user_metadata?.username || authUser?.email?.split("@")[0] || "User";

  if (loading) {
    return <div className="rounded-3xl bg-white border border-slate-200 p-10 text-center text-slate-500">Loading your wardrobe...</div>;
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="rounded-3xl bg-white border border-slate-200 p-5 sm:p-7 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-cyan-600">MY WARDROBE</p>
            <h2 className="mt-1 text-2xl sm:text-3xl font-bold text-slate-900 truncate">My Clothes</h2>
            <p className="mt-1 text-sm text-slate-500">Your clothes are stored separately from other users.</p>
          </div>
          <div className="shrink-0 w-16 h-16 rounded-2xl bg-cyan-50 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-cyan-700">{clothes.length}</span>
            <span className="text-[10px] text-cyan-600">items</span>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3">
          <div className="w-9 h-9 rounded-full bg-cyan-500 text-white flex items-center justify-center font-bold">
            {username.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs text-slate-400">Signed in as</p>
            <p className="text-sm font-semibold text-slate-800 truncate">{username}</p>
          </div>
        </div>
      </section>

      {error && <div className="rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">{error}</div>}

      <section className="rounded-3xl bg-white border border-slate-200 p-5 sm:p-6 shadow-sm">
        <div className="mb-5">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900">Add clothing</h3>
          <p className="text-sm text-slate-500 mt-1">Add an item to your personal wardrobe.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <select value={selectedCategory} onChange={e => { setSelectedCategory(e.target.value); setSelectedCloth(""); }} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-cyan-200">
            <option value="">Select category</option>
            {categories.map(category => <option key={category} value={category}>{category}</option>)}
          </select>

          <select value={selectedCloth} onChange={e => setSelectedCloth(e.target.value)} disabled={!selectedCategory} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-cyan-200 disabled:bg-slate-50">
            <option value="">Select type</option>
            {selectedCategory && clothesdetail[selectedCategory].map(item => <option key={item.id} value={item.type}>{item.type}</option>)}
          </select>

          <input value={clothName} onChange={e => setClothName(e.target.value)} disabled={!selectedCloth} placeholder="Item name (e.g. Green shirt)" className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-cyan-200 disabled:bg-slate-50" />
        </div>

        <button onClick={handleAddCloth} disabled={saving || !selectedCloth || !clothName.trim()} className="mt-4 w-full sm:w-auto rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-40">
          {saving ? "Adding..." : "+ Add to wardrobe"}
        </button>
      </section>

      <section className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">Your wardrobe</h3>
            <p className="text-sm text-slate-500 mt-1">Only your clothing items are shown.</p>
          </div>
          <select value={selectedSeeCategory} onChange={e => setSelectedSeeCategory(e.target.value)} className="w-full sm:w-auto rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none">
            <option value="">All categories</option>
            {categories.map(category => <option key={category} value={category}>{category}</option>)}
          </select>
        </div>

        {visibleClothes.length ? (
          <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {visibleClothes.map(cloth => (
              <div key={cloth.id} className="rounded-2xl border border-slate-200 p-4 hover:shadow-md transition">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-xl shrink-0">{categoryIcons[cloth.category] || "👕"}</div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-800 truncate">{cloth.name}</p>
                    <p className="text-sm text-slate-500 truncate">{cloth.type} · {cloth.category}</p>
                    <p className="text-xs text-slate-400 mt-1">Quantity: {cloth.cloth_count}</p>
                  </div>
                  <button onClick={() => handleDeleteCloth(cloth.id)} className="h-9 w-9 shrink-0 rounded-lg text-red-500 hover:bg-red-50" title="Delete">✕</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center text-slate-500">
            <div className="text-4xl">👕</div>
            <p className="mt-3 font-semibold text-slate-700">No clothes yet</p>
            <p className="text-sm mt-1">Add your first clothing item above.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default UserManager;
