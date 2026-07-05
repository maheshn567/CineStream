"use client"
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { createPortal } from "react-dom";
import CinematicTrailerPlayer from "@/features/movies/components/CinematicTrailerPlayer";


export default function AnimeDetailsPage({ data }) {
    const router = useRouter();
    const params = useParams();
    const id = params?.id;

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
            router.push("/anime");
        }
    };

    const saveAnimeIds = (playerId) => {
        if (typeof window !== "undefined") {
            try {
                sessionStorage.setItem(`anime_ids_${playerId}`, JSON.stringify({
                    malId: data.id,
                    anilistId: data.anilist_id
                }));
            } catch (e) {
                console.error("Failed to save anime IDs to sessionStorage:", e);
            }
        }
    };

    const playerContainerRef = useRef(null);
    const similarScrollContainerRef = useRef(null);

    const scrollSimilar = (direction) => {
        const { current } = similarScrollContainerRef;
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

    const similarAnime = data.recommendations?.map(r => r.node).slice(0, 12) || [];
    const [isCinematicPlayerOpen, setIsCinematicPlayerOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [playMode, setPlayMode] = useState(null); // null, 'trailer', 'stream'
    const [selectedEpisode, setSelectedEpisode] = useState(1);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Season & Episode selection states
    const [selectedSeason, setSelectedSeason] = useState(1);
    const [isSeasonDropdownOpen, setIsSeasonDropdownOpen] = useState(false);
    const [episodeSearchQuery, setEpisodeSearchQuery] = useState("");

    // Reset episode search query when season changes
    useEffect(() => {
        setEpisodeSearchQuery("");
        setSelectedEpisode(1);
    }, [selectedSeason]);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Fetch episodes for the selected season dynamically
    const { data: seasonData, isLoading: isSeasonLoading } = useQuery({
        queryKey: ["tv-season-details", data?.tmdb_id, selectedSeason],
        queryFn: () => {
            const baseUrl = process.env.NEXT_PUBLIC_TMDB_BASE_URL || "https://api.tmdb.org";
            return fetch(`${baseUrl}/3/tv/${data.tmdb_id}/season/${selectedSeason}`, {
                headers: {
                    accept: 'application/json',
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_ACCESS_TOKEN}`
                }
            }).then((res) => {
                if (!res.ok) throw new Error('Failed to fetch season details');
                return res.json();
            });
        },
        enabled: !!data?.tmdb_id && data.media_type !== "movie" && !!selectedSeason,
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
            <div className="min-h-screen bg-surface flex flex-col items-center justify-center text-center p-6 text-on-surface">
                <span className="material-symbols-outlined text-primary text-6xl animate-pulse mb-4">
                    error_outline
                </span>
                <h1 className="text-2xl font-bold text-white mb-2">Anime Not Found</h1>
                <p className="text-on-surface-variant max-w-[28rem] mb-6">
                    We couldn't retrieve the details for this anime. It may have been removed, or the API request failed.
                </p>
                <div className="flex gap-4 justify-center">
                    <button 
                        onClick={handleBack}
                        className="bg-surface-container-high border border-outline-variant/30 text-white font-bold px-6 py-3 rounded-full hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
                    >
                        Go Back
                    </button>
                    {id && (
                        <button 
                            onClick={() => {
                                router.push(`/anime/player/${id}?ref=${encodeURIComponent(`/anime/details/${id}`)}`);
                            }}
                            className="bg-primary-container text-on-primary-container font-bold px-6 py-3 rounded-full hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,209,255,0.4)] hover:shadow-[0_0_25px_rgba(0,209,255,0.6)] flex items-center justify-center"
                        >
                            Stream on Videasy
                        </button>
                    )}
                </div>
            </div>
        );
    }

    const posterUrl = data.main_picture?.large || data.main_picture?.medium;
    const studios = data.studios?.map(s => s.name).join(', ') || "Unknown";
    const score = data.mean || "0.0";
    const rank = data.rank || "N/A";
    const popularity = data.popularity || "N/A";
    const episodes = data.num_episodes || "Unknown";
    const ageRating = data.rating ? data.rating.replace(/_/g, ' ').toUpperCase() : "N/A";
    
    // Format Broadcast Period
    const broadcastPeriod = `${data.start_date || "N/A"} to ${data.end_date || "Ongoing"}`;

    // Trailer Key Resolution (TMDB key fallback to MAL YouTube ID)
    const trailerKey = data.tmdb_trailer_key || data.trailer?.youtube_id;

    return (
        <main className="min-h-screen bg-surface pb-16 w-full font-montserrat text-on-surface relative pt-20">
            
            {/* Go Back button */}
            <button 
                onClick={handleBack}
                className="fixed top-28 left-6 md:left-12 z-40 bg-black/40 hover:bg-black/70 p-3 rounded-full text-white backdrop-blur-md transition-all border border-white/10 flex items-center justify-center cursor-pointer group hover:scale-105 active:scale-95"
                title="Go Back"
            >
                <span className="material-symbols-outlined text-2xl group-hover:text-primary transition-colors">
                    arrow_back
                </span>
            </button>

            {/* Immersive Widescreen Backdrop Banner */}
            <div className="absolute top-0 left-0 w-full h-[550px] md:h-[650px] overflow-hidden z-0">
                <div className="relative w-full h-full">
                    <img 
                        className={`w-full h-full object-cover object-top select-none transition-all duration-700 ${!data.tmdb_backdrop_url ? 'blur-[40px] opacity-35 scale-105' : ''}`}
                        src={data.tmdb_backdrop_url || posterUrl} 
                        alt={data.title}
                    />
                    {/* Dark gradient fade-outs matching the hero slider */}
                    <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/60 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/30 to-transparent" />
                </div>
            </div>

            {/* Detail Layout Container */}
            <div className="max-w-container-max mx-auto px-gutter md:px-xl mt-[280px] md:mt-[380px] relative z-20 flex flex-col md:flex-row gap-10">
                
                {/* Left Side: Imposing Poster Card and Quick Metadata List */}
                <div className="w-full md:w-80 shrink-0 space-y-6 flex flex-col items-center md:items-stretch">
                    
                    {/* Poster Card Wrapper with Cyan Glow Hover */}
                    <div onClick={() => {
                        const playerId = data.tmdb_id || data.id;
                        saveAnimeIds(playerId);
                        const baseUrl = `/anime/player/${playerId}`;
                        const targetUrl = data.media_type === 'movie'
                            ? `${baseUrl}?ref=${encodeURIComponent(`/anime/details/${data.id}`)}`
                            : `${baseUrl}?seasonId=${selectedSeason}&episodeId=${selectedEpisode}&ref=${encodeURIComponent(`/anime/details/${data.id}`)}`;
                        router.push(targetUrl);
                    }} className="w-64 md:w-full aspect-[2/3] relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 group bg-surface-container-low transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(0,209,255,0.25)] cursor-pointer">
                        <img 
                            src={posterUrl} 
                            alt={data.title} 
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Metadata Card Panel */}
                    <div className="w-full bg-surface-container-low/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 space-y-4 shadow-xl">
                        <div className="flex justify-between items-center pb-2 border-b border-white/5">
                            <span className="text-on-surface-variant font-medium text-sm">Rank</span>
                            <span className="text-white font-bold text-base">#{rank}</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-white/5">
                            <span className="text-on-surface-variant font-medium text-sm">MAL Score</span>
                            <span className="text-yellow-500 font-bold flex items-center gap-1 text-base">
                                ⭐ {score}
                            </span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-white/5">
                            <span className="text-on-surface-variant font-medium text-sm">Popularity</span>
                            <span className="text-white font-semibold text-sm">#{popularity}</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-white/5">
                            <span className="text-on-surface-variant font-medium text-sm">Episodes</span>
                            <span className="text-white font-semibold text-sm">{episodes}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-on-surface-variant font-medium text-sm">Age Rating</span>
                            <span className="text-white font-semibold text-xs bg-white/5 border border-white/10 px-2 py-0.5 rounded uppercase tracking-wider">
                                {ageRating}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right Side: Deep Story, Themes and Technical specs */}
                <div className="flex-1 space-y-8">
                    
                    {/* Header: Title and Alternative Titles */}
                    <div className="space-y-3">
                        <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight tracking-tight uppercase drop-shadow-md">
                            {data.title}
                        </h1>
                        {data.alternative_titles?.en && (
                            <h2 className="text-xl md:text-2xl text-on-surface-variant font-medium tracking-wide">
                                {data.alternative_titles.en}
                            </h2>
                        )}
                        {data.alternative_titles?.ja && (
                            <h3 className="text-base text-on-surface-variant/70 italic font-medium">
                                {data.alternative_titles.ja}
                            </h3>
                        )}
                        
                        {/* Genres */}
                        <div className="flex flex-wrap gap-2.5 pt-3">
                            {data.genres?.map(genre => (
                                <span 
                                    key={genre.id} 
                                    className="bg-white/5 border border-white/10 hover:border-primary-container/40 text-on-surface hover:text-primary px-4.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer"
                                >
                                    {genre.name}
                                </span>
                            ))}
                        </div>

                        {/* Actions block */}
                        <div className="flex flex-wrap items-center gap-4 pt-4">
                            <button
                                onClick={() => {
                                    const playerId = data.tmdb_id || data.id;
                                    saveAnimeIds(playerId);
                                    const baseUrl = `/anime/player/${playerId}`;
                                    const targetUrl = data.media_type === "movie"
                                        ? `${baseUrl}?ref=${encodeURIComponent(`/anime/details/${data.id}`)}`
                                        : `${baseUrl}?seasonId=${selectedSeason}&episodeId=${selectedEpisode}&ref=${encodeURIComponent(`/anime/details/${data.id}`)}`;
                                    router.push(targetUrl);
                                }}
                                className="bg-primary-container text-on-primary-container font-label-md text-label-md px-8 py-3.5 rounded-full flex items-center gap-2 font-bold hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,209,255,0.3)] hover:shadow-[0_0_25px_rgba(0,209,255,0.5)]"
                            >
                                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                                <span>{data.media_type === "movie" ? "Watch Now" : "Play Episode"}</span>
                            </button>
                            
                            {trailerKey && (
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
                                onClick={() => handleAddToWatchlist(data.id, "anime", data.title)}
                                className="w-12 h-12 flex items-center justify-center rounded-full bg-surface-container-high text-on-surface border border-outline-variant/30 hover:bg-surface-variant transition-all duration-300 hover:text-primary cursor-pointer"
                                title="Add to My List"
                            >
                                <span className="material-symbols-outlined">add</span>
                            </button>
                        </div>
                    </div>

                    {/* Interactive Video Player Area */}
                    <div ref={playerContainerRef} className="w-full aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative bg-black/80 z-30">
                        {playMode === "trailer" && trailerKey ? (
                            <div className="relative w-full h-full">
                                <iframe 
                                    className="w-full h-full border-0"
                                    src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&controls=1&rel=0`}
                                    allow="accelerated-media; autoplay; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                                <button 
                                    onClick={() => setPlayMode(null)}
                                    className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 border border-white/10 cursor-pointer transition-all hover:scale-105 active:scale-95 z-50 flex items-center justify-center w-8 h-8"
                                >
                                    <span className="material-symbols-outlined text-sm">close</span>
                                </button>
                            </div>
                        ) : playMode === "stream" && data.tmdb_id && data.media_type !== "movie" ? (
                            <div className="relative w-full h-full bg-black">
                                <iframe 
                                    className="w-full h-full border-0"
                                    src={`https://vidsrc.to/embed/tv/${data.tmdb_id}/${selectedSeason}/${selectedEpisode}?color=00d1ff`}
                                    allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                                <button 
                                    onClick={() => setPlayMode(null)}
                                    className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 border border-white/10 cursor-pointer transition-all hover:scale-105 active:scale-95 z-50 flex items-center justify-center w-8 h-8"
                                >
                                    <span className="material-symbols-outlined text-sm">close</span>
                                </button>
                            </div>
                        ) : (
                            /* Preview Card Mode */
                            <div className="w-full h-full relative flex items-center justify-center">
                                <img 
                                    src={data.tmdb_backdrop_url || posterUrl} 
                                    alt={data.title}
                                    className="absolute inset-0 w-full h-full object-cover opacity-50"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                                
                                <div className="relative z-10 flex flex-col items-center gap-4 p-4 text-center">
                                    <span className="text-white/60 text-xs font-bold uppercase tracking-widest bg-black/40 px-3 py-1 rounded border border-white/5">
                                        {data.media_type === "movie" ? "Anime Movie" : `TV Format • ${episodes} Episodes`}
                                    </span>
                                    
                                    <div className="flex gap-4 mt-2">
                                        {/* Trailer option (always shown) */}
                                        {trailerKey ? (
                                            <button
                                                onClick={() => setIsCinematicPlayerOpen(true)}
                                                className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white px-6 py-3 rounded-full font-bold flex items-center space-x-2 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg"
                                            >
                                                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
                                                <span>Watch Trailer</span>
                                            </button>
                                        ) : null}
                                        {/* Streaming Option */}
                                        <button
                                            onClick={() => {
                                                const playerId = data.tmdb_id || data.id;
                                                saveAnimeIds(playerId);
                                                const baseUrl = `/anime/player/${playerId}`;
                                                const targetUrl = data.media_type === "movie"
                                                    ? `${baseUrl}?ref=${encodeURIComponent(`/anime/details/${data.id}`)}`
                                                    : `${baseUrl}?seasonId=${selectedSeason}&episodeId=${selectedEpisode}&ref=${encodeURIComponent(`/anime/details/${data.id}`)}`;
                                                router.push(targetUrl);
                                            }}
                                            className="bg-primary-container text-on-primary-container px-6 py-3 rounded-full font-bold flex items-center space-x-2 shadow-[0_0_15px_rgba(0,209,255,0.4)] hover:shadow-[0_0_25px_rgba(0,209,255,0.6)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
                                        >
                                            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                                            <span>{data.media_type === "movie" ? "Watch Now" : `Play Season ${selectedSeason} Ep ${selectedEpisode}`}</span>
                                        </button>
                                        {/* Add to Watchlist Option */}
                                        <button
                                            onClick={() => handleAddToWatchlist(data.id, "anime", data.title)}
                                            className="bg-white/10 backdrop-blur-md border border-white/10 text-white w-12 h-12 rounded-full flex items-center justify-center hover:scale-115 hover:text-primary transition-all cursor-pointer shadow-lg"
                                            title="Add to My List"
                                        >
                                            <span className="material-symbols-outlined">add</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>



                    {/* Synopsis Overview */}
                    <div className="space-y-3 bg-surface-container-low/40 backdrop-blur-sm border border-white/5 rounded-3xl p-6 md:p-8">
                        <h4 className="text-white font-bold text-lg flex items-center gap-2 tracking-tight">
                            <span className="material-symbols-outlined text-primary">description</span>
                            Storyline Synopsis
                        </h4>
                        <p className="text-on-surface-variant text-base leading-relaxed font-light whitespace-pre-line">
                            {data.synopsis || "No synopsis available."}
                        </p>
                    </div>

                    {/* Seasons & Episodes Section - Only for series formats */}
                    {data.media_type !== "movie" && (
                        <section className="space-y-6 bg-surface-container-low/40 backdrop-blur-sm border border-white/5 rounded-3xl p-6 md:p-8 relative z-30">

                            {data.seasons && data.seasons.length > 0 ? (
                                <>
                                    <div className="flex flex-col gap-4 border-b border-white/10 pb-4">
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                            <h4 className="text-white font-bold text-lg flex items-center gap-2 uppercase tracking-tight font-montserrat">
                                                <span className="w-1 h-6 bg-primary rounded-full" />
                                                Episodes
                                            </h4>
                                        </div>
                                        
                                        {/* Episode Search & Season Selector Toolbar */}
                                        <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center bg-surface-container-low/40 p-3.5 rounded-2xl border border-white/5 shadow-md relative z-40">
                                            {/* Search input field */}
                                            <div className="relative w-full sm:w-80">
                                                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60 text-lg">
                                                    search
                                                </span>
                                                <input 
                                                    type="text" 
                                                    placeholder="Search episode by name or number..."
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
                                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                            {filteredEpisodes.map((episode) => {
                                                const isActive = selectedEpisode === episode.episode_number;
                                                return (
                                                    <div 
                                                        key={episode.id}
                                                        onClick={() => {
                                                            const playerId = data.tmdb_id || data.id;
                                                            saveAnimeIds(playerId);
                                                            router.push(`/anime/player/${playerId}?seasonId=${selectedSeason}&episodeId=${episode.episode_number}&ref=${encodeURIComponent(`/anime/details/${data.id}`)}`);
                                                        }}
                                                        className={`border p-4 rounded-2xl flex flex-col md:flex-row gap-4 hover:bg-surface-container-low transition-all duration-300 relative group cursor-pointer ${
                                                            isActive 
                                                                ? "bg-surface-container-low border-primary/40 shadow-lg shadow-primary/5" 
                                                                : "bg-surface-container-low/40 border-white/5 hover:border-primary/20"
                                                        }`}
                                                    >
                                                        {/* Episode still thumbnail */}
                                                        <div className="w-full md:w-48 aspect-video rounded-xl overflow-hidden relative shrink-0 bg-surface-container-high border border-white/5">
                                                            {episode.still_path ? (
                                                                <img 
                                                                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                                                                    src={`https://image.tmdb.org/t/p/w300${episode.still_path}`}
                                                                    alt={episode.name}
                                                                    loading="lazy"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-on-surface/30">
                                                                    <span className="material-symbols-outlined text-3xl">tv</span>
                                                                </div>
                                                            )}
                                                            
                                                            {/* Play Hover Trigger Overlay */}
                                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                                <div className="w-10 h-10 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all">
                                                                    <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Episode description content */}
                                                        <div className="flex-1 min-w-0 space-y-1">
                                                            <div className="flex items-center justify-between gap-4">
                                                                <h3 className={`font-label-md font-bold truncate group-hover:text-primary transition-colors ${
                                                                    isActive ? "text-primary" : "text-white"
                                                                }`}>
                                                                    {episode.episode_number}. {episode.name || `Episode ${episode.episode_number}`}
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
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-on-surface-variant font-medium text-sm bg-surface-container-low/20 rounded-2xl border border-white/5">
                                            No episodes found matching search criteria.
                                        </div>
                                    )}
                                </>
                            ) : (
                                /* Fallback: List of episodes formatted like the TMDB episode list */
                                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                    {[...Array(data.num_episodes || 12)].map((_, i) => {
                                        const epNum = i + 1;
                                        const isActive = selectedEpisode === epNum;
                                        const epThumbnail = data.tmdb_backdrop_url || posterUrl;
                                        return (
                                            <div 
                                                key={epNum}
                                                onClick={() => {
                                                    const playerId = data.tmdb_id || data.id;
                                                    saveAnimeIds(playerId);
                                                    router.push(`/anime/player/${playerId}?seasonId=${selectedSeason}&episodeId=${epNum}&ref=${encodeURIComponent(`/anime/details/${data.id}`)}`);
                                                }}
                                                className={`border p-4 rounded-2xl flex flex-col md:flex-row gap-4 hover:bg-surface-container-low transition-all duration-300 relative group cursor-pointer ${
                                                    isActive 
                                                        ? "bg-surface-container-low border-primary/40 shadow-lg shadow-primary/5" 
                                                        : "bg-surface-container-low/40 border-white/5 hover:border-primary/20"
                                                }`}
                                            >
                                                {/* Episode still thumbnail */}
                                                <div className="w-full md:w-48 aspect-video rounded-xl overflow-hidden relative shrink-0 bg-surface-container-high border border-white/5">
                                                    {epThumbnail ? (
                                                        <img 
                                                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 opacity-80"
                                                            src={epThumbnail}
                                                            alt={`Episode ${epNum}`}
                                                            loading="lazy"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-on-surface/30">
                                                            <span className="material-symbols-outlined text-3xl">tv</span>
                                                        </div>
                                                    )}
                                                    
                                                    {/* Play Hover Trigger Overlay */}
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                        <div className="w-10 h-10 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all">
                                                            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Episode description content */}
                                                <div className="flex-1 min-w-0 space-y-1">
                                                    <div className="flex items-center justify-between gap-4">
                                                        <h3 className={`font-label-md font-bold truncate group-hover:text-primary transition-colors ${
                                                            isActive ? "text-primary" : "text-white"
                                                        }`}>
                                                            Episode {epNum}
                                                        </h3>
                                                    </div>
                                                    <p className="font-label-sm text-[11px] text-on-surface-variant line-clamp-3 leading-relaxed">
                                                        Watch Episode {epNum} of {data.title} online with subbed and dubbed options.
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </section>
                    )}

                    {/* Technical Specifications Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-surface-container-low/40 backdrop-blur-sm border border-white/5 rounded-3xl p-6 md:p-8 relative z-20">
                        <div className="space-y-1">
                            <span className="text-on-surface-variant text-xs font-semibold uppercase tracking-widest">Studios</span>
                            <p className="text-white font-semibold text-base">{studios}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-on-surface-variant text-xs font-semibold uppercase tracking-widest">Broadcast Period</span>
                            <p className="text-white font-semibold text-base">{broadcastPeriod}</p>
                        </div>
                        {data.average_episode_duration && (
                            <div className="space-y-1">
                                <span className="text-on-surface-variant text-xs font-semibold uppercase tracking-widest">Episode Duration</span>
                                <p className="text-white font-semibold text-base">
                                    {Math.round(data.average_episode_duration / 60)} minutes
                                </p>
                            </div>
                        )}
                        {data.num_episodes && (
                            <div className="space-y-1">
                                <span className="text-on-surface-variant text-xs font-semibold uppercase tracking-widest">Total Format</span>
                                <p className="text-white font-semibold text-base">
                                    {data.num_episodes} Episodes
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Themes & Soundtrack music */}
                    {((data.opening_themes && data.opening_themes.length > 0) || (data.ending_themes && data.ending_themes.length > 0)) && (
                        <div className="bg-surface-container-low/40 backdrop-blur-sm border border-white/5 rounded-3xl p-6 md:p-8 space-y-6 relative z-10">
                            <h4 className="text-white font-bold text-lg flex items-center gap-2 tracking-tight">
                                <span className="material-symbols-outlined text-primary">music_note</span>
                                Themes & Soundtracks
                            </h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-on-surface-variant">
                                {data.opening_themes && data.opening_themes.length > 0 && (
                                    <div className="space-y-2">
                                        <span className="text-white font-bold tracking-wide flex items-center gap-1.5">
                                            <span className="material-symbols-outlined text-xs text-primary">play_arrow</span>
                                            Opening Themes:
                                        </span>
                                        <ul className="list-decimal pl-5 space-y-1.5 font-light">
                                            {data.opening_themes.map((t, idx) => (
                                                <li key={idx} className="hover:text-primary transition-colors cursor-pointer">{t.text}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {data.ending_themes && data.ending_themes.length > 0 && (
                                    <div className="space-y-2">
                                        <span className="text-white font-bold tracking-wide flex items-center gap-1.5">
                                            <span className="material-symbols-outlined text-xs text-primary">play_arrow</span>
                                            Ending Themes:
                                        </span>
                                        <ul className="list-decimal pl-5 space-y-1.5 font-light">
                                            {data.ending_themes.map((t, idx) => (
                                                <li key={idx} className="hover:text-primary transition-colors cursor-pointer">{t.text}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Similar Anime Section */}
            {similarAnime.length > 0 && (
                <section className="max-w-container-max mx-auto px-gutter md:px-xl mt-16 space-y-md border-t border-white/5 pt-12 relative z-20">
                    <div className="flex justify-between items-end">
                        <h2 className="font-headline-md text-headline-md text-white flex items-center gap-2 uppercase tracking-tight font-bold">
                            <span className="w-1 h-6 bg-primary rounded-full" />
                            More Like This
                        </h2>
                    </div>

                    <div className="relative group/nav">
                        <button 
                            onClick={() => scrollSimilar("left")}
                            className="absolute left-0 top-1/2 -translate-y-1/2 z-50 bg-black/60 border border-white/10 hover:bg-primary-container hover:text-on-primary-container text-white w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md opacity-0 group-hover/nav:opacity-100 backdrop-blur-md active:scale-90"
                            aria-label="Scroll left"
                        >
                            <span className="material-symbols-outlined text-xl">chevron_left</span>
                        </button>

                        <button 
                            onClick={() => scrollSimilar("right")}
                            className="absolute right-0 top-1/2 -translate-y-1/2 z-50 bg-black/60 border border-white/10 hover:bg-primary-container hover:text-on-primary-container text-white w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md opacity-0 group-hover/nav:opacity-100 backdrop-blur-md active:scale-90"
                            aria-label="Scroll right"
                        >
                            <span className="material-symbols-outlined text-xl">chevron_right</span>
                        </button>

                        <div 
                            ref={similarScrollContainerRef}
                            className="flex space-x-md overflow-x-auto pb-6 custom-scrollbar no-scrollbar scroll-smooth"
                        >
                            {similarAnime.map((item) => {
                                const simPosterUrl = item.main_picture?.large || item.main_picture?.medium;
                                const simYear = item.start_date ? item.start_date.split("-")[0] : null;
                                const simScore = item.mean ? item.mean.toFixed(1) : null;
                                const simGenres = item.genres?.slice(0, 2).map(g => g.name).join(", ");
                                return (
                                    <Link 
                                        href={`/anime/details/${item.id}`} 
                                        key={item.id} 
                                        className="flex-none w-48 md:w-64 group relative bg-surface-container-low rounded-xl overflow-hidden cursor-pointer aspect-[2/3] border border-white/5 shadow-md transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(0,209,255,0.3)] z-10 hover:z-20"
                                    >
                                        {simPosterUrl ? (
                                            <img 
                                                className="object-cover w-full h-full group-hover:scale-105 transition-all duration-300"
                                                src={simPosterUrl} 
                                                alt={item.title}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center bg-surface-container-high border border-white/5 p-4 text-center">
                                                <span className="material-symbols-outlined text-primary/20 text-5xl mb-2">movie</span>
                                                <span className="text-on-surface/50 text-label-md font-semibold truncate max-w-full">{item.title}</span>
                                            </div>
                                        )}

                                        {/* Hover info Panel */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 z-20">
                                            <div className="flex items-center flex-wrap gap-2 mb-2">
                                                <span className="bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">Anime</span>
                                                {simYear && (
                                                    <span className="text-white/60 text-[10px] font-bold">
                                                        {simYear}
                                                    </span>
                                                )}
                                                {simScore && (
                                                    <span className="text-yellow-400 text-[10px] font-bold flex items-center gap-0.5">
                                                        ★ {simScore}
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="font-label-md text-label-md text-white font-semibold truncate mb-1">
                                                {item.title}
                                            </h3>
                                            {simGenres && (
                                                <p className="text-[10px] text-on-surface-variant font-medium truncate mb-2">
                                                    {simGenres}
                                                </p>
                                            )}
                                            <div className="flex space-x-2 mt-2">
                                                <button 
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        // Cache ids so player gets MAL ID directly without parameter clutter
                                                        if (typeof window !== "undefined") {
                                                            sessionStorage.setItem(`anime_ids_${item.id}`, JSON.stringify({
                                                                malId: item.id,
                                                                anilistId: null
                                                            }));
                                                        }
                                                        router.push(`/anime/player/${item.id}?ref=${encodeURIComponent(`/anime/details/${data.id}`)}`);
                                                    }}
                                                    className="bg-white text-black p-2 rounded-lg flex items-center justify-center hover:scale-115 transition-transform cursor-pointer"
                                                >
                                                    <span className="material-symbols-outlined text-sm font-semibold" style={{ fontVariationSettings: "'FILL' 1" }}>
                                                        play_arrow
                                                    </span>
                                                </button>
                                                <button 
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleAddToWatchlist(item.id, "anime", item.title);
                                                    }}
                                                    className="bg-white/20 backdrop-blur-md text-white p-2 rounded-lg flex items-center justify-center hover:scale-115 transition-transform cursor-pointer"
                                                >
                                                    <span className="material-symbols-outlined text-sm">add</span>
                                                </button>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                            <div className="w-12 shrink-0 h-1" />
                        </div>
                    </div>
                </section>
            )}

            {isMounted && isCinematicPlayerOpen && createPortal(
                <CinematicTrailerPlayer 
                    movie={{
                        title: data.title,
                        videos: {
                            results: [
                                {
                                    key: trailerKey,
                                    type: "Trailer",
                                    site: "YouTube"
                                }
                            ]
                        }
                    }} 
                    similarMovies={[]} 
                    onClose={() => setIsCinematicPlayerOpen(false)} 
                />,
                document.body
            )}
        </main>
    );
}
