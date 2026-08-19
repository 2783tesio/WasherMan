import React, { useState, useEffect } from "react";
import { addUser, getUsers, addClothToUser, updateUserClothes, getActiveProfileId, setActiveProfileId } from "../utils/indexedDB";

const categoryIcons = { Tops: "👕", Bottoms: "👖", Traditional: "🥻", Accessories: "🧣", Footwear: "👟", HomeLinen: "🛏️" };

const UserManager = ({ clothesdetail }) => {
  const [profiles, setProfiles] = useState([]);
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCloth, setSelectedCloth] = useState("");
  const [clothName, setClothName] = useState("");
  const [selectedSeeCategory, setSelectedSeeCategory] = useState("");

  useEffect(() => { loadProfiles(); }, []);

  const loadProfiles = async () => {
    const storedUsers = await getUsers();
    setProfiles(storedUsers);
    if (!storedUsers.length) { setUser(null); return; }
    const savedId = getActiveProfileId();
    const active = storedUsers.find(u => u.id === savedId) || storedUsers[0];
    setActiveProfileId(active.id);
    setUser(active);
  };

  const handleProfileChange = e => {
    const active = profiles.find(p => p.id === e.target.value);
    if (!active) return;
    setActiveProfileId(active.id);
    setUser(active);
    setSelectedSeeCategory("");
  };

  const handleAddUser = async () => {
    if (!userName.trim()) return alert("Please enter a user name!");
    await addUser(userName.trim(), []);
    setUserName("");
    await loadProfiles();
  };

  const handleAddCloth = async () => {
    if (!user || !selectedCloth || !clothName.trim() || !selectedCategory) return alert("Please fill all fields!");
    await addClothToUser(user.id, { type: selectedCloth, name: clothName.trim(), category: selectedCategory, ClothCount: 1 });
    setClothName(""); setSelectedCloth("");
    await loadProfiles();
  };

  const handleDeleteCloth = async id => {
    if (!user) return;
    const updated = user.userCloth.filter(cloth => cloth.id !== id);
    await updateUserClothes(user.id, updated);
    setUser(prev => ({ ...prev, userCloth: updated }));
  };

  const categories = Object.keys(clothesdetail);
  const visibleClothes = (user?.userCloth || []).filter(c => !selectedSeeCategory || c.category === selectedSeeCategory);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div><p className="text-sm font-medium text-cyan-600">WARDROBE</p><h2 className="mt-1 text-3xl font-bold text-slate-900">My Clothes</h2><p className="mt-2 text-slate-500">Each profile has its own wardrobe and laundry data.</p></div>
          <div className="rounded-2xl bg-cyan-50 px-5 py-4"><p className="text-xs text-cyan-700">Total items</p><p className="text-2xl font-bold text-cyan-900">{user?.userCloth?.length || 0}</p></div>
        </div>
      </section>

      <section className="rounded-3xl bg-white border border-slate-200 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="flex-1"><label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active profile</label><select value={user?.id || ""} onChange={handleProfileChange} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-cyan-200"><option value="">Select profile</option>{profiles.map(profile => <option key={profile.id} value={profile.id}>{profile.userName}</option>)}</select></div>
          <div className="text-sm text-slate-500">{profiles.length} profile{profiles.length === 1 ? "" : "s"} available</div>
        </div>
      </section>

      {!user ? <section className="max-w-xl rounded-3xl bg-white border border-slate-200 p-6 shadow-sm"><h3 className="text-xl font-bold text-slate-900">Create your profile</h3><p className="mt-1 text-sm text-slate-500">Start by entering your name.</p><div className="mt-5 flex flex-col sm:flex-row gap-3"><input value={userName} onChange={e => setUserName(e.target.value)} placeholder="Your name" className="flex-1 rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-200" /><button onClick={handleAddUser} className="rounded-xl bg-cyan-600 px-5 py-3 font-semibold text-white hover:bg-cyan-700">Create profile</button></div></section> : <>
        <section className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm"><div className="flex items-center gap-3 mb-5"><div className="w-11 h-11 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold text-lg">{user.userName?.charAt(0)?.toUpperCase()}</div><div><h3 className="font-bold text-slate-900">Add clothing item</h3><p className="text-sm text-slate-500">Add an item to {user.userName}'s wardrobe.</p></div></div><div className="grid grid-cols-1 md:grid-cols-3 gap-3"><select value={selectedCategory} onChange={e => { setSelectedCategory(e.target.value); setSelectedCloth(""); }} className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-200"><option value="">Select category</option>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select><select value={selectedCloth} onChange={e => setSelectedCloth(e.target.value)} disabled={!selectedCategory} className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-200 disabled:bg-slate-50"><option value="">Select type</option>{selectedCategory && clothesdetail[selectedCategory].map(c => <option key={c.id} value={c.type}>{c.type}</option>)}</select><input value={clothName} onChange={e => setClothName(e.target.value)} disabled={!selectedCloth} placeholder="Item name (e.g. Black shirt)" className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-200 disabled:bg-slate-50" /></div><button onClick={handleAddCloth} disabled={!selectedCloth || !clothName.trim()} className="mt-4 rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800 disabled:opacity-40">+ Add to wardrobe</button></section>

        <section className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden"><div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between gap-3"><div><h3 className="text-xl font-bold text-slate-900">{user.userName}'s wardrobe</h3><p className="text-sm text-slate-500 mt-1">Only this profile's clothes are shown.</p></div><select value={selectedSeeCategory} onChange={e => setSelectedSeeCategory(e.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"><option value="">All categories</option>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select></div>{visibleClothes.length ? <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">{visibleClothes.map(cloth => <div key={cloth.id} className="rounded-2xl border border-slate-200 p-4 hover:shadow-md transition"><div className="flex items-center gap-3"><div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-xl">{categoryIcons[cloth.category] || "👕"}</div><div className="min-w-0 flex-1"><p className="font-semibold text-slate-800 truncate">{cloth.name}</p><p className="text-sm text-slate-500">{cloth.type} · {cloth.category}</p></div><button onClick={() => handleDeleteCloth(cloth.id)} className="h-9 w-9 rounded-lg text-red-500 hover:bg-red-50" title="Delete">✕</button></div></div>)}</div> : <div className="p-10 text-center text-slate-500"><div className="text-4xl">🧺</div><p className="mt-3 font-semibold text-slate-700">No clothes in this profile</p><p className="text-sm mt-1">Add the first item above.</p></div>}</section>
      </>}
    </div>
  );
};

export default UserManager;
