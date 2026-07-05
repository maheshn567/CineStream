import SeriesHeroClousure from "@/features/series/components/SeriesHeroClousre";
import ContinueSeries from "@/features/series/components/ContinueSeries";
import SeriesGenresNav from "@/features/series/components/SeriesGenresNav";
import Top10Series from "@/features/series/components/Top10Series";
import AiringToday from "@/features/series/components/AiringToday";
import ThisWeek from "@/features/series/components/ThisWeek";
import PopularSeries from "@/features/series/components/PopularSeries";


export default async function Series(){
    const res= await fetch(`${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/3/tv/top_rated?language=en-US&page=1`,{
        headers:{
            accept: "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_ACCESS_TOKEN}`
        },
        next: { revalidate: 86400 }
    });
    if(!res.ok){
        throw new Error("Failed to fetch series data from server");
    }
    const data = await res.json();
    return(
        <div>
            <div>
                <SeriesHeroClousure data={data}/>
            </div>

            <div>
                <SeriesGenresNav/>
            </div>
            
            <div>
                <ContinueSeries/>
            </div>
            
            <div>
                <Top10Series/>
            </div>

            <div>
                <AiringToday/>
            </div>
            
            <div>
                <ThisWeek/>
            </div>

            <div>
                <PopularSeries/>
            </div>
        </div>
    )
}