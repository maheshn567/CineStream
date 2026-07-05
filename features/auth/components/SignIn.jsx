"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Parallax background effect on mouse movement
  useEffect(() => {
    const handleMouseMove = (e) => {
      const background = document.querySelector(".animate-subtle-zoom");
      if (!background) return;
      const x = (window.innerWidth - e.pageX) / 50;
      const y = (window.innerHeight - e.pageY) / 50;
      background.style.transform = `scale(1.05) translate(${x}px, ${y}px)`;
    };
    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    await authClient.signIn.email({
      email,
      password,
      callbackURL: "/",
    }, {
      onRequest: () => {
        setLoading(true);
      },
      onSuccess: () => {
        setLoading(false);
      },
      onError: (ctx) => {
        setLoading(false);
        setError(ctx.error.message || "Invalid email or password.");
      }
    });
  };

  const handleGoogleSignIn = async () => {
    setError("");
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });
    } catch (err) {
      console.error(err);
      setError("Failed to redirect to Google Sign-In.");
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center px-4 font-sans text-white overflow-hidden">
      
      {/* Background Cinematic Asset */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center animate-subtle-zoom transition-transform duration-300 ease-out"
          style={{
            backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCpkJEMrdbiHSsxZN4SBT30mFQFRM9R1stCVRQMEULng3KncEINVBmWoeGWP7qVopJ4oZtXyxLYruXnQZtdCWszDvl-oZRmktRJuLZI5TD4Cr2sHhedTv_VB7JB6XBFGPer5SDTYRS4eulDC8iu0ZuTAqNTpB2ujcv9agv8JkkioXRSMLmxSLRaP8wOJM2ns7N3EOfvQKmUEGfwszuk0AUy5W0pWkPZCs32JOwZtk60Vm0dyfZAbGwa8tfqTPN7yjBG7pSiDUywdng')",
            transform: "scale(1.05)",
          }}
        ></div>
        <div 
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background: "radial-gradient(circle, transparent 20%, rgba(12, 15, 15, 0.9) 100%)"
          }}
        ></div>
        <div className="absolute inset-0 bg-[#0c0f0f]/40 z-5 pointer-events-none"></div>
      </div>

      {/* Header / Brand Anchor */}
      <header className="fixed top-0 left-0 w-full z-50 px-6 py-6 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto transition-transform duration-300 hover:scale-105">
          <Link href="/" className="flex items-center space-x-3 group">
            <img 
              src="/logo.svg" 
              alt="CineStream Logo" 
              className="h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-105" 
            />
            <span className="text-2xl font-black text-[#a4e6ff] tracking-tighter">
              CineStream
            </span>
          </Link>
        </div>
        <Link 
          href="/" 
          className="pointer-events-auto group flex items-center gap-2 text-[#bbc9cf] hover:text-[#a4e6ff] transition-colors duration-300"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          <span className="font-semibold text-sm">Back to Home</span>
        </Link>
      </header>

      {/* Main Auth Container */}
      <main className="relative z-20 w-full max-w-[480px] my-20">
        <div 
          className="rounded-2xl shadow-[0px_0px_40px_rgba(0,0,0,0.5)] overflow-hidden border border-white/10"
          style={{
            background: "rgba(25, 27, 27, 0.55)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)"
          }}
        >
          
          {/* Auth Navigation Tabs */}
          <div className="flex border-b border-white/5">
            <Link 
              href="/login" 
              className="flex-1 py-5 text-center text-sm font-semibold transition-all duration-300 text-[#a4e6ff] border-b-2 border-[#00d1ff]"
            >
              Login
            </Link>
            <Link 
              href="/register" 
              className="flex-1 py-5 text-center text-sm font-semibold text-[#bbc9cf] hover:text-white transition-all duration-300"
            >
              Sign Up
            </Link>
          </div>

          <div className="p-8 md:p-10 flex flex-col gap-y-6">
            
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold text-white">Welcome Back</h2>
              <p className="text-[#bbc9cf] text-sm font-medium">Access your premium screening room.</p>
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400 flex items-center gap-2">
                <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleEmailSignIn} className="space-y-5">
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#bbc9cf] uppercase tracking-wider block">
                  Email Address
                </label>
                <input 
                  type="email"
                  placeholder="name@cinestream.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-[#00d1ff] focus:ring-1 focus:ring-[#00d1ff]/30 transition-all duration-300"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#bbc9cf] uppercase tracking-wider block">
                  Password
                </label>
                <input 
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-[#00d1ff] focus:ring-1 focus:ring-[#00d1ff]/30 transition-all duration-300"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-[#00d1ff] focus:ring-[#00d1ff]/30"
                  />
                  <span className="text-xs text-[#bbc9cf] group-hover:text-white transition-colors select-none">
                    Remember me
                  </span>
                </label>
                <a href="#" className="text-xs text-[#a4e6ff] hover:underline font-semibold">
                  Forgot Password?
                </a>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full mt-4 bg-[#00d1ff] text-[#003543] font-bold text-xs uppercase tracking-widest py-4 rounded-full shadow-[0px_0px_15px_rgba(0,209,255,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#003543]/20 border-t-[#003543]"></div>
                ) : (
                  "Sign In"
                )}
              </button>

            </form>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#191b1b] px-3 text-[#bbc9cf] font-semibold tracking-wider">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="w-full">
              <button 
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-white/5 border border-white/10 py-3 rounded-lg hover:bg-white/10 transition-colors"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    fill="#EA4335"
                  />
                </svg>
                <span className="text-xs font-semibold text-[#bbc9cf]">Google</span>
              </button>
            </div>

          </div>
        </div>
      </main>

      {/* Footer / Info */}
      <footer className="mt-6 text-center space-y-2 relative z-20 pb-8">
        <p className="text-xs text-[#bbc9cf] font-medium">© {new Date().getFullYear()} CineStream Global. All rights reserved.</p>
        <div className="flex justify-center gap-6">
          <a className="text-xs text-[#bbc9cf] hover:text-[#a4e6ff] transition-colors" href="#">Help Center</a>
          <a className="text-xs text-[#bbc9cf] hover:text-[#a4e6ff] transition-colors" href="#">Privacy</a>
          <a className="text-xs text-[#bbc9cf] hover:text-[#a4e6ff] transition-colors" href="#">Terms</a>
        </div>
      </footer>

    </div>
  );
}