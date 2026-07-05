import SeriesDetail from "@/features/series/components/SeriesDetail";

export default async function SeriesDetails({params}){
    let data = null;
    const { id } = await params;
    
    const headers = {
        accept: "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_ACCESS_TOKEN || process.env.ACCESS_TOKEN}`
    };

    // 1. Try to fetch with all appends (credits, videos, similar)
    try {
        console.log(`[TMDB] Fetching series details for ID: ${id} with full appends...`);
        const res = await fetch(`${process.env.NEXT_PUBLIC_TMDB_BASE_URL || "https://api.tmdb.org"}/3/tv/${id}?append_to_response=credits,videos,similar`, {
            headers,
            next: { revalidate: 86400 }
        });
        
        if (res.ok) {
            data = await res.json();
            console.log(`[TMDB] Successfully fetched series ID: ${id} with full appends.`);
        } else {
            console.warn(`[TMDB] Full append fetch failed with status ${res.status}. Retrying with credits only...`);
            
            // 2. Retry with credits only if full fetch failed (e.g. videos/similar microservice down)
            const fallbackRes = await fetch(`${process.env.NEXT_PUBLIC_TMDB_BASE_URL || "https://api.tmdb.org"}/3/tv/${id}?append_to_response=credits`, {
                headers,
                next: { revalidate: 86400 }
            });
            
            if (fallbackRes.ok) {
                data = await fallbackRes.json();
                console.log(`[TMDB] Successfully fetched series ID: ${id} with credits only.`);
            } else {
                console.warn(`[TMDB] Credits-only fetch failed with status ${fallbackRes.status}. Retrying basic details...`);
                
                // 3. Retry basic details only
                const basicRes = await fetch(`${process.env.NEXT_PUBLIC_TMDB_BASE_URL || "https://api.tmdb.org"}/3/tv/${id}`, {
                    headers,
                    next: { revalidate: 86400 }
                });
                
                if (basicRes.ok) {
                    data = await basicRes.json();
                    console.log(`[TMDB] Successfully fetched basic details for series ID: ${id}.`);
                } else {
                    console.error(`[TMDB] All fetches failed for series ID: ${id}. Status: ${basicRes.status}`);
                }
            }
        }
    } catch (error) {
        console.error("Error fetching series details:", error);
        
        // Final catch fallback if the network/fetch call itself threw an exception
        try {
            console.log(`[TMDB] Attempting emergency basic fetch for series ID: ${id} after error...`);
            const emergencyRes = await fetch(`${process.env.NEXT_PUBLIC_TMDB_BASE_URL || "https://api.tmdb.org"}/3/tv/${id}`, {
                headers,
                next: { revalidate: 86400 }
            });
            if (emergencyRes.ok) {
                data = await emergencyRes.json();
            }
        } catch (emergencyErr) {
            console.error("[TMDB] Emergency basic fetch failed:", emergencyErr);
            data = null;
        }
    }
    
    return (
        <SeriesDetail data={data}/>
    )
}
