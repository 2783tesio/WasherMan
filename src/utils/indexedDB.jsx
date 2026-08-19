import { supabase } from "../lib/supabase";

const ACTIVE_PROFILE_KEY = "washerman_active_profile";

export function getActiveProfileId() {
  return localStorage.getItem(ACTIVE_PROFILE_KEY);
}

export function setActiveProfileId(id) {
  if (id) localStorage.setItem(ACTIVE_PROFILE_KEY, id);
  else localStorage.removeItem(ACTIVE_PROFILE_KEY);
}

export async function addUser(userName, userCloth = []) {
  const { data: user, error } = await supabase
    .from("users")
    .insert({ user_name: userName })
    .select("id, user_name")
    .single();
  if (error) throw error;

  if (userCloth.length) {
    const rows = userCloth.map(cloth => ({
      user_id: user.id,
      name: cloth.name,
      type: cloth.type,
      category: cloth.category,
      cloth_count: cloth.ClothCount || 1
    }));
    const { error: clothError } = await supabase.from("clothes").insert(rows);
    if (clothError) throw clothError;
  }

  setActiveProfileId(user.id);
  return user.id;
}

export async function getUsers() {
  const { data, error } = await supabase
    .from("users")
    .select("id, user_name, created_at, clothes(*)")
    .order("created_at", { ascending: true });
  if (error) throw error;

  return (data || []).map(user => ({
    id: user.id,
    userName: user.user_name,
    userCloth: (user.clothes || []).map(mapCloth)
  }));
}

export async function getUserById(userId) {
  if (!userId) return null;
  const { data, error } = await supabase
    .from("users")
    .select("id, user_name, clothes(*)")
    .eq("id", userId)
    .single();
  if (error) throw error;

  return {
    id: data.id,
    userName: data.user_name,
    userCloth: (data.clothes || []).map(mapCloth)
  };
}

export async function addClothToUser(userId, clothItem) {
  const { error } = await supabase.from("clothes").insert({
    user_id: userId,
    name: clothItem.name,
    type: clothItem.type,
    category: clothItem.category,
    cloth_count: clothItem.ClothCount || 1
  });
  if (error) throw error;
  return "Cloth added successfully!";
}

export async function deleteUser(id) {
  const { error } = await supabase.from("users").delete().eq("id", id);
  if (error) throw error;
  if (getActiveProfileId() === id) setActiveProfileId(null);
  return "User deleted successfully!";
}

export async function updateUserClothes(userId, updatedClothes) {
  const { data: existing, error: fetchError } = await supabase
    .from("clothes")
    .select("id")
    .eq("user_id", userId);
  if (fetchError) throw fetchError;

  const keepIds = new Set(updatedClothes.filter(c => typeof c.id === "string").map(c => c.id));
  const idsToDelete = (existing || []).map(c => c.id).filter(id => !keepIds.has(id));

  if (idsToDelete.length) {
    const { error } = await supabase.from("clothes").delete().in("id", idsToDelete);
    if (error) throw error;
  }

  for (const cloth of updatedClothes) {
    const payload = {
      name: cloth.name,
      type: cloth.type,
      category: cloth.category,
      cloth_count: cloth.ClothCount || 1
    };

    if (typeof cloth.id === "string") {
      const { error } = await supabase.from("clothes").update(payload).eq("id", cloth.id).eq("user_id", userId);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("clothes").insert({ ...payload, user_id: userId });
      if (error) throw error;
    }
  }
}

export async function addClothForWash(userId, washData) {
  if (!userId) throw new Error("Please select a profile first.");

  const { data: batch, error: batchError } = await supabase
    .from("wash_batches")
    .insert({ user_id: userId, wash_date: washData.date })
    .select("id")
    .single();
  if (batchError) throw batchError;

  const items = (washData.clothes || []).map(cloth => ({
    wash_batch_id: batch.id,
    cloth_id: cloth.id,
    quantity: cloth.ClothCount || 1
  }));

  if (items.length) {
    const { error: itemError } = await supabase.from("wash_items").insert(items);
    if (itemError) throw itemError;
  }
  return "Added Successfully";
}

export async function getGivenClothesForWash(userId) {
  if (!userId) return [];

  const { data, error } = await supabase
    .from("wash_batches")
    .select("id, wash_date, wash_items(id, quantity, cloth_id, clothes(id, name, type, category, cloth_count))")
    .eq("user_id", userId)
    .order("wash_date", { ascending: false });
  if (error) throw error;

  return (data || []).map(batch => ({
    id: batch.id,
    date: batch.wash_date,
    clothes: (batch.wash_items || []).map(item => ({
      id: item.clothes?.id || item.cloth_id,
      name: item.clothes?.name || "Cloth",
      type: item.clothes?.type || "",
      category: item.clothes?.category || "",
      ClothCount: item.quantity
    }))
  }));
}

export async function deleteGivenClothForWash(id, userId) {
  const { error } = await supabase
    .from("wash_batches")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw error;
}

function mapCloth(cloth) {
  return {
    id: cloth.id,
    name: cloth.name,
    type: cloth.type,
    category: cloth.category,
    ClothCount: cloth.cloth_count || 1
  };
}
