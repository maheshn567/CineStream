"use client"
import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import AnimeNav from "./AnimeNav";

export default function AnimeGenre() {
    const router = useRouter();
    const params = useParams();
    const genreId = params?.id;

    const { data, isLoading, error } = useQuery({
        queryKey: ["anime-genre", genreId],
        queryFn: () => {
            return fetch(`https://api.jikan.moe/v4/anime?genres=${genreId}&limit=24`).then((res) => {
                if (!res.ok) throw new Error("Failed to fetch anime by genre");
                return res.json();
            });
        },
        enabled: !!genreId,
        staleTime: 1000 * 60 * 60, // 1 hour client cache
    });

    const genreMap = {
        1: "Action",
        2: "Adventure",
        4: "Comedy",
        8: "Drama",
        10: "Fantasy",
        22: "Romance",
        24: "Sci-Fi",
        36: "Slice of Life",
        37: "Supernatural",
        41: "Suspense",
        27: "Shounen",
        42: "Seinen",
        25: "Shoujo",
        43: "Josei",
        14: "Horror",
        7: "Mystery",
        19: "Music",
        30: "Sports",
        11: "Game"
    };

    const animeList = data?.data || [];

    // Dynamically resolve genre name from items first, then fallback to static map
    const activeGenreItem = animeList?.[0]?.genres?.find(g => String(g.mal_id) === String(genreId));
    const genreName = activeGenreItem ? activeGenreItem.name : (genreMap[genreId] || genreMap[Number(genreId)] || "Anime");

    return (
        <main className="min-h-screen bg-surface pb-16 w-full font-montserrat text-on-surface relative pt-24">
            
            {/* Go Back button */}
            <button 
                onClick={() => router.push("/anime")}
                className="absolute top-28 left-6 md:left-12 z-40 bg-black/40 hover:bg-black/70 p-3 rounded-full text-white backdrop-blur-md transition-all border border-white/10 flex items-center justify-center cursor-pointer group hover:scale-105 active:scale-95"
                title="Back to Anime Hub"
            >
                <span className="material-symbols-outlined text-2xl group-hover:text-primary transition-colors">
                    arrow_back
                </span>
            </button>

            {/* Genre Navigation Chips bar */}
            <div className="bg-surface relative z-20 -mt-2">
                <AnimeNav activeGenreId={genreId} />
            </div>

            <section className="px-gutter md:px-xl max-w-container-max mx-auto w-full space-y-8 mt-6">
                {/* Section Header */}
                <div className="flex justify-between items-end border-l-4 border-primary-container pl-4 mb-6">
                    <h2 className="font-headline-md text-headline-md text-on-surface uppercase font-bold tracking-tight">
                        {genreName} Spotlight
                    </h2>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {[...Array(12)].map((_, index) => (
                            <div key={index} className="flex flex-col space-y-2 animate-pulse">
                                <div className="aspect-[2/3] rounded-xl bg-surface-container-low/50 border border-white/5" />
                                <div className="h-4 w-3/4 bg-surface-container-low/50 rounded" />
                                <div className="h-3 w-1/2 bg-surface-container-low/50 rounded mt-1" />
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center gap-4 py-24 bg-surface-container-low/40 rounded-3xl border border-error/10 p-8 text-center max-w-[28rem] mx-auto">
                        <span className="material-symbols-outlined text-error text-5xl">
                            error_outline
                        </span>
                        <h3 className="text-xl font-bold text-white">Error Loading Anime</h3>
                        <p className="text-on-surface-variant text-sm">
                            {error.message || "We couldn't retrieve anime for this genre. Please try again."}
                        </p>
                        <button 
                            onClick={() => window.location.reload()}
                            className="bg-primary-container text-on-primary-container font-bold px-6 py-2.5 rounded-full hover:brightness-110 active:scale-95 transition-all mt-2 cursor-pointer"
                        >
                            Retry
                        </button>
                    </div>
                ) : animeList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-4 py-24 bg-surface-container-low/40 rounded-3xl border border-white/5 p-8 text-center max-w-[28rem] mx-auto">
                        <span className="material-symbols-outlined text-primary text-5xl animate-pulse">
                            search_off
                        </span>
                        <h3 className="text-xl font-bold text-white">No Anime Found</h3>
                        <p className="text-on-surface-variant text-sm">
                            We couldn't retrieve any anime for this genre category right now. Try checking another category.
                        </p>
                        <Link 
                            href="/anime"
                            className="bg-primary-container text-on-primary-container font-bold px-6 py-2.5 rounded-full hover:brightness-110 active:scale-95 transition-all mt-2"
                        >
                            Back to Hub
                        </Link>
                    </div>
                ) : (
                    /* Responsive 6-column grid matching design specifications */
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {animeList.map((anime) => {
                            const posterUrl = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url;
                            const rating = anime.score || "0.0";
                            const year = anime.year || (anime.aired?.prop?.from?.year) || "N/A";
                            return (
                                <Link 
                                    href={`/anime/details/${anime.mal_id}`}
                                    key={anime.mal_id} 
                                    className="flex flex-col space-y-2 group cursor-pointer block"
                                >
                                    {/* Card Image Wrapper with Cyan Glow Hover */}
                                    <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-md border border-white/5 bg-surface-container-low transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(0,209,255,0.3)]">
                                        <img 
                                            className="w-full h-full object-cover" 
                                            src={posterUrl} 
                                            alt={anime.title}
                                            loading="lazy"
                                        />
                                        
                                        {/* Hover Overlay info */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 z-10">
                                            <div className="flex items-center justify-between gap-1 text-[10px] text-white/80 font-bold mb-1">
                                                <span className="bg-primary-container/85 text-on-primary-container px-2 py-0.5 rounded uppercase">
                                                    {anime.type || "TV"}
                                                </span>
                                                {anime.score && (
                                                    <span className="text-yellow-400 flex items-center gap-0.5">
                                                        ★ {Number(rating).toFixed(1)}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="bg-primary/20 border border-primary/30 text-primary text-[9px] font-bold py-1 px-2.5 rounded-full text-center hover:bg-primary hover:text-on-primary transition-colors cursor-pointer mt-2">
                                                VIEW DETAILS
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {/* Movie / Series Title */}
                                    <h3 className="font-label-md text-label-md text-on-surface mt-2 group-hover:text-primary transition-colors truncate font-semibold">
                                        {anime.title}
                                    </h3>
                                    
                                    {/* Metadata text */}
                                    <div className="flex items-center text-[10px] text-on-surface-variant font-medium space-x-2">
                                        <span>{year}</span>
                                        <span>•</span>
                                        <span>{anime.episodes ? `${anime.episodes} Episodes` : "Movie Format"}</span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </section>
        </main>
    );
}