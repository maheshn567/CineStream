import TvShowsHeroClousre from "@/features/tvshows/components/TvShows";

export default async function Page() {
    let trendingData = [];
    let popularData = [];
    let topRatedData = [];

    const headers = {
        accept: 'application/json',
        Authorization: `Bearer ${process.env.ACCESS_TOKEN || process.env.NEXT_PUBLIC_ACCESS_TOKEN || ""}`
    };

    const baseUrl = process.env.TMDB_BASE_URL || process.env.NEXT_PUBLIC_TMDB_BASE_URL || "https://api.tmdb.org";

    try {
        const [trendingRes, popularRes, topRatedRes] = await Promise.all([
            fetch(`${baseUrl}/3/trending/tv/week?language=en-US`, { headers, next: { revalidate: 86400 } }),
            fetch(`${baseUrl}/3/tv/popular?language=en-US&page=1`, { headers, next: { revalidate: 86400 } }),
            fetch(`${baseUrl}/3/tv/top_rated?language=en-US&page=1`, { headers, next: { revalidate: 86400 } })
        ]);

        if (trendingRes.ok) {
            const json = await trendingRes.json();
            trendingData = json.results || [];
        }
        if (popularRes.ok) {
            const json = await popularRes.json();
            popularData = json.results || [];
        }
        if (topRatedRes.ok) {
            const json = await topRatedRes.json();
            topRatedData = json.results || [];
        }
    } catch (error) {
        console.error("[TMDB] Error fetching TV shows data:", error);
    }

    return (
        <div>
            <TvShowsHeroClousre
                trending={trendingData}
                popular={popularData}
                topRated={topRatedData}
            />
        </div>
    );
}