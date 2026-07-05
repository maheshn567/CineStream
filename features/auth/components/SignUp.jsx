"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    await authClient.signUp.email({
      email,
      password,
      name,
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
        setError(ctx.error.message || "Failed to register account.");
      }
    });
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
              className="flex-1 py-5 text-center text-sm font-semibold text-[#bbc9cf] hover:text-white transition-all duration-300"
            >
              Login
            </Link>
            <Link 
              href="/register" 
              className="flex-1 py-5 text-center text-sm font-semibold transition-all duration-300 text-[#a4e6ff] border-b-2 border-[#00d1ff]"
            >
              Sign Up
            </Link>
          </div>

          <div className="p-8 md:p-10 flex flex-col gap-y-6">
            
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold text-white">Join CineStream</h2>
              <p className="text-[#bbc9cf] text-sm font-medium">Start your cinematic journey today.</p>
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400 flex items-center gap-2">
                <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSignUp} className="space-y-5">
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#bbc9cf] uppercase tracking-wider block">
                  Full Name
                </label>
                <input 
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-[#00d1ff] focus:ring-1 focus:ring-[#00d1ff]/30 transition-all duration-300"
                />
              </div>

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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#bbc9cf] uppercase tracking-wider block">
                    Confirm
                  </label>
                  <input 
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-[#00d1ff] focus:ring-1 focus:ring-[#00d1ff]/30 transition-all duration-300"
                  />
                </div>
              </div>

              <div className="pt-2">
                <p className="text-xs text-[#bbc9cf] leading-relaxed">
                  By signing up, you agree to our{" "}
                  <a className="text-[#a4e6ff] hover:underline" href="#">Terms of Service</a> and{" "}
                  <a className="text-[#a4e6ff] hover:underline" href="#">Privacy Policy</a>.
                </p>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full mt-4 bg-[#00d1ff] text-[#003543] font-bold text-xs uppercase tracking-widest py-4 rounded-full shadow-[0px_0px_15px_rgba(0,209,255,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#003543]/20 border-t-[#003543]"></div>
                ) : (
                  "Create Account"
                )}
              </button>

            </form>

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
