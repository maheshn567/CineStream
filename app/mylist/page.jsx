import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import WatchList from "@/features/watchlist/components/WatchList";

export const dynamic = "force-dynamic";

const GENRE_MAP = {
    28: "Action",
    12: "Adventure",
    16: "Animation",
    35: "Comedy",
    80: "Crime",
    99: "Documentary",
    18: "Drama",
    10751: "Family",
    14: "Fantasy",
    36: "History",
    27: "Horror",
    10402: "Music",
    9648: "Mystery",
    10749: "Romance",
    878: "Sci-Fi",
    10770: "TV Movie",
    53: "Thriller",
    10752: "War",
    37: "Western",
    10759: "Action & Adventure",
    10762: "Kids",
    10763: "News",
    10764: "Reality",
    10765: "Sci-Fi & Fantasy",
    10766: "Soap",
    10767: "Talk",
    10768: "War & Politics"
};

function formatGenres(genreIds) {
    if (!genreIds || !Array.isArray(genreIds)) return "Genre";
    return genreIds.map(id => GENRE_MAP[id]).filter(Boolean).slice(0, 2).join(" • ") || "Drama";
}

export default async function MyList() {
    let watchlistItems = [];
    let authenticatedUser = null;
    let recommendedItems = [];

    // Fetch real recommendations from TMDB
    try {
        const token = process.env.ACCESS_TOKEN || process.env.NEXT_PUBLIC_ACCESS_TOKEN;
        const baseUrl = process.env.NEXT_PUBLIC_TMDB_BASE_URL || "https://api.tmdb.org";
        
        const [movieRes, tvRes] = await Promise.all([
            fetch(`${baseUrl}/3/movie/popular?language=en-US&page=1`, {
                headers: {
                    accept: 'application/json',
                    Authorization: `Bearer ${token}`
                },
                cache: "no-store"
            }),
            fetch(`${baseUrl}/3/tv/popular?language=en-US&page=1`, {
                headers: {
                    accept: 'application/json',
                    Authorization: `Bearer ${token}`
                },
                cache: "no-store"
            })
        ]);

        let popularMovies = [];
        let popularTv = [];

        if (movieRes.ok) {
            const data = await movieRes.json();
            popularMovies = data.results || [];
        }
        if (tvRes.ok) {
            const data = await tvRes.json();
            popularTv = data.results || [];
        }

        const recommendedMovies = popularMovies.slice(0, 3).map(m => ({
            id: `rec-movie-${m.id}`,
            tmdb_id: m.id,
            title: m.title,
            img: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : "",
            rate: m.vote_average ? m.vote_average.toFixed(1) : "7.5",
            cat: formatGenres(m.genre_ids) || "Movie",
            year: (m.release_date || "").split("-")[0] || "2024",
            type: "movie"
        }));

        const recommendedTv = popularTv.slice(0, 2).map(t => ({
            id: `rec-tv-${t.id}`,
            tmdb_id: t.id,
            title: t.name,
            img: t.poster_path ? `https://image.tmdb.org/t/p/w500${t.poster_path}` : "",
            rate: t.vote_average ? t.vote_average.toFixed(1) : "7.5",
            cat: formatGenres(t.genre_ids) || "Series",
            year: (t.first_air_date || "").split("-")[0] || "2024",
            type: "tv"
        }));

        recommendedItems = [...recommendedMovies, ...recommendedTv];
    } catch (recErr) {
        console.error("Failed to fetch recommendations:", recErr);
    }

    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });
        
        if (session?.user) {
            authenticatedUser = session.user;
            
            // Fetch real watchlist from database
            const dbWatchlist = await db.userWatchList.findMany({
                where: { user_id: session.user.id }
            });

            if (dbWatchlist.length > 0) {
                // Fetch details from TMDB / MAL for database items
                const detailPromises = dbWatchlist.map(async (item) => {
                    try {
                        if (item.type === "movie") {
                            const res = await fetch(`${process.env.NEXT_PUBLIC_TMDB_BASE_URL || "https://api.tmdb.org"}/3/movie/${item.tmdb_id}`, {
                                headers: {
                                    accept: 'application/json',
                                    Authorization: `Bearer ${process.env.ACCESS_TOKEN || process.env.NEXT_PUBLIC_ACCESS_TOKEN}`
                                }
                            });
                            if (res.ok) {
                                const data = await res.json();
                                return {
                                    id: item.id,
                                    tmdb_id: item.tmdb_id,
                                    title: data.title,
                                    img: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : "",
                                    rate: data.vote_average ? data.vote_average.toFixed(1) : "7.5",
                                    cat: data.genres?.map(g => g.name).slice(0, 2).join(" • ") || "Movie",
                                    year: (data.release_date || "").split("-")[0] || "2024",
                                    type: "movie"
                                };
                            }
                        } else if (item.type === "tv" || item.type === "series") {
                            const res = await fetch(`${process.env.NEXT_PUBLIC_TMDB_BASE_URL || "https://api.tmdb.org"}/3/tv/${item.tmdb_id}`, {
                                headers: {
                                    accept: 'application/json',
                                    Authorization: `Bearer ${process.env.ACCESS_TOKEN || process.env.NEXT_PUBLIC_ACCESS_TOKEN}`
                                }
                            });
                            if (res.ok) {
                                const data = await res.json();
                                return {
                                    id: item.id,
                                    tmdb_id: item.tmdb_id,
                                    title: data.name,
                                    img: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : "",
                                    rate: data.vote_average ? data.vote_average.toFixed(1) : "7.5",
                                    cat: data.genres?.map(g => g.name).slice(0, 2).join(" • ") || "Series",
                                    year: (data.first_air_date || "").split("-")[0] || "2024",
                                    type: "tv"
                                };
                            }
                        } else if (item.type === "anime") {
                            const res = await fetch(`https://api.myanimelist.net/v2/anime/${item.tmdb_id}?fields=id,title,main_picture,mean,start_date,genres`, {
                                headers: {
                                    'X-MAL-CLIENT-ID': process.env.CILENTID || ''
                                }
                            });
                            if (res.ok) {
                                const data = await res.json();
                                return {
                                    id: item.id,
                                    tmdb_id: item.tmdb_id,
                                    title: data.title,
                                    img: data.main_picture?.large || data.main_picture?.medium || "",
                                    rate: data.mean ? data.mean.toFixed(1) : "7.5",
                                    cat: data.genres?.map(g => g.name).slice(0, 2).join(" • ") || "Anime",
                                    year: (data.start_date || "").split("-")[0] || "2024",
                                    type: "anime"
                                };
                            }
                        }
                    } catch (err) {
                        console.error(`Failed to fetch details for watchlist item ${item.tmdb_id}:`, err);
                    }
                    return null;
                });

                const details = await Promise.all(detailPromises);
                watchlistItems = details.filter(Boolean);
            }
        }
    } catch (err) {
        console.error("Session or DB error in MyList page:", err);
    }

    // Removed discover and mock fallbacks as the user watchlist should only contain explicitly saved content.

    return (
        <div className="min-h-screen bg-[#0F0F0F] pt-24 pb-12 font-montserrat text-on-surface">
            <WatchList data={watchlistItems} user={authenticatedUser} recommendations={recommendedItems} />
        </div>
    );
}