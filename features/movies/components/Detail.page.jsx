"use client"
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import CinematicTrailerPlayer from "./CinematicTrailerPlayer";

export default function DetailPage({ movie }) {
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
            router.push("/");
        }
    };
    
    if (!movie) {
        return (
            <main className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center font-montserrat text-on-surface">
                <div className="max-w-md bg-surface-container-low/40 backdrop-blur-xl border border-white/5 p-8 rounded-2xl shadow-2xl">
                    <span className="material-symbols-outlined text-6xl text-error mb-4">
                        error
                    </span>
                    <h1 className="text-2xl font-bold text-white mb-2">Movie Not Found</h1>
                    <p className="text-on-surface-variant mb-6">
                        We couldn't retrieve the details for this movie. It might be temporarily unavailable or the ID is incorrect.
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
                                    router.push(`/movie/${id}?server=videasy&ref=${encodeURIComponent(`/movie/details/${id}`)}`);
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

    const scrollContainerRef = useRef(null);
    const [isHeroTrailerPlaying, setIsHeroTrailerPlaying] = useState(false);
    const [isCardTrailerPlaying, setIsCardTrailerPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [isCinematicPlayerOpen, setIsCinematicPlayerOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Scroll handler for similar movies section
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

    const data = movie;
    const similarData = movie?.similar;

    const director = data?.credits?.crew?.find(c => c.job === 'Director')?.name || "N/A";
    const writers = data?.credits?.crew?.filter(c => c.job === 'Writer' || c.job === 'Screenplay')?.map(w => w.name).slice(0, 3).join(", ") || "";
    const cast = data?.credits?.cast?.slice(0, 10) || [];
    const similarMovies = similarData?.results?.slice(0, 12) || [];

    const formatRuntime = (minutes) => {
        if (!minutes) return "";
        const hrs = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
    };

    const trailer = data?.videos?.results?.find(
        (v) => v.type === "Trailer" && v.site === "YouTube"
    ) || data?.videos?.results?.find((v) => v.site === "YouTube");

    // Convert vote average to percentage (e.g. 7.634 -> 76%)
    const scorePercentage = data?.vote_average ? Math.round(data.vote_average * 10) : 0;

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
                        /* YouTube iframe background player */
                        <div className="relative w-full h-full bg-black">
                            <div className="absolute inset-0 z-10 bg-transparent" />
                            <iframe
                                className="w-full h-full border-0 scale-105 md:scale-110 object-cover pointer-events-none"
                                src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&loop=1&playlist=${trailer.key}&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3`}
                                allow="accelerated-media; autoplay; encrypted-media; gyroscope"
                            ></iframe>
                        </div>
                    ) : (
                        /* Static Image Backdrop */
                        <>
                            {data.backdrop_path ? (
                                <Image 
                                    className="object-cover opacity-60 transition-transform duration-[10s] ease-out scale-105"
                                    fill
                                    src={`https://image.tmdb.org/t/p/original${data.backdrop_path}`}
                                    alt={data.title}
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

                {/* Mute/Unmute toggle button (Mockup style at bottom right) */}
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
                                {data.release_date ? data.release_date.split("-")[0] : ""}
                            </span>
                            {data.vote_average > 0 && (
                                <span className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[16px] text-yellow-400" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                    <span className="text-on-surface font-bold">{data.vote_average.toFixed(1)}</span>
                                </span>
                            )}
                            <span>•</span>
                            <span>{formatRuntime(data.runtime)}</span>
                            <span>•</span>
                            {data.genres && data.genres.slice(0, 2).map((g) => (
                                <span key={g.id} className="px-2.5 py-0.5 bg-white/10 rounded-full text-primary font-bold">
                                    {g.name}
                                </span>
                            ))}
                        </div>

                        {/* Title */}
                        <h1 className="font-display-lg text-headline-lg-mobile md:text-headline-lg lg:text-[2.75rem] text-white font-extrabold uppercase leading-tight tracking-tight mb-4 drop-shadow-lg">
                            {data.title}
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
                                href={`/movie/${data.id}`}
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
                                onClick={() => handleAddToWatchlist(data.id, "movie", data.title)}
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
                
                {/* Left Column: Storyline & Cast (takes up 2 columns on desktop) */}
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
                                    <h4 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Director</h4>
                                    <p className="text-white font-bold">{director}</p>
                                </div>
                                <div>
                                    <h4 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Writers</h4>
                                    <p className="text-white font-bold truncate" title={writers}>{writers || "N/A"}</p>
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
                                    "{data.tagline || `Top rated masterpiece with an outstanding ${data.vote_average.toFixed(1)} rating globally.`}"
                                </p>
                                <p className="font-label-sm text-primary font-bold text-[11px]">
                                    - TMDB Reviewers
                                </p>
                            </div>
                        </div>
                    </div>

                </div>

            </div>

            {/* Similar Movies Section */}
            {similarMovies.length > 0 && (
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
                            {similarMovies.map((item) => (
                                <Link 
                                    href={`/movie/details/${item.id}`} 
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

                                    {/* Hover info Panel */}
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
                                            <button className="bg-white text-black p-2 rounded-lg flex items-center justify-center hover:scale-115 transition-transform cursor-pointer">
                                                <span className="material-symbols-outlined text-sm font-semibold" style={{ fontVariationSettings: "'FILL' 1" }}>
                                                    play_arrow
                                                </span>
                                            </button>
                                            <button 
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleAddToWatchlist(item.id, "movie", item.title);
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
                    similarMovies={similarMovies} 
                    onClose={() => setIsCinematicPlayerOpen(false)} 
                />,
                document.body
            )}
        </main>
    );
}