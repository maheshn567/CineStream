import AnimeDetailsPage from "@/features/anime/components/AnimeDetailsPage"

export default async function AnimeDetailPages({ params }) {
    const { id } = await params;
    let data = null;
    
    try {
        // Fetch detailed anime metadata from MyAnimeList (using process.env.CILENTID)
        const fields = "id,title,main_picture,start_date,end_date,mean,rank,popularity,num_episodes,synopsis,rating,genres,studios,alternative_titles,opening_themes,ending_themes,average_episode_duration,media_type,trailer,recommendations{node{id,title,main_picture,mean,start_date,genres}}";
        const res = await fetch(`https://api.myanimelist.net/v2/anime/${id}?fields=${fields}`, {
            headers: {
                "X-MAL-CLIENT-ID": process.env.CILENTID || "",
            }
        });
        
        if (res.ok) {
            data = await res.json();
            
            // Fetch AniList ID using MAL ID
            data.anilist_id = null;
            try {
                const query = `
                    query ($id: Int) {
                        Media (idMal: $id, type: ANIME) {
                            id
                        }
                    }
                `;
                const variables = { id: parseInt(id) };
                const aniRes = await fetch('https://graphql.anilist.co', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify({ query, variables }),
                });
                if (aniRes.ok) {
                    const aniData = await aniRes.json();
                    if (aniData.data?.Media?.id) {
                        data.anilist_id = aniData.data.Media.id;
                    }
                }
            } catch (aniErr) {
                // AniList mapping failed silently
            }
            
            // Search TMDB in parallel to fetch a widescreen backdrop image and video key
            try {
                const searchQuery = data.alternative_titles?.en || data.title;
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
                    if (match) {
                        data.tmdb_id = match.id;
                        data.tmdb_media_type = match.media_type;
                        if (match.backdrop_path) {
                            data.tmdb_backdrop_url = `https://image.tmdb.org/t/p/original${match.backdrop_path}`;
                        }
                        
                        // Query full TV details to get seasons lists if it's a TV show
                        if (match.media_type === 'tv') {
                            try {
                                const tvRes = await fetch(
                                    `https://api.tmdb.org/3/tv/${match.id}?language=en-US`,
                                    {
                                        headers: {
                                            accept: 'application/json',
                                            Authorization: `Bearer ${process.env.ACCESS_TOKEN}`
                                        }
                                    }
                                );
                                if (tvRes.ok) {
                                    const tvDetails = await tvRes.json();
                                    data.seasons = tvDetails.seasons || [];
                                    data.number_of_seasons = tvDetails.number_of_seasons || 0;
                                    data.tmdb_number_of_episodes = tvDetails.number_of_episodes || 0;
                                }
                            } catch (tvErr) {
                                console.error("Failed to fetch TMDB tv details:", tvErr);
                            }
                        }
                        
                        // Query TMDB videos for trailer key
                        try {
                            const videoRes = await fetch(
                                `https://api.tmdb.org/3/${match.media_type}/${match.id}/videos?language=en-US`,
                                {
                                    headers: {
                                        accept: 'application/json',
                                        Authorization: `Bearer ${process.env.ACCESS_TOKEN}`
                                    }
                                }
                            );
                            if (videoRes.ok) {
                                const videoData = await videoRes.json();
                                const trailer = videoData.results?.find(
                                    (v) => v.type === "Trailer" && v.site === "YouTube"
                                ) || videoData.results?.find((v) => v.site === "YouTube");
                                if (trailer && trailer.key) {
                                    data.tmdb_trailer_key = trailer.key;
                                }
                            }
                        } catch (videoErr) {
                            console.error("Failed to fetch TMDB videos:", videoErr);
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to enrich anime backdrop from TMDB:", err);
            }
        } else {
            console.error("MAL API fetch failed status:", res.status);
        }
    } catch (error) {
        console.error("Error fetching anime details:", error);
    }
    
    return (
        <AnimeDetailsPage data={data} />
    );
}