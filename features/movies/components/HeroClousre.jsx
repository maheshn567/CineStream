"use client"
import { useQuery } from "@tanstack/react-query"
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, Pagination, Navigation } from "swiper/modules"
import "swiper/css"
import "swiper/css/pagination";
import "swiper/css/navigation"
import Link from "next/link";

export default function HeroClousre(){
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

    const { data, isLoading, error } = useQuery({
        queryKey: ["hero"],
        queryFn: () => {
            return fetch(`${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/3/trending/movie/day`, {
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

    if (isLoading) {
        return (
            <div className="min-h-[500px] flex items-center justify-center text-white bg-surface">
                <p className="text-xl font-medium animate-pulse">Loading cinematic experience...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[300px] flex items-center justify-center text-red-500 bg-surface">
                <p className="text-lg">Error: {error.message}</p>
            </div>
        );
    }

    return (
        <section className="relative overflow-hidden w-full h-[600px] md:h-[750px] bg-black font-montserrat">
            <Swiper
                spaceBetween={0}
                centeredSlides={true}
                autoplay={{
                    delay: 6000,
                    disableOnInteraction: false,
                }}
                pagination={{
                    clickable: true,
                    bulletActiveClass: 'swiper-pagination-bullet-active !bg-primary-container !w-8 !rounded-full',
                }}
                navigation={true}
                modules={[Autoplay, Pagination, Navigation]}
                className="w-full h-full"
            >
                {data?.results?.slice(0, 5).map((movie) => {
                    const backdropUrl = `https://image.tmdb.org/t/p/original${movie.backdrop_path}`;
                    return (
                        <SwiperSlide key={movie.id} className="relative w-full h-full">
                            {/* Slide Background Image */}
                            <div className="absolute inset-0">
                                <Image 
                                    className="object-cover object-top" 
                                    fill 
                                    src={backdropUrl} 
                                    alt={movie.title || movie.name || "Movie Backdrop"}
                                    sizes="100vw"
                                    priority
                                />
                            </div>

                            {/* Cinematic Overlay */}
                            <div 
                                className="absolute inset-0 z-10" 
                                style={{ 
                                    background: "linear-gradient(to top, #121414 0%, rgba(18, 20, 20, 0.4) 50%, rgba(18, 20, 20, 0.1) 100%)" 
                                }}
                            />

                            {/* Content Overlays */}
                            <div className="absolute inset-x-0 bottom-0 z-20 max-w-container-max mx-auto px-lg md:px-xl pb-24 md:pb-32 flex items-end h-full">
                                <div className="space-y-sm max-w-3xl">
                                    {/* Trending Badge */}
                                    <div className="inline-flex items-center space-x-2 bg-surface/30 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                                        <span className="material-symbols-outlined text-primary text-sm">trending_up</span>
                                        <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest">
                                            Trending Now
                                        </span>
                                    </div>

                                    {/* Movie Title */}
                                    <h1 className="font-display-lg text-3xl sm:text-4xl md:text-5xl lg:text-display-lg text-on-surface drop-shadow-lg uppercase leading-tight font-bold">
                                        {movie.title || movie.name}
                                    </h1>

                                    {/* Movie Overview */}
                                    <p className="font-body-lg text-body-lg text-on-surface-variant drop-shadow-md line-clamp-3 text-sm md:text-base max-w-2xl font-light">
                                        {movie.overview}
                                    </p>

                                    {/* Actions */}
                                    <div className="flex space-x-4 pt-4">
                                        <Link href={`/movie/${movie.id}`} className="bg-primary-container text-on-primary-container font-label-md text-label-md px-8 py-4 rounded-xl flex items-center space-x-2 hover:opacity-90 transition-all shadow-[0_0_4px_rgba(0,209,255,0.1)] hover:shadow-[0_0_12px_rgba(0,209,255,0.25)] cursor-pointer">
                                            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                                                play_arrow
                                            </span>
                                            <span>Watch Now</span>
                                        </Link>
                                        
                                        <Link href={`/movie/details/${movie.id}`} className="bg-surface-container-high/50 backdrop-blur-md text-on-surface font-label-md text-label-md px-8 py-4 rounded-xl flex items-center space-x-2 hover:bg-surface-container-highest transition-colors border border-white/10 cursor-pointer">
                                            <span className="material-symbols-outlined">info</span>
                                            <span>More Info</span>
                                        </Link>

                                        <button 
                                            onClick={() => handleAddToWatchlist(movie.id, "movie", movie.title || movie.name)}
                                            className="bg-white/10 backdrop-blur-md text-white font-label-md text-label-md px-8 py-4 rounded-xl flex items-center space-x-2 hover:bg-white/20 transition-all border border-white/10 cursor-pointer"
                                        >
                                            <span className="material-symbols-outlined">add</span>
                                            <span>Add to List</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>
                    );
                })}
            </Swiper>
        </section>
    );
}
