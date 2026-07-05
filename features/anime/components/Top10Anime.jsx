"use client"
import { useRef } from "react";
import Link from "next/link";

export default function Top10Anime({ animeData }) {
    const scrollContainerRef = useRef(null);

    const scroll = (direction) => {
        const { current } = scrollContainerRef;
        if (current) {
            const scrollAmount = 500;
            current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth"
            });
        }
    };

    const handleAddToWatchlist = async (tmdbId, type, title) => {
        try {
            const res = await fetch("/api/watchlist", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ tmdbId, type })
            });
            if (res.status === 401) {
                alert("Please sign in to add titles to your watchlist!");
                window.location.href = "/login";
                return;
            }
            if (res.ok) {
                alert(`Added "${title}" to My List!`);
            }
        } catch (err) {
            console.error("Error adding to watchlist:", err);
        }
    };

    const items = animeData?.data || [];
    const top10 = items.slice(0, 10);

    if (top10.length === 0) return null;

    return (
        <section className="bg-surface py-8 px-gutter max-w-container-max mx-auto w-full space-y-md">
            {/* Row Title with accent indicator */}
            <div className="flex justify-between items-end border-l-4 border-primary-container pl-4 mb-6">
                <h2 className="font-headline-md text-headline-md text-on-surface uppercase font-bold tracking-tight">
                    Top 10 Anime Today
                </h2>
            </div>

            <div className="relative group/nav">
                {/* Left Navigation Arrow */}
                <button 
                    onClick={() => scroll("left")}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-50 bg-black/60 border border-white/10 hover:bg-primary-container hover:text-on-primary-container text-white w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md opacity-0 group-hover/nav:opacity-100 backdrop-blur-md active:scale-90"
                    aria-label="Scroll left"
                >
                    <span className="material-symbols-outlined text-xl">chevron_left</span>
                </button>

                {/* Right Navigation Arrow */}
                <button 
                    onClick={() => scroll("right")}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-50 bg-black/60 border border-white/10 hover:bg-primary-container hover:text-on-primary-container text-white w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md opacity-0 group-hover/nav:opacity-100 backdrop-blur-md active:scale-90"
                    aria-label="Scroll right"
                >
                    <span className="material-symbols-outlined text-xl">chevron_right</span>
                </button>

                {/* Snap scrollable row for Netflix-style Top 10 cards */}
                <div 
                    ref={scrollContainerRef}
                    className="flex gap-20 overflow-x-auto pb-6 custom-scrollbar no-scrollbar scroll-smooth snap-x pl-16 pr-6"
                >
                    {top10.map((item, index) => {
                        const anime = item.node;
                        const rankIndex = index + 1;
                        return (
                            <div 
                                key={anime.id} 
                                className="flex-none flex items-end snap-start group cursor-pointer relative pb-4"
                            >
                                {/* Large Background Ranking Number */}
                                <span className="absolute left-[-50px] bottom-[-15px] select-none z-0 font-black text-white/10 text-[8rem] md:text-[10rem] leading-none pointer-events-none transition-all duration-300 group-hover:text-primary-container/20">
                                    {rankIndex}
                                </span>

                                {/* Standard Aspect Ratio Image wrapper */}
                                <div 
                                    className="w-[180px] md:w-[240px] aspect-[2/3] rounded-xl overflow-hidden shadow-2xl relative bg-surface-container-low border border-white/5 z-10 transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(0,209,255,0.3)]"
                                >
                                    
                                    <img 
                                        className="w-full h-full object-cover"
                                        src={anime.main_picture?.large || anime.main_picture?.medium} 
                                        alt={anime.title}
                                    />

                                    {/* Hover Panel Glassmorphic details overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 z-20">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <span className="bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">HD</span>
                                            {anime.start_date && (
                                                <span className="text-white/60 text-[10px] font-bold">
                                                    {anime.start_date.split("-")[0]}
                                                </span>
                                            )}
                                            {anime.mean > 0 && (
                                                <span className="text-yellow-400 text-[10px] font-bold flex items-center gap-0.5">
                                                    ★ {anime.mean.toFixed(1)}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="font-label-md text-label-md text-white font-semibold truncate mb-1">
                                            {anime.title}
                                        </h3>
                                        <div className="flex space-x-2 mt-3">
                                            <Link 
                                                href={`/anime/details/${anime.id}`}
                                                className="bg-white text-black p-2 rounded-lg flex items-center justify-center hover:scale-115 transition-transform cursor-pointer"
                                            >
                                                <span className="material-symbols-outlined text-sm font-semibold" style={{ fontVariationSettings: "'FILL' 1" }}>
                                                    play_arrow
                                                </span>
                                            </Link>
                                            <button 
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleAddToWatchlist(anime.id, "anime", anime.title);
                                                }}
                                                className="bg-white/20 backdrop-blur-md text-white p-2 rounded-lg flex items-center justify-center hover:scale-115 transition-transform cursor-pointer"
                                            >
                                                <span className="material-symbols-outlined text-sm">add</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    
                    {/* Spacer to prevent scroll end trimming */}
                    <div className="w-12 shrink-0 h-1" />
                </div>
            </div>
        </section>
    );
}
