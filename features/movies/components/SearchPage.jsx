"use client"
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function SearchPage({ data, query }){
    const [selectedGenre, setSelectedGenre] = useState(null);
    const [releaseYear, setReleaseYear] = useState(1990);
    const [minRating, setMinRating] = useState(0);
    const [contentType, setContentType] = useState("all");
    const [sortBy, setSortBy] = useState("relevance");
    
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);

    const genres = [
        { id: 878, name: "Sci-Fi" },
        { id: 28, name: "Action" },
        { id: 18, name: "Drama" },
        { id: 53, name: "Thriller" },
        { id: 12, name: "Adventure" },
        { id: 9648, name: "Mystery" }
    ];

    const activeFiltersCount = 
        (selectedGenre ? 1 : 0) + 
        (releaseYear > 1990 ? 1 : 0) + 
        (minRating > 0 ? 1 : 0) + 
        (contentType !== "all" ? 1 : 0);

    const resetFilters = () => {
        setSelectedGenre(null);
        setReleaseYear(1990);
        setMinRating(0);
        setContentType("all");
        setSortBy("relevance");
    };

    const filteredResults = (data?.results || [])
        .filter(item => item.media_type !== "person")
        .filter(item => {
            const isMovie = item.media_type === "movie" || !!item.title;
            const isTV = item.media_type === "tv" || !!item.name;

            // Genre filter
            if (selectedGenre) {
                if (!item.genre_ids) return false;
                
                // Map movie genres to TV genres:
                // - Action (28) -> Action & Adventure (10759)
                // - Adventure (12) -> Action & Adventure (10759)
                // - Sci-Fi (878) -> Sci-Fi & Fantasy (10765)
                let matched = item.genre_ids.includes(selectedGenre);
                if (!matched) {
                    if (selectedGenre === 28 && item.genre_ids.includes(10759)) matched = true;
                    else if (selectedGenre === 12 && item.genre_ids.includes(10759)) matched = true;
                    else if (selectedGenre === 878 && item.genre_ids.includes(10765)) matched = true;
                }
                if (!matched) return false;
            }

            // Release year filter
            if (releaseYear > 1990) {
                const dateStr = isMovie ? item.release_date : item.first_air_date;
                const itemYear = dateStr ? new Date(dateStr).getFullYear() : null;
                if (!itemYear || itemYear < releaseYear) {
                    return false;
                }
            }

            // Rating filter
            if (minRating > 0) {
                if (item.vote_average < minRating) {
                    return false;
                }
            }

            // Content Type filter
            if (contentType === "movie") {
                if (!isMovie) return false;
            } else if (contentType === "series") {
                if (!isTV) return false;
            }

            return true;
        });

    const sortedResults = [...filteredResults].sort((a, b) => {
        if (sortBy === "rating") {
            return b.vote_average - a.vote_average;
        }
        if (sortBy === "release_date") {
            const dateA = new Date(a.release_date || a.first_air_date || 0).getTime();
            const dateB = new Date(b.release_date || b.first_air_date || 0).getTime();
            return dateB - dateA;
        }
        return 0;
    });

    return (
        <main className="flex-grow max-w-container-max mx-auto w-full px-4 md:px-12 py-6 pt-24 flex flex-col gap-6 bg-surface text-on-surface min-h-screen">
            {/* Advanced Filters Toolbar */}
            <section className="w-full space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                            className="flex items-center gap-2 bg-primary-container/20 text-primary border border-primary/50 px-4 py-2 rounded-full text-label-md font-semibold hover:bg-primary-container/30 transition-all cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-lg">filter_list</span>
                            Filters
                            {activeFiltersCount > 0 && (
                                <span className="bg-primary text-on-primary w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold">
                                    {activeFiltersCount}
                                </span>
                            )}
                        </button>
                        
                        <div className="h-6 w-px bg-white/10"></div>
                        
                        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1 flex-1">
                            {genres.map((genre) => {
                                const isActive = selectedGenre === genre.id;
                                return (
                                    <button
                                        key={genre.id}
                                        onClick={() => setSelectedGenre(isActive ? null : genre.id)}
                                        className={`px-4 py-1.5 rounded-full text-label-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                                            isActive
                                                ? "bg-primary text-on-primary font-bold shadow-md shadow-primary/25"
                                                : "bg-surface-container-highest text-on-surface hover:bg-surface-bright"
                                        }`}
                                    >
                                        {genre.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    
                    {/* Sort By Dropdown */}
                    <div className="relative">
                        <button 
                            onClick={() => setIsSortOpen(!isSortOpen)}
                            className="text-label-md font-semibold text-on-surface-variant flex items-center gap-2 cursor-pointer hover:text-on-surface bg-transparent border-none focus:outline-none"
                        >
                            Sort by: {sortBy === "relevance" ? "Relevance" : sortBy === "rating" ? "Rating" : "Release Date"} 
                            <span className="material-symbols-outlined text-sm">expand_more</span>
                        </button>
                        {isSortOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsSortOpen(false)}></div>
                                <div className="absolute right-0 mt-2 w-48 bg-surface-container-high rounded-xl shadow-xl border border-white/10 py-2 z-20">
                                    <button
                                        onClick={() => { setSortBy("relevance"); setIsSortOpen(false); }}
                                        className={`w-full text-left px-4 py-2 text-label-sm transition-colors hover:bg-white/5 ${sortBy === "relevance" ? "text-primary font-bold" : "text-on-surface"}`}
                                    >
                                        Relevance
                                    </button>
                                    <button
                                        onClick={() => { setSortBy("rating"); setIsSortOpen(false); }}
                                        className={`w-full text-left px-4 py-2 text-label-sm transition-colors hover:bg-white/5 ${sortBy === "rating" ? "text-primary font-bold" : "text-on-surface"}`}
                                    >
                                        Rating (High to Low)
                                    </button>
                                    <button
                                        onClick={() => { setSortBy("release_date"); setIsSortOpen(false); }}
                                        className={`w-full text-left px-4 py-2 text-label-sm transition-colors hover:bg-white/5 ${sortBy === "release_date" ? "text-primary font-bold" : "text-on-surface"}`}
                                    >
                                        Release Date (Newest)
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Collapsible Filters Panel */}
                {isFiltersOpen && (
                    <div className="glass-panel rounded-2xl p-6 grid grid-cols-1 md:grid-cols-3 gap-8 transition-all duration-300 ease-in-out border border-white/10 bg-white/5 backdrop-blur-xl animate-fade-in">
                        {/* Release Year */}
                        <div>
                            <h3 className="text-label-md font-semibold text-on-surface-variant mb-4 uppercase tracking-wider">Release Year</h3>
                            <input 
                                type="range" 
                                min="1990" 
                                max="2026" 
                                value={releaseYear} 
                                onChange={(e) => setReleaseYear(Number(e.target.value))}
                                className="w-full accent-primary bg-surface-container-highest h-1.5 rounded-lg appearance-none cursor-pointer mb-2"
                            />
                            <div className="flex justify-between text-label-sm font-medium text-on-surface-variant">
                                <span>1990</span>
                                <span className="text-primary font-bold">{releaseYear}</span>
                                <span>2026</span>
                            </div>
                        </div>
                        
                        {/* Minimum Rating */}
                        <div>
                            <h3 className="text-label-md font-semibold text-on-surface-variant mb-4 uppercase tracking-wider">Minimum Rating</h3>
                            <input 
                                type="range" 
                                min="0" 
                                max="10" 
                                step="0.5" 
                                value={minRating} 
                                onChange={(e) => setMinRating(Number(e.target.value))}
                                className="w-full accent-primary bg-surface-container-highest h-1.5 rounded-lg appearance-none cursor-pointer mb-2"
                            />
                            <div className="flex justify-between text-label-sm font-medium text-on-surface-variant">
                                <span>0</span>
                                <span className="text-primary font-bold">{minRating.toFixed(1)}+</span>
                                <span>10</span>
                            </div>
                        </div>

                        {/* Content Type */}
                        <div>
                            <h3 className="text-label-md font-semibold text-on-surface-variant mb-4 uppercase tracking-wider">Content Type</h3>
                            <div className="flex bg-surface-container-highest p-1 rounded-xl">
                                <button 
                                    onClick={() => setContentType("all")}
                                    className={`flex-1 py-2 rounded-lg text-label-sm font-semibold transition-all ${contentType === "all" ? "bg-surface-bright shadow-sm text-primary" : "text-on-surface-variant hover:text-on-surface"}`}
                                >
                                    All
                                </button>
                                <button 
                                    onClick={() => setContentType("movie")}
                                    className={`flex-1 py-2 rounded-lg text-label-sm font-semibold transition-all ${contentType === "movie" ? "bg-surface-bright shadow-sm text-primary" : "text-on-surface-variant hover:text-on-surface"}`}
                                >
                                    Movies
                                </button>
                                <button 
                                    onClick={() => setContentType("series")}
                                    className={`flex-1 py-2 rounded-lg text-label-sm font-semibold transition-all ${contentType === "series" ? "bg-surface-bright shadow-sm text-primary" : "text-on-surface-variant hover:text-on-surface"}`}
                                >
                                    Series
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </section>

            {/* Search Results Grid */}
            <div className="flex-grow">
                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-4">
                    <div>
                        <h1 className="text-headline-lg font-bold text-on-surface hidden md:block">Search Results</h1>
                        <h1 className="text-headline-lg-mobile font-bold text-on-surface md:hidden">Search Results</h1>
                        <p className="text-body-lg text-on-surface-variant mt-1">
                            Showing {sortedResults.length} {sortedResults.length === 1 ? 'result' : 'results'} for "<span className="text-primary font-semibold">{query || 'your search'}</span>"
                        </p>
                    </div>
                </div>

                {sortedResults.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-4 py-12">
                        <span className="text-4xl">🔍</span>
                        <p className="text-lg font-bold text-on-surface">No results match your filters</p>
                        <p className="text-sm text-on-surface-variant">Try adjusting your filters or resetting them.</p>
                        <button 
                            onClick={resetFilters}
                            className="mt-2 bg-primary text-on-primary font-bold px-6 py-2.5 rounded-full text-label-md hover:brightness-110 transition-all cursor-pointer"
                        >
                            Reset Filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {sortedResults.map((item) => {
                            const isTV = item.media_type === "tv" || !item.title;
                            const title = item.title || item.name || "Untitled";
                            const releaseDateStr = item.release_date || item.first_air_date;
                            const releaseYearVal = releaseDateStr ? new Date(releaseDateStr).getFullYear() : 'Unknown';
                            const detailsUrl = isTV ? `/series/detail/${item.id}` : `/movie/details/${item.id}`;

                            return (
                                <div key={item.id} className="group relative aspect-[2/3] overflow-hidden rounded-lg border border-white/5 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
                                    <Image
                                        src={item.poster_path ? `https://image.tmdb.org/t/p/w300${item.poster_path}` : '/placeholder-image.jpg'}
                                        alt={title}
                                        fill
                                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                                        unoptimized={true}
                                    />

                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                                        <h3 className="text-white text-lg font-bold line-clamp-1 mb-1">{title}</h3>

                                        <div className="flex items-center gap-2 mb-4 text-xs text-on-surface-variant">
                                            <span>{releaseYearVal}</span>
                                            <span className="w-1 h-1 rounded-full bg-on-surface-variant"></span>
                                            <div className="flex items-center gap-1 text-yellow-500">
                                                <span>⭐</span>
                                                <span className="text-on-surface font-semibold">{item.vote_average ? item.vote_average.toFixed(1) : '0.0'}</span>
                                            </div>
                                            <span className="w-1 h-1 rounded-full bg-on-surface-variant"></span>
                                            <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                                                {isTV ? 'TV' : 'Movie'}
                                            </span>
                                        </div>

                                        <Link
                                            href={detailsUrl}
                                            className="text-center text-sm font-bold bg-primary text-on-primary py-2.5 rounded-lg hover:brightness-110 transition-all duration-200"
                                        >
                                            See Details
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}
    