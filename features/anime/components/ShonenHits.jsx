"use client"
import { useRef } from "react";
import Link from "next/link";

export default function ShonenHits({ animeData }) {
    const scrollContainerRef = useRef(null);

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

    const items = animeData?.data || [];
    const shonenItems = items.filter(item => {
        const genres = item.node.genres || [];
        return genres.some(g => {
            const name = g.name.toLowerCase();
            return name.includes("shounen") || name.includes("shonen");
        });
    });

    if (shonenItems.length === 0) return null;

    return (
        <section className="mt-lg px-gutter md:px-lg max-w-container-max mx-auto w-full space-y-md py-8">
            {/* Component Title with Left Accent Indicator */}
            <div className="flex justify-between items-end border-l-4 border-primary-container pl-4 mb-6">
                <h2 className="font-headline-md text-headline-md text-on-surface uppercase font-bold tracking-tight">
                    Shonen Hits
                </h2>
            </div>

            <div className="relative group/nav">
                {/* Left Navigation Arrow */}
                <button 
                    onClick={() => scroll("left")}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-50 bg-black/60 border border-white/10 hover:bg-primary-container hover:text-on-primary-container text-white w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md opacity-0 group-hover/nav:opacity-100 backdrop-blur-md active:scale-90"
                    aria-label="Scroll left"
                >
                    <span className="material-symbols-outlined text-xl">chevron_left</span>
                </button>

                {/* Right Navigation Arrow */}
                <button 
                    onClick={() => scroll("right")}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-50 bg-black/60 border border-white/10 hover:bg-primary-container hover:text-on-primary-container text-white w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md opacity-0 group-hover/nav:opacity-100 backdrop-blur-md active:scale-90"
                    aria-label="Scroll right"
                >
                    <span className="material-symbols-outlined text-xl">chevron_right</span>
                </button>

                {/* Horizontal scroll container */}
                <div 
                    ref={scrollContainerRef}
                    className="flex space-x-6 overflow-x-auto pb-6 custom-scrollbar no-scrollbar scroll-smooth snap-x"
                >
                    {shonenItems.map((item) => {
                        const anime = item.node;
                        return (
                            <Link 
                                href={`/anime/details/${anime.id}`}
                                key={anime.id} 
                                className="flex-none w-[200px] md:w-[240px] flex flex-col space-y-2 group cursor-pointer snap-start block"
                            >
                                <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-md border border-white/5 bg-surface-container-low transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(0,209,255,0.3)]">
                                    <img 
                                        className="w-full h-full object-cover" 
                                        src={anime.main_picture?.large || anime.main_picture?.medium} 
                                        alt={anime.title}
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                                        <span className="bg-primary-container/90 text-on-primary-container text-xs font-bold py-2 px-4 rounded-full shadow-lg">
                                            QUICK PREVIEW
                                        </span>
                                    </div>
                                </div>
                                <h3 className="font-label-md text-label-md text-on-surface mt-2 group-hover:text-primary transition-colors truncate font-semibold">
                                    {anime.title}
                                </h3>
                            </Link>
                        );
                    })}

                    {/* Spacer to prevent scroll end trimming */}
                    <div className="w-12 shrink-0 h-1" />
                </div>
            </div>
        </section>
    );
}