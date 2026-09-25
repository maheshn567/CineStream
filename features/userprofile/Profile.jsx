"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";

export default function Profile() {
    const { data: session, isPending } = authClient.useSession();
    const [name, setName] = useState("");
    const [activeTab, setActiveTab] = useState("history"); // "history" | "edit" | "account"
    const [editName, setEditName] = useState("");
    const [updating, setUpdating] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [continueList, setContinueList] = useState([]);

    // Load continue list items from all localStorage categories
    useEffect(() => {
        if (!session?.user) return;
        
        setName(session.user.name || "");
        setEditName(session.user.name || "");

        // Merge movie, series, and anime watch histories
        const moviesRaw = localStorage.getItem("cinestream_movies_continue");
        const seriesRaw = localStorage.getItem("cinestream_series_continue");
        const animeRaw = localStorage.getItem("cinestream_anime_continue");

        let items = [];

        try {
            if (moviesRaw) {
                const parsed = JSON.parse(moviesRaw);
                if (Array.isArray(parsed)) {
                    items = [...items, ...parsed.map(i => ({ ...i, category: "Movie" }))];
                }
            }
            if (seriesRaw) {
                const parsed = JSON.parse(seriesRaw);
                if (Array.isArray(parsed)) {
                    items = [...items, ...parsed.map(i => ({ ...i, category: "Series" }))];
                }
            }
            if (animeRaw) {
                const parsed = JSON.parse(animeRaw);
                if (Array.isArray(parsed)) {
                    items = [...items, ...parsed.map(i => ({ ...i, category: "Anime" }))];
                }
            }
        } catch (e) {
            console.error("Failed to load user profile watch history:", e);
        }

        setContinueList(items);
    }, [session]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setSuccessMessage("");
        setErrorMessage("");

        if (!editName.trim()) {
            setErrorMessage("Name cannot be empty.");
            return;
        }

        setUpdating(true);
        try {
            await authClient.updateUser({
                name: editName
            });
            setName(editName);
            setSuccessMessage("Profile updated successfully!");
            setTimeout(() => setSuccessMessage(""), 4000);
        } catch (err) {
            console.error("Failed to update profile name:", err);
            setErrorMessage(err.message || "Failed to update profile. Please try again.");
        } finally {
            setUpdating(false);
        }
    };

    const handleRemoveHistoryItem = (id, category) => {
        let storageKey = "";
        if (category === "Movie") storageKey = "cinestream_movies_continue";
        else if (category === "Series") storageKey = "cinestream_series_continue";
        else if (category === "Anime") storageKey = "cinestream_anime_continue";

        if (!storageKey) return;

        const raw = localStorage.getItem(storageKey);
        if (raw) {
            try {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                    const updated = parsed.filter(item => item.id !== id);
                    localStorage.setItem(storageKey, JSON.stringify(updated));
                    setContinueList(prev => prev.filter(item => !(item.id === id && item.category === category)));
                }
            } catch (err) {
                console.error("Failed to remove history item:", err);
            }
        }
    };

    if (isPending) {
        return (
            <div className="min-h-screen bg-[#0F0F0F] pt-32 flex justify-center items-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-t-[#00d1ff] border-white/15"></div>
            </div>
        );
    }

    if (!session?.user) {
        return (
            <main className="min-h-screen bg-[#0F0F0F] pt-32 pb-12 px-6 flex items-center justify-center font-montserrat">
                <div 
                    className="w-full max-w-2xl rounded-3xl p-8 md:p-12 text-center flex flex-col items-center gap-6 border border-white/10 shadow-[0px_0px_50px_rgba(0,0,0,0.6)]"
                    style={{
                        background: "rgba(25, 27, 27, 0.4)",
                        backdropFilter: "blur(24px)",
                        WebkitBackdropFilter: "blur(24px)"
                    }}
                >
                    <div className="relative w-24 h-24 flex items-center justify-center rounded-2xl bg-gradient-to-tr from-[#00d1ff]/15 to-[#a4e6ff]/5 border border-[#00d1ff]/20 shadow-[0_0_30px_rgba(0,209,255,0.1)] animate-pulse">
                        <span className="material-symbols-outlined text-[44px] text-[#00d1ff] drop-shadow-[0_0_15px_rgba(0,209,255,0.6)]">
                            lock
                        </span>
                    </div>
                    
                    <div className="space-y-2 w-full">
                        <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Sign in to view Profile</h2>
                        <p 
                            className="text-[#bbc9cf] text-sm md:text-base leading-relaxed"
                            style={{ display: "block", width: "100%", maxWidth: "480px", margin: "0 auto" }}
                        >
                            You must be signed in to manage your profile settings, view your account status, and access your watch history.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 mt-2 w-full justify-center">
                        <Link 
                            href="/login" 
                            className="bg-[#00d1ff] text-[#003543] font-bold text-sm px-10 py-4 rounded-full shadow-[0px_0px_20px_rgba(0,209,255,0.3)] hover:scale-[1.05] hover:bg-[#a4e6ff] active:scale-[0.97] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider font-semibold"
                        >
                            <span className="material-symbols-outlined text-[18px]">login</span>
                            <span>Sign In</span>
                        </Link>
                        <Link 
                            href="/register" 
                            className="bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold text-sm px-10 py-4 rounded-full hover:scale-[1.05] hover:bg-white/20 active:scale-[0.97] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider font-semibold"
                        >
                            <span className="material-symbols-outlined text-[18px]">person_add</span>
                            <span>Register</span>
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    const memberSinceDate = session.user.createdAt 
        ? new Date(session.user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
        : "January 2026";

    const isGoogleAuth = !session.user.password; // Social logins don't have password stored on User schema

    return (
        <main className="min-h-screen bg-[#0F0F0F] pt-28 pb-16 px-6 font-montserrat text-white">
            <div className="max-w-[1440px] mx-auto space-y-10">
                
                {/* Profile Header Dashboard Card */}
                <div 
                    className="w-full rounded-3xl p-6 md:p-8 border border-white/10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6 shadow-[0px_0px_40px_rgba(0,0,0,0.5)] relative overflow-hidden"
                    style={{
                        background: "rgba(25, 27, 27, 0.45)",
                        backdropFilter: "blur(24px)",
                        WebkitBackdropFilter: "blur(24px)"
                    }}
                >
                    <div className="absolute top-0 right-0 w-96 h-96 bg-[#00d1ff]/5 rounded-full filter blur-[80px] pointer-events-none -mr-32 -mt-32"></div>

                    <div className="flex flex-col md:flex-row items-center gap-6 z-10 w-full">
                        {/* Avatar */}
                        <div className="relative group w-28 h-28 md:w-32 md:h-32 rounded-2xl overflow-hidden border border-white/15 shadow-[0_0_20px_rgba(0,0,0,0.3)] bg-gradient-to-tr from-[#00d1ff]/20 to-[#a4e6ff]/5">
                            <img 
                                src={session.user.image || "https://lh3.googleusercontent.com/aida-public/AB6AXuD9nZf7P5jLpT3R_p6v-z9E5W2u3-i0X8A9E_Y8-0abHz2rhHyC5HywnJEpbJspOkwcin9C4voR_QxHCpqNJVnqiSGG4cnwKqqs1xzDE715zgd441lLxxHYHFMwKu2y83gMAwNV6lDS0N3SJrT-11i3sWcrxFGnQWyjwFNDmZ81RmTfR82wzRaKOF3lVcEztb2reSFGKyqxheRJpUa0Fb2BOvntpJqojC8dGFWkJGab_cxbnF2B9fnVDFYARBcbGULJCJ5mf4avn8"} 
                                alt="User Avatar" 
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Name and Stats */}
                        <div className="text-center md:text-left space-y-2 flex-1">
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">{name}</h1>
                                <span className="px-2.5 py-0.5 rounded-full bg-[#00d1ff]/15 border border-[#00d1ff]/30 text-[#00d1ff] text-[10px] font-bold uppercase tracking-wider">
                                    Enthusiast Tier
                                </span>
                            </div>
                            <p className="text-[#bbc9cf] text-sm md:text-base font-medium">{session.user.email}</p>
                            
                            <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 pt-2 text-xs text-zinc-400 font-semibold uppercase tracking-wider">
                                <div className="flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-[16px] text-[#00d1ff]">calendar_today</span>
                                    <span>Joined {memberSinceDate}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-[16px] text-[#00d1ff]">history</span>
                                    <span>{continueList.length} Played Titles</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Sign Out Action */}
                    <div className="z-10 shrink-0 flex gap-3">
                        <button 
                            onClick={async () => {
                                await authClient.signOut();
                                window.location.href = "/";
                            }}
                            className="bg-white/5 border border-white/10 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/40 text-white px-5 py-3 rounded-full font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all duration-300"
                        >
                            <span className="material-symbols-outlined text-[16px]">logout</span>
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>

                {/* Dashboard Grid Content Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                    
                    {/* Left Sidebar Menu */}
                    <div 
                        className="lg:col-span-1 rounded-2xl border border-white/10 p-2 space-y-1 shadow-lg"
                        style={{
                            background: "rgba(25, 27, 27, 0.45)",
                            backdropFilter: "blur(24px)",
                            WebkitBackdropFilter: "blur(24px)"
                        }}
                    >
                        <button 
                            onClick={() => setActiveTab("history")}
                            className={`w-full px-4 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-3 ${activeTab === "history" ? "bg-[#00d1ff] text-[#003543] shadow-[0px_0px_15px_rgba(0,209,255,0.25)]" : "text-[#bbc9cf] hover:text-white hover:bg-white/5"}`}
                        >
                            <span className="material-symbols-outlined text-[20px]">history</span>
                            <span>Watch History</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab("edit")}
                            className={`w-full px-4 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-3 ${activeTab === "edit" ? "bg-[#00d1ff] text-[#003543] shadow-[0px_0px_15px_rgba(0,209,255,0.25)]" : "text-[#bbc9cf] hover:text-white hover:bg-white/5"}`}
                        >
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                            <span>Edit Profile</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab("account")}
                            className={`w-full px-4 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-3 ${activeTab === "account" ? "bg-[#00d1ff] text-[#003543] shadow-[0px_0px_15px_rgba(0,209,255,0.25)]" : "text-[#bbc9cf] hover:text-white hover:bg-white/5"}`}
                        >
                            <span className="material-symbols-outlined text-[20px]">manage_accounts</span>
                            <span>Account Details</span>
                        </button>
                    </div>

                    {/* Right Panel Contents */}
                    <div className="lg:col-span-3 w-full">
                        {activeTab === "history" && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center border-l-4 border-[#00d1ff] pl-4">
                                    <h2 className="text-xl font-bold uppercase tracking-tight text-white">Your Streaming History</h2>
                                    <span className="text-xs text-[#bbc9cf] font-semibold">{continueList.length} Item{continueList.length !== 1 ? "s" : ""}</span>
                                </div>

                                {continueList.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {continueList.map((item) => (
                                            <div key={`${item.id}-${item.category}`} className="group relative rounded-xl overflow-hidden bg-[#1e2020] border border-white/5 shadow-md flex flex-col hover:scale-[1.02] transition-transform duration-300">
                                                
                                                {/* Backdrop Aspect Ratio Container */}
                                                <div className="aspect-video relative w-full bg-zinc-800">
                                                    {item.image ? (
                                                        <img 
                                                            src={item.image} 
                                                            alt={item.title} 
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80 group-hover:opacity-100"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-500 font-bold text-sm">
                                                            {item.title}
                                                        </div>
                                                    )}
                                                    
                                                    {/* Play Button Trigger */}
                                                    <Link 
                                                        href={item.link}
                                                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                                    >
                                                        <span className="material-symbols-outlined text-white text-[48px] hover:scale-110 transition-transform">
                                                            play_circle
                                                        </span>
                                                    </Link>

                                                    {/* Category Badge */}
                                                    <div className="absolute top-3 left-3 bg-[#00d1ff] text-[#003543] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                                                        {item.category}
                                                    </div>

                                                    {/* Watch Progress bar */}
                                                    <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
                                                        <div className="h-full bg-[#00d1ff]" style={{ width: `${item.progress || 0}%` }}></div>
                                                    </div>
                                                </div>

                                                {/* Info Area */}
                                                <div className="p-4 flex-1 flex flex-col justify-between">
                                                    <div>
                                                        <h3 className="font-bold text-sm text-white truncate w-full" title={item.title}>{item.title}</h3>
                                                        <p className="text-xs text-[#bbc9cf] mt-1 truncate">{item.subtitle}</p>
                                                    </div>
                                                    <div className="mt-3 flex justify-between items-center text-[10px] font-bold text-zinc-400 uppercase tracking-wider border-t border-white/5 pt-3">
                                                        <span>{item.timeLeft || "Finished"}</span>
                                                        <button 
                                                            onClick={() => handleRemoveHistoryItem(item.id, item.category)}
                                                            className="hover:text-red-400 transition-colors flex items-center gap-0.5 cursor-pointer text-[10px] font-bold uppercase"
                                                            style={{ background: 'none', border: 'none' }}
                                                            title="Delete from History"
                                                        >
                                                            <span className="material-symbols-outlined text-[14px]">delete</span> Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="w-full flex justify-center items-center py-8 min-h-[420px]">
                                        <div 
                                            className="w-full max-w-2xl rounded-2xl px-8 py-12 md:px-16 md:py-16 text-center flex flex-col items-center gap-8 border border-white/10 shadow-[0px_0px_30px_rgba(0,0,0,0.4)]"
                                            style={{
                                                background: "rgba(25, 27, 27, 0.4)",
                                                backdropFilter: "blur(24px)",
                                                WebkitBackdropFilter: "blur(24px)"
                                            }}
                                        >
                                            <div className="relative w-20 h-20 flex items-center justify-center rounded-2xl bg-gradient-to-tr from-[#00d1ff]/15 to-[#a4e6ff]/5 border border-[#00d1ff]/20 shadow-[0_0_20px_rgba(0,209,255,0.1)]">
                                                <span className="material-symbols-outlined text-[36px] text-[#00d1ff]">
                                                    videocam_off
                                                </span>
                                            </div>
                                            <div className="space-y-3">
                                                <h3 className="font-extrabold text-2xl text-white">No Streaming History</h3>
                                                <p className="text-[#bbc9cf] text-sm leading-relaxed max-w-[440px] mx-auto">
                                                    Start playing movies or series, and they'll show up here automatically as you watch.
                                                </p>
                                            </div>
                                            <Link 
                                                href="/" 
                                                className="bg-[#00d1ff] text-[#003543] font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-full hover:scale-[1.05] hover:bg-[#a4e6ff] active:scale-[0.97] transition-all duration-300 flex items-center gap-2 cursor-pointer"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                                                <span>Start Watching</span>
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "edit" && (
                            <div 
                                className="w-full rounded-2xl p-6 md:p-8 border border-white/10 shadow-lg"
                                style={{
                                    background: "rgba(25, 27, 27, 0.45)",
                                    backdropFilter: "blur(24px)",
                                    WebkitBackdropFilter: "blur(24px)"
                                }}
                            >
                                <h2 className="text-xl font-bold text-white mb-6">Profile Settings</h2>

                                {successMessage && (
                                    <div className="mb-4 rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-400 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[20px]">check_circle</span>
                                        <span>{successMessage}</span>
                                    </div>
                                )}

                                {errorMessage && (
                                    <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[20px]">error</span>
                                        <span>{errorMessage}</span>
                                    </div>
                                )}

                                <form onSubmit={handleUpdateProfile} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-[#bbc9cf] uppercase tracking-wider block">Full Name</label>
                                        <input 
                                            type="text" 
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            placeholder="Enter your name"
                                            disabled={updating}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3.5 text-sm text-white placeholder-zinc-500 outline-none focus:border-[#00d1ff] focus:ring-1 focus:ring-[#00d1ff]/30 transition-all duration-300"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-[#bbc9cf] uppercase tracking-wider block">Email Address (Read Only)</label>
                                        <input 
                                            type="text" 
                                            value={session.user.email}
                                            disabled
                                            className="w-full bg-white/5 border border-white/5 rounded-lg px-4 py-3.5 text-sm text-zinc-500 outline-none cursor-not-allowed select-none"
                                        />
                                    </div>

                                    <button 
                                        type="submit"
                                        disabled={updating}
                                        className="w-full bg-[#00d1ff] text-[#003543] font-bold text-xs uppercase tracking-widest py-4 rounded-full shadow-[0px_0px_15px_rgba(0,209,255,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center cursor-pointer"
                                    >
                                        {updating ? (
                                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#003543]/20 border-t-[#003543]"></div>
                                        ) : (
                                            "Save Changes"
                                        )}
                                    </button>
                                </form>
                            </div>
                        )}

                        {activeTab === "account" && (
                            <div 
                                className="w-full rounded-2xl p-6 md:p-8 border border-white/10 shadow-lg space-y-6"
                                style={{
                                    background: "rgba(25, 27, 27, 0.45)",
                                    backdropFilter: "blur(24px)",
                                    WebkitBackdropFilter: "blur(24px)"
                                }}
                            >
                                <h2 className="text-xl font-bold text-white">System & Identity Profile</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                    <div className="space-y-1.5">
                                        <span className="text-xs font-semibold text-[#bbc9cf] uppercase tracking-wider block">Unique User ID</span>
                                        <p className="text-sm font-mono text-zinc-300 bg-black/30 px-3 py-2 rounded-lg border border-white/5 select-all overflow-x-auto">{session.user.id}</p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <span className="text-xs font-semibold text-[#bbc9cf] uppercase tracking-wider block">Authentication Provider</span>
                                        <div className="flex items-center gap-2 text-sm font-semibold text-zinc-300 bg-black/30 px-3 py-2 rounded-lg border border-white/5">
                                            <span className="material-symbols-outlined text-[18px] text-[#00d1ff]">
                                                {isGoogleAuth ? "google" : "mail"}
                                            </span>
                                            <span>{isGoogleAuth ? "Google Social Provider" : "Email & Password Provider"}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <span className="text-xs font-semibold text-[#bbc9cf] uppercase tracking-wider block">Account Created At</span>
                                        <p className="text-sm font-semibold text-zinc-300 bg-black/30 px-3 py-2 rounded-lg border border-white/5">
                                            {session.user.createdAt ? new Date(session.user.createdAt).toString() : "N/A"}
                                        </p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <span className="text-xs font-semibold text-[#bbc9cf] uppercase tracking-wider block">Current Session Device</span>
                                        <p className="text-sm font-semibold text-zinc-300 bg-black/30 px-3 py-2 rounded-lg border border-white/5">
                                            Web Browser (Desktop Workspace)
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </main>
    );
}