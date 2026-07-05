import DetailPage from "@/features/movies/components/Detail.page";

export default async function DetailPages({ params }) {
    const { id } = await params;
    let movieData = null;

    const headers = {
        accept: 'application/json',
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_ACCESS_TOKEN || process.env.ACCESS_TOKEN}`
    };

    // 1. Try to fetch with all appends (credits, videos, similar)
    try {
        console.log(`[TMDB] Fetching movie details for ID: ${id} with full appends...`);
        const res = await fetch(`${process.env.NEXT_PUBLIC_TMDB_BASE_URL || "https://api.tmdb.org"}/3/movie/${id}?append_to_response=credits,videos,similar`, {
            headers,
            next: { revalidate: 86400 } // Cache server-side fetch for 24 hours
        });

        if (res.ok) {
            movieData = await res.json();
            console.log(`[TMDB] Successfully fetched movie ID: ${id} with full appends.`);
        } else {
            console.warn(`[TMDB] Full append movie fetch failed with status ${res.status}. Retrying with credits only...`);
            
            // 2. Retry with credits only if full fetch failed (e.g. videos/similar microservice down)
            const fallbackRes = await fetch(`${process.env.NEXT_PUBLIC_TMDB_BASE_URL || "https://api.tmdb.org"}/3/movie/${id}?append_to_response=credits`, {
                headers,
                next: { revalidate: 86400 }
            });
            
            if (fallbackRes.ok) {
                movieData = await fallbackRes.json();
                console.log(`[TMDB] Successfully fetched movie ID: ${id} with credits only.`);
            } else {
                console.warn(`[TMDB] Credits-only movie fetch failed with status ${fallbackRes.status}. Retrying basic details...`);
                
                // 3. Retry basic details only
                const basicRes = await fetch(`${process.env.NEXT_PUBLIC_TMDB_BASE_URL || "https://api.tmdb.org"}/3/movie/${id}`, {
                    headers,
                    next: { revalidate: 86400 }
                });
                
                if (basicRes.ok) {
                    movieData = await basicRes.json();
                    console.log(`[TMDB] Successfully fetched basic details for movie ID: ${id}.`);
                } else {
                    console.error(`[TMDB] All fetches failed for movie ID: ${id}. Status: ${basicRes.status}`);
                    movieData = null;
                }
            }
        }
    } catch (error) {
        console.error("Error fetching movie details:", error);
        
        // Emergency basic fetch fallback
        try {
            console.log(`[TMDB] Attempting emergency basic fetch for movie ID: ${id} after error...`);
            const emergencyRes = await fetch(`${process.env.NEXT_PUBLIC_TMDB_BASE_URL || "https://api.tmdb.org"}/3/movie/${id}`, {
                headers,
                next: { revalidate: 86400 }
            });
            if (emergencyRes.ok) {
                movieData = await emergencyRes.json();
            }
        } catch (emergencyErr) {
            console.error("[TMDB] Emergency basic fetch failed:", emergencyErr);
            movieData = null;
        }
    }

    return (
        <DetailPage movie={movieData} />
    );
}