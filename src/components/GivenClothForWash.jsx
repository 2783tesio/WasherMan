import React, { useEffect, useState } from "react";
import { getGivenClothesForWash, deleteGivenClothForWash } from "../utils/indexedDB";

const GivenClothForWash = () => {
  const [washRecords, setWashRecords] = useState([]);
  useEffect(() => { loadWashedClothes(); }, []);
  const loadWashedClothes = async () => setWashRecords(await getGivenClothesForWash());
  const handleDelete = async id => { await deleteGivenClothForWash(id); setWashRecords(prev => prev.filter(record => record.id !== id)); };
  const totalPieces = washRecords.reduce((sum, r) => sum + r.clothes.reduce((s, c) => s + (c.ClothCount || 0), 0), 0);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div><p className="text-sm font-medium text-cyan-600">LAUNDRY</p><h2 className="mt-1 text-3xl font-bold text-slate-900">Laundry History</h2><p className="mt-2 text-slate-500">Review the clothes you've scheduled for washing.</p></div>
          <div className="flex gap-3"><div className="rounded-2xl bg-cyan-50 px-5 py-4"><p className="text-xs text-cyan-700">Batches</p><p className="text-2xl font-bold text-cyan-900">{washRecords.length}</p></div><div className="rounded-2xl bg-slate-100 px-5 py-4"><p className="text-xs text-slate-500">Pieces</p><p className="text-2xl font-bold text-slate-800">{totalPieces}</p></div></div>
        </div>
      </section>

      {washRecords.length > 0 ? <div className="space-y-4">{washRecords.map(record => <article key={record.id} className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden"><div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100"><div><p className="text-xs uppercase tracking-wider text-slate-400">Wash date</p><h3 className="mt-1 text-lg font-bold text-slate-900">📅 {record.date}</h3></div><span className="w-fit rounded-full bg-amber-50 text-amber-700 px-3 py-1 text-xs font-semibold">Scheduled</span></div><div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">{record.clothes.map(cloth => <div key={cloth.id} className="rounded-2xl bg-slate-50 border border-slate-100 p-4"><div className="flex items-center justify-between gap-3"><div><p className="font-semibold text-slate-800">{cloth.name}</p><p className="text-sm text-slate-500 mt-1">{cloth.type}</p></div><span className="rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-sm font-semibold text-slate-700">× {cloth.ClothCount || 1}</span></div></div>)}</div><div className="px-5 sm:px-6 pb-5"><button onClick={() => handleDelete(record.id)} className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">Delete batch</button></div></article>)}</div> : <section className="rounded-3xl bg-white border border-slate-200 p-12 text-center shadow-sm"><div className="text-5xl">🧺</div><h3 className="mt-4 text-xl font-bold text-slate-800">No laundry scheduled</h3><p className="mt-2 text-sm text-slate-500">Your scheduled wash batches will appear here.</p></section>}
    </div>
  );
};

export default GivenClothForWash;
