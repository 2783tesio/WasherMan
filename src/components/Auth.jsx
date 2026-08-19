import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Auth({ onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const lookupEmail = async (cleanUsername) => {
    const { data, error } = await supabase.rpc("get_auth_email_by_username", { p_username: cleanUsername });
    if (error || !data) throw new Error("Username not found.");
    return data;
  };

  const submit = async (event) => {
    event.preventDefault();
    setMessage("");
    const cleanUsername = username.trim().toLowerCase();
    if (!/^[a-z0-9._-]{3,30}$/.test(cleanUsername)) return setMessage("Username must be 3-30 characters: letters, numbers, ., _ or -.");
    if (password.length < 6) return setMessage("Password must be at least 6 characters.");
    if (mode === "signup" && !/^\S+@\S+\.\S+$/.test(email.trim())) return setMessage("Please enter a valid recovery email address.");

    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({ email: email.trim().toLowerCase(), password, options: { data: { username: cleanUsername } } });
        if (error) throw error;
        if (data.session) onAuthenticated(data.session.user);
        else setMessage("Account created. Check your recovery email if confirmation is enabled, then log in.");
      } else {
        const authEmail = await lookupEmail(cleanUsername);
        const { data, error } = await supabase.auth.signInWithPassword({ email: authEmail, password });
        if (error) throw error;
        onAuthenticated(data.user);
      }
    } catch (error) { setMessage(error.message || "Unable to authenticate."); }
    finally { setLoading(false); }
  };

  const sendReset = async (event) => {
    event.preventDefault();
    setMessage("");
    const cleanUsername = username.trim().toLowerCase();
    if (!/^[a-z0-9._-]{3,30}$/.test(cleanUsername)) return setMessage("Enter your username first.");
    setLoading(true);
    try {
      const authEmail = await lookupEmail(cleanUsername);
      if (authEmail.endsWith("@washerman.example.com")) throw new Error("No recovery email is available for this account. Add a recovery email first.");
      const { error } = await supabase.auth.resetPasswordForEmail(authEmail, { redirectTo: `${window.location.origin}/?recovery=1` });
      if (error) throw error;
      setMessage("Password reset link sent. Check your recovery email.");
    } catch (error) { setMessage(error.message || "Unable to send reset link."); }
    finally { setLoading(false); }
  };

  const title = mode === "signup" ? "Create your account" : mode === "forgot" ? "Reset your password" : "Welcome back";
  const success = message.startsWith("Password reset");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
        <div className="text-center mb-8"><div className="mx-auto w-14 h-14 rounded-2xl bg-cyan-500 flex items-center justify-center text-2xl shadow-lg shadow-cyan-500/20">🧺</div><h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">WasherMan</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{title}</p></div>

        {mode === "forgot" ? (
          <form onSubmit={sendReset} className="space-y-4">
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Username</label><input value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-400" placeholder="Enter your username" /></div>
            {message && <p className={`text-sm rounded-xl px-3 py-2 ${success ? "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300" : "text-red-600 bg-red-50 dark:bg-red-950/40 dark:text-red-400"}`}>{message}</p>}
            <button type="submit" disabled={loading} className="w-full rounded-xl bg-cyan-500 text-white font-semibold py-3 hover:bg-cyan-600 disabled:opacity-60">{loading ? "Sending..." : "Send reset link"}</button>
            <button type="button" onClick={() => { setMode("login"); setMessage(""); }} className="w-full text-sm text-cyan-700 dark:text-cyan-400 hover:underline">Back to login</button>
          </form>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Username</label><input value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-400" placeholder="Enter username" /></div>
            {mode === "signup" && <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Recovery email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-400" placeholder="you@example.com" /><p className="mt-1 text-xs text-slate-400">Used for password recovery.</p></div>}
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label><div className="relative"><input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} autoComplete={mode === "signup" ? "new-password" : "current-password"} className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-cyan-400" placeholder="Enter password" /><button type="button" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">{showPassword ? "🙈" : "👁️"}</button></div></div>
            {message && <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 rounded-xl px-3 py-2">{message}</p>}
            <button type="submit" disabled={loading} className="w-full rounded-xl bg-cyan-500 text-white font-semibold py-3 hover:bg-cyan-600 disabled:opacity-60">{loading ? "Please wait..." : mode === "signup" ? "Create account" : "Login"}</button>
          </form>
        )}

        {mode === "login" && <button type="button" onClick={() => { setMode("forgot"); setMessage(""); }} className="w-full mt-4 text-sm text-cyan-700 dark:text-cyan-400 hover:underline">Forgot password?</button>}
        {mode !== "forgot" && <button type="button" onClick={() => { setMode(mode === "signup" ? "login" : "signup"); setMessage(""); setShowPassword(false); }} className="w-full mt-3 text-sm text-cyan-700 dark:text-cyan-400 hover:underline">{mode === "signup" ? "Already have an account? Login" : "Don't have an account? Sign up"}</button>}
      </div>
    </div>
  );
}
