"use client"
import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";

export default function Upcomming() {
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

    const formatReleaseDate = (dateStr) => {
        if (!dateStr) return "Coming Soon";
        try {
            const date = new Date(dateStr);
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            return `Coming ${months[date.getMonth()]} ${date.getFullYear()}`;
        } catch (e) {
            return `Coming ${dateStr}`;
        }
    };

    const { data, isLoading, error } = useQuery({
        queryKey: ["upcoming"],
        queryFn: () => {
            return fetch(`${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/3/movie/upcoming`, {
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
                    {[...Array(6)].map((_, index) => (
                        <div key={index} className="flex-none w-48 md:w-64 aspect-[2/3] rounded-xl bg-surface-container-low animate-pulse border border-white/5" />
                    ))}
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="bg-surface py-8 px-gutter max-w-container-max mx-auto w-full">
                <div className="border border-error/20 bg-error/5 text-error px-6 py-4 rounded-xl text-body-md font-semibold text-center">
                    Error loading upcoming movies: {error.message}
                </div>
            </section>
        );
    }

    // Filter to only include current month and future upcoming releases, then sort chronologically
    const current = new Date();
    const currentYear = current.getFullYear();
    const currentMonth = current.getMonth(); // 0-11

    const filteredMovies = (data?.results || []).filter((item) => {
        if (!item.release_date) return false;
        const releaseDate = new Date(item.release_date);
        const releaseYear = releaseDate.getFullYear();
        const releaseMonth = releaseDate.getMonth();

        if (releaseYear > currentYear) return true;
        if (releaseYear === currentYear) {
            return releaseMonth >= currentMonth;
        }
        return false;
    });

    const movies = [...filteredMovies].sort((a, b) => {
        return new Date(a.release_date) - new Date(b.release_date);
    });

    return (
        <section className="bg-surface py-8 px-gutter max-w-container-max mx-auto w-full space-y-md">
            {/* Title with left accent bar */}
            <div className="flex justify-between items-end border-l-4 border-primary-container pl-4 mb-6">
                <h2 className="font-headline-md text-headline-md text-on-surface uppercase font-bold tracking-tight">
                    Upcoming Movies
                </h2>
            </div>

            <div className="relative group/nav">
                {/* Left navigation arrow */}
                <button 
                    onClick={() => scroll("left")}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-50 bg-black/60 border border-white/10 hover:bg-primary-container hover:text-on-primary-container text-white w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md opacity-0 group-hover/nav:opacity-100 backdrop-blur-md active:scale-90"
                    aria-label="Scroll left"
                >
                    <span className="material-symbols-outlined text-xl">chevron_left</span>
                </button>

                {/* Right navigation arrow */}
                <button 
                    onClick={() => scroll("right")}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-50 bg-black/60 border border-white/10 hover:bg-primary-container hover:text-on-primary-container text-white w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md opacity-0 group-hover/nav:opacity-100 backdrop-blur-md active:scale-90"
                    aria-label="Scroll right"
                >
                    <span className="material-symbols-outlined text-xl">chevron_right</span>
                </button>

                {/* Horizontal scrollable row */}
                <div 
                    ref={scrollContainerRef}
                    className="flex space-x-md overflow-x-auto pb-6 custom-scrollbar no-scrollbar scroll-smooth"
                >
                    {movies.map((item) => (
                        <div 
                            key={item.id} 
                            className="flex-none w-48 md:w-64 group relative bg-surface-container-low rounded-xl overflow-hidden cursor-pointer aspect-[2/3] border border-white/5 shadow-md transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(0,209,255,0.3)] z-10 hover:z-20"
                        >
                            
                            {item.poster_path ? (
                                <Image 
                                    className="object-cover group-hover:scale-105 transition-all duration-300"
                                    fill 
                                    src={`https://image.tmdb.org/t/p/w500${item.poster_path}`} 
                                    alt={item.title}
                                    unoptimized={true}
                                    sizes="(max-width: 768px) 192px, 256px"
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-surface-container-high border border-white/5 p-4 text-center">
                                    <span className="material-symbols-outlined text-primary/20 text-5xl mb-2">movie</span>
                                    <span className="text-on-surface/50 text-label-md font-semibold truncate max-w-full">{item.title}</span>
                                </div>
                            )}

                            {/* Info Overlay Panel */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent flex flex-col justify-end p-4 z-20">
                                <div className="flex items-center space-x-2 mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <span className="bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">Upcoming</span>
                                    {item.release_date && (
                                        <span className="text-white/60 text-[10px] font-bold">
                                            {item.release_date.split("-")[0]}
                                        </span>
                                    )}
                                </div>
                                <h3 className="font-label-md text-label-md text-white font-semibold truncate mb-1 group-hover:text-primary transition-colors duration-300">
                                    {item.title}
                                </h3>
                                <p className="font-label-sm text-label-sm text-primary font-semibold">
                                    {formatReleaseDate(item.release_date)}
                                </p>
                                
                                {/* Action Buttons Revealed on Hover */}
                                <div className="max-h-0 opacity-0 overflow-hidden group-hover:max-h-12 group-hover:opacity-100 group-hover:mt-3 transition-all duration-300 flex space-x-2">
                                    <Link 
                                        href={`/movie/details/${item.id}`}
                                        className="bg-white text-black px-3.5 py-1.5 rounded-lg flex items-center justify-center gap-1 hover:scale-105 transition-all cursor-pointer font-bold text-[12px] shadow-md"
                                        title="Watch Trailer"
                                    >
                                        <span className="material-symbols-outlined text-[14px] font-semibold" style={{ fontVariationSettings: "'FILL' 1" }}>
                                            play_arrow
                                        </span>
                                        <span>Trailer</span>
                                    </Link>
                                    <button 
                                        className="bg-white/20 backdrop-blur-md text-white px-3.5 py-1.5 rounded-lg flex items-center justify-center gap-1 hover:scale-105 transition-all cursor-pointer font-bold text-[12px] shadow-md hover:bg-white/30"
                                        title="Remind Me"
                                    >
                                        <span className="material-symbols-outlined text-[14px]">notifications</span>
                                        <span>Remind</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {/* Spacer to prevent cut off */}
                    <div className="w-12 shrink-0 h-1" />
                </div>
            </div>
        </section>
    );
}
