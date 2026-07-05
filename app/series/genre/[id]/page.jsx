import SeriesHeroClousure from "@/features/series/components/SeriesHeroClousre";
import SeriesGenresNav from "@/features/series/components/SeriesGenresNav";
import SeriesGenre from "@/features/series/components/SeriesGenre";

export default async function SeriesGenres({params}) {
    const {id} = await params;
    
    // Fetch series for Hero closure just like in app/series/page.jsx
    const res = await fetch(`${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/3/tv/top_rated?language=en-US&page=1`, {
        headers: {
            accept: "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_ACCESS_TOKEN}`
        },
        next: { revalidate: 86400 }
    });
    
    let data = null;
    if (res.ok) {
        data = await res.json();
    }

    return (
        <div className="min-h-screen w-full bg-surface font-montserrat pb-12">
            {data && <SeriesHeroClousure data={data} />}
            <div className="bg-surface relative -mt-8 z-20 rounded-t-3xl">
                <SeriesGenresNav />
            </div>
            <SeriesGenre genreId={id} />
        </div>
    );
}