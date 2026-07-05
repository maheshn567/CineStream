"use client"
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";

export default function MoviePlayer() {
    const router = useRouter();
    const params = useParams();
    const id = params.id;
    const { data: session } = authClient.useSession();

    const servers = [
        { name: "Vidfast (Pro)", url: `https://vidfast.pro/movie/${id}?overlay=true&color=00D1FF` },
        { name: "Videasy (.to)", url: `https://player.videasy.to/movie/${id}?overlay=true&color=00D1FF` },
        { name: "Videasy (.net)", url: `https://player.videasy.net/movie/${id}?overlay=true&color=00D1FF` },
        { name: "VidSrc (.to)", url: `https://vidsrc.to/embed/movie/${id}` },
        { name: "VidSrc (.me)", url: `https://vidsrc.me/embed/movie?tmdb=${id}` },
        { name: "VidLink (Sub)", url: `https://vidlink.pro/embed/movie/${id}?color=00D1FF` },
        { name: "VidLink (Dub)", url: `https://vidlink.pro/embed/movie/${id}?color=00D1FF` },
        { name: "EmbedAPI", url: `https://player.embed-api.stream/?id=${id}` }
    ];

    const [activeServer, setActiveServer] = useState(servers[0]);
    const [isOpen, setIsOpen] = useState(false);
    const [showControls, setShowControls] = useState(true);

    // Detect server parameter to default to Videasy if requested
    useEffect(() => {
        if (typeof window !== "undefined") {
            const search = new URLSearchParams(window.location.search);
            const serverParam = search.get("server");
            if (serverParam && serverParam.toLowerCase() === "videasy") {
                const found = servers.find(s => s.name.toLowerCase().includes("videasy (.to)"));
                if (found) {
                    setActiveServer(found);
                }
            }
        }
    }, [id]);

    // Record movie watched history
    useEffect(() => {
        if (!id || !session?.user) return;
        const fetchDetailsAndSave = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_TMDB_BASE_URL || "https://api.tmdb.org"}/3/movie/${id}?language=en-US`, {
                    headers: {
                        accept: 'application/json',
                        Authorization: `Bearer ${process.env.NEXT_PUBLIC_ACCESS_TOKEN}`
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    
                    const raw = localStorage.getItem("cinestream_movies_continue");
                    let list = [];
                    if (raw) {
                        try { list = JSON.parse(raw); } catch (e) {}
                    }
                    if (!Array.isArray(list)) list = [];
                    
                    // Filter out duplicate
                    list = list.filter(item => String(item.id) !== String(data.id));
                    
                    const genreLabel = data.genres?.[0]?.name || "Movie";
                    const releaseYear = data.release_date ? data.release_date.split("-")[0] : "";
                    const subtitle = releaseYear ? `${genreLabel} • ${releaseYear}` : genreLabel;
                    
                    const progress = Math.floor(Math.random() * 40) + 30; // 30% to 70%
                    const runtime = data.runtime || 120;
                    const timeLeftMins = Math.round(runtime * (1 - progress / 100));
                    const timeLeft = timeLeftMins > 60 
                        ? `${Math.floor(timeLeftMins / 60)}h ${timeLeftMins % 60}m left` 
                        : `${timeLeftMins}m left`;

                    const newItem = {
                        id: String(data.id),
                        title: data.title || data.original_title || "Unknown Movie",
                        subtitle: subtitle,
                        timeLeft: timeLeft,
                        progress: progress,
                        image: data.backdrop_path 
                            ? `https://image.tmdb.org/t/p/w500${data.backdrop_path}` 
                            : (data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : ""),
                        link: `/movie/${data.id}`,
                        timestamp: Date.now()
                    };
                    
                    list.unshift(newItem);
                    if (list.length > 8) list = list.slice(0, 8);
                    
                    localStorage.setItem("cinestream_movies_continue", JSON.stringify(list));
                }
            } catch (e) {
                console.error("Failed to save movie to continue watching:", e);
            }
        };
        fetchDetailsAndSave();
    }, [id, session]);

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