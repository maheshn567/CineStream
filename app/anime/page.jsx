import AnimeClosure from "@/features/anime/components/AnimeClousre"

export default async function AnimePage() {
    let rankingData = null;
    let latestData = null;
    let movieData = null;
    
    try {
        const malHeaders = {
            'X-MAL-CLIENT-ID': process.env.CILENTID || ''
        };
        
        // Fetch top rated rankings, currently airing (latest releases), and top movies in parallel
        const [rankingRes, latestRes, movieRes] = await Promise.all([
            fetch("https://api.myanimelist.net/v2/anime/ranking?limit=35&fields=id,title,main_picture,my_list_status,start_date,end_date,mean,rank,popularity,num_episodes,synopsis,average_episode_duration,rating,genres,studios,pictures,alternative_titles,related_anime,opening_theme,ending_theme", {
                headers: malHeaders,
                next: { revalidate: 86400 } // Cache for 24 hours
            }),
            fetch("https://api.myanimelist.net/v2/anime/ranking?ranking_type=airing&limit=12&fields=id,title,main_picture,my_list_status,start_date,end_date,mean,rank,popularity,num_episodes,synopsis,average_episode_duration,rating,genres,studios,pictures,alternative_titles,related_anime,opening_theme,ending_theme", {
                headers: malHeaders,
                next: { revalidate: 86400 } // Cache for 24 hours
            }),
            fetch("https://api.myanimelist.net/v2/anime/ranking?ranking_type=movie&limit=12&fields=id,title,main_picture,my_list_status,start_date,end_date,mean,rank,popularity,num_episodes,synopsis,average_episode_duration,rating,genres,studios,pictures,alternative_titles,related_anime,opening_theme,ending_theme", {
                headers: malHeaders,
                next: { revalidate: 86400 } // Cache for 24 hours
            })
        ]);
        
        if (rankingRes.ok) {
            rankingData = await rankingRes.json();
            
            // Query TMDB in parallel to fetch high-resolution backdrops for the top 5 slides
            if (rankingData?.data) {
                const enrichPromises = rankingData.data.slice(0, 5).map(async (item) => {
                    try {
                        const anime = item.node;
                        // Search TMDB by the English title or primary title
                        const searchQuery = anime.alternative_titles?.en || anime.title;
                        const tmdbRes = await fetch(
                            `https://api.tmdb.org/3/search/multi?query=${encodeURIComponent(searchQuery)}&language=en-US`,
                            {
                                headers: {
                                    accept: 'application/json',
                                    Authorization: `Bearer ${process.env.ACCESS_TOKEN}`
                                }
                            }
                        );
                        if (tmdbRes.ok) {
                            const tmdbData = await tmdbRes.json();
                            const match = tmdbData.results?.find(r => r.media_type === 'tv' || r.media_type === 'movie') || tmdbData.results?.[0];
                            if (match && match.backdrop_path) {
                                anime.tmdb_backdrop_url = `https://image.tmdb.org/t/p/original${match.backdrop_path}`;
                            }
                        }
                    } catch (err) {
                        console.error("Failed to enrich anime backdrop from TMDB:", err);
                    }
                });
                await Promise.all(enrichPromises);
            }
        } else {
            console.error("MAL API ranking fetch failed status:", rankingRes.status);
        }

        if (latestRes.ok) {
            latestData = await latestRes.json();
        } else {
            console.error("MAL API airing fetch failed status:", latestRes.status);
        }

        if (movieRes.ok) {
            movieData = await movieRes.json();
        } else {
            console.error("MAL API movie fetch failed status:", movieRes.status);
        }
    } catch (error) {
        console.error("Error fetching ranking data from MAL:", error);
    }

    return (
        <div className="min-h-screen w-full bg-surface pb-12 font-montserrat text-on-surface">
            <AnimeClosure animeData={rankingData} latestData={latestData} movieData={movieData} />
        </div>
    );
}
