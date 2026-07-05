"use client"
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";

export default function SeriesGenre({ genreId }) {
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
    // 1. Fetch TV series matching the selected genre ID
    const { data: showsData, isLoading: isShowsLoading, error: showsError } = useQuery({
        queryKey: ["series-by-genre", genreId],
        queryFn: () => {
            return fetch(`${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/3/discover/tv?with_genres=${genreId}`, {
                headers: {
                    accept: 'application/json',
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_ACCESS_TOKEN}`
                }
            }).then((res) => {
                if (!res.ok) throw new Error('Failed to fetch series for this genre');
                return res.json();
            });
        },
        staleTime: 1000 * 60 * 60 * 24, // 1 day
        gcTime: 1000 * 60 * 60 * 24,    // 1 day
        retry: false,
    });

    // 2. Fetch the genres list to get the active genre name
    const { data: genresData } = useQuery({
        queryKey: ["tv-genres-list"],
        queryFn: () => {
            return fetch(`${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/3/genre/tv/list`, {
                headers: {
                    accept: 'application/json',
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_ACCESS_TOKEN}`
                }
            }).then((res) => {
                if (!res.ok) throw new Error('Failed to fetch TV genres');
                return res.json();
            });
        },
        staleTime: 1000 * 60 * 60 * 24,
        gcTime: 1000 * 60 * 60 * 24,
    });

    const activeGenre = genresData?.genres?.find(g => String(g.id) === String(genreId));
    const genreName = activeGenre ? activeGenre.name : "Series Spotlight";

    if (isShowsLoading) {
        return (
            <section className="bg-surface py-8 px-gutter max-w-container-max mx-auto w-full space-y-md">
                <div className="flex justify-between items-end border-l-4 border-primary-container pl-4 mb-6">
                    <div className="h-8 w-48 bg-surface-container-high rounded animate-pulse" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-md">
                    {[...Array(12)].map((_, index) => (
                        <div key={index} className="aspect-[2/3] rounded-xl bg-surface-container-low animate-pulse border border-white/5" />
                    ))}
                </div>
            </section>
        );
    }

    if (showsError) {
        return (
            <section className="bg-surface py-8 px-gutter max-w-container-max mx-auto w-full">
                <div className="border border-error/20 bg-error/5 text-error px-6 py-4 rounded-xl text-body-md font-semibold text-center">
                    Error loading series: {showsError.message}
                </div>
            </section>
        );
    }

    const series = showsData?.results || [];

    return (
        <section className="bg-surface py-8 px-gutter max-w-container-max mx-auto w-full space-y-md">
            {/* Genre Header Spotlight */}
            <div className="flex justify-between items-end border-l-4 border-primary-container pl-4 mb-6">
                <h2 className="font-headline-md text-headline-md text-on-surface uppercase font-bold tracking-tight">
                    {genreName} Spotlight
                </h2>
            </div>

            {series.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-4 py-24">
                    <span className="text-4xl">📺</span>
                    <p className="text-lg font-bold text-on-surface">No series found for this genre</p>
                    <p className="text-sm text-on-surface-variant">Try browsing another genre category.</p>
                </div>
            ) : (
                /* Grid Layout for TV Genre Spotlight */
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-md">
                    {series.map((item) => (
                        <div key={item.id} className="group relative bg-surface-container-low rounded-xl overflow-hidden cursor-pointer aspect-[2/3] border border-white/5 shadow-md">
                            
                            {item.poster_path ? (
                                <Image 
                                    className="object-cover group-hover:scale-105 transition-all duration-300"
                                    fill 
                                    src={`https://image.tmdb.org/t/p/w500${item.poster_path}`} 
                                    alt={item.name || item.original_name}
                                    unoptimized={true}
                                    sizes="(max-width: 768px) 192px, 256px"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center p-4 bg-surface-container text-on-surface/50 text-center font-semibold text-label-md">
                                    {item.name || item.original_name}
                                </div>
                            )}

                            {/* Hover Details Panel (Glassmorphism + Overlay) */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 z-20">
                                <div className="flex items-center space-x-2 mb-2">
                                    <span className="bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">HD</span>
                                    {item.first_air_date && (
                                        <span className="text-white/60 text-[10px] font-bold">
                                            {item.first_air_date.split("-")[0]}
                                        </span>
                                    )}
                                    {item.vote_average > 0 && (
                                        <span className="text-yellow-400 text-[10px] font-bold flex items-center gap-0.5">
                                            ★ {item.vote_average.toFixed(1)}
                                        </span>
                                    )}
                                </div>
                                <h3 className="font-label-md text-label-md text-white font-semibold truncate mb-1">
                                    {item.name || item.original_name}
                                </h3>
                                <div className="flex space-x-2 mt-3">
                                    <Link 
                                        href={`/series/detail/${item.id}`}
                                        className="bg-white text-black p-2 rounded-lg flex items-center justify-center hover:scale-115 transition-transform cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined text-sm font-semibold" style={{ fontVariationSettings: "'FILL' 1" }}>
                                            play_arrow
                                        </span>
                                    </Link>
                                    <button 
                                        onClick={() => handleAddToWatchlist(item.id, "series", item.name || item.original_name)}
                                        className="bg-white/20 backdrop-blur-md text-white p-2 rounded-lg flex items-center justify-center hover:scale-115 transition-transform cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined text-sm">add</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}