"use client"
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";

export default function SeriesPlayerClient({ id, seasonId, episodeId }) {
    const router = useRouter();
    const { data: session } = authClient.useSession();

    const servers = [
        { name: "Videasy (.to)", url: `https://player.videasy.to/tv/${id}/${seasonId}/${episodeId}?nextEpisode=true&autoplayNextEpisode=true&episodeSelector=true&overlay=true&color=00D1FF` },
        { name: "Vidfast (Pro)", url: `https://vidfast.pro/tv/${id}/${seasonId}/${episodeId}?nextEpisode=true&autoplayNextEpisode=true&episodeSelector=true&overlay=true&color=00D1FF` },
        { name: "Videasy (.net)", url: `https://player.videasy.net/tv/${id}/${seasonId}/${episodeId}?nextEpisode=true&autoplayNextEpisode=true&episodeSelector=true&overlay=true&color=00D1FF` },
        { name: "VidSrc (.to)", url: `https://vidsrc.to/embed/tv/${id}/${seasonId}/${episodeId}` },
        { name: "VidSrc (.me)", url: `https://vidsrc.me/embed/tv?tmdb=${id}&season=${seasonId}&episode=${episodeId}` },
        { name: "EmbedAPI", url: `https://player.embed-api.stream/?id=${id}&s=${seasonId}&e=${episodeId}` }
    ];

    const [activeServer, setActiveServer] = useState(servers.find((s) => s.name === "Vidfast (Pro)") ?? servers[0]);
    const [isOpen, setIsOpen] = useState(false);
    const [showControls, setShowControls] = useState(true);

    // Mouse inactivity control bar auto-hiding (3s threshold)
    useEffect(() => {
        let timeoutId;
        const handleMouseMove = () => {
            setShowControls(true);
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                if (!isOpen) {
                    setShowControls(false);
                }
            }, 3000);
        };

        const handleKeyDown = () => {
            setShowControls(true);
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("keydown", handleKeyDown);

        timeoutId = setTimeout(() => {
            if (!isOpen) {
                setShowControls(false);
            }
        }, 3000);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("keydown", handleKeyDown);
            clearTimeout(timeoutId);
        };
    }, [isOpen]);

    // Record series watched history
    useEffect(() => {
        if (!id || !session?.user) return;
        const fetchDetailsAndSave = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_TMDB_BASE_URL || "https://api.tmdb.org"}/3/tv/${id}?language=en-US`, {
                    headers: {
                        accept: 'application/json',
                        Authorization: `Bearer ${process.env.NEXT_PUBLIC_ACCESS_TOKEN}`
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    
                    const raw = localStorage.getItem("cinestream_series_continue");
                    let list = [];
                    if (raw) {
                        try { list = JSON.parse(raw); } catch (e) {}
                    }
                    if (!Array.isArray(list)) list = [];
                    
                    // Filter out existing history for this series
                    list = list.filter(item => String(item.seriesId) !== String(id));
                    
                    const progress = Math.floor(Math.random() * 40) + 30; // 30% to 70%
                    
                    const newItem = {
                        id: `${id}-s${seasonId}-e${episodeId}`,
                        seriesId: String(id),
                        title: data.name || data.original_name || "Unknown Series",
                        subtitle: `S${seasonId}:E${episodeId} • Episode ${episodeId}`,
                        timeLeft: "25m left",
                        progress: progress,
                        image: data.backdrop_path 
                            ? `https://image.tmdb.org/t/p/w500${data.backdrop_path}` 
                            : (data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : ""),
                        link: `/series/${id}/season/${seasonId}/episode/${episodeId}`,
                        timestamp: Date.now()
                    };
                    
                    list.unshift(newItem);
                    if (list.length > 8) list = list.slice(0, 8);
                    
                    localStorage.setItem("cinestream_series_continue", JSON.stringify(list));
                }
            } catch (e) {
                console.error("Failed to save series to continue watching:", e);
            }
        };
        fetchDetailsAndSave();
    }, [id, seasonId, episodeId, session]);

    return (
        <div className="fixed inset-0 w-screen h-screen bg-black z-[9999] flex items-center justify-center font-montserrat select-none">
            
            {/* Back Button */}
            <button 
                onClick={() => router.back()}
                className={`absolute top-8 left-8 z-50 text-white hover:text-primary transition-all duration-300 cursor-pointer flex items-center justify-center p-2 rounded-full hover:bg-white/10 ${
                    showControls ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
                title="Go Back"
            >
                <span className="material-symbols-outlined text-3xl font-semibold">arrow_back</span>
            </button>

            {/* Server Selector Dropdown */}
            <div className={`absolute top-6 right-6 z-50 transition-opacity duration-300 ${
                showControls ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}>
                <button
                    onClick={() => {
                        setIsOpen(!isOpen);
                    }}
                    className="bg-black/60 border border-white/10 hover:bg-white/10 text-white font-label-md text-label-md px-4 py-2.5 rounded-xl flex items-center justify-between gap-2 cursor-pointer backdrop-blur-md transition-all shadow-md select-none w-52 md:w-60 hover:border-primary/30"
                >
                    <div className="flex items-center gap-2 truncate">
                        <span className="material-symbols-outlined text-lg text-primary shrink-0">dns</span>
                        <span className="truncate">Server: {activeServer.name}</span>
                    </div>
                    <span className="material-symbols-outlined text-sm text-white/60 transition-transform duration-200 shrink-0" style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}>
                        expand_more
                    </span>
                </button>

                {isOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-surface-container-highest/90 border border-white/10 rounded-xl shadow-2xl overflow-hidden py-1 z-50 backdrop-blur-xl">
                        <div className="px-3 py-1.5 text-[10px] font-bold text-white/40 uppercase tracking-wider border-b border-white/5">
                            Switch Streaming Server
                        </div>
                        {servers.map((srv, index) => {
                            const isActive = srv.url === activeServer.url;
                            return (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setActiveServer(srv);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-2 text-label-md font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                                        isActive 
                                            ? "bg-primary-container text-on-primary-container font-bold" 
                                            : "text-on-surface hover:bg-white/5"
                                    }`}
                                >
                                    <span>{srv.name}</span>
                                    {isActive && (
                                        <span className="material-symbols-outlined text-sm text-primary">check</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Viewport Video Player (utilizes native allowFullScreen and allow properties for full features support) */}
            <iframe 
                key={activeServer.url}
                className="w-full h-full border-0 pointer-events-auto animate-fade-in" 
                src={activeServer.url} 
                frameBorder="0" 
                allowFullScreen
                allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            ></iframe>
        </div>
    );
}
