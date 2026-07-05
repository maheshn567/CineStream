

"use client"
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

export default function SeriesHeroClousre({data}){
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
                            <Link href={`/series/detail/${movie.id}`} className="absolute inset-0 cursor-pointer z-0">
                                <Image 
                                    className="object-cover object-top" 
                                    fill 
                                    src={backdropUrl} 
                                    alt={movie.title || movie.name || "Movie Backdrop"}
                                    sizes="100vw"
                                    priority
                                />
                            </Link>

                            {/* Cinematic Overlay */}
                            <div 
                                className="absolute inset-0 z-10 pointer-events-none" 
                                style={{ 
                                    background: "linear-gradient(to top, #121414 0%, rgba(18, 20, 20, 0.4) 50%, rgba(18, 20, 20, 0.1) 100%)" 
                                }}
                            />

                            {/* Content Overlays */}
                            <div className="absolute inset-x-0 bottom-0 z-20 max-w-container-max mx-auto px-lg md:px-xl pb-24 md:pb-32 flex items-end h-full pointer-events-none">
                                <div className="space-y-sm max-w-3xl pointer-events-auto">
                                    {/* Trending Badge */}
                                    <div className="inline-flex items-center space-x-2 bg-surface/30 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                                        <span className="material-symbols-outlined text-primary text-sm">trending_up</span>
                                        <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest">
                                            Trending Now
                                        </span>
                                    </div>

                                    {/* Movie Title */}
                                    <Link href={`/series/detail/${movie.id}`} className="block">
                                        <h1 className="font-display-lg text-3xl sm:text-4xl md:text-5xl lg:text-display-lg text-on-surface drop-shadow-lg uppercase leading-tight font-bold hover:text-primary transition-colors cursor-pointer">
                                            {movie.title || movie.name}
                                        </h1>
                                    </Link>

                                    {/* Movie Overview */}
                                    <p className="font-body-lg text-body-lg text-on-surface-variant drop-shadow-md line-clamp-3 text-sm md:text-base max-w-2xl font-light">
                                        {movie.overview}
                                    </p>

                                    {/* Actions */}
                                    <div className="flex space-x-4 pt-4">
                                        <Link href={`/series/${movie.id}/season/1/episode/1`} className="bg-primary-container text-on-primary-container font-label-md text-label-md px-8 py-4 rounded-xl flex items-center space-x-2 hover:opacity-90 transition-all shadow-[0_0_4px_rgba(0,209,255,0.1)] hover:shadow-[0_0_12px_rgba(0,209,255,0.25)] cursor-pointer">
                                            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                                                play_arrow
                                            </span>
                                            <span>Watch Now</span>
                                        </Link>
                                        
                                        <Link href={`/series/detail/${movie.id}`} className="bg-surface-container-high/50 backdrop-blur-md text-on-surface font-label-md text-label-md px-8 py-4 rounded-xl flex items-center space-x-2 hover:bg-surface-container-highest transition-colors border border-white/10 cursor-pointer">
                                            <span className="material-symbols-outlined">info</span>
                                            <span>More Info</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>
                    );
                })}
            </Swiper>
        </section>
    )
}