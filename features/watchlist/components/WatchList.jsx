"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function WatchList({ data, user, recommendations: propsRecommendations }) {
    const [items, setItems] = useState(data || []);
    const [activeFilter, setActiveFilter] = useState("all");
    const [removingIds, setRemovingIds] = useState([]);
    const [removedItem, setRemovedItem] = useState(null);
    const [toastText, setToastText] = useState("");
    const [toastVisible, setToastVisible] = useState(false);
    const [toastAction, setToastAction] = useState(null);

    // Filter items based on active tab selection
    const getFilteredItems = () => {
        if (activeFilter === "movies") {
            return items.filter(item => item.type === "movie");
        }
        if (activeFilter === "series") {
            return items.filter(item => item.type === "tv" || item.type === "series" || item.type === "anime");
        }
        if (activeFilter === "expiring") {
            return items.filter(item => item.expiring_soon);
        }
        return items;
    };

    const filteredItems = getFilteredItems();

    // Show a toast message with optional Action
    const showToast = (text, action = null) => {
        setToastText(text);
        setToastAction(() => action);
        setToastVisible(true);
    };

    useEffect(() => {
        if (toastVisible) {
            const timer = setTimeout(() => {
                setToastVisible(false);
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [toastVisible]);

    const handleRemove = (id, e) => {
        e.preventDefault();
        e.stopPropagation();

        const itemToRemove = items.find(item => item.id === id);
        if (!itemToRemove) return;

        setRemovingIds(prev => [...prev, id]);

        setTimeout(async () => {
            setItems(prev => prev.filter(item => item.id !== id));
            setRemovingIds(prev => prev.filter(x => x !== id));
            setRemovedItem(itemToRemove);

            try {
                await fetch("/api/watchlist", {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        tmdbId: itemToRemove.tmdb_id
                    })
                });
            } catch (err) {
                console.error("Failed to delete from DB watchlist:", err);
            }

            showToast("Removed from My List", async () => {
                setItems(prev => [itemToRemove, ...prev]);
                setRemovedItem(null);
                try {
                    await fetch("/api/watchlist", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            tmdbId: itemToRemove.tmdb_id,
                            type: itemToRemove.type
                        })
                    });
                } catch (err) {
                    console.error("Failed to restore to DB watchlist:", err);
                }
            });
        }, 400);
    };

    const handleMarkWatched = (id, e) => {
        e.preventDefault();
        e.stopPropagation();

        setItems(prev => prev.map(item => {
            if (item.id === id) {
                return { ...item, watched: true };
            }
            return item;
        }));
        showToast("Marked as watched");
    };

    const getDetailsLink = (item) => {
        if (item.type === "movie") return `/movie/details/${item.tmdb_id}`;
        if (item.type === "tv" || item.type === "series") return `/series/detail/${item.tmdb_id}`;
        if (item.type === "anime") return `/anime/details/${item.tmdb_id}`;
        return "/";
    };

    const [recommendations, setRecommendations] = useState(propsRecommendations || []);

    useEffect(() => {
        if (propsRecommendations && propsRecommendations.length > 0) {
            setRecommendations(propsRecommendations);
        } else {
            const fetchFallbackRecommendations = async () => {
                try {
                    const token = process.env.NEXT_PUBLIC_ACCESS_TOKEN;
                    const baseUrl = process.env.NEXT_PUBLIC_TMDB_BASE_URL || "https://api.tmdb.org";
                    if (!token) return;

                    const [movieRes, tvRes] = await Promise.all([
                        fetch(`${baseUrl}/3/movie/popular?language=en-US&page=1`, {
                            headers: {
                                accept: 'application/json',
                                Authorization: `Bearer ${token}`
                            }
                        }),
                        fetch(`${baseUrl}/3/tv/popular?language=en-US&page=1`, {
                            headers: {
                                accept: 'application/json',
                                Authorization: `Bearer ${token}`
                            }
                        })
                    ]);

                    let popularMovies = [];
                    let popularTv = [];

                    if (movieRes.ok) {
                        const data = await movieRes.json();
                        popularMovies = data.results || [];
                    }
                    if (tvRes.ok) {
                        const data = await tvRes.json();
                        popularTv = data.results || [];
                    }

                    const formatGenresLocal = (genreIds) => {
                        const GENRE_MAP_LOCAL = {
                            28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
                            99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
                            27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Sci-Fi",
                            10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western",
                            10759: "Action & Adventure", 10762: "Kids", 10763: "News", 10764: "Reality",
                            10765: "Sci-Fi & Fantasy", 10766: "Soap", 10767: "Talk", 10768: "War & Politics"
                        };
                        if (!genreIds || !Array.isArray(genreIds)) return "Genre";
                        return genreIds.map(id => GENRE_MAP_LOCAL[id]).filter(Boolean).slice(0, 2).join(" • ") || "Drama";
                    };

                    const recMovies = popularMovies.slice(0, 3).map(m => ({
                        id: `rec-movie-${m.id}`,
                        tmdb_id: m.id,
                        title: m.title,
                        img: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : "",
                        rate: m.vote_average ? m.vote_average.toFixed(1) : "7.5",
                        cat: formatGenresLocal(m.genre_ids) || "Movie",
                        year: (m.release_date || "").split("-")[0] || "2024",
                        type: "movie"
                    }));

                    const recTv = popularTv.slice(0, 2).map(t => ({
                        id: `rec-tv-${t.id}`,
                        tmdb_id: t.id,
                        title: t.name,
                        img: t.poster_path ? `https://image.tmdb.org/t/p/w500${t.poster_path}` : "",
                        rate: t.vote_average ? t.vote_average.toFixed(1) : "7.5",
                        cat: formatGenresLocal(t.genre_ids) || "Series",
                        year: (t.first_air_date || "").split("-")[0] || "2024",
                        type: "tv"
                    }));

                    setRecommendations([...recMovies, ...recTv]);
                } catch (err) {
                    console.error("Client fallback recommendation fetch failed:", err);
                }
            };

            fetchFallbackRecommendations();
        }
    }, [propsRecommendations]);

    const handleAddRecommendation = async (rec, e) => {
        e.preventDefault();
        e.stopPropagation();

        if (items.some(item => item.tmdb_id === rec.tmdb_id)) {
            showToast(`"${rec.title}" is already in My List`);
            return;
        }

        const newItem = {
            id: `rec-added-${rec.tmdb_id}-${Date.now()}`,
            tmdb_id: rec.tmdb_id,
            title: rec.title,
            img: rec.img,
            rate: rec.rate,
            cat: rec.cat,
            year: rec.year,
            type: rec.type
        };

        setItems(prev => [newItem, ...prev]);
        showToast(`Added "${rec.title}" to My List`);

        try {
            await fetch("/api/watchlist", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    tmdbId: rec.tmdb_id,
                    type: rec.type
                })
            });
        } catch (err) {
            console.error("Failed to add recommendation to DB watchlist:", err);
        }
    };

    if (!user) {
        return (
            <main className="pt-24 pb-12 px-6 max-w-[1440px] mx-auto w-full min-h-[60vh] flex items-center justify-center">
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
                        <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Sign in to view My List</h2>
                        <p 
                            className="text-[#bbc9cf] text-sm md:text-base leading-relaxed"
                            style={{ display: "block", width: "100%", maxWidth: "480px", margin: "0 auto" }}
                        >
                            Your watchlist is saved securely in your profile. Please log in or sign up to access your saved titles and continue watching.
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

    return (
        <main className="pt-24 pb-12 px-6 max-w-[1440px] mx-auto w-full">
            
            {/* Header Section */}
            <header className="mt-8 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight">My List</h1>
                    <p className="text-[#bbc9cf] text-lg mt-1">
                        {items.length} Title{items.length !== 1 ? "s" : ""} saved for later
                    </p>
                </div>
                
                {/* Filter Tabs */}
                <div className="flex bg-[#1e2020] p-1 rounded-xl w-fit border border-white/5">
                    <button 
                        onClick={() => setActiveFilter("all")}
                        className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all cursor-pointer ${activeFilter === "all" ? "bg-[#00d1ff] text-[#003543] shadow-[0px_0px_10px_rgba(0,209,255,0.2)]" : "text-[#bbc9cf] hover:text-white"}`}
                    >
                        All
                    </button>
                    <button 
                        onClick={() => setActiveFilter("movies")}
                        className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all cursor-pointer ${activeFilter === "movies" ? "bg-[#00d1ff] text-[#003543] shadow-[0px_0px_10px_rgba(0,209,255,0.2)]" : "text-[#bbc9cf] hover:text-white"}`}
                    >
                        Movies
                    </button>
                    <button 
                        onClick={() => setActiveFilter("series")}
                        className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all cursor-pointer ${activeFilter === "series" ? "bg-[#00d1ff] text-[#003543] shadow-[0px_0px_10px_rgba(0,209,255,0.2)]" : "text-[#bbc9cf] hover:text-white"}`}
                    >
                        Series
                    </button>
                    <button 
                        onClick={() => setActiveFilter("expiring")}
                        className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all cursor-pointer flex items-center gap-2 ${activeFilter === "expiring" ? "bg-[#00d1ff] text-[#003543] shadow-[0px_0px_10px_rgba(0,209,255,0.2)]" : "text-[#bbc9cf] hover:text-white"}`}
                    >
                        Expiring Soon
                        <span className="w-2 h-2 rounded-full bg-[#ff571a] animate-pulse"></span>
                    </button>
                </div>
            </header>

            {/* Bento-inspired Movie Grid */}
            {filteredItems.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {filteredItems.map((item) => (
                        <div 
                            key={item.id} 
                            className={`group relative aspect-[2/3] rounded-xl overflow-hidden bg-[#1e2020] border border-white/5 shadow-lg transition-all duration-500 cursor-pointer ${removingIds.includes(item.id) ? "scale-90 opacity-0 pointer-events-none" : "hover:shadow-[0_0_20px_rgba(0,209,255,0.2)] hover:scale-[1.03]"}`}
                        >
                            {/* Backdrop Image */}
                            {item.img ? (
                                <Image
                                    alt={item.title}
                                    fill
                                    unoptimized={true}
                                    src={item.img}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center p-4 bg-[#1e2020] text-zinc-500 text-center font-bold text-sm">
                                    {item.title}
                                </div>
                            )}

                            {/* Black gradient overlay */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
                            
                            {/* Play Arrow Button (Hover Center) */}
                            <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-95 group-hover:scale-100">
                                <Link 
                                    href={getDetailsLink(item)}
                                    className="w-16 h-16 rounded-full bg-[#00d1ff]/90 flex items-center justify-center text-[#003543] shadow-[0_0_20px_rgba(0,209,255,0.6)] hover:scale-110 transition-transform cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                        play_arrow
                                    </span>
                                </Link>
                            </div>

                            {/* Rating and Custom Status Badges */}
                            <div className="absolute top-3 left-3 bg-[#00d1ff]/90 backdrop-blur-md text-[#003543] px-2 py-1 rounded text-xs font-bold shadow-lg z-30">
                                {item.rate}
                            </div>
                            
                            {item.expiring_soon && !item.watched && (
                                <div className="absolute top-3 right-3 bg-[#ff571a] text-white px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider z-30">
                                    7 Days Left
                                </div>
                            )}

                            {item.watched && (
                                <div className="absolute top-3 right-3 bg-green-500/80 backdrop-blur-md text-white px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider z-30">
                                    Watched
                                </div>
                            )}

                            {/* Info Details Panel (Slide-up on hover) */}
                            <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-30">
                                <h3 className="font-bold text-lg text-white mb-0.5 truncate">{item.title}</h3>
                                <div className="flex items-center gap-2 text-xs text-[#bbc9cf] mb-4">
                                    <span>{item.year}</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-600"></span>
                                    <span>{item.cat}</span>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Link 
                                        href={getDetailsLink(item)}
                                        className="w-full bg-[#00d1ff] text-[#003543] py-2.5 rounded-full font-bold text-sm hover:bg-[#a4e6ff] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                            play_arrow
                                        </span> 
                                        {item.watched ? "Watch Again" : "Watch Now"}
                                    </Link>
                                    <div className="flex gap-2">
                                        {!item.watched && (
                                            <button 
                                                onClick={(e) => handleMarkWatched(item.id, e)}
                                                className="flex-1 border border-white/20 bg-white/5 backdrop-blur-md py-2.5 rounded-full text-xs font-bold text-white hover:bg-green-500/20 hover:text-green-400 hover:border-green-500/40 transition-all flex items-center justify-center gap-1 cursor-pointer"
                                                title="Mark as Watched"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">check_circle</span> Watched
                                            </button>
                                        )}
                                        <button 
                                            onClick={(e) => handleRemove(item.id, e)}
                                            className={`rounded-full border border-white/20 bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-[#ffb4ab]/20 hover:text-[#ffb4ab] hover:border-[#ffb4ab]/40 transition-all cursor-pointer ${item.watched ? "w-full py-2.5 gap-2" : "w-11 h-11"}`}
                                            title="Remove"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">close</span>
                                            {item.watched && <span className="text-xs font-bold">Remove from List</span>}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* Empty Watchlist State Redesign */
                <div className="py-16 w-full flex justify-center items-center px-4">
                    <div 
                        className="w-full max-w-2xl rounded-3xl p-8 md:p-12 text-center flex flex-col items-center gap-6 border border-white/10 shadow-[0px_0px_50px_rgba(0,0,0,0.6)]"
                        style={{
                            background: "rgba(25, 27, 27, 0.4)",
                            backdropFilter: "blur(24px)",
                            WebkitBackdropFilter: "blur(24px)"
                        }}
                    >
                        {/* Glow bookmark icon container */}
                        <div className="relative w-24 h-24 flex items-center justify-center rounded-2xl bg-gradient-to-tr from-[#00d1ff]/15 to-[#a4e6ff]/5 border border-[#00d1ff]/20 shadow-[0_0_30px_rgba(0,209,255,0.1)]">
                            <span className="material-symbols-outlined text-[44px] text-[#00d1ff] drop-shadow-[0_0_15px_rgba(0,209,255,0.6)]">
                                bookmark_add
                            </span>
                        </div>
                        
                        <div className="space-y-2 w-full">
                            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Your watchlist is empty</h2>
                            <p 
                                className="text-[#bbc9cf] text-sm md:text-base leading-relaxed"
                                style={{ display: "block", width: "100%", maxWidth: "480px", margin: "0 auto" }}
                            >
                                To see your watchlist content, you need to add them first. Start browsing and click <strong className="text-[#a4e6ff]">"Add to List"</strong> on movie cards or headers!
                            </p>
                        </div>

                        <Link 
                            href="/" 
                            className="bg-[#00d1ff] text-[#003543] font-bold text-sm px-10 py-4 rounded-full shadow-[0px_0px_20px_rgba(0,209,255,0.3)] hover:scale-[1.05] hover:bg-[#a4e6ff] active:scale-[0.97] transition-all duration-300 flex items-center gap-2 cursor-pointer uppercase tracking-wider"
                        >
                            <span className="material-symbols-outlined text-[18px]">explore</span>
                            <span>Browse Titles</span>
                        </Link>
                    </div>
                </div>
            )}

            {/* Recommended Section */}
            <section className="mt-20 pt-8 border-t border-white/5">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-white">Recommended for You</h2>
                    <Link href="/" className="text-[#00d1ff] hover:underline font-semibold text-sm">
                        View All
                    </Link>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {recommendations.map((rec) => (
                        <div 
                            key={rec.tmdb_id}
                            className="group relative aspect-[2/3] rounded-xl overflow-hidden bg-[#1e2020] border border-white/5 shadow-lg transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,209,255,0.2)] hover:scale-[1.03] cursor-pointer"
                        >
                            <Image
                                alt={rec.title}
                                fill
                                unoptimized={true}
                                src={rec.img}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
                            
                            {/* Play center trigger */}
                            <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-95 group-hover:scale-100">
                                <Link 
                                    href={getDetailsLink(rec)}
                                    className="w-16 h-16 rounded-full bg-[#00d1ff]/90 flex items-center justify-center text-[#003543] shadow-[0_0_20px_rgba(0,209,255,0.6)] hover:scale-110 transition-transform cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                        play_arrow
                                    </span>
                                </Link>
                            </div>

                            <div className="absolute top-3 left-3 bg-[#00d1ff]/90 backdrop-blur-md text-[#003543] px-2 py-1 rounded text-xs font-bold shadow-lg z-30">
                                {rec.rate}
                            </div>

                            {/* Details slide-up */}
                            <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-30">
                                <h3 className="font-bold text-lg text-white mb-0.5 truncate">{rec.title}</h3>
                                <p className="text-xs text-[#bbc9cf] mb-4">{rec.cat}</p>
                                <div className="flex gap-2">
                                    <Link 
                                        href={getDetailsLink(rec)}
                                        className="flex-1 bg-white text-black py-2.5 rounded-full font-bold text-xs text-center hover:bg-[#e2e2e2] transition-colors cursor-pointer"
                                    >
                                        Details
                                    </Link>
                                    <button 
                                        onClick={(e) => handleAddRecommendation(rec, e)}
                                        className="w-11 h-11 rounded-full border border-white/20 bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-[#00d1ff] hover:text-[#003543] hover:border-[#00d1ff] transition-all cursor-pointer"
                                        title="Add to Watchlist"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">add</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Interactive Toast Notification */}
            <div 
                className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-4 bg-[#333535] border border-white/10 px-6 py-3 rounded-full shadow-2xl transition-all duration-500 pointer-events-auto ${toastVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0 pointer-events-none"}`}
            >
                <span className="text-white font-medium text-sm">{toastText}</span>
                {toastAction && (
                    <button 
                        onClick={() => {
                            toastAction();
                            setToastVisible(false);
                        }}
                        className="text-[#00d1ff] font-bold hover:underline active:scale-95 transition-all cursor-pointer text-sm"
                    >
                        Undo
                    </button>
                )}
            </div>

        </main>
    );
}