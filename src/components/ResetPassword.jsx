import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function ResetPassword({ onComplete }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setMessage("");
    if (password.length < 6) return setMessage("Password must be at least 6 characters.");
    if (password !== confirmPassword) return setMessage("Passwords do not match.");

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return setMessage(error.message);
    setMessage("Password updated successfully. You can continue to WasherMan.");
    setTimeout(onComplete, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
        <div className="text-center mb-8"><div className="mx-auto w-14 h-14 rounded-2xl bg-cyan-500 flex items-center justify-center text-2xl">🧺</div><h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">Set new password</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Choose a new password for your WasherMan account.</p></div>
        <form onSubmit={submit} className="space-y-4">
          <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">New password</label><div className="relative"><input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-cyan-400" placeholder="Enter new password" /><button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-500">{showPassword ? "🙈" : "👁️"}</button></div></div>
          <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirm password</label><input type={showPassword ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} autoComplete="new-password" className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-400" placeholder="Confirm new password" /></div>
          {message && <p className={`text-sm rounded-xl px-3 py-2 ${message.startsWith("Password updated") ? "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300" : "text-red-600 bg-red-50 dark:bg-red-950/40 dark:text-red-400"}`}>{message}</p>}
          <button type="submit" disabled={loading} className="w-full rounded-xl bg-cyan-500 text-white font-semibold py-3 hover:bg-cyan-600 disabled:opacity-60">{loading ? "Updating..." : "Update password"}</button>
        </form>
      </div>
    </div>
  );
}
