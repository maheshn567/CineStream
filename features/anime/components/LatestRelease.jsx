"use client"
import Link from "next/link";

export default function LatestRelease({ latestData }) {
    const items = latestData?.data || [];

    if (items.length === 0) return null;

    return (
        <section className="mt-lg px-gutter md:px-lg max-w-container-max mx-auto w-full space-y-md py-8">
            {/* Component Title with Left Accent Indicator */}
            <div className="flex justify-between items-end border-l-4 border-primary-container pl-4 mb-6">
                <h2 className="font-headline-md text-headline-md text-on-surface uppercase font-bold tracking-tight">
                    Latest Releases
                </h2>
                <button className="text-primary text-label-md hover:underline cursor-pointer transition-all bg-transparent border-none">
                    See All
                </button>
            </div>
            
            {/* Grid layout from reference design */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {items.map((item) => {
                    const anime = item.node;
                    const primaryGenre = anime.genres?.[0]?.name || "Anime";
                    return (
                        <Link 
                            href={`/anime/details/${anime.id}`}
                            key={anime.id} 
                            className="flex flex-col space-y-2 group cursor-pointer block"
                        >
                            {/* Card Wrapper with scaling and glow styling */}
                            <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-md border border-white/5 bg-surface-container-low transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(0,209,255,0.3)]">
                                <img 
                                    className="w-full h-full object-cover" 
                                    src={anime.main_picture?.large || anime.main_picture?.medium} 
                                    alt={anime.title}
                                    loading="lazy"
                                />
                                {/* Quick Preview Overlay */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                                    <span className="bg-primary-container/90 text-on-primary-container text-xs font-bold py-2 px-4 rounded-full shadow-lg">
                                        QUICK PREVIEW
                                    </span>
                                </div>
                            </div>
                            
                            {/* Title & Metadata */}
                            <h3 className="font-label-md text-label-md text-on-surface mt-2 group-hover:text-primary transition-colors truncate font-semibold">
                                {anime.title}
                            </h3>
                            
                            <div className="flex items-center text-[10px] text-on-surface-variant font-medium space-x-2">
                                <span>Airing Now</span>
                                <span>•</span>
                                <span>{primaryGenre}</span>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}