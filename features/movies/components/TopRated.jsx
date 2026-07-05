"use client"
import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";

export default function TopRated() {
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

    const { data, isLoading, error } = useQuery({
        queryKey: ["top-rated"],
        queryFn: () => {
            return fetch(`${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/3/movie/top_rated`, {
                headers: {
                    accept: 'application/json',
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_ACCESS_TOKEN}`
                }
            }).then((res) => {
                if (!res.ok) throw new Error('Failed to fetch TMDB data');
                return res.json();
            });
        },
        staleTime: 1000 * 60 * 60 * 24, // 1 day
        gcTime: 1000 * 60 * 60 * 24,    // 1 day
        retry: false, // Don't block development with continuous retries
    });

    if (isLoading) {
        return (
            <section className="bg-surface py-8 px-gutter max-w-container-max mx-auto w-full space-y-md">
                <div className="flex justify-between items-end border-l-4 border-primary-container pl-4 mb-6">
                    <div className="h-8 w-48 bg-surface-container-high rounded animate-pulse" />
                </div>

                <div className="flex space-x-md overflow-x-auto pb-6 custom-scrollbar scroll-smooth">
                    {[...Array(5)].map((_, index) => (
                        <div key={index} className="flex-none w-[180px] md:w-[240px] aspect-[2/3] rounded-xl bg-surface-container-low animate-pulse border border-white/5" />
                    ))}
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="bg-surface py-8 px-gutter max-w-container-max mx-auto w-full">
                <div className="border border-error/20 bg-error/5 text-error px-6 py-4 rounded-xl text-body-md font-semibold text-center">
                    Error loading top rated movies: {error.message}
                </div>
            </section>
        );
    }

    // Showcase the top 10 movies
    const movies = data?.results?.slice(0, 10) || [];

    return (
        <section className="bg-surface py-8 px-gutter max-w-container-max mx-auto w-full space-y-md">
            {/* Row Title with accent indicator */}
            <div className="flex justify-between items-end border-l-4 border-primary-container pl-4 mb-6">
                <h2 className="font-headline-md text-headline-md text-on-surface uppercase font-bold tracking-tight">
                    Top 10 Masterpieces
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
                    {movies.map((item, index) => (
                        <div key={item.id} className="flex-none flex items-end snap-start group cursor-pointer relative pb-4">
                            
                            {/* Large Background Ranking Number */}
                            <span className="absolute left-[-50px] bottom-[-15px] select-none z-0 font-black text-white/10 text-[8rem] md:text-[10rem] leading-none pointer-events-none transition-all duration-300 group-hover:text-primary-container/20">
                                {index + 1}
                            </span>

                            {/* Standard Aspect Ratio Image wrapper */}
                            <div className="w-[180px] md:w-[240px] aspect-[2/3] rounded-xl overflow-hidden shadow-2xl relative bg-surface-container-low border border-white/5 z-10 transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(0,209,255,0.3)]">
                                
                                {item.poster_path ? (
                                    <Image 
                                        className="object-cover"
                                        fill 
                                        src={`https://image.tmdb.org/t/p/w500${item.poster_path}`} 
                                        alt={item.title}
                                        unoptimized={true}
                                        sizes="(max-width: 768px) 180px, 240px"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center p-4 bg-surface-container text-on-surface/50 text-center font-semibold text-label-md">
                                        {item.title}
                                    </div>
                                )}

                                {/* Hover Panel Glassmorphic details overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 z-20">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <span className="bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">HD</span>
                                        {item.release_date && (
                                            <span className="text-white/60 text-[10px] font-bold">
                                                {item.release_date.split("-")[0]}
                                            </span>
                                        )}
                                        {item.vote_average > 0 && (
                                            <span className="text-yellow-400 text-[10px] font-bold flex items-center gap-0.5">
                                                ★ {item.vote_average.toFixed(1)}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="font-label-md text-label-md text-white font-semibold truncate mb-1">
                                        {item.title}
                                    </h3>
                                    <div className="flex space-x-2 mt-3">
                                        <Link 
                                            href={`/movie/details/${item.id}`}
                                            className="bg-white text-black p-2 rounded-lg flex items-center justify-center hover:scale-115 transition-transform cursor-pointer"
                                        >
                                            <span className="material-symbols-outlined text-sm font-semibold" style={{ fontVariationSettings: "'FILL' 1" }}>
                                                play_arrow
                                            </span>
                                        </Link>
                                        <button 
                                            onClick={() => handleAddToWatchlist(item.id, "movie", item.title)}
                                            className="bg-white/20 backdrop-blur-md text-white p-2 rounded-lg flex items-center justify-center hover:scale-115 transition-transform cursor-pointer"
                                        >
                                            <span className="material-symbols-outlined text-sm">add</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {/* Spacer to prevent scroll end trimming */}
                    <div className="w-12 shrink-0 h-1" />
                </div>
            </div>
        </section>
    );
}
