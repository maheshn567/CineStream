"use client"
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import CinematicTrailerPlayer from "@/features/movies/components/CinematicTrailerPlayer";

export default function SeriesDetail({ data }) {
    const router = useRouter();
    const params = useParams();
    const id = params?.id;

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

    const handleBack = () => {
        if (typeof window !== "undefined") {
            try {
                const stored = sessionStorage.getItem("custom_history");
                if (stored) {
                    const stack = JSON.parse(stored);
                    if (Array.isArray(stack) && stack.length >= 2) {
                        const prev = stack[stack.length - 2];
                        stack.pop();
                        sessionStorage.setItem("custom_history", JSON.stringify(stack));
                        router.push(prev);
                        return;
                    }
                }
            } catch (e) {
                console.error("Error reading custom_history:", e);
            }
        }
        if (typeof window !== "undefined" && window.history.length > 1) {
            router.back();
        } else {
            router.push("/series");
        }
    };

    const scrollContainerRef = useRef(null);
    const [isHeroTrailerPlaying, setIsHeroTrailerPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [isCinematicPlayerOpen, setIsCinematicPlayerOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    
    // Season & Episode selection states
    const [selectedSeason, setSelectedSeason] = useState(1);
    const [isSeasonDropdownOpen, setIsSeasonDropdownOpen] = useState(false);
    const [episodeSearchQuery, setEpisodeSearchQuery] = useState("");

    // Reset episode search query when season changes
    useEffect(() => {
        setEpisodeSearchQuery("");
    }, [selectedSeason]);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Fetch episodes for the selected season dynamically
    const { data: seasonData, isLoading: isSeasonLoading } = useQuery({
        queryKey: ["tv-season-details", data?.id, selectedSeason],
        queryFn: () => {
            return fetch(`${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/3/tv/${data.id}/season/${selectedSeason}`, {
                headers: {
                    accept: 'application/json',
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_ACCESS_TOKEN}`
                }
            }).then((res) => {
                if (!res.ok) throw new Error('Failed to fetch season details');
                return res.json();
            });
        },
        enabled: !!data?.id && !!selectedSeason,
        staleTime: 1000 * 60 * 60 * 24, // 1 day
    });

    const filteredEpisodes = seasonData?.episodes?.filter((episode) => {
        if (!episodeSearchQuery) return true;
        const cleanQuery = episodeSearchQuery.trim();
        const epNumStr = String(episode.episode_number);
        return epNumStr === cleanQuery || epNumStr.includes(cleanQuery) || episode.name?.toLowerCase().includes(cleanQuery.toLowerCase());
    }) || [];

    if (!data) {
        return (
            <main className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center font-montserrat text-on-surface">
                <div className="max-w-md bg-surface-container-low/40 backdrop-blur-xl border border-white/5 p-8 rounded-2xl shadow-2xl">
                    <span className="material-symbols-outlined text-6xl text-error mb-4">
                        error
                    </span>
                    <h1 className="text-2xl font-bold text-white mb-2">Series Not Found</h1>
                    <p className="text-on-surface-variant mb-6">
                        We couldn't retrieve the details for this series. It might be temporarily unavailable or the ID is incorrect.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button 
                            onClick={handleBack}
                            className="bg-surface-container-high border border-outline-variant/30 text-white font-bold px-6 py-3 rounded-full hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
                        >
                            Go Back
                        </button>
                        {id && (
                            <button 
                                onClick={() => {
                                    router.push(`/series/${id}/season/1/episode/1?ref=${encodeURIComponent(`/series/detail/${id}`)}`);
                                }}
                                className="bg-primary-container text-on-primary-container font-bold px-6 py-3 rounded-full hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,209,255,0.4)] hover:shadow-[0_0_25px_rgba(0,209,255,0.6)] flex items-center justify-center"
                            >
                                Stream on Videasy
                            </button>
                        )}
                        <Link 
                            href="/"
                            className="bg-surface-container-high border border-outline-variant/30 text-white font-bold px-6 py-3 rounded-full hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
                        >
                            Home
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

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

    const creators = data.created_by?.map(c => c.name).slice(0, 3).join(", ") || "N/A";
    const cast = data.credits?.cast?.slice(0, 10) || [];
    const similarSeries = data.similar?.results?.slice(0, 12) || [];

    const formatRuntime = (runTimes) => {
        if (!runTimes || runTimes.length === 0) return "";
        const minutes = runTimes[0];
        const hrs = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
    };

    const trailer = data.videos?.results?.find(
        (v) => v.type === "Trailer" && v.site === "YouTube"
    ) || data.videos?.results?.find((v) => v.site === "YouTube");

    const scorePercentage = data.vote_average ? Math.round(data.vote_average * 10) : 0;

    return (
        <main className="min-h-screen bg-surface pb-12 w-full font-montserrat text-on-surface relative">
            
            {/* Go Back button */}
            <button 
                onClick={handleBack}
                className="fixed top-24 left-6 md:left-12 z-40 bg-black/40 hover:bg-black/70 p-3 rounded-full text-white backdrop-blur-md transition-all border border-white/10 flex items-center justify-center cursor-pointer group hover:scale-105 active:scale-95"
                title="Go Back"
            >
                <span className="material-symbols-outlined text-2xl group-hover:text-primary transition-colors">
                    arrow_back
                </span>
            </button>

            {/* Hero Section / Backdrop */}
            <div className="relative w-full h-[65vh] md:h-[80vh] overflow-hidden bg-surface-container-lowest animate-fade-in">
                
                {/* Backdrop Area */}
                <div className="absolute inset-0 z-0">
                    {isHeroTrailerPlaying && trailer ? (
                        <div className="relative w-full h-full bg-black">
                            <div className="absolute inset-0 z-10 bg-transparent" />
                            <iframe
                                className="w-full h-full border-0 scale-105 md:scale-110 object-cover pointer-events-none"
                                src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&loop=1&playlist=${trailer.key}&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3`}
                                allow="accelerated-media; autoplay; encrypted-media; gyroscope"
                            ></iframe>
                        </div>
                    ) : (
                        <>
                            {data.backdrop_path ? (
                                <Image 
                                    className="object-cover opacity-60 transition-transform duration-[10s] ease-out scale-105"
                                    fill
                                    src={`https://image.tmdb.org/t/p/original${data.backdrop_path}`}
                                    alt={data.name}
                                    unoptimized={true}
                                    priority
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-surface-container-low to-surface-container-high" />
                            )}
                        </>
                    )}
                </div>

                {/* Dark Gradient overlays */}
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-surface via-surface/40 to-transparent pointer-events-none" />
                <div className="absolute inset-0 z-10 bg-gradient-to-r from-surface via-surface/80 md:via-surface/40 to-transparent pointer-events-none" />

                {/* Mute/Unmute toggle button */}
                {isHeroTrailerPlaying && trailer && (
                    <button 
                        onClick={() => setIsMuted(!isMuted)}
                        className="absolute bottom-8 right-8 z-30 w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-black/60 transition-all duration-300 shadow-lg cursor-pointer"
                        title={isMuted ? "Unmute Trailer" : "Mute Trailer"}
                    >
                        <span className="material-symbols-outlined text-xl">
                            {isMuted ? "volume_off" : "volume_up"}
                        </span>
                    </button>
                )}

                {/* Hero Title & Actions Overlay */}
                <div className="absolute inset-0 max-w-container-max mx-auto px-gutter flex flex-col justify-end pb-12 z-20">
                    <div className="max-w-3xl bg-surface-container-low/40 backdrop-blur-xl border border-white/5 p-6 md:p-8 rounded-2xl transform transition-all shadow-2xl">
                        
                        {/* Meta tags list */}
                        <div className="flex flex-wrap items-center gap-3 mb-4 text-label-md text-on-surface-variant font-semibold">
                            <span className="px-2.5 py-0.5 bg-surface-container-high rounded text-white font-bold tracking-wider">
                                {data.first_air_date ? data.first_air_date.split("-")[0] : ""}
                            </span>
                            {data.vote_average > 0 && (
                                <span className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[16px] text-yellow-400" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                    <span className="text-on-surface font-bold">{data.vote_average.toFixed(1)}</span>
                                </span>
                            )}
                            <span>•</span>
                            <span>{data.number_of_seasons} {data.number_of_seasons === 1 ? "Season" : "Seasons"}</span>
                            <span>•</span>
                            <span>{data.number_of_episodes} Episodes</span>
                            {data.episode_run_time?.[0] && (
                                <>
                                    <span>•</span>
                                    <span>{formatRuntime(data.episode_run_time)}</span>
                                </>
                            )}
                            <span>•</span>
                            {data.genres && data.genres.slice(0, 2).map((g) => (
                                <span key={g.id} className="px-2.5 py-0.5 bg-white/10 rounded-full text-primary font-bold">
                                    {g.name}
                                </span>
                            ))}
                        </div>

                        {/* Title */}
                        <h1 className="font-display-lg text-headline-lg-mobile md:text-headline-lg lg:text-[2.75rem] text-white font-extrabold uppercase leading-tight tracking-tight mb-4 drop-shadow-lg">
                            {data.name}
                        </h1>

                        {/* Tagline */}
                        {data.tagline && (
                            <p className="text-body-lg text-primary italic font-medium mb-4">
                                "{data.tagline}"
                            </p>
                        )}

                        {/* Actions block */}
                        <div className="flex flex-wrap items-center gap-4">
                            <Link 
                                href={`/series/${data.id}/season/1/episode/1`}
                                className="bg-primary-container text-on-primary-container font-label-md text-label-md px-8 py-3.5 rounded-full flex items-center gap-2 font-bold hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,209,255,0.3)] hover:shadow-[0_0_25px_rgba(0,209,255,0.5)]"
                            >
                                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                                <span>Watch Now</span>
                            </Link>
                            
                            {trailer && (
                                <button 
                                    onClick={() => setIsCinematicPlayerOpen(true)}
                                    className="font-label-md text-label-md px-8 py-3.5 rounded-full flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer border bg-surface-container-high/60 backdrop-blur-md text-white border-outline-variant/30 hover:bg-surface-variant"
                                >
                                    <span className="material-symbols-outlined">
                                        smart_display
                                    </span>
                                    <span>Watch Trailer</span>
                                </button>
                            )}

                             <button 
                                 onClick={() => handleAddToWatchlist(data.id, "series", data.name || data.original_name)}
                                 className="w-12 h-12 flex items-center justify-center rounded-full bg-surface-container-high text-on-surface border border-outline-variant/30 hover:bg-surface-variant transition-all duration-300 hover:text-primary cursor-pointer"
                             >
                                 <span className="material-symbols-outlined">add</span>
                             </button>
                        </div>

                    </div>
                </div>

            </div>

            {/* Details Section in 2 columns */}
            <div className="max-w-container-max mx-auto px-gutter mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
                
                {/* Left Column: Storyline & Cast */}
                <div className="lg:col-span-2 space-y-12">
                    
                    {/* Storyline details */}
                    <section className="space-y-4">
                        <h2 className="font-headline-md text-headline-md text-white flex items-center gap-2 uppercase tracking-tight font-bold">
                            <span className="w-1 h-6 bg-primary rounded-full" />
                            Storyline
                        </h2>

                        <div className="bg-surface-container-low rounded-2xl p-6 md:p-8 border border-white/5 shadow-md">
                            <p className="text-body-md text-on-surface-variant leading-relaxed mb-6 font-medium">
                                {data.overview || "No storyline description available."}
                            </p>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-white/10 text-body-md">
                                <div>
                                    <h4 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Creators</h4>
                                    <p className="text-white font-bold">{creators}</p>
                                </div>
                                <div>
                                    <h4 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Status</h4>
                                    <p className="text-white font-bold">{data.status || "N/A"}</p>
                                </div>
                                <div>
                                    <h4 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Audio</h4>
                                    <p className="text-white font-bold">Dolby Atmos, Spatial</p>
                                </div>
                                <div>
                                    <h4 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Subtitles</h4>
                                    <p className="text-white font-bold">EN, ES, FR, JP, +12</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Top Cast List */}
                    {cast.length > 0 && (
                        <section className="space-y-4">
                            <div className="flex justify-between items-end">
                                <h2 className="font-headline-md text-headline-md text-white flex items-center gap-2 uppercase tracking-tight font-bold">
                                    <span className="w-1 h-6 bg-primary rounded-full" />
                                    Top Cast
                                </h2>
                            </div>

                            <div className="flex space-x-md overflow-x-auto pb-4 custom-scrollbar scroll-smooth">
                                {cast.map((c) => (
                                    <div key={c.id} className="flex-none w-28 text-center group cursor-pointer">
                                        <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-transparent group-hover:border-primary transition-all duration-300 relative bg-surface-container-low mb-2 shadow-md">
                                            {c.profile_path ? (
                                                <Image 
                                                    className="object-cover object-top scale-100 group-hover:scale-105 transition-transform duration-300"
                                                    fill
                                                    src={`https://image.tmdb.org/t/p/w185${c.profile_path}`}
                                                    alt={c.name}
                                                    unoptimized={true}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-surface-container-high text-on-surface/30">
                                                    <span className="material-symbols-outlined text-3xl">person</span>
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="font-label-md text-[13px] text-white group-hover:text-primary transition-colors truncate">
                                            {c.name}
                                        </h3>
                                        <p className="font-label-sm text-[11px] text-on-surface-variant truncate">
                                            {c.character}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Seasons & Episodes Section */}
                    {data.seasons && data.seasons.length > 0 && (
                        <section className="space-y-6">
                            <div className="flex flex-col gap-4 border-b border-white/10 pb-4">
                                <div className="flex justify-between items-center">
                                    <h2 className="font-headline-md text-headline-md text-white flex items-center gap-2 uppercase tracking-tight font-bold font-montserrat">
                                        <span className="w-1 h-6 bg-primary rounded-full" />
                                        Episodes
                                    </h2>
                                </div>
                                
                                {/* Episode Search & Season Selector Toolbar */}
                                <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center bg-surface-container-low/40 p-3.5 rounded-2xl border border-white/5 shadow-md">
                                    {/* Search input field */}
                                    <div className="relative w-full sm:w-80">
                                        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60 text-lg">
                                            search
                                        </span>
                                        <input 
                                            type="text" 
                                            placeholder="Search episode by number..."
                                            value={episodeSearchQuery}
                                            onChange={(e) => setEpisodeSearchQuery(e.target.value)}
                                            className="w-full h-10 bg-surface-container-high/60 border border-outline-variant/30 text-on-surface rounded-xl pl-11 pr-10 text-label-md font-medium placeholder-on-surface-variant/50 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all duration-300"
                                        />
                                        {episodeSearchQuery && (
                                            <button 
                                                onClick={() => setEpisodeSearchQuery("")}
                                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-base">close</span>
                                            </button>
                                        )}
                                    </div>

                                    {/* Season Dropdown Selector */}
                                    <div className="flex items-center justify-between sm:justify-end gap-2.5">
                                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider shrink-0 select-none">
                                            Season:
                                        </span>
                                        <div className="relative">
                                            <button 
                                                onClick={() => setIsSeasonDropdownOpen(!isSeasonDropdownOpen)}
                                                className="bg-surface-container-high border border-white/10 hover:bg-surface-variant text-white font-label-md text-label-md px-4 py-2 rounded-xl flex items-center gap-2 cursor-pointer transition-all shadow-md select-none shrink-0"
                                            >
                                                <span>Season {selectedSeason}</span>
                                                <span className="material-symbols-outlined text-sm transition-transform duration-200" style={{ transform: isSeasonDropdownOpen ? 'rotate(180deg)' : 'none' }}>
                                                    expand_more
                                                </span>
                                            </button>
                                            
                                            {isSeasonDropdownOpen && (
                                                <div className="absolute right-0 mt-2 w-44 bg-surface-container-highest border border-white/10 rounded-xl shadow-2xl overflow-hidden py-1 z-40 max-h-60 overflow-y-auto custom-scrollbar backdrop-blur-xl">
                                                    {data.seasons.map((season) => (
                                                        <button
                                                            key={season.id}
                                                            onClick={() => {
                                                                setSelectedSeason(season.season_number);
                                                                setIsSeasonDropdownOpen(false);
                                                            }}
                                                            className={`w-full text-left px-4 py-2.5 text-label-md font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                                                                season.season_number === selectedSeason 
                                                                    ? "bg-primary-container text-on-primary-container font-bold" 
                                                                    : "text-on-surface hover:bg-white/5"
                                                            }`}
                                                        >
                                                            <span>{season.name}</span>
                                                            <span className="text-[10px] text-white/50">{season.episode_count} Ep</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Episodes List */}
                            {isSeasonLoading ? (
                                <div className="space-y-4">
                                    {[...Array(3)].map((_, idx) => (
                                        <div key={idx} className="h-28 bg-surface-container-low/50 animate-pulse rounded-2xl border border-white/5" />
                                    ))}
                                </div>
                            ) : filteredEpisodes.length > 0 ? (
                                <div className="space-y-4">
                                    {filteredEpisodes.map((episode) => (
                                        <div 
                                            key={episode.id}
                                            className="bg-surface-container-low/40 border border-white/5 p-4 rounded-2xl flex flex-col md:flex-row gap-4 hover:border-primary/20 hover:bg-surface-container-low transition-all duration-300 relative group"
                                        >
                                            {/* Episode still thumbnail */}
                                            <div className="w-full md:w-48 aspect-video rounded-xl overflow-hidden relative shrink-0 bg-surface-container-high border border-white/5">
                                                {episode.still_path ? (
                                                    <Image 
                                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                        fill
                                                        src={`https://image.tmdb.org/t/p/w300${episode.still_path}`}
                                                        alt={episode.name}
                                                        unoptimized={true}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-on-surface/30">
                                                        <span className="material-symbols-outlined text-3xl">tv</span>
                                                    </div>
                                                )}
                                                
                                                {/* Play Hover Trigger Overlay */}
                                                <Link 
                                                    href={`/series/${data.id}/season/${selectedSeason}/episode/${episode.episode_number}`}
                                                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                                >
                                                    <div className="w-10 h-10 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all">
                                                        <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                                                    </div>
                                                </Link>
                                            </div>

                                            {/* Episode description content */}
                                            <div className="flex-1 min-w-0 space-y-1">
                                                <div className="flex items-center justify-between gap-4">
                                                    <h3 className="font-label-md text-white font-bold truncate group-hover:text-primary transition-colors">
                                                        {episode.episode_number}. {episode.name}
                                                    </h3>
                                                    {episode.vote_average > 0 && (
                                                        <span className="text-[11px] font-bold text-yellow-400 shrink-0 flex items-center gap-0.5">
                                                            ★ {episode.vote_average.toFixed(1)}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="font-label-sm text-[11px] text-on-surface-variant line-clamp-3 leading-relaxed">
                                                    {episode.overview || "No episode description available."}
                                                </p>
                                                <p className="text-[10px] text-white/40 pt-1 font-semibold">
                                                    Air Date: {episode.air_date || "N/A"}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-on-surface-variant font-medium text-sm bg-surface-container-low/20 rounded-2xl border border-white/5">
                                    No episodes found matching search criteria.
                                </div>
                            )}
                        </section>
                    )}

                </div>

                {/* Right Column: Official Trailer Card & Audience Score Card */}
                <div className="space-y-6">
                    
                    {/* Official Trailer Card */}
                    {trailer ? (
                        <div 
                            onClick={() => setIsCinematicPlayerOpen(true)}
                            className="bg-surface-container-low rounded-2xl overflow-hidden border border-white/5 relative group shadow-md cursor-pointer hover:border-primary/30 transition-all"
                        >
                            <div className="aspect-video relative overflow-hidden bg-black">
                                {data.backdrop_path ? (
                                    <Image 
                                        className="object-cover opacity-60 group-hover:opacity-80 transition-all duration-300 group-hover:scale-105"
                                        fill
                                        src={`https://image.tmdb.org/t/p/w500${data.backdrop_path}`}
                                        alt="Trailer Thumbnail"
                                        unoptimized={true}
                                    />
                                ) : (
                                    <div className="w-full h-full bg-surface-container-high" />
                                )}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div 
                                        className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30 group-hover:bg-primary group-hover:text-on-primary group-hover:border-primary transition-all duration-300 group-hover:scale-110 active:scale-95"
                                        title="Watch Trailer"
                                    >
                                        <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                            play_arrow
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="font-headline-md text-white text-base md:text-lg mb-1 truncate group-hover:text-primary transition-colors">
                                    Official Trailer
                                </h3>
                                <p className="font-label-sm text-label-sm text-on-surface-variant font-semibold">
                                    YouTube • 4K Ultra HD
                                </p>
                            </div>
                        </div>
                    ) : null}

                    {/* Audience Score Card */}
                    <div className="bg-surface-container-low rounded-2xl p-6 border border-white/5 shadow-md space-y-4">
                        <h3 className="font-label-md text-label-sm text-on-surface-variant uppercase tracking-wider border-b border-white/10 pb-3 font-semibold">
                            Audience Score
                        </h3>
                        <div className="flex items-center gap-6">
                            {/* Score Radial Circle indicator */}
                            <div className="w-16 h-16 rounded-full border-4 border-primary-container flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(0,209,255,0.2)]">
                                <span className="font-headline-md text-base text-white font-bold">
                                    {scorePercentage}<span className="text-[10px]">%</span>
                                </span>
                            </div>
                            <div className="space-y-1">
                                <p className="font-body-md text-[13px] text-on-surface-variant italic leading-relaxed">
                                    "{data.tagline || `Top rated series masterpiece with an outstanding ${data.vote_average.toFixed(1)} rating globally.`}"
                                </p>
                                <p className="font-label-sm text-primary font-bold text-[11px]">
                                    - TMDB Reviewers
                                </p>
                            </div>
                        </div>
                    </div>

                </div>

            </div>

            {/* Similar Series Section */}
            {similarSeries.length > 0 && (
                <section className="max-w-container-max mx-auto px-gutter mt-16 space-y-md border-t border-white/5 pt-12">
                    <div className="flex justify-between items-end">
                        <h2 className="font-headline-md text-headline-md text-white flex items-center gap-2 uppercase tracking-tight font-bold">
                            <span className="w-1 h-6 bg-primary rounded-full" />
                            More Like This
                        </h2>
                    </div>

                    <div className="relative group/nav">
                        <button 
                            onClick={() => scroll("left")}
                            className="absolute left-0 top-1/2 -translate-y-1/2 z-50 bg-black/60 border border-white/10 hover:bg-primary-container hover:text-on-primary-container text-white w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md opacity-0 group-hover/nav:opacity-100 backdrop-blur-md active:scale-90"
                            aria-label="Scroll left"
                        >
                            <span className="material-symbols-outlined text-xl">chevron_left</span>
                        </button>

                        <button 
                            onClick={() => scroll("right")}
                            className="absolute right-0 top-1/2 -translate-y-1/2 z-50 bg-black/60 border border-white/10 hover:bg-primary-container hover:text-on-primary-container text-white w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md opacity-0 group-hover/nav:opacity-100 backdrop-blur-md active:scale-90"
                            aria-label="Scroll right"
                        >
                            <span className="material-symbols-outlined text-xl">chevron_right</span>
                        </button>

                        <div 
                            ref={scrollContainerRef}
                            className="flex space-x-md overflow-x-auto pb-6 custom-scrollbar no-scrollbar scroll-smooth"
                        >
                            {similarSeries.map((item) => (
                                <Link 
                                    href={`/series/detail/${item.id}`} 
                                    key={item.id} 
                                    className="flex-none w-48 md:w-64 group relative bg-surface-container-low rounded-xl overflow-hidden cursor-pointer aspect-[2/3] border border-white/5 shadow-md transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(0,209,255,0.3)] z-10 hover:z-20"
                                >
                                    {item.poster_path ? (
                                        <Image 
                                            className="object-cover group-hover:scale-105 transition-all duration-300"
                                            fill 
                                            src={`https://image.tmdb.org/t/p/w500${item.poster_path}`} 
                                            alt={item.name}
                                            unoptimized={true}
                                            sizes="(max-width: 768px) 192px, 256px"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center bg-surface-container-high border border-white/5 p-4 text-center">
                                            <span className="material-symbols-outlined text-primary/20 text-5xl mb-2">tv</span>
                                            <span className="text-on-surface/50 text-label-md font-semibold truncate max-w-full">{item.name}</span>
                                        </div>
                                    )}

                                    {/* Hover info Panel */}
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
                                            {item.name}
                                        </h3>
                                        <div className="flex space-x-2 mt-3">
                                            <button className="bg-white text-black p-2 rounded-lg flex items-center justify-center hover:scale-115 transition-transform cursor-pointer">
                                                <span className="material-symbols-outlined text-sm font-semibold" style={{ fontVariationSettings: "'FILL' 1" }}>
                                                    play_arrow
                                                </span>
                                            </button>
                                             <button 
                                                 onClick={(e) => {
                                                     e.preventDefault();
                                                     e.stopPropagation();
                                                     handleAddToWatchlist(item.id, "series", item.name || item.original_name);
                                                 }}
                                                 className="bg-white/20 backdrop-blur-md text-white p-2 rounded-lg flex items-center justify-center hover:scale-115 transition-transform cursor-pointer"
                                             >
                                                 <span className="material-symbols-outlined text-sm">add</span>
                                             </button>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                            <div className="w-12 shrink-0 h-1" />
                        </div>
                    </div>
                </section>
            )}

            {isMounted && isCinematicPlayerOpen && createPortal(
                <CinematicTrailerPlayer 
                    movie={data} 
                    similarMovies={similarSeries} 
                    onClose={() => setIsCinematicPlayerOpen(false)} 
                />,
                document.body
            )}
        </main>
    );
}