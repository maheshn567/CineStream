"use client"
import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import AnimeNav from "./AnimeNav";
import AnimeContinue from "./AnimeContinue";
import Top10Anime from "./Top10Anime";
import LatestRelease from "./LatestRelease";
import ShonenHits from "./ShonenHits";
import AnimeMovies from "./AnimeMovies";
import Link from "next/link";

export default function AnimeClosure({ animeData, latestData, movieData }) {
    const [selectedAnime, setSelectedAnime] = useState(null);
    const [selectedGenre, setSelectedGenre] = useState("All Genres");

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
    const filteredItems = items.filter(item => {
        if (!selectedGenre || selectedGenre === "All Genres") return true;
        const anime = item.node;
        return anime.genres?.some(g => {
            const name = g.name.toLowerCase();
            const query = selectedGenre.toLowerCase();
            if (query === "shonen" && name === "shounen") return true;
            return name.includes(query) || query.includes(name);
        });
    });

    if (!animeData || items.length === 0) {
        return (
            <div className="max-w-container-max mx-auto px-gutter py-12 flex flex-col items-center justify-center text-center space-y-6 min-h-[500px]">
                <span className="material-symbols-outlined text-primary text-6xl animate-pulse">
                    error_outline
                </span>
                <h2 className="text-2xl font-bold text-white">No Anime Data Available</h2>
                <p className="text-on-surface-variant max-w-[28rem]">
                    We couldn't retrieve the anime rankings at this time. Please check your network connection or try again later.
                </p>
            </div>
        );
    }

    return (
        <div className="w-full bg-surface space-y-12 anime-hero-swiper">
            {/* Scoped CSS to style Swiper bullets as modern progress bars matching the new design */}
            <style>{`
                .anime-hero-swiper .swiper-pagination {
                    position: absolute;
                    bottom: 96px !important;
                    left: 24px !important;
                    right: auto !important;
                    width: auto !important;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    z-index: 30;
                }
                @media (min-width: 768px) {
                    .anime-hero-swiper .swiper-pagination {
                        left: 48px !important;
                    }
                }
                .anime-hero-swiper .swiper-pagination-bullet {
                    width: 32px;
                    height: 4px;
                    background-color: rgba(187, 201, 207, 0.3) !important;
                    border-radius: 9999px;
                    opacity: 1;
                    transition: all 0.3s ease;
                    margin: 0 !important;
                    cursor: pointer;
                }
                .anime-hero-swiper .swiper-pagination-bullet-active {
                    width: 48px;
                    background-color: #00d1ff !important;
                }
                .anime-hero-swiper .swiper-button-next,
                .anime-hero-swiper .swiper-button-prev {
                    color: rgba(255, 255, 255, 0.6) !important;
                    transition: color 0.3s ease;
                }
                .anime-hero-swiper .swiper-button-next:hover,
                .anime-hero-swiper .swiper-button-prev:hover {
                    color: #00d1ff !important;
                }
            `}</style>
            
            {/* Cinematic Hero Slider redesigned to match the newly uploaded design */}
            <section className="relative w-full h-[820px] overflow-hidden group">
                <Swiper
                    spaceBetween={0}
                    centeredSlides={true}
                    autoplay={{
                        delay: 6000,
                        disableOnInteraction: false,
                    }}
                    pagination={{
                        clickable: true,
                    }}
                    navigation={true}
                    modules={[Autoplay, Pagination, Navigation]}
                    className="w-full h-full"
                >
                    {items.slice(0, 5).map((item, index) => {
                        const anime = item.node;
                        const posterUrl = anime.main_picture?.large || anime.main_picture?.medium;
                        return (
                            <SwiperSlide key={anime.id} className="relative w-full h-full bg-[#121414]">
                                {/* Slide Background Image - direct widescreen backdrop from TMDB, or blurred MAL poster fallback */}
                                <div className="absolute inset-0 z-0">
                                    <img 
                                        className={`w-full h-full object-cover object-top select-none transition-all duration-700 ${!anime.tmdb_backdrop_url ? 'blur-[40px] opacity-35 scale-105' : ''}`}
                                        src={anime.tmdb_backdrop_url || posterUrl} 
                                        alt={anime.title}
                                    />
                                    {/* Gradients matching the design exactly */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent"></div>
                                    <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/20 to-transparent"></div>
                                </div>

                                {/* Content Layout Container */}
                                <div className="absolute inset-0 z-20 max-w-container-max mx-auto px-gutter md:px-xl flex items-end h-full pb-24 pointer-events-none">
                                    {/* Left Side: Anime Information content styled exactly like the upload */}
                                    <div className="space-y-6 max-w-2xl pointer-events-auto mb-20">
                                        
                                        {/* Rank / Rating Badge */}
                                        <div className="flex items-center space-x-3 mb-6">
                                            <span className="bg-primary-container text-on-primary-container px-3 py-1 rounded-sm text-label-sm font-bold tracking-widest uppercase">
                                                Rank #{index + 1}
                                            </span>
                                            <span className="text-primary font-bold text-label-md flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                                {anime.mean ? `${anime.mean.toFixed(1)} Rating` : "N/A Rating"}
                                            </span>
                                        </div>

                                        {/* Anime Title */}
                                        <Link href={`/anime/details/${anime.id}`}>
                                            <h1 className="font-display-lg text-[2.75rem] md:text-display-lg text-white mb-4 leading-tight uppercase cursor-pointer hover:text-primary transition-colors duration-300 drop-shadow-lg">
                                                {anime.title}
                                            </h1>
                                        </Link>

                                        {/* Synopsis Overview */}
                                        <p className="font-body-lg text-body-lg text-on-surface-variant mb-8 line-clamp-3 leading-relaxed font-light drop-shadow-md">
                                            {anime.synopsis}
                                        </p>

                                        {/* Action buttons with full rounding and custom designs */}
                                        <div className="flex items-center space-x-4">
                                            <Link 
                                                href={`/anime/player/${anime.id}`}
                                                className="bg-primary-container text-on-primary-container px-8 py-4 rounded-full font-bold flex items-center space-x-2 shadow-[0_0_15px_rgba(0,209,255,0.4)] hover:shadow-[0_0_25px_rgba(0,209,255,0.6)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
                                            >
                                                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                                                <span>Watch Now</span>
                                            </Link>
                                            <Link 
                                                href={`/anime/details/${anime.id}`}
                                                className="bg-surface-container-highest/40 backdrop-blur-md border border-white/10 text-white px-8 py-4 rounded-full font-bold flex items-center space-x-2 hover:bg-surface-container-highest hover:scale-105 active:scale-95 transition-all cursor-pointer"
                                            >
                                                <span className="material-symbols-outlined">info</span>
                                                <span>Details</span>
                                            </Link>
                                            <button 
                                                onClick={() => handleAddToWatchlist(anime.id, "anime", anime.title)}
                                                className="bg-white/10 backdrop-blur-md border border-white/10 text-white px-8 py-4 rounded-full font-bold flex items-center space-x-2 hover:bg-white/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                                            >
                                                <span className="material-symbols-outlined">add</span>
                                                <span>Add to List</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </SwiperSlide>
                        );
                    })}
                </Swiper>
            </section>

            {/* Genre Filter Chips Nav */}
            <AnimeNav onGenreChange={setSelectedGenre} />

            {/* Continue Watching Section */}
            <AnimeContinue />

            {/* Top 10 Anime Today */}
            <Top10Anime animeData={animeData} onAnimeClick={setSelectedAnime} />

            {/* Latest Releases */}
            <LatestRelease latestData={latestData} onAnimeClick={setSelectedAnime} />

            {/* Anime Movies */}
            <AnimeMovies movieData={movieData} onAnimeClick={setSelectedAnime} />

            {/* Shonen Hits */}
            <ShonenHits animeData={animeData} onAnimeClick={setSelectedAnime} />

            {/* Top Leaderboard Grid Section */}
            <div className="max-w-container-max mx-auto px-gutter md:px-xl py-6 space-y-8 bg-surface text-on-surface">
                
                <h3 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">grid_view</span>
                    Leaderboard Rankings
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {filteredItems.length === 0 ? (
                        <div className="col-span-full py-16 flex flex-col items-center justify-center text-center space-y-4 bg-surface-container-low/40 rounded-2xl border border-white/5 p-8">
                            <span className="material-symbols-outlined text-on-surface-variant text-4xl">search_off</span>
                            <p className="text-on-surface-variant font-medium">No top anime match this genre filter currently.</p>
                        </div>
                    ) : (
                        filteredItems.map((item) => {
                            const anime = item.node;
                            // Find original index in rank rankings
                            const rankIndex = items.findIndex(x => x.node.id === anime.id);
                            return (
                                <Link 
                                    href={`/anime/details/${anime.id}`}
                                    key={anime.id} 
                                    className="group relative aspect-[2/3] overflow-hidden rounded-2xl border border-white/5 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 transition-all duration-500 bg-surface-container-low cursor-pointer flex flex-col justify-end"
                                >
                                    {/* Rank indicator tag using the original index */}
                                    <div className={`absolute top-3 left-3 z-30 font-black px-2.5 py-1 rounded-lg text-xs shadow-md tracking-wider flex items-center justify-center ${
                                        rankIndex === 0 ? "bg-gradient-to-r from-yellow-500 to-amber-600 text-white" :
                                        rankIndex === 1 ? "bg-gradient-to-r from-slate-300 to-slate-400 text-black" :
                                        rankIndex === 2 ? "bg-gradient-to-r from-amber-700 to-amber-950 text-white" :
                                        "bg-surface/80 text-white border border-white/10"
                                    }`}>
                                        #{rankIndex + 1}
                                    </div>

                                    <img 
                                        src={anime.main_picture?.large || anime.main_picture?.medium} 
                                        alt={anime.title} 
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />

                                    {/* Card content on hover */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 z-20">
                                        <h4 className="text-white text-base font-bold line-clamp-2 mb-1">{anime.title}</h4>
                                        
                                        <div className="flex items-center gap-2 text-xs text-on-surface-variant font-medium mb-3">
                                            <span>{(anime.start_date || "").split("-")[0]}</span>
                                            <span className="w-1 h-1 rounded-full bg-on-surface-variant"></span>
                                            <div className="flex items-center gap-1 text-yellow-500">
                                                <span>⭐</span>
                                                <span className="text-on-surface font-semibold">{anime.mean || "0.0"}</span>
                                            </div>
                                        </div>

                                        <button 
                                            className="w-full text-center text-xs font-bold bg-primary text-on-primary py-2 rounded-lg hover:brightness-110 transition-all duration-200"
                                        >
                                            Details
                                        </button>
                                    </div>
                                </Link>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Anime Detail Modal */}
            {selectedAnime && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-500" 
                        onClick={() => setSelectedAnime(null)}
                    />
                    
                    {/* Modal Box */}
                    <div className="relative bg-surface-container border border-white/10 w-full max-w-4xl max-h-[85vh] rounded-3xl overflow-y-auto z-10 shadow-2xl animate-fade-in custom-scrollbar">
                        {/* Close button */}
                        <button 
                            onClick={() => setSelectedAnime(null)}
                            className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 border border-white/10 cursor-pointer transition-all hover:scale-105 active:scale-95 z-50 group"
                        >
                            <span className="material-symbols-outlined text-lg group-hover:rotate-90 transition-transform duration-300">close</span>
                        </button>

                        <div className="p-6 md:p-10 flex flex-col md:flex-row gap-8">
                            {/* Left Side: Poster and Metadata */}
                            <div className="w-full md:w-72 shrink-0 space-y-4">
                                <div className="aspect-[2/3] relative rounded-2xl overflow-hidden border border-white/10 shadow-md">
                                    <img 
                                        src={selectedAnime.main_picture?.large || selectedAnime.main_picture?.medium} 
                                        alt={selectedAnime.title} 
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="bg-surface-container-low border border-white/5 rounded-2xl p-4 space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-on-surface-variant font-medium">Rank</span>
                                        <span className="text-white font-bold">#{selectedAnime.rank}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-on-surface-variant font-medium">Score</span>
                                        <span className="text-yellow-500 font-bold flex items-center gap-1">⭐ {selectedAnime.mean}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-on-surface-variant font-medium">Popularity</span>
                                        <span className="text-white font-semibold">#{selectedAnime.popularity}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-on-surface-variant font-medium">Episodes</span>
                                        <span className="text-white font-semibold">{selectedAnime.num_episodes}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-on-surface-variant font-medium">Rating</span>
                                        <span className="text-white font-semibold uppercase">{selectedAnime.rating}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side: Detailed Info */}
                            <div className="flex-1 space-y-6">
                                <div>
                                    <h2 className="text-2xl md:text-4xl font-extrabold text-white leading-tight">
                                        {selectedAnime.title}
                                    </h2>
                                    {selectedAnime.alternative_titles?.en && (
                                        <h3 className="text-lg text-on-surface-variant font-medium mt-1">
                                            {selectedAnime.alternative_titles.en}
                                        </h3>
                                    )}
                                    {selectedAnime.alternative_titles?.ja && (
                                        <h4 className="text-sm text-on-surface-variant/70 font-medium italic mt-0.5">
                                            {selectedAnime.alternative_titles.ja}
                                        </h4>
                                    )}
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {selectedAnime.genres?.map(genre => (
                                            <span key={genre.id} className="bg-white/5 border border-white/10 text-on-surface px-3 py-1 rounded-full text-xs font-semibold">
                                                {genre.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-white font-bold text-base flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-primary">description</span>
                                        Synopsis
                                    </h4>
                                    <p className="text-on-surface-variant text-sm md:text-base leading-relaxed font-medium">
                                        {selectedAnime.synopsis}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                                    <div className="space-y-1">
                                        <span className="text-on-surface-variant text-xs font-medium uppercase tracking-wider">Studios</span>
                                        <p className="text-white font-semibold text-sm">
                                            {selectedAnime.studios?.map(s => s.name).join(', ') || "Unknown"}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-on-surface-variant text-xs font-medium uppercase tracking-wider">Broadcast Period</span>
                                        <p className="text-white font-semibold text-sm">
                                            {selectedAnime.start_date || "N/A"} to {selectedAnime.end_date || "Ongoing"}
                                        </p>
                                    </div>
                                </div>

                                {/* Themes */}
                                {(selectedAnime.opening_themes || selectedAnime.ending_themes) && (
                                    <div className="pt-6 border-t border-white/5 space-y-4">
                                        <h4 className="text-white font-bold text-base flex items-center gap-1.5">
                                            <span className="material-symbols-outlined text-primary">music_note</span>
                                            Themes & Music
                                        </h4>
                                        <div className="space-y-3 text-xs md:text-sm text-on-surface-variant">
                                            {selectedAnime.opening_themes && selectedAnime.opening_themes.length > 0 && (
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-white font-bold">Opening Themes:</span>
                                                    <ul className="list-disc pl-4 space-y-1">
                                                        {selectedAnime.opening_themes.map((t, idx) => (
                                                            <li key={idx}>{t.text}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            {selectedAnime.ending_themes && selectedAnime.ending_themes.length > 0 && (
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-white font-bold">Ending Themes:</span>
                                                    <ul className="list-disc pl-4 space-y-1">
                                                        {selectedAnime.ending_themes.map((t, idx) => (
                                                            <li key={idx}>{t.text}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
