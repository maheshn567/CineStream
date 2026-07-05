"use client"
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function CinematicTrailerPlayer({ movie, similarMovies = [], onClose }) {
    const iframeRef = useRef(null);
    const playerRef = useRef(null);
    const containerRef = useRef(null);
    const router = useRouter();

    const trailer = movie?.videos?.results?.find(
        (v) => v.type === "Trailer" && v.site === "YouTube"
    ) || movie?.videos?.results?.find((v) => v.site === "YouTube");

    const [activeVideoId, setActiveVideoId] = useState(trailer?.key || "");
    const [activeMovie, setActiveMovie] = useState(movie);
    const [loadingPreviewId, setLoadingPreviewId] = useState(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(80);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showIndicator, setShowIndicator] = useState(false);
    const [isControlsVisible, setIsControlsVisible] = useState(true);
    
    // Cursor glow coordinates
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    // Format time (seconds to mm:ss)
    const formatTime = (secs) => {
        if (isNaN(secs) || secs === undefined) return "0:00";
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m}:${s < 10 ? "0" : ""}${s}`;
    };

    // Load YouTube API and bind player
    useEffect(() => {
        if (!activeVideoId) return;

        // Load the API if not already present
        if (!window.YT) {
            const tag = document.createElement("script");
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName("script")[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }

        let player;
        let isPlayerDestroyed = false;

        const initPlayer = () => {
            if (!window.YT || !window.YT.Player || !iframeRef.current || isPlayerDestroyed) return false;

            player = new window.YT.Player(iframeRef.current, {
                events: {
                    onReady: (event) => {
                        setDuration(event.target.getDuration());
                        setVolume(event.target.getVolume());
                        setIsMuted(event.target.isMuted());
                        event.target.playVideo();
                        setIsPlaying(true);
                    },
                    onStateChange: (event) => {
                        if (event.data === window.YT.PlayerState.PLAYING) {
                            setIsPlaying(true);
                        } else if (event.data === window.YT.PlayerState.PAUSED) {
                            setIsPlaying(false);
                        } else if (event.data === window.YT.PlayerState.ENDED) {
                            setIsPlaying(false);
                        }
                    }
                }
            });
            playerRef.current = player;
            return true;
        };

        if (window.YT && window.YT.Player) {
            initPlayer();
        } else {
            const checkYT = setInterval(() => {
                if (window.YT && window.YT.Player) {
                    if (initPlayer()) {
                        clearInterval(checkYT);
                    }
                }
            }, 100);
            return () => clearInterval(checkYT);
        }

        return () => {
            isPlayerDestroyed = true;
            if (player && player.destroy) {
                player.destroy();
            }
            playerRef.current = null;
        };
    }, [activeVideoId]);

    // Update time interval
    useEffect(() => {
        let interval;
        if (isPlaying && playerRef.current && typeof playerRef.current.getCurrentTime === "function") {
            interval = setInterval(() => {
                if (playerRef.current && typeof playerRef.current.getCurrentTime === "function") {
                    setCurrentTime(playerRef.current.getCurrentTime());
                }
                if (playerRef.current && typeof playerRef.current.getDuration === "function") {
                    setDuration(playerRef.current.getDuration());
                }
            }, 250);
        }
        return () => clearInterval(interval);
    }, [isPlaying]);

    // Handle play/pause toggle
    const togglePlay = () => {
        if (!playerRef.current || typeof playerRef.current.playVideo !== "function") return;
        if (isPlaying) {
            playerRef.current.pauseVideo();
            setIsPlaying(false);
        } else {
            playerRef.current.playVideo();
            setIsPlaying(true);
        }
        setShowIndicator(true);
        setTimeout(() => setShowIndicator(false), 500);
    };

    // Replay 10 seconds
    const handleReplay10 = () => {
        if (!playerRef.current || typeof playerRef.current.seekTo !== "function") return;
        const newTime = Math.max(0, currentTime - 10);
        playerRef.current.seekTo(newTime, true);
        setCurrentTime(newTime);
    };

    // Forward 10 seconds
    const handleForward10 = () => {
        if (!playerRef.current || typeof playerRef.current.seekTo !== "function") return;
        const newTime = Math.min(duration, currentTime + 10);
        playerRef.current.seekTo(newTime, true);
        setCurrentTime(newTime);
    };

    // Handle volume adjustments
    const handleVolumeChange = (e) => {
        if (!playerRef.current || typeof playerRef.current.setVolume !== "function") return;
        const newVol = parseInt(e.target.value);
        setVolume(newVol);
        playerRef.current.setVolume(newVol);
        if (newVol > 0 && isMuted) {
            if (typeof playerRef.current.unMute === "function") {
                playerRef.current.unMute();
            }
            setIsMuted(false);
        } else if (newVol === 0 && !isMuted) {
            if (typeof playerRef.current.mute === "function") {
                playerRef.current.mute();
            }
            setIsMuted(true);
        }
    };

    const toggleMute = () => {
        if (!playerRef.current) return;
        if (isMuted) {
            if (typeof playerRef.current.unMute === "function") {
                playerRef.current.unMute();
            }
            setIsMuted(false);
            if (volume === 0) {
                setVolume(50);
                if (typeof playerRef.current.setVolume === "function") {
                    playerRef.current.setVolume(50);
                }
            }
        } else {
            if (typeof playerRef.current.mute === "function") {
                playerRef.current.mute();
            }
            setIsMuted(true);
        }
    };

    // Progress Bar timeline scrubbing
    const handleProgressClick = (e) => {
        if (!playerRef.current || typeof playerRef.current.seekTo !== "function" || duration === 0) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = clickX / rect.width;
        const targetTime = percentage * duration;
        playerRef.current.seekTo(targetTime, true);
        setCurrentTime(targetTime);
    };

    // Fullscreen Toggler
    const toggleFullscreen = () => {
        if (!containerRef.current) return;
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().then(() => {
                setIsFullscreen(true);
            }).catch(err => {
                console.error("Error attempting to enable full-screen mode:", err);
            });
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
    }, []);

    // Escape to close
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    // Handle mouse inactivity auto-hide
    useEffect(() => {
        let hideTimeout;
        const handleMouseMove = (e) => {
            setIsControlsVisible(true);
            setMousePos({ x: e.clientX, y: e.clientY });
            clearTimeout(hideTimeout);
            hideTimeout = setTimeout(() => {
                setIsControlsVisible(false);
            }, 4000);
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            clearTimeout(hideTimeout);
        };
    }, []);

    // Load recommendations trailer via API
    const handleQuickPreview = async (similarMovie) => {
        setLoadingPreviewId(similarMovie.id);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/3/movie/${similarMovie.id}?append_to_response=videos`, {
                headers: {
                    accept: "application/json",
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_ACCESS_TOKEN}`
                }
            });
            if (res.ok) {
                const details = await res.json();
                const simTrailer = details?.videos?.results?.find(
                    (v) => v.type === "Trailer" && v.site === "YouTube"
                ) || details?.videos?.results?.find((v) => v.site === "YouTube");

                if (simTrailer?.key) {
                    setActiveVideoId(simTrailer.key);
                    setActiveMovie(details);
                } else {
                    alert("No trailer preview available for this movie.");
                }
            } else {
                alert("Failed to load trailer details.");
            }
        } catch (error) {
            console.error("Failed to fetch trailer preview:", error);
        } finally {
            setLoadingPreviewId(null);
        }
    };

    const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div 
            ref={containerRef}
            className={`fixed inset-0 w-screen h-screen bg-black z-[99999] flex flex-col justify-between overflow-hidden select-none transition-all duration-700 font-montserrat ${
                isControlsVisible ? "cursor-default" : "cursor-none"
            }`}
        >
            {/* Cinematic Background Video Layer */}
            <div className="absolute inset-0 z-0 overflow-hidden bg-black">
                {activeVideoId ? (
                    <iframe
                        ref={iframeRef}
                        id="yt-cinematic-player"
                        className="w-full h-full border-0 scale-105 md:scale-110 object-cover pointer-events-none"
                        src={`https://www.youtube.com/embed/${activeVideoId}?enablejsapi=1&autoplay=1&controls=0&rel=0&showinfo=0&iv_load_policy=3&modestbranding=1&disablekb=1&origin=${typeof window !== "undefined" ? window.location.origin : ""}`}
                        allow="accelerated-media; autoplay; encrypted-media; gyroscope"
                    ></iframe>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
                        No Trailer Available
                    </div>
                )}

                {/* Dark Gradient Overlays exactly matching mockup */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Close Preview Button Only */}
            <button 
                onClick={onClose}
                className={`fixed top-6 right-6 z-50 flex items-center justify-center bg-black/60 hover:bg-black/80 border border-white/10 text-white rounded-full p-2.5 hover:scale-105 active:scale-95 cursor-pointer transition-all duration-500 shadow-md group ${
                    isControlsVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-6 pointer-events-none"
                }`}
                title="Close Preview"
            >
                <span className="material-symbols-outlined text-white group-hover:rotate-90 transition-transform duration-300">
                    close
                </span>
            </button>

            {/* Interactive Play/Pause Indicator (Flashing in Center) */}
            <main className="fixed inset-0 pointer-events-none z-10 flex items-center justify-center">
                <div 
                    className={`transition-all duration-300 w-24 h-24 rounded-full bg-primary-container/20 border border-primary-container/30 flex items-center justify-center backdrop-blur-md ${
                        showIndicator ? "opacity-100 scale-100" : "opacity-0 scale-75"
                    }`}
                >
                    <span className="material-symbols-outlined text-primary-container text-[48px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {isPlaying ? "play_arrow" : "pause"}
                    </span>
                </div>
            </main>

            {/* Bottom Controls Overlay */}
            <footer 
                className={`fixed bottom-0 left-0 w-full z-50 px-8 pb-8 transition-all duration-500 bg-gradient-to-t from-black via-black/40 to-transparent pt-12 ${
                    isControlsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6 pointer-events-none"
                }`}
            >
                <div className="max-w-container-max mx-auto space-y-6">

                    {/* Dynamic "More Like This" Section */}
                    {similarMovies.length > 0 && (
                        <div className={`pointer-events-auto space-y-3 transition-all duration-500 origin-bottom overflow-hidden ${
                            isPlaying 
                                ? "opacity-0 max-h-0 scale-95 pointer-events-none mb-0" 
                                : "opacity-100 max-h-96 scale-100"
                        }`}>
                            <h3 className="font-label-md text-xs text-on-surface-variant uppercase tracking-widest flex items-center gap-2 font-bold">
                                <span className="w-8 h-px bg-primary-container/50"></span>
                                More Like This
                            </h3>
                            <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar scroll-smooth">
                                {similarMovies.slice(0, 4).map((item) => (
                                    <div 
                                        key={item.id} 
                                        onClick={() => handleQuickPreview(item)}
                                        className="flex-none w-36 group cursor-pointer select-none"
                                    >
                                        <div className="aspect-[2/3] relative rounded-xl overflow-hidden border border-white/10 transition-all duration-300 group-hover:border-primary/50 group-hover:shadow-[0_0_15px_rgba(0,209,255,0.3)] bg-surface-container-low">
                                            {item.poster_path ? (
                                                <Image 
                                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                    fill 
                                                    src={`https://image.tmdb.org/t/p/w185${item.poster_path}`} 
                                                    alt={item.title}
                                                    unoptimized={true}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-surface-container-high text-xs text-white/30">
                                                    No Poster
                                                </div>
                                            )}

                                            {/* Quick Preview Hover Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2">
                                                <button className="w-full py-1.5 bg-primary text-on-primary text-[10px] font-bold rounded-lg transform translate-y-2 group-hover:translate-y-0 transition-transform cursor-pointer">
                                                    {loadingPreviewId === item.id ? "LOADING..." : "QUICK PREVIEW"}
                                                </button>
                                            </div>
                                        </div>
                                        <p className="mt-1.5 text-xs text-on-surface-variant font-semibold truncate group-hover:text-primary transition-colors">
                                            {item.title}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Progress Bar Container */}
                    <div 
                        onClick={handleProgressClick}
                        className="relative w-full group cursor-pointer pointer-events-auto h-6 flex items-center"
                    >
                        <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden transition-all duration-300 group-hover:h-1.5 relative">
                            {/* Blue elapsed bar with glow effect matching mockup */}
                            <div 
                                className="h-full bg-primary-container shadow-[0_0_10px_#00d1ff] transition-all duration-100 ease-out" 
                                style={{ width: `${progressPercent}%` }}
                            >
                                {/* Drag/Hover Knob */}
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-primary rounded-full scale-0 group-hover:scale-100 transition-transform shadow-[0_0_8px_rgba(0,209,255,0.8)]" />
                            </div>
                        </div>
                    </div>

                    {/* Bottom Controls Row */}
                    <div className="flex flex-col md:flex-row items-center justify-between pointer-events-auto gap-4 md:gap-0">
                        
                        {/* Left: Playback Controls */}
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={togglePlay}
                                className="hover:scale-105 active:scale-95 transition-transform cursor-pointer flex items-center justify-center text-white hover:text-primary"
                                title={isPlaying ? "Pause" : "Play"}
                            >
                                <span className="material-symbols-outlined text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                    {isPlaying ? "pause" : "play_arrow"}
                                </span>
                            </button>

                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={handleReplay10}
                                    className="opacity-80 hover:opacity-100 cursor-pointer text-white hover:text-primary transition-colors"
                                    title="Rewind 10s"
                                >
                                    <span className="material-symbols-outlined text-2xl">replay_10</span>
                                </button>
                                <button 
                                    onClick={handleForward10}
                                    className="opacity-80 hover:opacity-100 cursor-pointer text-white hover:text-primary transition-colors"
                                    title="Forward 10s"
                                >
                                    <span className="material-symbols-outlined text-2xl">forward_10</span>
                                </button>
                            </div>

                            {/* Volume layout */}
                            <div className="flex items-center gap-2 group ml-2">
                                <button 
                                    onClick={toggleMute}
                                    className="text-on-surface-variant hover:text-primary cursor-pointer transition-colors"
                                >
                                    <span className="material-symbols-outlined text-xl">
                                        {isMuted || volume === 0 ? "volume_off" : volume < 50 ? "volume_down" : "volume_up"}
                                    </span>
                                </button>
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="100" 
                                    value={isMuted ? 0 : volume} 
                                    onChange={handleVolumeChange}
                                    className="w-20 md:w-24 h-1 bg-white/20 appearance-none rounded-lg accent-primary cursor-pointer transition-all duration-300 outline-none"
                                    style={{
                                        background: `linear-gradient(to right, #00d1ff 0%, #00d1ff ${isMuted ? 0 : volume}%, rgba(255, 255, 255, 0.2) ${isMuted ? 0 : volume}%, rgba(255, 255, 255, 0.2) 100%)`
                                    }}
                                />
                            </div>

                            {/* Current / Duration Timer */}
                            <span className="text-xs text-on-surface-variant font-semibold ml-2 select-none">
                                {formatTime(currentTime)} / {formatTime(duration)}
                            </span>
                        </div>

                        {/* Center: Metadata */}
                        <div className="text-center flex flex-col items-center">
                            <h2 className="font-headline-md text-base md:text-lg font-bold text-white tracking-widest uppercase truncate max-w-[20rem] md:max-w-[28rem]">
                                {activeMovie.title || activeMovie.name}
                            </h2>
                            <div className="flex items-center gap-2 mt-1 text-on-surface-variant text-xs font-semibold">
                                <span>{(activeMovie.release_date || activeMovie.first_air_date || "").split("-")[0]}</span>
                                <span className="w-1 h-1 bg-white/30 rounded-full"></span>
                                <span className="border border-outline-variant px-1.5 py-0.5 rounded text-[10px] uppercase">
                                    {activeMovie.adult ? "18+" : "PG-13"}
                                </span>
                                <span className="w-1 h-1 bg-white/30 rounded-full"></span>
                                <span>{formatTime((activeMovie.runtime || activeMovie.episode_run_time?.[0] || 0) * 60)}</span>
                            </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 border-r border-white/10 pr-4">
                                <button className="opacity-80 hover:opacity-100 p-2 hover:bg-white/5 rounded-full transition-all text-white hover:text-primary cursor-pointer" title="Subtitles (CC)">
                                    <span className="material-symbols-outlined text-xl">closed_caption</span>
                                </button>
                                <button className="opacity-80 hover:opacity-100 p-2 hover:bg-white/5 rounded-full transition-all text-white hover:text-primary cursor-pointer" title="Settings">
                                    <span className="material-symbols-outlined text-xl">settings</span>
                                </button>
                                <button 
                                    onClick={toggleFullscreen}
                                    className="opacity-80 hover:opacity-100 p-2 hover:bg-white/5 rounded-full transition-all text-white hover:text-primary cursor-pointer" 
                                    title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                                >
                                    <span className="material-symbols-outlined text-xl">
                                        {isFullscreen ? "fullscreen_exit" : "fullscreen"}
                                    </span>
                                </button>
                            </div>

                            {/* Watch Now Button linking to the main movie stream */}
                            <button 
                                onClick={() => {
                                    if (activeMovie && activeMovie.id) {
                                        onClose();
                                        if (activeMovie.first_air_date) {
                                            router.push(`/series/${activeMovie.id}/season/1/episode/1`);
                                        } else {
                                            router.push(`/movie/${activeMovie.id}`);
                                        }
                                    }
                                }}
                                className="bg-primary-container text-on-primary-container font-semibold text-xs px-6 py-2.5 rounded-xl flex items-center gap-1.5 transition-all duration-300 shadow-[0_0_15px_rgba(0,209,255,0.4)] hover:shadow-[0_0_25px_rgba(0,209,255,0.6)] hover:scale-105 active:scale-95 cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                                    play_circle
                                </span>
                                <span>WATCH NOW</span>
                            </button>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Mouse Tracking Cursor Glow Overlay */}
            {isControlsVisible && (
                <div 
                    className="fixed w-[32rem] h-[32rem] bg-primary/5 rounded-full blur-[90px] pointer-events-none z-0 transform -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300"
                    style={{
                        left: `${mousePos.x}px`,
                        top: `${mousePos.y}px`
                    }}
                />
            )}
        </div>
    );
}
