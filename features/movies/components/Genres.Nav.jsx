"use client"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link";
import { useState,useEffect,useRef } from "react";
import { usePathname } from "next/navigation";

export default function GenresNav(){
    const pathname = usePathname();
    const [activeGenre, setActiveGenre] = useState(null);
    const scrollContainerRef = useRef(null);

    const scroll = (direction) => {
        const { current } = scrollContainerRef;
        if (current) {
            const scrollAmount = 300;
            current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth"
            });
        }
    };
    const {data, isLoading, error} = useQuery({
        queryKey: ["movie-genres-list"],
        queryFn: () => {
            return fetch(`${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/3/genre/movie/list`, {
                headers: {
                    accept: 'application/json',
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_ACCESS_TOKEN}`
                }
            }).then((res) => {
                if (!res.ok) throw new Error('Failed to fetch TMDB data');
                return res.json();
            });
        },
        staleTime: 1000 * 60 * 60 * 24, // 1 day
        gcTime: 1000 * 60 * 60 * 24,    // 1 day
        retry: false, // Don't block development with continuous retries
    });

    useEffect(()=>{
        if(pathname.includes("/genre/")){
            setActiveGenre(pathname.split("/genre/")[1]);
        } else {
            setActiveGenre(null);
        }
    },[pathname]);

    if(isLoading){
        return(
            <div className="max-w-container-max mx-auto px-gutter py-6 flex items-center gap-4 bg-surface">
                <div className="whitespace-nowrap px-8 py-3 rounded-full bg-surface-container/30 border border-white/5 text-on-surface/50 text-label-md animate-pulse">
                    Loading categories...
                </div>
            </div>
        )
    }

    if(error){
        return(
            <div className="max-w-container-max mx-auto px-gutter py-6 flex items-center bg-surface">
                <div className="whitespace-nowrap px-8 py-3 rounded-full border border-error/20 text-error text-label-md">
                    Error loading categories: {error.message}
                </div>
            </div>
        )
    }

    return (
        <section className="w-full max-w-container-max mx-auto px-gutter relative z-40 bg-surface">
            <div className="relative group/nav w-full overflow-hidden">
                {/* Left navigation arrow */}
                <button 
                    onClick={() => scroll("left")}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-50 bg-black/60 border border-white/10 hover:bg-primary-container hover:text-on-primary-container text-white w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-sm opacity-0 group-hover/nav:opacity-100 backdrop-blur-md active:scale-90"
                    aria-label="Scroll left"
                >
                    <span className="material-symbols-outlined text-lg">chevron_left</span>
                </button>

                {/* Right navigation arrow */}
                <button 
                    onClick={() => scroll("right")}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-50 bg-black/60 border border-white/10 hover:bg-primary-container hover:text-on-primary-container text-white w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-sm opacity-0 group-hover/nav:opacity-100 backdrop-blur-md active:scale-90"
                    aria-label="Scroll right"
                >
                    <span className="material-symbols-outlined text-lg">chevron_right</span>
                </button>

                <div 
                    ref={scrollContainerRef}
                    className="flex w-full overflow-x-auto gap-sm py-4 scroll-smooth custom-scrollbar no-scrollbar"
                >
                <Link 
                    href="/" 
                    className={`shrink-0 whitespace-nowrap px-6 py-2 rounded-full text-label-md transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                        !activeGenre 
                            ? "bg-primary-container text-on-primary-container font-bold shadow-sm shadow-primary/5" 
                            : "bg-surface-container/60 backdrop-blur-xl border border-white/10 text-on-surface font-semibold hover:bg-primary/20"
                    }`}
                >
                    All Movies
                </Link>

                {/* Dynamic Genre Chips from TMDB */}
                {data?.genres?.map((genre) => {
                    const isActive = activeGenre === String(genre.id);
                    return (
                        <Link 
                            key={genre.id}
                            href={`/genre/${genre.id}`} 
                            className={`shrink-0 whitespace-nowrap px-6 py-2 rounded-full text-label-md transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                                isActive 
                                    ? "bg-primary-container text-on-primary-container font-bold shadow-sm shadow-primary/5" 
                                    : "bg-surface-container/60 backdrop-blur-xl border border-white/10 text-on-surface font-semibold hover:bg-primary/20"
                            }`}
                        >
                            {genre.name}
                        </Link>
                    );
                })}
                
                {/* Right-side spacer to prevent clipping on scroll end */}
                <div className="w-12 shrink-0 h-1" />
            </div>
            </div>
        </section>
    );
}