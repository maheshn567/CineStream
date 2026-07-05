"use client"
import { useState, useEffect } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export default function ContinueSeries() {
    const [continueList, setContinueList] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const { data: session } = authClient.useSession();

    useEffect(() => {
        if (!session?.user) {
            setIsLoaded(true);
            return;
        }
        const raw = localStorage.getItem("cinestream_series_continue");
        if (raw) {
            try {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                    setContinueList(parsed);
                }
            } catch (e) {
                console.error("Failed to parse series continue list:", e);
            }
        }
        setIsLoaded(true);
    }, [session]);

    const handleRemoveItem = (itemId) => {
        const updatedList = continueList.filter(item => item.id !== itemId);
        setContinueList(updatedList);
        localStorage.setItem("cinestream_series_continue", JSON.stringify(updatedList));
    };

    if (!isLoaded || !session?.user) return null;

    return (
        <section className="bg-surface pt-md px-gutter max-w-container-max mx-auto w-full space-y-md">
            {/* Row Title with Design accent line */}
            <div className="flex justify-between items-end border-l-4 border-primary-container pl-4 mb-6">
                <h2 className="font-headline-md text-headline-md text-on-surface uppercase font-bold tracking-tight">
                    Continue Watching Series
                </h2>
            </div>

            {isLoaded && continueList.length > 0 ? (
                /* Horizontal scroll container with custom scrollbar */
                <div className="flex space-x-md overflow-x-auto pb-6 custom-scrollbar scroll-smooth">
                    {continueList.map((item) => (
                        <div key={item.id} className="flex-none w-72 md:w-80 group relative">
                            <Link href={item.link} className="cursor-pointer block">
                                
                                {/* Aspect Ratio Card Wrapper */}
                                <div className="aspect-video relative rounded-xl overflow-hidden bg-surface-container-high border border-white/5 shadow-md">
                                    
                                    {/* Series Backdrop */}
                                    {item.image ? (
                                        <img 
                                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                                            src={item.image} 
                                            alt={item.title}
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-surface-container-high flex items-center justify-center">
                                            <span className="material-symbols-outlined text-4xl text-white/20">live_tv</span>
                                        </div>
                                    )}
                                    
                                    {/* Hover Play Button Overlay */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 z-10">
                                        <span className="material-symbols-outlined text-white text-5xl font-light hover:scale-110 transition-transform">
                                            play_circle
                                        </span>
                                    </div>

                                    {/* Watch Progress Bar */}
                                    <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20 z-20">
                                        <div 
                                            className="h-full bg-primary-container" 
                                            style={{ width: `${item.progress}%` }}
                                        />
                                    </div>
                                </div>
                            </Link>

                            {/* Delete Button Overlay */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveItem(item.id);
                                }}
                                className="absolute top-2 right-2 z-30 w-8 h-8 rounded-full bg-black/60 hover:bg-red-600/80 border border-white/10 flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all duration-200 opacity-0 group-hover:opacity-100 shadow-md cursor-pointer"
                                title="Remove from history"
                            >
                                <span className="material-symbols-outlined text-sm font-semibold">close</span>
                            </button>

                            <Link href={item.link} className="cursor-pointer block">
                                {/* Title and Metadata block */}
                                <div className="mt-3 flex justify-between items-start px-1">
                                    <div>
                                        <h3 className="font-label-md text-label-md text-on-surface font-semibold group-hover:text-primary transition-colors truncate w-56 md:w-64">
                                            {item.title}
                                        </h3>
                                        <p className="font-label-sm text-label-sm text-on-surface-variant font-medium mt-0.5">
                                            {item.subtitle}
                                        </p>
                                    </div>
                                    <span className="font-label-sm text-label-sm text-primary-container font-semibold whitespace-nowrap">
                                        {item.timeLeft}
                                    </span>
                                </div>
                            </Link>
                        </div>
                    ))}

                    {/* Right side spacer to prevent clipping */}
                    <div className="w-12 shrink-0 h-1" />
                </div>
            ) : (
                /* Fallback design when empty or loading client history */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md pb-6">
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
                                Start playing series and they'll show up here automatically.
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
    );
}
