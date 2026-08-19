import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Auth({ onAuthenticated }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setMessage("");

    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername || password.length < 6) {
      setMessage("Enter a username and a password of at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      // Supabase Auth uses email/password internally. The user only sees a username.
      const internalEmail = `${cleanUsername}@users.washer-man.local`;

      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: internalEmail,
          password,
          options: { data: { username: cleanUsername } },
        });
        if (error) throw error;
        if (data.session) onAuthenticated(data.session.user);
        else setMessage("Account created. You can now log in.");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: internalEmail,
          password,
        });
        if (error) throw error;
        onAuthenticated(data.user);
      }
    } catch (error) {
      setMessage(error.message || "Unable to authenticate.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-cyan-500 flex items-center justify-center text-2xl shadow-lg shadow-cyan-500/20">🧺</div>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">WasherMan</h1>
          <p className="mt-1 text-sm text-slate-500">{isSignUp ? "Create your account" : "Welcome back"}</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-400" placeholder="Enter username" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={isSignUp ? "new-password" : "current-password"} className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-400" placeholder="Enter password" />
          </div>

          {message && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{message}</p>}

          <button disabled={loading} className="w-full rounded-xl bg-cyan-500 text-white font-semibold py-3 hover:bg-cyan-600 disabled:opacity-60">
            {loading ? "Please wait..." : isSignUp ? "Create account" : "Login"}
          </button>
        </form>

        <button type="button" onClick={() => { setIsSignUp(!isSignUp); setMessage(""); }} className="w-full mt-4 text-sm text-cyan-700 hover:underline">
          {isSignUp ? "Already have an account? Login" : "Don't have an account? Sign up"}
        </button>
      </div>
    </div>
  );
}
