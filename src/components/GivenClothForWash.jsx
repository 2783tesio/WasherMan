import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const GivenClothForWash = () => {
  const [authUser, setAuthUser] = useState(null);
  const [washRecords, setWashRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadHistory();
    const { data: listener } = supabase.auth.onAuthStateChange(() => loadHistory());
    return () => listener.subscription.unsubscribe();
  }, []);

  const getCurrentWasherUser = async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!user) return null;

    setAuthUser(user);

    const { data, error } = await supabase
      .from("users")
      .select("id, user_name")
      .eq("auth_user_id", user.id)
      .single();

    if (error) throw error;
    return data;
  };

  const loadHistory = async () => {
    setLoading(true);
    setError("");
    try {
      const washerUser = await getCurrentWasherUser();
      if (!washerUser) {
        setWashRecords([]);
        return;
      }

      const { data, error: batchError } = await supabase
        .from("wash_batches")
        .select(`
          id,
          wash_date,
          created_at,
          wash_items (
            id,
            quantity,
            cloth_id,
            clothes (id, name, type, category)
          )
        `)
        .eq("user_id", washerUser.id)
        .order("wash_date", { ascending: false })
        .order("created_at", { ascending: false });

      if (batchError) throw batchError;

      setWashRecords((data || []).map(batch => ({
        id: batch.id,
        date: batch.wash_date,
        clothes: (batch.wash_items || []).map(item => ({
          id: item.id,
          clothId: item.cloth_id,
          name: item.clothes?.name || "Clothing item",
          type: item.clothes?.type || "",
          category: item.clothes?.category || "",
          quantity: item.quantity || 1
        }))
      })));
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load laundry history.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this laundry batch?")) return;
    setError("");
    try {
      const { error: deleteError } = await supabase
        .from("wash_batches")
        .delete()
        .eq("id", id);
      if (deleteError) throw deleteError;
      setWashRecords(prev => prev.filter(record => record.id !== id));
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to delete the laundry batch.");
    }
  };

  const totalPieces = washRecords.reduce(
    (sum, record) => sum + record.clothes.reduce((s, cloth) => s + (cloth.quantity || 0), 0),
    0
  );

  const username = authUser?.user_metadata?.username || authUser?.email?.split("@")[0] || "User";

  if (loading) {
    return <div className="rounded-3xl bg-white border border-slate-200 p-10 text-center text-slate-500">Loading your laundry history...</div>;
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="rounded-3xl bg-white border border-slate-200 p-5 sm:p-7 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-cyan-600">MY LAUNDRY</p>
            <h2 className="mt-1 text-2xl sm:text-3xl font-bold text-slate-900">Laundry History</h2>
            <p className="mt-1 text-sm text-slate-500">Your laundry batches, stored separately from other users.</p>
          </div>
          <div className="flex gap-3">
            <div className="rounded-2xl bg-cyan-50 px-5 py-3 text-center">
              <p className="text-xs text-cyan-600">Batches</p>
              <p className="text-xl font-bold text-cyan-800">{washRecords.length}</p>
            </div>
            <div className="rounded-2xl bg-slate-100 px-5 py-3 text-center">
              <p className="text-xs text-slate-500">Pieces</p>
              <p className="text-xl font-bold text-slate-800">{totalPieces}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3">
          <div className="w-9 h-9 rounded-full bg-cyan-500 text-white flex items-center justify-center font-bold">
            {username.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-xs text-slate-400">Signed in as</p>
            <p className="text-sm font-semibold text-slate-800">{username}</p>
          </div>
        </div>
      </section>

      {error && <div className="rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">{error}</div>}

      {washRecords.length > 0 ? (
        <div className="space-y-4">
          {washRecords.map(record => (
            <article key={record.id} className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100">
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-400">Wash date</p>
                  <h3 className="mt-1 text-lg font-bold text-slate-900">📅 {record.date}</h3>
                </div>
                <span className="w-fit rounded-full bg-amber-50 text-amber-700 px-3 py-1 text-xs font-semibold">Scheduled</span>
              </div>

              <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {record.clothes.map(cloth => (
                  <div key={cloth.id} className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 truncate">{cloth.name}</p>
                        <p className="text-sm text-slate-500 mt-1">{cloth.type} · {cloth.category}</p>
                      </div>
                      <span className="shrink-0 rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-sm font-semibold text-slate-700">× {cloth.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-5 sm:px-6 pb-5 flex justify-end">
                <button onClick={() => handleDelete(record.id)} className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">Delete batch</button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <section className="rounded-3xl bg-white border border-slate-200 p-12 text-center shadow-sm">
          <div className="text-5xl">🧺</div>
          <h3 className="mt-4 text-xl font-bold text-slate-800">No laundry scheduled</h3>
          <p className="mt-2 text-sm text-slate-500">Your completed or scheduled laundry batches will appear here.</p>
        </section>
      )}
    </div>
  );
};

export default GivenClothForWash;
