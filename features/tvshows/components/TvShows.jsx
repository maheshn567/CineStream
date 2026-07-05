"use client"

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

// TMDB TV genre map
const genres = [
  { id: null, name: "All" },
  { id: 10759, name: "Action & Adventure" },
  { id: 35, name: "Comedy" },
  { id: 18, name: "Drama" },
  { id: 10765, name: "Sci-Fi & Fantasy" },
  { id: 9648, name: "Mystery" },
  { id: 99, name: "Documentary" }
];

export default function TvShowsHeroClousre({ trending = [], popular = [], topRated = [], continueWatching = [] }) {
  const router = useRouter();
  const { data: session } = authClient.useSession();

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

  // Scroll references
  const top10ScrollRef = useRef(null);

  const handleScrollLeft = () => {
    if (top10ScrollRef.current) {
      top10ScrollRef.current.scrollBy({ left: -320, behavior: "smooth" });
    }
  };

  const handleScrollRight = () => {
    if (top10ScrollRef.current) {
      top10ScrollRef.current.scrollBy({ left: 320, behavior: "smooth" });
    }
  };

  // Clean TMDB items
  const liveTrending = trending.length > 0 ? trending.slice(0, 5) : [];
  const livePopular = popular.length > 0 ? popular : [];
  const liveTopRated = topRated.length > 0 ? topRated.slice(0, 10) : [];
  
  const [liveContinue, setLiveContinue] = useState([]);
  const [isContinueLoaded, setIsContinueLoaded] = useState(false);

  useEffect(() => {
    if (!session?.user) {
      setLiveContinue([]);
      setIsContinueLoaded(true);
      return;
    }
    const raw = localStorage.getItem("cinestream_series_continue");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setLiveContinue(parsed);
        }
      } catch (e) {
        console.error("Failed to parse series continue watching history:", e);
      }
    }
    setIsContinueLoaded(true);
  }, [session]);

  const handleRemoveContinueItem = (itemId) => {
    const updatedList = liveContinue.filter(item => item.id !== itemId);
    setLiveContinue(updatedList);
    localStorage.setItem("cinestream_series_continue", JSON.stringify(updatedList));
  };

  // Hero slideshow logic
  const [heroIndex, setHeroIndex] = useState(0);
  const currentHeroShow = liveTrending.length > 0 ? (liveTrending[heroIndex] || liveTrending[0]) : null;

  useEffect(() => {
    if (liveTrending.length === 0) return;
    const timer = setInterval(() => {
      setHeroIndex((prevIndex) => (prevIndex + 1) % liveTrending.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [liveTrending.length]);

  const handleNextHero = () => {
    if (liveTrending.length === 0) return;
    setHeroIndex((prevIndex) => (prevIndex + 1) % liveTrending.length);
  };

  const handlePrevHero = () => {
    if (liveTrending.length === 0) return;
    setHeroIndex((prevIndex) => (prevIndex - 1 + liveTrending.length) % liveTrending.length);
  };

  // Genre filtering logic
  const [selectedGenreId, setSelectedGenreId] = useState(null);

  const filterShowsByGenre = (showsList) => {
    if (selectedGenreId === null) return showsList;
    return showsList.filter(show => show.genre_ids?.includes(selectedGenreId));
  };

  // Safe navigation helpers
  const navigateToPlayer = (id) => {
    router.push(`/series/${id}/season/1/episode/1?ref=${encodeURIComponent("/tv")}`);
  };

  const navigateToDetails = (id) => {
    router.push(`/series/detail/${id}`);
  };

  // Lists filtered by genre
  const filteredPopular = filterShowsByGenre(popular.length > 0 ? popular.slice(0, 12) : []);
  const filteredBingeDramas = filterShowsByGenre(topRated.length > 0 ? topRated.slice(0, 12) : []);

  return (
    <div className="bg-surface text-on-surface font-montserrat min-h-screen">
      
      {/* Immersive Slideshow Hero Header */}
      {liveTrending.length > 0 ? (
        <header className="relative h-[650px] md:h-[820px] w-full overflow-hidden bg-black select-none">
          
          {/* Dynamic backdrop background frame */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-1000 transform scale-100 ease-in-out z-0"
            style={{
              backgroundImage: `url(${
                currentHeroShow?.backdrop_path?.startsWith("http") 
                  ? currentHeroShow.backdrop_path 
                  : `https://image.tmdb.org/t/p/original${currentHeroShow?.backdrop_path}`
              })`
            }}
          >
            {/* Moody gradients for readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/40 to-transparent z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-surface/20 z-10" />
          </div>

          {/* Content Box */}
          <div className="relative h-full flex flex-col justify-center px-6 md:px-12 lg:px-xl max-w-container-max mx-auto z-10 pt-20">
            <div className="flex items-center gap-sm mb-md">
              {currentHeroShow?.isNew !== false && (
                <span className="bg-primary-container text-on-primary-container px-sm py-1 rounded-full font-label-sm text-label-sm uppercase tracking-wider font-semibold">
                  New
                </span>
              )}
              <span className="text-on-surface-variant font-label-md text-label-md font-semibold tracking-wider uppercase">
                {currentHeroShow?.isOriginal ? "Original Series" : "Trending Series"}
              </span>
            </div>

            <h1 className="font-display-lg text-4xl md:text-display-lg max-w-3xl mb-sm leading-none text-white uppercase drop-shadow-md tracking-tighter">
              {currentHeroShow?.name || currentHeroShow?.original_name}
            </h1>

            <p className="font-body-lg text-sm md:text-body-lg text-on-surface-variant max-w-3xl mb-lg leading-relaxed font-light">
              {currentHeroShow?.overview || "No overview description available for this trending series."}
            </p>

            <div className="flex flex-wrap gap-md z-20">
              <button 
                onClick={() => navigateToPlayer(currentHeroShow?.id)}
                className="bg-primary-container text-on-primary-container px-lg py-sm rounded-full font-label-md text-label-md flex items-center gap-sm hover:brightness-110 active:scale-95 duration-150 transition-all cursor-pointer cyan-glow font-bold shadow-lg"
              >
                <span className="material-symbols-outlined font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                Watch Now
              </button>
              <button 
                onClick={() => navigateToDetails(currentHeroShow?.id)}
                className="bg-white/10 backdrop-blur-md border border-white/20 text-on-surface px-lg py-sm rounded-full font-label-md text-label-md flex items-center gap-sm hover:bg-white/20 active:scale-95 duration-150 transition-all cursor-pointer font-bold"
              >
                <span className="material-symbols-outlined font-semibold">info</span>
                Details
              </button>
            </div>

            {/* Slider Indicators dots */}
            <div className="absolute bottom-12 md:bottom-xl left-6 md:left-12 lg:left-xl flex items-center gap-sm">
              {liveTrending.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setHeroIndex(idx)}
                  className={`h-1.5 transition-all duration-300 rounded-full cursor-pointer ${
                    idx === heroIndex ? "w-10 bg-primary-container" : "w-3 bg-white/20 hover:bg-white/40"
                  }`}
                  title={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Chevrons */}
            <div className="absolute bottom-12 md:bottom-xl right-6 md:right-12 lg:right-xl flex gap-md z-30">
              <button 
                onClick={handlePrevHero}
                className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 hover:border-white/40 text-white transition-all cursor-pointer backdrop-blur-md active:scale-90"
                title="Previous Slide"
              >
                <span className="material-symbols-outlined text-lg">chevron_left</span>
              </button>
              <button 
                onClick={handleNextHero}
                className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 hover:border-white/40 text-white transition-all cursor-pointer backdrop-blur-md active:scale-90"
                title="Next Slide"
              >
                <span className="material-symbols-outlined text-lg">chevron_right</span>
              </button>
            </div>

          </div>
        </header>
      ) : (
        <header className="relative h-[600px] md:h-[700px] w-full overflow-hidden bg-black select-none flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-gradient-to-tr from-surface via-[#0a101d] to-[#050b14] z-0" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,209,255,0.08)_0%,transparent_70%)]" />
          
          <div className="relative max-w-2xl w-full p-8 md:p-12 rounded-3xl bg-white/[0.02] backdrop-blur-xl border border-white/10 text-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-10 space-y-6">
            <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-tr from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20 shadow-inner animate-pulse">
              <span className="material-symbols-outlined text-4xl text-primary font-light">
                offline_bolt
              </span>
            </div>
            
            <div className="space-y-2">
              <h1 className="font-display-lg text-2xl md:text-3xl font-extrabold text-white tracking-tight uppercase">
                Spotlight Offline
              </h1>
              <p className="font-body-md text-sm md:text-base text-on-surface-variant max-w-md mx-auto leading-relaxed">
                We couldn't connect to the server to fetch trending shows. Try checking your connection or reloading.
              </p>
            </div>

            <button 
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-sm bg-white/10 hover:bg-white/20 text-white border border-white/10 px-6 py-3 rounded-full font-semibold transition-all duration-300 active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">refresh</span>
              Reload Page
            </button>
          </div>
        </header>
      )}

      {/* Main Sections Body */}
      <main className="relative z-20 -mt-16 md:-mt-20 space-y-xl pb-xl">

        {/* Genre Chips Toolbar */}
        <section className="max-w-container-max mx-auto px-6 md:px-12 lg:px-xl">
          <div className="flex gap-sm overflow-x-auto no-scrollbar py-sm custom-scrollbar scroll-smooth">
            {genres.map((genre) => {
              const isSelected = selectedGenreId === genre.id;
              return (
                <button
                  key={genre.id}
                  onClick={() => setSelectedGenreId(genre.id)}
                  className={`px-6 py-2 rounded-full font-label-md text-label-md font-semibold transition-all duration-300 cursor-pointer whitespace-nowrap ${
                    isSelected 
                      ? "bg-primary-container text-on-primary-container shadow-[0_0_15px_rgba(0,209,255,0.35)]" 
                      : "bg-surface-container-high text-on-surface-variant hover:text-on-surface hover:bg-surface-variant border border-white/5"
                  }`}
                >
                  {genre.name}
                </button>
              );
            })}
          </div>
        </section>

        {/* Continue Watching Section */}
        {session?.user && (
          <section className="max-w-container-max mx-auto px-6 md:px-12 lg:px-xl">
          <h2 className="font-headline-md text-headline-md font-bold mb-md text-white tracking-tight uppercase flex items-center gap-2">
            <span className="w-1 h-6 bg-primary rounded-full" />
            Continue Watching
          </h2>
          {isContinueLoaded && liveContinue.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
              {liveContinue.map((item) => {
                // Swap placeholder backdrop with live TMDB data backdrop if available for corresponding index
                const liveShow = liveTrending[liveContinue.indexOf(item)];
                const displayBackdrop = (liveShow && liveShow.backdrop_path) 
                  ? `https://image.tmdb.org/t/p/w500${liveShow.backdrop_path}` 
                  : item.backdrop || item.image;
                const displayTitle = (liveShow && (liveShow.name || liveShow.original_name)) || item.title;
                const displayId = (liveShow && liveShow.id) || item.seriesId || item.id;

                return (
                  <div 
                    key={item.id}
                    onClick={() => navigateToPlayer(displayId)}
                    className="group relative aspect-video rounded-xl overflow-hidden cursor-pointer border border-white/5 bg-surface-container-low transition-all duration-300 hover:scale-[1.04] hover:shadow-[0_0_20px_rgba(0,209,255,0.25)] hover:border-primary/30 z-10 hover:z-20 shadow-lg"
                  >
                    <img 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                      src={displayBackdrop} 
                      alt={displayTitle}
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                    
                    {/* Play Trigger Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-11 h-11 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all">
                        <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                      </div>
                    </div>

                    {/* Delete Item Overlay */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveContinueItem(item.id);
                      }}
                      className="absolute top-2 right-2 z-30 w-8 h-8 rounded-full bg-black/60 hover:bg-red-600/80 border border-white/10 flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all duration-200 opacity-0 group-hover:opacity-100 shadow-md cursor-pointer"
                      title="Remove from history"
                    >
                      <span className="material-symbols-outlined text-sm font-semibold">close</span>
                    </button>

                    <div className="absolute bottom-0 left-0 w-full p-sm space-y-1.5 z-20">
                      <p className="font-label-sm text-xs font-semibold text-white tracking-wide truncate">
                        {displayTitle} • {item.detail || item.subtitle}
                      </p>
                      <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden">
                        <div 
                          className="bg-primary-container h-full rounded-full transition-all duration-500" 
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
              {/* Primary Info Card */}
              <div className="relative aspect-video rounded-xl border border-dashed border-white/10 bg-white/[0.01] backdrop-blur-md p-5 flex flex-col justify-between shadow-md group hover:border-primary/25 transition-all duration-300 select-none">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/5 flex items-center justify-center text-on-surface-variant flex-shrink-0">
                    <span className="material-symbols-outlined text-lg">history</span>
                  </div>
                  <span className="font-semibold text-xs text-white uppercase tracking-wider">Watchlist Clear</span>
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-white">No Watch History</h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Start playing TV shows and they'll show up here automatically.
                  </p>
                </div>
              </div>

              {/* Skeleton placeholders */}
              <div className="relative aspect-video rounded-xl border border-dashed border-white/5 bg-white/[0.005] opacity-60 hidden sm:flex flex-col items-center justify-center p-6 text-center select-none">
                <span className="material-symbols-outlined text-xl text-on-surface-variant/20 mb-2">videocam_off</span>
                <span className="text-xs text-on-surface-variant/40 font-medium">Slot Empty</span>
              </div>
              <div className="relative aspect-video rounded-xl border border-dashed border-white/5 bg-white/[0.005] opacity-40 hidden lg:flex flex-col items-center justify-center p-6 text-center select-none">
                <span className="material-symbols-outlined text-xl text-on-surface-variant/20 mb-2">videocam_off</span>
                <span className="text-xs text-on-surface-variant/40 font-medium">Slot Empty</span>
              </div>
              <div className="relative aspect-video rounded-xl border border-dashed border-white/5 bg-white/[0.005] opacity-25 hidden lg:flex flex-col items-center justify-center p-6 text-center select-none">
                <span className="material-symbols-outlined text-xl text-on-surface-variant/20 mb-2">videocam_off</span>
                <span className="text-xs text-on-surface-variant/40 font-medium">Slot Empty</span>
              </div>
            </div>
          )}
          </section>
        )}

        {/* Trending TV Shows Section */}
        <section id="trending-section" className="max-w-container-max mx-auto px-6 md:px-12 lg:px-xl">
          <h2 className="font-headline-md text-headline-md font-bold mb-md text-white tracking-tight uppercase flex items-center gap-2">
            <span className="w-1 h-6 bg-primary rounded-full" />
            Trending TV Shows
          </h2>
          {filteredPopular.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-md">
              {filteredPopular.map((show) => (
                <div 
                  key={show.id}
                  className="group relative aspect-[2/3] rounded-xl overflow-hidden cursor-pointer bg-surface-container-low border border-white/5 transition-all duration-300 hover:scale-[1.04] hover:shadow-[0_0_20px_rgba(0,209,255,0.25)] hover:border-primary/30 z-10 hover:z-20 shadow-md"
                >
                  {show.poster_path ? (
                    <img 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                      src={`https://image.tmdb.org/t/p/w500${show.poster_path}`} 
                      alt={show.name || show.original_name}
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-on-surface/40 bg-surface-container-high border border-white/5">
                      <span className="material-symbols-outlined text-4xl mb-2 text-primary/30">tv</span>
                      <span className="text-xs font-bold truncate max-w-full">{show.name || show.original_name}</span>
                    </div>
                  )}

                  {/* Hover Details Panel */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 z-20">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">HD</span>
                      {show.first_air_date && (
                        <span className="text-white/60 text-[10px] font-bold">
                          {show.first_air_date.split("-")[0]}
                        </span>
                      )}
                      {show.vote_average > 0 && (
                        <span className="text-yellow-400 text-[10px] font-bold flex items-center gap-0.5">
                          ★ {show.vote_average.toFixed(1)}
                        </span>
                      )}
                    </div>
                    <h3 className="font-label-md text-label-md text-white font-semibold truncate mb-1">
                      {show.name || show.original_name}
                    </h3>
                    <div className="flex space-x-2 mt-3">
                      <Link 
                        href={`/series/detail/${show.id}`}
                        className="bg-white text-black p-2 rounded-lg flex items-center justify-center hover:scale-115 transition-transform cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm font-semibold" style={{ fontVariationSettings: "'FILL' 1" }}>
                          play_arrow
                        </span>
                      </Link>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToWatchlist(show.id, "series", show.name || show.original_name);
                        }}
                        className="bg-white/20 backdrop-blur-md text-white p-2 rounded-lg flex items-center justify-center hover:scale-115 transition-transform cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">add</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full py-16 rounded-2xl bg-white/[0.01] backdrop-blur-md border border-white/5 flex flex-col items-center justify-center text-center px-6 shadow-md">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant/40 mb-3">tv_off</span>
              <h3 className="font-semibold text-lg text-white mb-1">No Shows Found</h3>
              <p className="text-sm text-on-surface-variant max-w-sm">
                We couldn't find any TV shows matching this category. Try selecting a different filter.
              </p>
            </div>
          )}
        </section>

        {/* Top 10 Shows Today */}
        <section className="max-w-container-max mx-auto px-6 md:px-12 lg:px-xl">
          <div className="flex justify-between items-center mb-md">
            <h2 className="font-headline-md text-headline-md font-bold text-white tracking-tight uppercase flex items-center gap-2">
              <span className="w-1 h-6 bg-primary rounded-full" />
              Top 10 Shows Today
            </h2>
            {liveTopRated.length > 0 && (
              <div className="flex gap-sm z-30">
                <button 
                  onClick={handleScrollLeft}
                  className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-white/5 hover:bg-white/10 hover:border-white/20 text-white transition-all cursor-pointer backdrop-blur-md active:scale-90"
                  title="Scroll Left"
                >
                  <span className="material-symbols-outlined text-lg">chevron_left</span>
                </button>
                <button 
                  onClick={handleScrollRight}
                  className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-white/5 hover:bg-white/10 hover:border-white/20 text-white transition-all cursor-pointer backdrop-blur-md active:scale-90"
                  title="Scroll Right"
                >
                  <span className="material-symbols-outlined text-lg">chevron_right</span>
                </button>
              </div>
            )}
          </div>
          {liveTopRated.length > 0 ? (
            <div ref={top10ScrollRef} className="flex gap-lg overflow-x-auto no-scrollbar pb-md custom-scrollbar scroll-smooth pl-12 pr-6">
              {liveTopRated.map((show, index) => {
                const rank = index + 1;
                return (
                  <div 
                    key={show.id}
                    className="flex-none flex items-end relative group cursor-pointer"
                  >
                    <span className="text-outline-rank absolute -left-12 -bottom-2 z-0 opacity-40 group-hover:opacity-100 transition-opacity font-extrabold select-none">
                      {rank}
                    </span>
                    <div className="w-48 aspect-[2/3] rounded-xl overflow-hidden relative z-10 transition-all duration-300 hover:scale-[1.04] hover:shadow-[0_0_20px_rgba(0,209,255,0.25)] hover:border-primary/30 border border-white/5 shadow-lg bg-surface-container-low">
                      {show.poster_path ? (
                        <img 
                          className="w-full h-full object-cover" 
                          src={`https://image.tmdb.org/t/p/w500${show.poster_path}`} 
                          alt={show.name || show.original_name}
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-on-surface/40 bg-surface-container-high border border-white/5">
                          <span className="material-symbols-outlined text-4xl mb-2 text-primary/30">tv</span>
                          <span className="text-xs font-bold truncate max-w-full">{show.name || show.original_name}</span>
                        </div>
                      )}

                      {/* Hover Details Panel */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 z-20">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">HD</span>
                          {show.first_air_date && (
                            <span className="text-white/60 text-[10px] font-bold">
                              {show.first_air_date.split("-")[0]}
                            </span>
                          )}
                          {show.vote_average > 0 && (
                            <span className="text-yellow-400 text-[10px] font-bold flex items-center gap-0.5">
                              ★ {show.vote_average.toFixed(1)}
                            </span>
                          )}
                        </div>
                        <h3 className="font-label-md text-label-md text-white font-semibold truncate mb-1">
                          {show.name || show.original_name}
                        </h3>
                        <div className="flex space-x-2 mt-3">
                          <Link 
                            href={`/series/detail/${show.id}`}
                            className="bg-white text-black p-2 rounded-lg flex items-center justify-center hover:scale-115 transition-transform cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-sm font-semibold" style={{ fontVariationSettings: "'FILL' 1" }}>
                              play_arrow
                            </span>
                          </Link>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToWatchlist(show.id, "series", show.name || show.original_name);
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
            </div>
          ) : (
            <div className="w-full py-12 rounded-2xl bg-white/[0.01] backdrop-blur-md border border-white/5 flex flex-col items-center justify-center text-center px-6 shadow-md">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant/40 mb-3">leaderboard</span>
              <h3 className="font-semibold text-lg text-white mb-1">Rankings Unavailable</h3>
              <p className="text-sm text-on-surface-variant max-w-sm">
                Top rated show rankings are currently unavailable. Please try again later.
              </p>
            </div>
          )}
        </section>

        {/* Binge-Worthy Dramas Section */}
        <section className="max-w-container-max mx-auto px-6 md:px-12 lg:px-xl">
          <h2 className="font-headline-md text-headline-md font-bold mb-md text-white tracking-tight uppercase flex items-center gap-2">
            <span className="w-1 h-6 bg-primary rounded-full" />
            Binge-Worthy Dramas
          </h2>
          {filteredBingeDramas.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-md">
              {filteredBingeDramas.map((show) => (
                <div 
                  key={show.id}
                  className="group relative aspect-[2/3] rounded-xl overflow-hidden cursor-pointer bg-surface-container-low border border-white/5 transition-all duration-300 hover:scale-[1.04] hover:shadow-[0_0_20px_rgba(0,209,255,0.25)] hover:border-primary/30 z-10 hover:z-20 shadow-md"
                >
                  {show.poster_path ? (
                    <img 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                      src={`https://image.tmdb.org/t/p/w500${show.poster_path}`} 
                      alt={show.name || show.original_name}
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-on-surface/40 bg-surface-container-high border border-white/5">
                      <span className="material-symbols-outlined text-4xl mb-2 text-primary/30">tv</span>
                      <span className="text-xs font-bold truncate max-w-full">{show.name || show.original_name}</span>
                    </div>
                  )}

                  {/* Hover Details Panel */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 z-20">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">HD</span>
                      {show.first_air_date && (
                        <span className="text-white/60 text-[10px] font-bold">
                          {show.first_air_date.split("-")[0]}
                        </span>
                      )}
                      {show.vote_average > 0 && (
                        <span className="text-yellow-400 text-[10px] font-bold flex items-center gap-0.5">
                          ★ {show.vote_average.toFixed(1)}
                        </span>
                      )}
                    </div>
                    <h3 className="font-label-md text-label-md text-white font-semibold truncate mb-1">
                      {show.name || show.original_name}
                    </h3>
                    <div className="flex space-x-2 mt-3">
                      <Link 
                        href={`/series/detail/${show.id}`}
                        className="bg-white text-black p-2 rounded-lg flex items-center justify-center hover:scale-115 transition-transform cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm font-semibold" style={{ fontVariationSettings: "'FILL' 1" }}>
                          play_arrow
                        </span>
                      </Link>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToWatchlist(show.id, "series", show.name || show.original_name);
                        }}
                        className="bg-white/20 backdrop-blur-md text-white p-2 rounded-lg flex items-center justify-center hover:scale-115 transition-transform cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">add</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full py-16 rounded-2xl bg-white/[0.01] backdrop-blur-md border border-white/5 flex flex-col items-center justify-center text-center px-6 shadow-md">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant/40 mb-3">theater_comedy</span>
              <h3 className="font-semibold text-lg text-white mb-1">No Drama Shows</h3>
              <p className="text-sm text-on-surface-variant max-w-sm">
                There are no dramas currently available in this category.
              </p>
            </div>
          )}
        </section>

      </main>
      {/* Cinematic Noir Footer */}
      <footer className="bg-surface border-t border-white/5 py-xl mt-12 relative z-20">
        <div className="max-w-container-max mx-auto px-6 md:px-12 lg:px-xl">
          <div className="mb-lg">
            <div className="flex items-center space-x-3">
              <img 
                src="/ChatGPT Image Jun 22, 2026, 02_54_52 PM.svg" 
                alt="CineStream Logo" 
                className="h-14 w-auto object-contain" 
              />
              <span className="font-headline-md text-headline-md font-bold text-primary">
                CineStream
              </span>
            </div>
            <div className="flex gap-md mt-sm text-on-surface-variant">
              <span className="material-symbols-outlined hover:text-primary cursor-pointer transition-colors">slideshow</span>
              <span className="material-symbols-outlined hover:text-primary cursor-pointer transition-colors">camera</span>
              <span className="material-symbols-outlined hover:text-primary cursor-pointer transition-colors">movie</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-md mb-lg">
            <div className="flex flex-col gap-sm">
              <a className="font-label-sm text-label-sm text-outline-variant hover:text-primary underline transition-all" href="#">Audio Description</a>
              <a className="font-label-sm text-label-sm text-outline-variant hover:text-primary underline transition-all" href="#">Help Center</a>
              <a className="font-label-sm text-label-sm text-outline-variant hover:text-primary underline transition-all" href="#">Gift Cards</a>
            </div>
            <div className="flex flex-col gap-sm">
              <a className="font-label-sm text-label-sm text-outline-variant hover:text-primary underline transition-all" href="#">Media Center</a>
              <a className="font-label-sm text-label-sm text-outline-variant hover:text-primary underline transition-all" href="#">Investor Relations</a>
              <a className="font-label-sm text-label-sm text-outline-variant hover:text-primary underline transition-all" href="#">Jobs</a>
            </div>
            <div className="flex flex-col gap-sm">
              <a className="font-label-sm text-label-sm text-outline-variant hover:text-primary underline transition-all" href="#">Terms of Use</a>
              <a className="font-label-sm text-label-sm text-outline-variant hover:text-primary underline transition-all" href="#">Privacy</a>
              <a className="font-label-sm text-label-sm text-outline-variant hover:text-primary underline transition-all" href="#">Legal Notices</a>
            </div>
            <div className="flex flex-col gap-sm">
              <a className="font-label-sm text-label-sm text-outline-variant hover:text-primary underline transition-all" href="#">Cookie Preferences</a>
              <a className="font-label-sm text-label-sm text-outline-variant hover:text-primary underline transition-all" href="#">Corporate Information</a>
              <a className="font-label-sm text-label-sm text-outline-variant hover:text-primary underline transition-all" href="#">Contact Us</a>
            </div>
          </div>

          <div className="pt-md border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-md">
            <p className="font-label-sm text-label-sm text-outline-variant">© 2026 CineStream. All rights reserved.</p>
            <div className="flex items-center gap-sm">
              <span className="text-label-sm text-outline-variant font-medium">Experience Cinema Anywhere.</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}